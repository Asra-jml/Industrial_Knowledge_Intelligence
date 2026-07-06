"""Markdown parser for the synthesized internal records (incidents, inspection,
audit, shutdown plan, minutes). Captures the title, the bold **Key:** Value
metadata pairs, and the raw text (full-text extraction finds the Linked: ids)."""
from __future__ import annotations

import re
from pathlib import Path

from backend.core.models import ParsedDoc

_TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
_META_RE = re.compile(r"\*\*([^*:]{1,40}):\*\*\s*([^|\n]+)")
_LINKED_RE = re.compile(r"\*\*Linked[^:*]*:\*\*\s*(.+?)(?:\n\n|\Z)", re.DOTALL | re.IGNORECASE)


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    raw = path.read_text(encoding="utf-8-sig", errors="replace")

    title_m = _TITLE_RE.search(raw)
    metadata = {
        key.strip(): value.strip()
        for key, value in _META_RE.findall(raw)
        if value.strip()
    }
    linked_m = _LINKED_RE.search(raw)
    if linked_m:
        metadata["linked_line"] = " ".join(linked_m.group(1).split())

    return ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=title_m.group(1).strip() if title_m else path.stem.replace("_", " "),
        text=raw,
        metadata=metadata,
    )
