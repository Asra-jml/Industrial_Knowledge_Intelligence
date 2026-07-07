"""Record contracts shared across the pipeline.

Everything is kept JSON-serializable (plain dicts inside) because per-file
contributions are cached to disk and merged deterministically.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ParsedDoc:
    """Result of parsing one corpus file (before entity extraction)."""

    doc_id: str                       # POSIX relpath from corpus root
    doc_type: str
    source_path: str
    title: str = ""
    text: str = ""                    # full extracted text ("" for images)
    pages: list[tuple[int, str]] | None = None   # PDFs: (page_no, page_text)
    rows: list[dict[str, str]] | None = None     # CSVs: row dicts
    metadata: dict[str, Any] = field(default_factory=dict)
    readable: bool = True
    ocr_used: bool = False


def node(node_type: str, key: str, **props: Any) -> dict:
    """Graph node as a plain dict; id is deterministic -> idempotent MERGE."""
    return {
        "id": f"{node_type}:{key}",
        "type": node_type,
        "key": key,
        "props": {k: v for k, v in props.items() if v not in (None, "", [])},
    }


def edge(source_id: str, target_id: str, rel: str, **props: Any) -> dict:
    return {
        "source": source_id,
        "target": target_id,
        "rel": rel,
        "props": {k: v for k, v in props.items() if v not in (None, "", [])},
    }


def chunk(
    chunk_id: str,
    doc_id: str,
    doc_type: str,
    text: str,
    equipment_tags: list[str] | None = None,
    record_ids: list[str] | None = None,
    dates: list[str] | None = None,
    page: int | None = None,
    source_path: str = "",
) -> dict:
    return {
        "chunk_id": chunk_id,
        "doc_id": doc_id,
        "doc_type": doc_type,
        "text": text,
        "equipment_tags": sorted(equipment_tags or []),
        "record_ids": sorted(record_ids or []),
        "dates": sorted(dates or []),
        "page": page,
        "source_path": source_path,
    }
