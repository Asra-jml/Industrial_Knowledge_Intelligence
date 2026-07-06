"""Format dispatch: one entry point, one parser per format."""
from __future__ import annotations

from pathlib import Path

from backend.core.models import ParsedDoc
from backend.ingestion.parsers import (
    csv_parser,
    email_parser,
    markdown_parser,
    pdf_parser,
    pid_parser,
    text_parser,
)

_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def parse_file(path: Path, doc_id: str, doc_type: str) -> ParsedDoc | None:
    """Parse one corpus file; None means the format is not ingestable."""
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return csv_parser.parse(path, doc_id, doc_type)
    if suffix == ".md":
        return markdown_parser.parse(path, doc_id, doc_type)
    if suffix == ".eml":
        return email_parser.parse(path, doc_id, doc_type)
    if suffix == ".pdf":
        return pdf_parser.parse(path, doc_id, doc_type)
    if suffix in (".txt", ".json"):
        return text_parser.parse(path, doc_id, doc_type)
    if suffix in _IMAGE_SUFFIXES:
        return pid_parser.parse(path, doc_id, doc_type)
    return None
