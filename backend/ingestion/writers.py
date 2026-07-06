"""Deterministic output writers — same inputs produce byte-identical files,
which is exactly what the idempotency acceptance test asserts."""
from __future__ import annotations

import json
from pathlib import Path

from backend.core import config


def write_documents(doc_records: list[dict], path: Path | None = None) -> Path:
    return _write_jsonl(path or config.DOCUMENTS_PATH,
                        sorted(doc_records, key=lambda d: d["doc_id"]))


def write_corpus_index(chunks: list[dict], path: Path | None = None) -> Path:
    return _write_jsonl(path or config.CORPUS_INDEX_PATH,
                        sorted(chunks, key=lambda c: c["chunk_id"]))


def write_graph(graph: dict, path: Path | None = None) -> Path:
    out = path or config.GRAPH_PATH
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "graph_schema_version": "1.0",
        "pipeline_version": config.PIPELINE_VERSION,
        "node_count": len(graph["nodes"]),
        "edge_count": len(graph["edges"]),
        "nodes": graph["nodes"],
        "edges": graph["edges"],
    }
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
    return out


def _write_jsonl(path: Path, records: list[dict]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False, sort_keys=True) + "\n")
    return path
