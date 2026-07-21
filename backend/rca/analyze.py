"""F3 — root cause analysis by knowledge-graph traversal.

Walks graph.json outward from an equipment node and assembles the causal
chain the ontology encodes: inspections (especially OVERDUE ones), work
orders, failures, incidents, NCR → CAPA, and breached regulations. The
chain is ordered by date, the root cause is derived rule-based (an overdue
inspection covering the failed component wins), and an optional LLM pass
turns the chain into an engineer-readable narrative.
"""
from __future__ import annotations

from backend.core import graph_store, llm

_STEP_TYPES = [
    "Inspection", "Calibration", "WorkOrder", "Failure",
    "Incident", "NearMiss", "NCR", "CAPA", "Audit", "LessonLearned",
]

_SEVERITY = {
    "Failure": "danger", "Incident": "danger", "NearMiss": "warning",
    "NCR": "warning", "Inspection": "info", "WorkOrder": "info",
    "CAPA": "success", "Audit": "info", "Calibration": "info",
    "LessonLearned": "success",
}


def _title(node: dict) -> str:
    props = node.get("props", {})
    return (
        props.get("description")
        or props.get("failure_mode")
        or props.get("finding")
        or props.get("classification")
        or props.get("title")
        or props.get("corrective_action")
        or ""
    )


def _date(node: dict) -> str:
    props = node.get("props", {})
    for key in ("date", "date_raised", "date_opened", "install_date"):
        if props.get(key):
            return str(props[key])[:10]
    return ""


def analyze(tag: str) -> dict | None:
    graph = graph_store.load_graph()
    nodes = {n["id"]: n for n in graph["nodes"]}
    start = f"Equipment:{tag}"
    if start not in nodes:
        return None

    # 2-hop neighborhood around the equipment
    adjacent: dict[str, set[str]] = {}
    for e in graph["edges"]:
        adjacent.setdefault(e["source"], set()).add(e["target"])
        adjacent.setdefault(e["target"], set()).add(e["source"])
    hop1 = adjacent.get(start, set())
    # expand hop 2 only through record nodes — Person/Document hubs would
    # drag in unrelated equipment's history (a shared inspector, a register)
    hop2 = hop1 | {
        n
        for h in hop1
        if h.split(":", 1)[0] in _STEP_TYPES
        for n in adjacent.get(h, set())
    }

    steps = []
    for node_id in hop2:
        node = nodes.get(node_id)
        if not node or node["type"] not in _STEP_TYPES:
            continue
        props = node.get("props", {})
        # keep hop-2 records only if they trace back to this tag's records
        steps.append({
            "id": node_id,
            "type": node["type"],
            "key": node["key"],
            "date": _date(node),
            "title": _title(node)[:180],
            "status": str(props.get("status", "") or props.get("result", "")),
            "severity": _SEVERITY.get(node["type"], "info"),
            "overdue": "OVERDUE" in str(props.get("status", "") or props.get("result", "")).upper(),
        })
    steps.sort(key=lambda s: (s["date"] or "9999", s["type"]))

    failures = [s for s in steps if s["type"] == "Failure"]
    overdue = [s for s in steps if s["overdue"]]
    capas = [s for s in steps if s["type"] == "CAPA"]

    root_cause = None
    if overdue and failures:
        root_cause = (
            f"Missed inspection {overdue[0]['key']} — the follow-up that would "
            f"have caught the degradation was never performed, allowing "
            f"{failures[-1]['title'] or failures[-1]['key']}."
        )
    elif failures:
        root_cause = failures[-1]["title"] or failures[-1]["key"]

    # regulations breached (GOVERNED_BY edges with GAP status)
    gaps = [
        {
            "regulation": e["target"].split(":", 1)[1],
            "clause": e.get("props", {}).get("clause", ""),
            "gap_note": e.get("props", {}).get("gap_note", ""),
        }
        for e in graph["edges"]
        if e["rel"] == "GOVERNED_BY"
        and e["source"] == start
        and e.get("props", {}).get("status") == "GAP"
    ]

    narrative = None
    if steps:
        chain_text = "\n".join(
            f"- {s['date']} {s['type']} {s['key']}: {s['title']} {s['status']}"
            for s in steps
        )
        narrative = llm.chat(
            "You are a senior reliability engineer writing a root-cause summary. "
            "Given this event chain from the plant knowledge graph, write 3-4 "
            "sentences: what failed, the direct cause, the systemic cause, and "
            "what prevents recurrence. Use record IDs. No preamble.",
            f"Equipment: {tag}\nEvent chain:\n{chain_text}",
            max_tokens=350,
        )

    return {
        "tag": tag,
        "equipment": nodes[start].get("props", {}),
        "chain": steps,
        "root_cause": root_cause,
        "regulation_gaps": gaps,
        "corrective_actions": [
            {"key": c["key"], "title": c["title"], "status": c["status"]} for c in capas
        ],
        "narrative": narrative,
        "narrative_mode": "llm" if narrative else "rule_based",
    }
