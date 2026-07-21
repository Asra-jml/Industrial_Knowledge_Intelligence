"""F4 — compliance intelligence.

Joins 11_quality_compliance/compliance_register.csv with the knowledge
graph: each requirement row is enriched with its GOVERNED_BY edge, and an
evidence pack is assembled per requirement by walking the graph — the
regulation's source PDF, the cited inspections, the NCR → CAPA chain and
the governing procedure. GAP rows carry everything an auditor asks for.
"""
from __future__ import annotations

import re

import pandas as pd

from backend.core import config, graph_store, llm

_REGISTER = "11_quality_compliance/compliance_register.csv"
_ID_RE = re.compile(r"\b(?:INSP|NCR|CAPA|WO|FR|AUD|INC|NM|LL|PTW|CAL)-\d{4}-\d{2,4}\b")
_SOP_RE = re.compile(r"\bSOP-[A-Z]{2,4}-\d{3}\b")

_PREFIX_TYPE = {
    "INSP": "Inspection", "NCR": "NCR", "CAPA": "CAPA", "WO": "WorkOrder",
    "FR": "Failure", "AUD": "Audit", "INC": "Incident", "NM": "NearMiss",
    "LL": "LessonLearned", "PTW": "Permit", "CAL": "Calibration",
}


def _rows() -> list[dict]:
    df = pd.read_csv(config.CORPUS_ROOT / _REGISTER, dtype=str, keep_default_na=False)
    return df.to_dict(orient="records")


def _node_ref(record_id: str) -> str | None:
    prefix = record_id.split("-", 1)[0]
    node_type = _PREFIX_TYPE.get(prefix)
    return f"{node_type}:{record_id}" if node_type else None


def _evidence_item(node_id: str, nodes: dict, role: str) -> dict:
    node = nodes.get(node_id)
    props = node.get("props", {}) if node else {}
    return {
        "id": node_id,
        "type": node_id.split(":", 1)[0],
        "key": node_id.split(":", 1)[1],
        "role": role,
        "title": (
            props.get("description") or props.get("finding")
            or props.get("title") or props.get("corrective_action") or ""
        )[:160],
        "date": str(
            props.get("date") or props.get("date_raised") or props.get("date_opened") or ""
        )[:10],
        "status": str(props.get("status", "") or props.get("result", "")),
        "in_graph": node is not None,
    }


def register() -> dict:
    graph = graph_store.load_graph()
    nodes = {n["id"]: n for n in graph["nodes"]}
    adjacent: dict[str, set[str]] = {}
    for e in graph["edges"]:
        adjacent.setdefault(e["source"], set()).add(e["target"])
        adjacent.setdefault(e["target"], set()).add(e["source"])

    requirements = []
    for row in _rows():
        req_id = row.get("req_id", "")
        status = row.get("status", "").upper()
        evidence: list[dict] = []
        seen: set[str] = set()

        def add(node_id: str | None, role: str):
            if node_id and node_id not in seen:
                seen.add(node_id)
                evidence.append(_evidence_item(node_id, nodes, role))

        # cited evidence + records referenced in the gap note
        for rid in _ID_RE.findall(f"{row.get('evidence', '')} {row.get('gap_note', '')}"):
            add(_node_ref(rid), "cited")
        # NCR -> CAPA chain
        for item in list(evidence):
            if item["type"] == "NCR":
                for neighbor in adjacent.get(item["id"], set()):
                    if neighbor.startswith("CAPA:"):
                        add(neighbor, "corrective_action")
        # governing procedure
        for sop in _SOP_RE.findall(row.get("linked_procedure", "")):
            add(f"Procedure:{sop}", "procedure")
        # this requirement's regulation + its source PDF
        from backend.ingestion.extract.ontology import normalize_regulation

        norm = normalize_regulation(row.get("regulation", ""))
        if norm:
            reg_node = f"Regulation:{norm[0]}"
            for neighbor in adjacent.get(reg_node, set()):
                if neighbor.startswith("Document:03_regulations/"):
                    add(neighbor, "regulation_text")

        requirements.append({
            "req_id": req_id,
            "regulation": row.get("regulation", ""),
            "clause": row.get("clause", ""),
            "requirement": row.get("requirement", ""),
            "applies_to": row.get("applies_to", ""),
            "linked_procedure": row.get("linked_procedure", ""),
            "status": status,
            "gap_note": row.get("gap_note", ""),
            "evidence": evidence,
        })

    counts = {"GAP": 0, "COMPLIANT": 0, "OPEN": 0}
    for r in requirements:
        counts[r["status"]] = counts.get(r["status"], 0) + 1

    return {
        "summary": {
            "total": len(requirements),
            "gaps": counts.get("GAP", 0),
            "compliant": counts.get("COMPLIANT", 0),
            "open": counts.get("OPEN", 0),
        },
        "requirements": requirements,
    }


def gap_narrative() -> str | None:
    data = register()
    gaps = [r for r in data["requirements"] if r["status"] == "GAP"]
    if not gaps:
        return None
    gap_text = "\n".join(
        f"- {g['req_id']} {g['regulation']} ({g['clause']}) on {g['applies_to']}: {g['gap_note']}"
        for g in gaps
    )
    return llm.chat(
        "You are a QA/compliance officer. Summarize these compliance gaps for "
        "plant leadership in 2-3 sentences: what is breached, the operational "
        "consequence already observed, and the immediate action. Use record IDs.",
        gap_text,
        max_tokens=250,
    )
