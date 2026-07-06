"""PDF parser — pdfplumber for digital PDFs; OCR fallback (via pypdfium2
rendering + pytesseract) for scanned ones like OISD_DOC-2016-1.

A PDF counts as "scanned" when total extracted text is near-zero. OCR is
capped at OCR_MAX_PAGES so one large scanned regulation can't stall ingest.
"""
from __future__ import annotations

from pathlib import Path

import pdfplumber

from backend.core.models import ParsedDoc
from backend.ingestion.parsers import ocr

SCANNED_TEXT_THRESHOLD = 100   # chars across the whole PDF
OCR_MAX_PAGES = 15
OCR_RESOLUTION = 200


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    doc = ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=path.stem.replace("_", " "),
    )

    pages: list[tuple[int, str]] = []
    with pdfplumber.open(path) as pdf:
        doc.metadata["page_count"] = len(pdf.pages)
        for i, page in enumerate(pdf.pages, start=1):
            try:
                pages.append((i, page.extract_text() or ""))
            except Exception:
                pages.append((i, ""))

        total_chars = sum(len(t) for _, t in pages)
        if total_chars < SCANNED_TEXT_THRESHOLD:
            doc.metadata["scanned"] = True
            if ocr.available():
                pages = _ocr_pages(pdf, min(len(pdf.pages), OCR_MAX_PAGES))
                doc.ocr_used = True
                doc.metadata["ocr_pages"] = len(pages)
            else:
                doc.readable = False
                doc.metadata["skip_reason"] = "scanned PDF, Tesseract unavailable"

    doc.pages = pages
    doc.text = "\n\n".join(t for _, t in pages if t)
    return doc


def _ocr_pages(pdf, max_pages: int) -> list[tuple[int, str]]:
    out: list[tuple[int, str]] = []
    for i, page in enumerate(pdf.pages[:max_pages], start=1):
        try:
            image = page.to_image(resolution=OCR_RESOLUTION).original
            out.append((i, ocr.image_to_text(image)))
        except Exception:
            out.append((i, ""))
    return out
