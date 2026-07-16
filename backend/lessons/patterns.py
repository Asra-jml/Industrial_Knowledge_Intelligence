"""F5 — lessons learned & failure intelligence.

Detects recurring failure patterns by grouping internal failure/near-miss
records on shared failure-mode keywords, then propagates risk along the
graph's SAME_CLASS_AS edges: if two pumps of a class have degraded the
same way, every remaining sibling is put on watch — escalated when its
live vibration trend is already rising. External precedents (CSB / OISD
case-study PDFs) are pulled through the F2 retriever so each alert cites
industry evidence, and the recommended action comes from the CAPA the
plant already wrote.
"""
from __future__ import annotations

import re
from collections import defaultdict

from backend.core import graph_store, llm
from backend.rag.retriever import retrieve
from backend.rca.trend import equipment_list

_MODE_KEYWORDS = [
    "bearing", "seizure", "vibration", "seal", "leak", "overheat",
    "corrosion", "fire", "explosion", "trip", "fouling", "cavitation",
]

_EXTERNAL_PREFIXES = ("04_incident_reports/CSB_", "04_incident_reports/OISD_")


def _keywords(text: str) -> set[str]:
    lower = text.lower()
    return {kw for kw in _MODE_KEYWORDS if kw in lower}


def _record_events(graph: dict) -> list[dict]:
    events = []
    for n in graph["nodes"]:
        if n["type"] not in ("Failure", "NearMiss", "Incident"):
            continue
        props = n.get("props", {})
        text = " ".join(
            str(props.get(k, ""))
            for k in ("failure_mode", "cause", "title", "classification", "description")
        )
        events.append({
            "id": n["id"],
            "type": n["type"],
            "key": n["key"],
            "date": str(props.get("date", ""))[:10],
            "summary": (props.get("failure_mode") or props.get("title") or "")[:160],
            "keywords": _keywords(text),
        })
    return events


def _equipment_of(event_id: str, graph: dict) -> list[str]:
    tags = []
    for e in graph["edges"]:
        if e["rel"] in ("HAS_FAILURE", "LINKED_TO") and e["target"] == event_id \
                and e["source"].startswith("Equipment:"):
            tags.append(e["source"].split(":", 1)[1])
        if e["source"] == event_id and e["target"].startswith("Equipment:"):
            tags.append(e["target"].split(":", 1)[1])
    # near-misses/incidents link via Failure records; fall back to text keys
    return sorted(set(tags))


def _same_class(graph: dict) -> dict[str, set[str]]:
    cls: dict[str, set[str]] = defaultdict(set)
    for e in graph["edges"]:
        if e["rel"] == "SAME_CLASS_AS":
            a = e["source"].split(":", 1)[1]
            b = e["target"].split(":", 1)[1]
            cls[a].add(b)
            cls[b].add(a)
    return cls


def _external_precedents(query: str, k: int = 3) -> list[dict]:
    hits = retrieve(query, k=30)
    out = []
    for h in hits:
        doc_id = h.chunk["doc_id"]
        if not doc_id.startswith(_EXTERNAL_PREFIXES):
            continue
        if any(p["doc_id"] == doc_id for p in out):
            continue
        out.append({
            "doc_id": doc_id,
            "title": doc_id.rsplit("/", 1)[-1].replace("_", " ").removesuffix(".pdf"),
            "snippet": h.chunk["text"][:220],
            "page": h.chunk.get("page"),
        })
        if len(out) >= k:
            break
    return out


def patterns() -> dict:
    graph = graph_store.load_graph()
    events = _record_events(graph)
    same_class = _same_class(graph)
    trend_risk = {e["tag"]: e for e in equipment_list()}

    # group events by strongest shared keyword
    groups: dict[str, list[dict]] = defaultdict(list)
    for event in events:
        for kw in event["keywords"]:
            groups[kw].append(event)

    seen_members: set[frozenset] = set()
    detected = []
    for kw, members in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        if len(members) < 2:
            continue
        member_ids = frozenset(m["id"] for m in members)
        if member_ids in seen_members:
            continue
        seen_members.add(member_ids)

        tags = sorted({t for m in members for t in _equipment_of(m["id"], graph)})
        siblings = sorted({s for t in tags for s in same_class.get(t, set())} - set(tags))
        at_risk = [
            {
                "tag": s,
                "risk": trend_risk.get(s, {}).get("risk", "unknown"),
                "latest_value": trend_risk.get(s, {}).get("latest_value"),
                "alarm": trend_risk.get(s, {}).get("alarm"),
            }
            for s in siblings
        ]

        detected.append({
            "pattern": kw,
            "title": f"Recurring {kw} events",
            "members": [
                {k: m[k] for k in ("id", "type", "key", "date", "summary")}
                for m in sorted(members, key=lambda m: m["date"])
            ],
            "equipment": tags,
            "at_risk_siblings": at_risk,
            "precedents": _external_precedents(f"{kw} failure rotating equipment refinery"),
        })

    return {"patterns": detected[:6], "event_count": len(events)}


def alerts() -> dict:
    data = patterns()
    graph = graph_store.load_graph()
    nodes = {n["id"]: n for n in graph["nodes"]}
    out = []

    for pattern in data["patterns"]:
        for sibling in pattern["at_risk_siblings"]:
            if sibling["risk"] not in ("watch", "alarm"):
                continue
            tag = sibling["tag"]
            capa = next(
                (n for nid, n in nodes.items() if nid.startswith("CAPA:")
                 and "BFW" in str(n.get("props", {}).get("preventive_action", ""))),
                None,
            )
            evidence_chain = [
                {"id": m["id"], "key": m["key"], "date": m["date"], "summary": m["summary"]}
                for m in pattern["members"]
            ]
            rationale = (
                f"{tag} is SAME_CLASS_AS {', '.join(pattern['equipment'])}, which "
                f"share {len(pattern['members'])} historical {pattern['pattern']} events. "
                f"Its DE vibration is now {sibling['latest_value']} mm/s and rising "
                f"(alarm {sibling['alarm']} mm/s)."
            )
            summary = llm.chat(
                "You are a reliability engineer issuing a proactive maintenance alert. "
                "Write 2 sentences: the specific risk and the action to take this week. "
                "Use the record IDs given. No preamble.",
                f"Alert target: {tag}\nRationale: {rationale}\n"
                f"Evidence: {[m['key'] for m in pattern['members']]}\n"
                f"Existing preventive action: "
                f"{capa.get('props', {}).get('preventive_action', 'n/a') if capa else 'n/a'}",
                max_tokens=180,
            )
            out.append({
                "severity": "warning" if sibling["risk"] == "watch" else "danger",
                "target": tag,
                "pattern": pattern["pattern"],
                "title": f"{tag}: {pattern['pattern']} risk — same class as "
                         f"{'/'.join(pattern['equipment'])}",
                "rationale": rationale,
                "summary": summary,
                "summary_mode": "llm" if summary else "rule_based",
                "evidence": evidence_chain,
                "precedents": pattern["precedents"],
                "recommended_action": (
                    capa.get("props", {}).get("preventive_action", "")[:220] if capa else ""
                ),
            })

    # deduplicate per target, strongest pattern first
    unique: dict[str, dict] = {}
    for alert in out:
        unique.setdefault(alert["target"], alert)
    return {"alerts": list(unique.values())}
