"""F1 acceptance verification — prints a scorecard, exits non-zero on failure.

Checks (mapped to PRD acceptance criteria):
 1. shared/ outputs exist and parse
 2. P-101 is exactly ONE node (no alias duplicates) with register properties
 3. golden-thread recall >= 90% within 2 hops of P-101
 4. P-101's linked documents span >= 6 doc_types ("linked across all document types")
 5. idempotency: incremental re-run produces byte-identical outputs
 6. add-a-file -> graph updates; remove -> graph reverts ("continuously updated")
 7. bloat guards: no sensor-array chunks, Equipment nodes only from the known-tag set

Usage:  python scripts/verify_f1.py [--skip-rerun]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.core import config                                    # noqa: E402
from backend.ingestion.extract.ontology import load_ontology       # noqa: E402
from backend.ingestion.run_ingest import run as run_ingest         # noqa: E402

# The "golden thread": every record the ontology says must be reachable from
# P-101. This is the PRD's Q12-style linkage-completeness target (>=90%).
GOLDEN_THREAD = [
    "Inspection:INSP-2026-0412",
    "Inspection:INSP-2026-0615",
    "WorkOrder:WO-2026-0622",
    "WorkOrder:WO-2026-0625",
    "Failure:FR-2026-0625",
    "Incident:INC-2026-07",
    "NCR:NCR-2026-014",
    "CAPA:CAPA-2026-009",
    "Regulation:Factories Act 1948",
    "Regulation:OISD-STD-128",
    "Equipment:P-102",
    "Equipment:P-205",
    "Equipment:VFD-101",
    "SparePart:SKF-6312-C3",
    "Audit:AUD-2026-03",
    "LessonLearned:LL-2026-02",
    "Document:02_manuals/Grundfos_CR-CRN-95-255_Install-Operate.pdf",
    "Document:10_emails/2026-05-28_maintenance_P-101_vibration.eml",
    "Document:10_emails/2026-06-25_safety_alert_P-101_trip.eml",
    "Document:04_incident_reports/INTERNAL_plant_incident_INC-2026-07.md",
    "Document:08_inspection_calibration/INSP-2026-0615_P-101_OVERDUE.md",
]

PROBE_FILE = "07_work_orders/_verify_probe.md"
PROBE_TEXT = (
    "# PROBE WORK ORDER WO-2099-0001\n\n"
    "**Equipment:** P-101\n\nVerification probe: new work order WO-2099-0001 "
    "raised for P-101 to prove incremental re-ingest updates the graph.\n"
)

results: list[tuple[bool, str]] = []


def check(ok: bool, label: str, detail: str = "") -> bool:
    results.append((ok, label))
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f"  ({detail})" if detail else ""))
    return ok


def _hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _load_graph() -> dict:
    return json.loads(config.GRAPH_PATH.read_text(encoding="utf-8"))


def _neighbors(graph: dict) -> dict[str, set[str]]:
    adj = defaultdict(set)
    for e in graph["edges"]:
        adj[e["source"]].add(e["target"])
        adj[e["target"]].add(e["source"])
    return adj


def _within_hops(adj, start: str, hops: int) -> set[str]:
    seen = {start}
    frontier = {start}
    for _ in range(hops):
        frontier = {n for f in frontier for n in adj[f]} - seen
        seen |= frontier
    return seen


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-rerun", action="store_true",
                    help="skip the idempotency + probe re-ingest checks (faster)")
    args = ap.parse_args()

    print("F1 VERIFICATION SCORECARD")
    print("=" * 60)

    # 1 — outputs exist and parse
    ok = True
    for path in (config.DOCUMENTS_PATH, config.CORPUS_INDEX_PATH, config.GRAPH_PATH):
        ok &= path.exists()
    check(ok, "shared/ outputs exist (documents, corpus_index, graph)")
    if not ok:
        return _finish()

    graph = _load_graph()
    docs = [json.loads(line) for line in
            config.DOCUMENTS_PATH.read_text(encoding="utf-8").splitlines()]
    chunks = [json.loads(line) for line in
              config.CORPUS_INDEX_PATH.read_text(encoding="utf-8").splitlines()]
    nodes = {n["id"]: n for n in graph["nodes"]}

    # 2 — single canonical P-101 node with register properties
    p101_like = [nid for nid in nodes
                 if nid.startswith("Equipment:") and nid.split(":")[1].replace("-", "") == "P101"]
    check(p101_like == ["Equipment:P-101"], "exactly one canonical P-101 node",
          f"found {p101_like}")
    props = nodes.get("Equipment:P-101", {}).get("props", {})
    check(props.get("make") == "Grundfos" and props.get("criticality") == "A",
          "P-101 carries asset-register properties", str({k: props.get(k) for k in ('make', 'model', 'criticality')}))

    # 3 — golden-thread recall within 2 hops
    adj = _neighbors(graph)
    reachable = _within_hops(adj, "Equipment:P-101", 2)
    hits = [g for g in GOLDEN_THREAD if g in reachable]
    misses = [g for g in GOLDEN_THREAD if g not in reachable]
    recall = len(hits) / len(GOLDEN_THREAD)
    check(recall >= 0.9, f"golden-thread recall >= 90% (got {recall:.0%})",
          f"missing: {misses}" if misses else "all linked")

    # 4 — document-type spread at 1 hop
    one_hop_docs = [n for n in adj["Equipment:P-101"] if n.startswith("Document:")]
    doc_types = {nodes[d]["props"].get("doc_type", "?") for d in one_hop_docs if d in nodes}
    check(len(doc_types) >= 6, f"P-101 documents span >= 6 doc_types (got {len(doc_types)})",
          ", ".join(sorted(doc_types)))

    # 7 — bloat guards
    sensor_chunks = [c for c in chunks
                     if any(s in c["doc_id"] for s in ("train_FD", "test_FD", "RUL_FD", "ai4i2020"))
                     and not c["chunk_id"].endswith("#descriptor")]
    check(not sensor_chunks, "no sensor-array chunks in corpus_index",
          f"{len(sensor_chunks)} found" if sensor_chunks else f"{len(chunks)} chunks total")
    check(len(chunks) < 20000, f"chunk count sane ({len(chunks)} < 20000)")

    onto = load_ontology()
    rogue = [nid for nid, n in nodes.items()
             if n["type"] == "Equipment" and n["key"] not in onto.known_tags]
    check(not rogue, "every Equipment node is in the known-tag set",
          f"rogue: {rogue[:5]}" if rogue else f"{sum(1 for n in nodes.values() if n['type'] == 'Equipment')} equipment nodes")

    if not args.skip_rerun:
        # 5 — idempotency: incremental re-run must be byte-identical
        before = {p: _hash(p) for p in (config.DOCUMENTS_PATH, config.CORPUS_INDEX_PATH, config.GRAPH_PATH)}
        run_ingest(full=False, use_neo4j=False)
        after = {p: _hash(p) for p in before}
        check(before == after, "idempotency: re-run produces byte-identical outputs")

        # 6 — add-a-file / remove-a-file ("continuously updated")
        probe_path = config.CORPUS_ROOT / PROBE_FILE
        try:
            probe_path.write_text(PROBE_TEXT, encoding="utf-8")
            run_ingest(full=False, use_neo4j=False)
            g2 = _load_graph()
            ids2 = {n["id"] for n in g2["nodes"]}
            adj2 = _neighbors(g2)
            added = ("WorkOrder:WO-2099-0001" in ids2
                     and "WorkOrder:WO-2099-0001" in _within_hops(adj2, "Equipment:P-101", 2))
            check(added, "add-a-file: new work order appears linked to P-101")
        finally:
            if probe_path.exists():
                probe_path.unlink()
        run_ingest(full=False, use_neo4j=False)
        g3 = _load_graph()
        check("WorkOrder:WO-2099-0001" not in {n["id"] for n in g3["nodes"]},
              "remove-a-file: probe work order gone after re-ingest")

    return _finish()


def _finish() -> int:
    passed = sum(1 for ok, _ in results if ok)
    print("=" * 60)
    print(f"RESULT: {passed}/{len(results)} checks passed")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
