"""spaCy NER — Person names from unstructured text (emails, internal reports).

Structured person columns (assigned_to, inspector, ...) are handled by the
graph builder; this catches free-text names like "R. Menon reassigned to
Unit-4". Applied only to small unstructured doc types — running a full NLP
pipeline over 300-page CSB PDFs would cost minutes for little graph value.
"""
from __future__ import annotations

import re

NER_DOC_TYPES = {"email", "incident_report", "project_doc", "inspection", "compliance"}
_MAX_CHARS = 20_000

_nlp = None
_NOISE = re.compile(r"\d|@|http|www\.|\.pdf|\.csv|\bunit\b", re.IGNORECASE)


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy

        _nlp = spacy.load("en_core_web_sm", disable=["lemmatizer", "tagger"])
    return _nlp


def extract_persons(text: str) -> list[str]:
    """Deduplicated PERSON entities, filtered for obvious non-names."""
    if not text:
        return []
    doc = _get_nlp()(text[:_MAX_CHARS])
    names: set[str] = set()
    for ent in doc.ents:
        if ent.label_ != "PERSON":
            continue
        name = " ".join(ent.text.split()).strip(".,;:-–—* ")
        if len(name) < 3 or len(name) > 40 or _NOISE.search(name):
            continue
        names.add(name)
    return sorted(names)
