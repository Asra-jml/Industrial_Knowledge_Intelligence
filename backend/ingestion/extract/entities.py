"""Masked-regex entity extraction.

Order is the whole trick: specific record IDs (WO-2026-0625, INSP-2026-0615, ...)
are matched FIRST and their spans masked, so the bare equipment pattern
`[A-Z]{1,3}-\\d{2,4}` never fires inside them (the naive baseline turned
"WO-2026" into a phantom pump). Surviving matches are gated through the
ontology's known-tag set; unknown-but-plausible tags are kept as candidates
on the document instead of becoming graph nodes.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

from backend.ingestion.extract.ontology import Ontology, find_regulations

# (node_type | None, pattern). None = mask-only (protects the equipment pass,
# creates no node). Slash shorthand "WO-2026-0622/0625" is expanded by _expand.
RECORD_PATTERNS: list[tuple[str | None, re.Pattern]] = [
    ("WorkOrder", re.compile(r"\bWO-\d{4}-\d{3,4}(?:/\d{3,4})*\b")),
    ("Failure", re.compile(r"\bFR-\d{4}-\d{3,4}(?:/\d{3,4})*\b")),
    ("NCR", re.compile(r"\bNCR-\d{4}-\d{3}(?:/\d{3})*\b")),
    ("CAPA", re.compile(r"\bCAPA-\d{4}-\d{3}(?:/\d{3})*\b")),
    ("Inspection", re.compile(r"\bINSP-\d{4}-\d{3,4}(?:/\d{3,4})*\b")),
    ("Calibration", re.compile(r"\bCAL-\d{4}-\d{3}(?:/\d{3})*\b")),
    ("Audit", re.compile(r"\bAUD-\d{4}-\d{2,3}(?:/\d{2,3})*\b")),
    ("Incident", re.compile(r"\bINC-\d{4}-\d{2,3}(?:/\d{2,3})*\b")),
    ("NearMiss", re.compile(r"\bNM-\d{4}-\d{2,3}(?:/\d{2,3})*\b")),
    ("LessonLearned", re.compile(r"\bLL-\d{4}-\d{2,3}(?:/\d{2,3})*\b")),
    ("Permit", re.compile(r"\bPTW-\d{4}-\d{3,4}(?:/\d{3,4})*\b")),
    ("Procedure", re.compile(r"\bSOP-[A-Z]{2,4}-\d{3}\b")),
    ("Drawing", re.compile(r"\bDWG-[A-Z0-9]{1,4}-\d{3}\b")),
    # mask-only record ids (rows carry their links; no dedicated node type)
    (None, re.compile(r"\bPM-[A-Z0-9]{2,8}-[A-Z]\b")),
    (None, re.compile(r"\bCM-\d{4}-\d{3}\b")),
    (None, re.compile(r"\bREQ-\d{3}\b")),
    (None, re.compile(r"\bAST-\d{4}\b")),
    (None, re.compile(r"\bINV-\d{4}\b")),
]

EQUIPMENT_RE = re.compile(r"\b[A-Z]{1,3}-\d{2,4}\b")
DATE_RE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")


@dataclass
class Extraction:
    equipment: set[str] = field(default_factory=set)       # canonical, gated
    parts: set[str] = field(default_factory=set)            # known spare parts
    candidates: set[str] = field(default_factory=set)       # plausible, ungated
    records: dict[str, set[str]] = field(default_factory=dict)  # node_type -> ids
    regulations: set[str] = field(default_factory=set)
    dates: set[str] = field(default_factory=set)

    def all_record_ids(self) -> set[str]:
        out: set[str] = set()
        for ids in self.records.values():
            out |= ids
        return out


def _expand(match_text: str) -> list[str]:
    """'WO-2026-0622/0625' -> ['WO-2026-0622', 'WO-2026-0625']."""
    if "/" not in match_text:
        return [match_text]
    head, *rest = match_text.split("/")
    prefix = head.rsplit("-", 1)[0]
    return [head] + [f"{prefix}-{suffix}" for suffix in rest]


def extract_entities(text: str, onto: Ontology) -> Extraction:
    result = Extraction()
    if not text:
        return result

    # 1) specific record IDs first; remember their spans
    masked_spans: list[tuple[int, int]] = []
    for node_type, pattern in RECORD_PATTERNS:
        for m in pattern.finditer(text):
            masked_spans.append(m.span())
            if node_type is not None:
                result.records.setdefault(node_type, set()).update(_expand(m.group()))

    def _masked(start: int, end: int) -> bool:
        return any(s < end and start < e for s, e in masked_spans)

    # 2) bare equipment pattern on the remainder, gated by the known-tag set
    for m in EQUIPMENT_RE.finditer(text):
        if _masked(*m.span()):
            continue
        tag = m.group()
        if tag in onto.known_tags:
            result.equipment.add(tag)
        elif tag in onto.known_parts:
            result.parts.add(tag)
        else:
            result.candidates.add(tag)

    # 3) dictionary aliases ("BFW Pump A", "P101") -> canonical tags
    if onto.alias_regex is not None:
        for m in onto.alias_regex.finditer(text):
            canonical = onto.alias_map[m.group(1).lower()]
            if canonical in onto.known_parts:
                result.parts.add(canonical)
            else:
                result.equipment.add(canonical)

    # 4) longer part numbers that the bare pattern misses (e.g. SKF-6312-C3)
    for pn in onto.known_parts:
        if pn in text:
            result.parts.add(pn)

    result.regulations = find_regulations(text)
    result.dates = set(DATE_RE.findall(text))
    return result
