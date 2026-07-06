"""Per-doc-type chunk policies for corpus_index.jsonl (F2's RAG source).

- operational CSV rows -> one readable chunk per row (row-level tags/ids)
- vibration trend      -> descriptor + only non-normal rows
- md / eml             -> ~900-char paragraph-aware chunks with overlap
- PDFs                 -> per-page, split at ~900 chars, `page` metadata
- ML datasets          -> single descriptor chunk (NEVER the raw arrays)
- P&ID images          -> no chunks (no plant text in the public drawings)
"""
from __future__ import annotations

from backend.core.models import ParsedDoc, chunk
from backend.ingestion.extract.entities import Extraction, extract_entities
from backend.ingestion.extract.ontology import Ontology

CHUNK_CHARS = 900
CHUNK_OVERLAP = 120


def build_chunks(doc: ParsedDoc, ex: Extraction, onto: Ontology) -> list[dict]:
    if doc.doc_type == "pid_drawing":
        return []
    if doc.doc_type == "dataset":
        return _descriptor(doc)
    if doc.rows is not None:
        return _csv_rows(doc, onto)
    if doc.pages:
        return _pdf_pages(doc, onto)
    if doc.text:
        return _text(doc, onto)
    return []


def _mk(doc: ParsedDoc, idx: str, text: str, row_ex: Extraction, page: int | None = None) -> dict:
    return chunk(
        chunk_id=f"{doc.doc_id}#{idx}",
        doc_id=doc.doc_id,
        doc_type=doc.doc_type,
        text=text,
        equipment_tags=list(row_ex.equipment),
        record_ids=list(row_ex.all_record_ids()),
        dates=list(row_ex.dates),
        page=page,
        source_path=doc.source_path,
    )


def _descriptor(doc: ParsedDoc) -> list[dict]:
    text = doc.text or f"Dataset {doc.doc_id}"
    return [chunk(f"{doc.doc_id}#descriptor", doc.doc_id, doc.doc_type, text,
                  source_path=doc.source_path)]


def _csv_rows(doc: ParsedDoc, onto: Ontology) -> list[dict]:
    basename = doc.doc_id.rsplit("/", 1)[-1]
    vibration_mode = basename == "condition_monitoring_vibration.csv"
    out: list[dict] = []

    if vibration_mode:
        n = doc.metadata.get("row_count", len(doc.rows))
        out.append(chunk(
            f"{doc.doc_id}#descriptor", doc.doc_id, doc.doc_type,
            f"Condition-monitoring vibration trend ({n} readings): date, tag, "
            "DE vibration mm/s, process temp, discharge pressure, status. "
            "Full series used by F3; only non-normal readings indexed here.",
            source_path=doc.source_path,
        ))

    for i, row in enumerate(doc.rows):
        if vibration_mode and row.get("status", "normal").lower() == "normal":
            continue
        text = f"{doc.title} — " + " | ".join(f"{k}: {v}" for k, v in row.items() if v)
        row_ex = extract_entities(text, onto)
        out.append(_mk(doc, f"row{i}", text[: CHUNK_CHARS * 2], row_ex))
    return out


def _split_paragraph_aware(text: str) -> list[str]:
    """Greedy ~CHUNK_CHARS pieces, cut at paragraph > line > word boundaries,
    with CHUNK_OVERLAP chars of trailing context carried into the next piece."""
    pieces: list[str] = []
    pos = 0
    n = len(text)
    while pos < n:
        end = pos + CHUNK_CHARS
        if end >= n:
            piece = text[pos:].strip()
            if piece:
                pieces.append(piece)
            break
        window = text[pos:end]
        cut = window.rfind("\n\n")
        if cut < CHUNK_CHARS // 3:
            cut = window.rfind("\n")
        if cut < CHUNK_CHARS // 3:
            cut = window.rfind(" ")
        if cut <= CHUNK_OVERLAP:   # no usable boundary -> hard cut
            cut = len(window)
        piece = window[:cut].strip()
        if piece:
            pieces.append(piece)
        pos += cut - CHUNK_OVERLAP if cut > CHUNK_OVERLAP else cut
    return pieces


def _text(doc: ParsedDoc, onto: Ontology) -> list[dict]:
    out = []
    for i, piece in enumerate(_split_paragraph_aware(doc.text)):
        out.append(_mk(doc, f"c{i}", piece, extract_entities(piece, onto)))
    return out


def _pdf_pages(doc: ParsedDoc, onto: Ontology) -> list[dict]:
    out = []
    for page_no, page_text in doc.pages:
        if not page_text.strip():
            continue
        for i, piece in enumerate(_split_paragraph_aware(page_text)):
            out.append(_mk(doc, f"p{page_no}c{i}", piece,
                           extract_entities(piece, onto), page=page_no))
    return out
