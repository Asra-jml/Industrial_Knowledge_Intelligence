"""F1 ingestion orchestrator.

    python -m backend.ingestion.run_ingest            # incremental
    python -m backend.ingestion.run_ingest --full     # force re-parse
    python -m backend.ingestion.run_ingest --no-neo4j # outputs only
    python -m backend.ingestion.run_ingest --reset    # wipe Neo4j first

Stages: discover -> manifest diff -> parse -> extract -> contribute (cached)
-> merge graph -> write shared/ outputs -> Neo4j.
"""
from __future__ import annotations

import argparse
import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from backend.core import config
from backend.core.models import chunk as make_chunk, edge, node
from backend.ingestion import writers
from backend.ingestion.chunking import build_chunks
from backend.ingestion.extract import llm_enrich, ner
from backend.ingestion.extract.entities import extract_entities
from backend.ingestion.extract.ontology import load_ontology, normalize_regulation
from backend.ingestion.graph import neo4j_loader
from backend.ingestion.graph.builder import build_contribution, merge_contributions
from backend.ingestion.manifest import Manifest
from backend.ingestion.parsers import parse_file

SUPPORTED_SUFFIXES = {".pdf", ".csv", ".md", ".eml", ".json", ".txt", ".jpg", ".jpeg", ".png"}


def discover(corpus_root: Path) -> dict[str, Path]:
    """doc_id (POSIX relpath) -> absolute path, for every ingestable file."""
    found: dict[str, Path] = {}
    for folder, _doc_type in config.FOLDER_DOC_TYPE.items():
        base = corpus_root / folder
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in SUPPORTED_SUFFIXES:
                continue
            rel = path.relative_to(corpus_root).as_posix()
            if folder == "01_pids" and "/labels/" in f"/{rel}":
                continue  # YOLO label sidecars belong to their image, not the corpus
            found[rel] = path
    return found


def process_file(doc_id: str, path: Path, onto) -> dict | None:
    doc_type = config.FOLDER_DOC_TYPE.get(doc_id.split("/", 1)[0], "other")
    doc = parse_file(path, doc_id, doc_type)
    if doc is None:
        return None
    ex = extract_entities(doc.text, onto)
    contribution = build_contribution(doc, ex, onto)
    contribution["doc_id"] = doc_id
    contribution["chunks"] = build_chunks(doc, ex, onto)

    # spaCy NER over small unstructured docs (emails, internal md reports)
    if doc.rows is None and doc.text and doc_type in ner.NER_DOC_TYPES:
        for name in ner.extract_persons(doc.text):
            contribution["nodes"].append(node("Person", name, kind="person"))
            contribution["edges"].append(
                edge(f"Document:{doc_id}", f"Person:{name}", "MENTIONS", via="ner")
            )

    # LLM enrichment of external incident PDFs (cached with the contribution)
    if llm_enrich.eligible(doc_id, doc_type):
        enrichment = llm_enrich.enrich(doc_id, doc.text)
        if enrichment:
            contribution["enrichment"] = enrichment
            doc.metadata["llm_enriched"] = True
            if enrichment["summary"]:
                contribution["chunks"].append(make_chunk(
                    f"{doc_id}#llm_summary", doc_id, doc_type,
                    f"Summary of {doc.title}: {enrichment['summary']}",
                    source_path=doc.source_path,
                ))
            for raw in enrichment["regulations"]:
                norm = normalize_regulation(raw)
                if norm:
                    contribution["nodes"].append(node("Regulation", norm[0]))
                    contribution["edges"].append(
                        edge(f"Document:{doc_id}", f"Regulation:{norm[0]}",
                             "MENTIONS", via="llm")
                    )
    contribution["doc_record"] = {
        "doc_id": doc_id,
        "doc_type": doc_type,
        "title": doc.title,
        "source_path": doc.source_path,
        "readable": doc.readable,
        "ocr_used": doc.ocr_used,
        "equipment_tags": sorted(ex.equipment),
        "parts": sorted(ex.parts),
        "record_ids": sorted(ex.all_record_ids()),
        "candidate_tags": sorted(ex.candidates),
        "regulations": sorted(ex.regulations),
        "dates": sorted(ex.dates),
        "metadata": {
            k: v for k, v in doc.metadata.items()
            if k in ("page_count", "row_count", "symbol_count", "scanned",
                     "ocr_pages", "date", "skip_reason", "columns", "llm_enriched")
        },
    }
    return contribution


# --- parallel parsing (PRD NFR: full corpus < 10 min on a laptop) ---
_worker_onto = None


def _init_worker():
    global _worker_onto
    from backend.ingestion.extract.ontology import load_ontology as _load

    _worker_onto = _load()


def _worker(args: tuple[str, str]):
    doc_id, path_str = args
    try:
        return doc_id, process_file(doc_id, Path(path_str), _worker_onto), None
    except Exception as exc:
        return doc_id, None, str(exc)


def _parse_many(doc_ids: list[str], files: dict[str, Path], onto):
    """Yield (doc_id, contribution|None, error|None); parallel when it pays off."""
    if len(doc_ids) < 999:  # sequential to avoid MemoryError on 475+ files
        for doc_id in doc_ids:
            try:
                yield doc_id, process_file(doc_id, files[doc_id], onto), None
            except Exception as exc:
                yield doc_id, None, str(exc)
        return
    workers = max(2, (os.cpu_count() or 4) - 2)
    with ProcessPoolExecutor(max_workers=workers, initializer=_init_worker) as pool:
        args = [(d, str(files[d])) for d in doc_ids]
        yield from pool.map(_worker, args, chunksize=8)


def run(full: bool = False, use_neo4j: bool = True, reset: bool = False) -> dict:
    t0 = time.time()
    print(f"[ingest] corpus: {config.CORPUS_ROOT}")
    onto = load_ontology()
    print(f"[ingest] ontology: {len(onto.known_tags)} known tags, "
          f"{len(onto.known_parts)} known parts, {len(onto.alias_map)} aliases")

    files = discover(config.CORPUS_ROOT)
    manifest = Manifest.load()
    plan = manifest.diff(files, force_full=full)
    print(f"[ingest] {len(files)} files: {len(plan['process'])} to parse, "
          f"{len(plan['reuse'])} cached, {len(plan['deleted'])} deleted")

    for doc_id in plan["deleted"]:
        manifest.forget(doc_id)

    contributions: list[dict] = []
    failures: list[str] = []
    total = len(plan["process"])
    for i, (doc_id, contribution, error) in enumerate(
        _parse_many(plan["process"], files, onto), 1
    ):
        if error:
            failures.append(f"{doc_id}: {error}")
        elif contribution is not None:
            manifest.store_contribution(doc_id, files[doc_id], contribution)
            contributions.append(contribution)
        if i % 50 == 0 or i == total:
            print(f"[ingest] parsed {i}/{total}")

    for doc_id in plan["reuse"]:
        contributions.append(manifest.load_contribution(doc_id))

    manifest.pipeline_version = config.PIPELINE_VERSION
    manifest.save()

    print("[ingest] merging graph...")
    graph = merge_contributions(contributions, onto)
    doc_records = [c["doc_record"] for c in contributions if "doc_record" in c]
    chunks = [ch for c in contributions for ch in c.get("chunks", [])]

    writers.write_documents(doc_records)
    writers.write_corpus_index(chunks)
    writers.write_graph(graph)
    print(f"[ingest] wrote {len(doc_records)} documents, {len(chunks)} chunks, "
          f"{len(graph['nodes'])} nodes, {len(graph['edges'])} edges -> {config.SHARED_DIR}")

    if failures:
        print(f"[ingest] WARNING {len(failures)} file(s) failed:")
        for f in failures:
            print(f"  - {f}")

    if use_neo4j:
        neo4j_loader.load_graph(graph, reset=reset)

    elapsed = time.time() - t0
    print(f"[ingest] done in {elapsed:.1f}s")
    return {
        "documents": len(doc_records),
        "chunks": len(chunks),
        "nodes": len(graph["nodes"]),
        "edges": len(graph["edges"]),
        "parsed": len(plan["process"]),
        "cached": len(plan["reuse"]),
        "failures": failures,
        "seconds": round(elapsed, 1),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="IKI F1 corpus ingestion")
    ap.add_argument("--full", action="store_true", help="ignore cache, re-parse everything")
    ap.add_argument("--no-neo4j", action="store_true", help="skip Neo4j upload")
    ap.add_argument("--reset", action="store_true", help="wipe Neo4j before loading")
    args = ap.parse_args()
    result = run(full=args.full, use_neo4j=not args.no_neo4j, reset=args.reset)
    return 1 if result["failures"] else 0


if __name__ == "__main__":
    sys.exit(main())
