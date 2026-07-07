"""Graph construction rules: ParsedDoc + Extraction -> nodes & edges.

Two layers:
- per-file contributions (cached, incremental) via `build_contribution`
- global pass via `merge_contributions` (node/edge dedup, SAME_CLASS_AS
  cliques, weighted CO_OCCURS_WITH, stub nodes for dangling references)

Edge vocabulary = the 12 ontology edge types + one documented extension,
LINKED_TO (with a `via` property), for structured cross-references the
ontology has no named edge for (e.g. failure->incident columns, markdown
"Linked:" lines). Node vocabulary = the 15 schema types + documented
extensions Procedure (SOP-xxx, referenced by compliance/NCR rows) and
LessonLearned (LL-xxxx records in 04_incident_reports).
"""
from __future__ import annotations

import re
from collections import Counter
from itertools import combinations

from backend.core.models import ParsedDoc, edge, node
from backend.ingestion.extract.entities import Extraction, extract_entities
from backend.ingestion.extract.ontology import (
    Ontology,
    REG_DOC_MAP,
    normalize_regulation,
)

# id prefix -> node type (for resolving cross-reference columns / Linked lines)
PREFIX_TYPE = {
    "WO": "WorkOrder", "FR": "Failure", "NCR": "NCR", "CAPA": "CAPA",
    "INSP": "Inspection", "CAL": "Calibration", "AUD": "Audit",
    "INC": "Incident", "NM": "NearMiss", "LL": "LessonLearned",
    "PTW": "Permit", "SOP": "Procedure",
}

# CSVs whose rows enumerate the whole plant — excluded from co-occurrence
REGISTER_FILES = {
    "asset_register.csv", "equipment_master.csv", "entity_dictionary.csv",
    "spare_parts_database.csv", "inventory_register.csv",
}

_DEPT_HINT = re.compile(
    r"dept|team|manager|planner|supervisor|in-?charge|committee|ops\b|maintenance|planning",
    re.IGNORECASE,
)


def _record_ref(record_id: str) -> str | None:
    """'FR-2026-0625' -> 'Failure:FR-2026-0625' (None if prefix unknown)."""
    prefix = record_id.split("-", 1)[0]
    ntype = PREFIX_TYPE.get(prefix)
    return f"{ntype}:{record_id}" if ntype else None


def _person(name: str) -> dict:
    kind = "dept" if _DEPT_HINT.search(name) else "person"
    return node("Person", name.strip(), kind=kind)


def _split_multi(value: str) -> list[str]:
    return [v.strip() for v in value.split(";") if v.strip()]


def build_contribution(doc: ParsedDoc, ex: Extraction, onto: Ontology) -> dict:
    """All nodes/edges derivable from one file, plus co-occurrence raw pairs."""
    nodes: list[dict] = []
    edges: list[dict] = []
    doc_ref = f"Document:{doc.doc_id}"

    nodes.append(
        node(
            "Document", doc.doc_id,
            doc_type=doc.doc_type, title=doc.title, readable=doc.readable,
            ocr_used=doc.ocr_used,
            date=doc.metadata.get("date", ""),
            symbol_count=doc.metadata.get("symbol_count"),
        )
    )

    # --- MENTIONS from whole-document extraction ---
    for tag in ex.equipment:
        nodes.append(_equipment_node(tag, onto))
        edges.append(edge(doc_ref, f"Equipment:{tag}", "MENTIONS"))
    for pn in ex.parts:
        nodes.append(node("SparePart", pn, **onto.part_props.get(pn, {})))
        edges.append(edge(doc_ref, f"SparePart:{pn}", "MENTIONS"))
    for reg in ex.regulations:
        nodes.append(node("Regulation", reg))
        edges.append(edge(doc_ref, f"Regulation:{reg}", "MENTIONS"))
    for ntype, ids in ex.records.items():
        for rid in ids:
            if ntype == "Drawing":
                continue  # drawing refs become virtual Documents via asset_register
            edges.append(edge(doc_ref, f"{ntype}:{rid}", "MENTIONS"))

    # --- structured rows (CSV) / typed markdown records ---
    basename = doc.doc_id.rsplit("/", 1)[-1]
    handler = _CSV_HANDLERS.get(basename)
    if handler and doc.rows is not None:
        n, e = handler(doc, onto)
        nodes += n
        edges += e
    elif doc.doc_id.endswith(".md"):
        n, e = _markdown_record(doc, ex)
        nodes += n
        edges += e
    elif doc.doc_type == "email":
        for p in doc.metadata.get("persons", []):
            nodes.append(_person(p["name"]))
            edges.append(
                edge(doc_ref, f"Person:{p['name']}", "MENTIONS",
                     role=p["role"], email=p.get("email", ""))
            )

    # --- co-occurrence raw material (register files excluded) ---
    pairs: list[list[str]] = []
    if basename not in REGISTER_FILES and doc.doc_type != "kg_metadata":
        if doc.rows is not None:
            for row in doc.rows:
                row_ex = extract_entities(" | ".join(row.values()), onto)
                pairs += [sorted(p) for p in combinations(sorted(row_ex.equipment), 2)]
        elif len(ex.equipment) > 1:
            pairs += [sorted(p) for p in combinations(sorted(ex.equipment), 2)]

    return {"nodes": nodes, "edges": edges, "cooccur_pairs": pairs}


def _equipment_node(tag: str, onto: Ontology) -> dict:
    return node("Equipment", tag, **onto.equipment_props.get(tag, {}))


# ---------------------------------------------------------------- CSV handlers

def _h_asset_register(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        tag = row.get("tag", "")
        if not tag:
            continue
        nodes.append(_equipment_node(tag, onto))
        if row.get("pid_ref"):
            dwg = row["pid_ref"]
            nodes.append(node("Document", dwg, doc_type="pid_drawing", virtual=True,
                              title=f"P&ID drawing {dwg}"))
            edges.append(edge(f"Equipment:{tag}", f"Document:{dwg}", "APPEARS_IN",
                              via="asset_register.pid_ref"))
        if row.get("manual_ref"):
            manual_id = f"02_manuals/{row['manual_ref']}"
            edges.append(edge(f"Equipment:{tag}", f"Document:{manual_id}", "APPEARS_IN",
                              via="asset_register.manual_ref"))
    return nodes, edges


def _h_equipment_master(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        tag = row.get("tag", "")
        if not tag:
            continue
        nodes.append(_equipment_node(tag, onto))
        for col in ("motor_tag", "drive_tag"):
            sub = row.get(col, "")
            if sub:
                nodes.append(_equipment_node(sub, onto))
                edges.append(edge(f"Equipment:{sub}", f"Equipment:{tag}", "LINKED_TO", via=col))
    return nodes, edges


def _h_work_orders(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        wo, tag = row.get("wo_id", ""), row.get("tag", "")
        if not wo:
            continue
        nodes.append(node("WorkOrder", wo, date=row.get("date_raised", ""),
                          wo_type=row.get("wo_type", ""), priority=row.get("priority", ""),
                          description=row.get("description", ""), status=row.get("status", ""),
                          downtime_hrs=row.get("downtime_hrs", "")))
        if tag:
            edges.append(edge(f"Equipment:{tag}", f"WorkOrder:{wo}", "HAS_WORKORDER"))
        if row.get("assigned_to"):
            nodes.append(_person(row["assigned_to"]))
            edges.append(edge(f"WorkOrder:{wo}", f"Person:{row['assigned_to']}",
                              "LINKED_TO", via="assigned_to"))
    return nodes, edges


def _h_failures(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        fr, tag = row.get("failure_id", ""), row.get("tag", "")
        if not fr:
            continue
        nodes.append(node("Failure", fr, date=row.get("date", ""),
                          failure_mode=row.get("failure_mode", ""),
                          detection=row.get("detection", ""),
                          downtime_hrs=row.get("downtime_hrs", ""),
                          cause=row.get("cause", "")))
        if tag:
            edges.append(edge(f"Equipment:{tag}", f"Failure:{fr}", "HAS_FAILURE"))
        for col in ("linked_wo", "linked_incident"):
            ref = _record_ref(row.get(col, "")) if row.get(col) else None
            if ref:
                edges.append(edge(f"Failure:{fr}", ref, "LINKED_TO", via=col))
    return nodes, edges


def _h_inspections(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        insp, tag = row.get("insp_id", ""), row.get("tag", "")
        if not insp:
            continue
        nodes.append(node("Inspection", insp, date=row.get("date", ""),
                          inspection_type=row.get("inspection_type", ""),
                          de_vibration_mm_s=row.get("de_vibration_mm_s", ""),
                          finding=row.get("finding", ""), result=row.get("result", ""),
                          next_due=row.get("next_due", "")))
        if tag:
            edges.append(edge(f"Equipment:{tag}", f"Inspection:{insp}", "INSPECTED_BY"))
        if row.get("inspector"):
            nodes.append(_person(row["inspector"]))
            edges.append(edge(f"Inspection:{insp}", f"Person:{row['inspector']}",
                              "LINKED_TO", via="inspector"))
    return nodes, edges


def _h_calibrations(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        cal, tag = row.get("cal_id", ""), row.get("instrument_tag", "")
        if not cal:
            continue
        nodes.append(node("Calibration", cal, date=row.get("date", ""),
                          instrument=row.get("instrument", ""), result=row.get("result", ""),
                          next_due=row.get("next_due", "")))
        if tag:
            edges.append(edge(f"Equipment:{tag}", f"Calibration:{cal}",
                              "INSPECTED_BY", kind="calibration"))
        if row.get("technician"):
            nodes.append(_person(row["technician"]))
            edges.append(edge(f"Calibration:{cal}", f"Person:{row['technician']}",
                              "LINKED_TO", via="technician"))
    return nodes, edges


def _h_ncr(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        ncr = row.get("ncr_id", "")
        if not ncr:
            continue
        nodes.append(node("NCR", ncr, date=row.get("date_raised", ""),
                          severity=row.get("severity", ""),
                          description=row.get("description", ""),
                          status=row.get("status", "")))
        if row.get("tag"):
            edges.append(edge(f"NCR:{ncr}", f"Equipment:{row['tag']}", "LINKED_TO", via="tag"))
        if row.get("linked_capa"):
            edges.append(edge(f"NCR:{ncr}", f"CAPA:{row['linked_capa']}", "ADDRESSED_BY"))
        # RAISED_AS: the failure/inspection named in the description raised this NCR
        ex = extract_entities(row.get("description", ""), onto)
        for ntype in ("Failure", "Inspection"):
            for rid in ex.records.get(ntype, set()):
                edges.append(edge(f"{ntype}:{rid}", f"NCR:{ncr}", "RAISED_AS"))
        for raw in _split_multi(row.get("regulation_breached", "")):
            norm = normalize_regulation(raw)
            if norm:
                name, clause = norm
                nodes.append(node("Regulation", name))
                edges.append(edge(f"NCR:{ncr}", f"Regulation:{name}", "LINKED_TO",
                                  via="regulation_breached", clause=clause))
        proc = extract_entities(row.get("procedure_breached", ""), onto)
        for sop in proc.records.get("Procedure", set()):
            nodes.append(node("Procedure", sop))
            edges.append(edge(f"NCR:{ncr}", f"Procedure:{sop}", "LINKED_TO",
                              via="procedure_breached"))
        if row.get("raised_by"):
            nodes.append(_person(row["raised_by"]))
            edges.append(edge(f"NCR:{ncr}", f"Person:{row['raised_by']}",
                              "LINKED_TO", via="raised_by"))
    return nodes, edges


def _h_capa(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        capa = row.get("capa_id", "")
        if not capa:
            continue
        nodes.append(node("CAPA", capa, date_opened=row.get("date_opened", ""),
                          capa_type=row.get("type", ""), root_cause=row.get("root_cause", ""),
                          corrective_action=row.get("corrective_action", ""),
                          preventive_action=row.get("preventive_action", ""),
                          status=row.get("status", ""), target_date=row.get("target_date", "")))
        if row.get("linked_ncr"):
            edges.append(edge(f"NCR:{row['linked_ncr']}", f"CAPA:{capa}", "ADDRESSED_BY"))
        if row.get("owner"):
            nodes.append(_person(row["owner"]))
            edges.append(edge(f"CAPA:{capa}", f"Person:{row['owner']}", "LINKED_TO", via="owner"))
    return nodes, edges


def _h_compliance(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        norm = normalize_regulation(row.get("regulation", ""))
        if not norm:
            continue
        reg_name, _ = norm
        nodes.append(node("Regulation", reg_name))
        applies_ex = extract_entities(row.get("applies_to", ""), onto)
        for tag in applies_ex.equipment:
            nodes.append(_equipment_node(tag, onto))
            edges.append(edge(f"Equipment:{tag}", f"Regulation:{reg_name}", "GOVERNED_BY",
                              req_id=row.get("req_id", ""), clause=row.get("clause", ""),
                              status=row.get("status", ""), gap_note=row.get("gap_note", ""),
                              evidence=row.get("evidence", "")))
        proc_ex = extract_entities(row.get("linked_procedure", ""), onto)
        for sop in proc_ex.records.get("Procedure", set()):
            nodes.append(node("Procedure", sop))
            edges.append(edge(f"Procedure:{sop}", f"Regulation:{reg_name}", "GOVERNED_BY",
                              req_id=row.get("req_id", "")))
    return nodes, edges


def _h_spare_parts(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        pn = row.get("part_no", "")
        if not pn:
            continue
        nodes.append(node("SparePart", pn, description=row.get("description", ""),
                          oem=row.get("oem", ""), criticality=row.get("criticality", ""),
                          lead_time_days=row.get("lead_time_days", ""),
                          notes=row.get("notes", "")))
        for tag in _split_multi(row.get("equipment_tag", "")):
            if tag in onto.known_tags:
                edges.append(edge(f"Equipment:{tag}", f"SparePart:{pn}", "USES_PART"))
    return nodes, edges


def _h_inventory(doc: ParsedDoc, onto: Ontology):
    nodes = []
    for row in doc.rows:
        pn = row.get("part_no", "")
        if pn:
            nodes.append(node("SparePart", pn, description=row.get("description", ""),
                              qty_on_hand=row.get("qty_on_hand", ""),
                              min_qty=row.get("min_qty", ""),
                              store_location=row.get("store_location", "")))
    return nodes, []


def _h_permits(doc: ParsedDoc, onto: Ontology):
    nodes, edges = [], []
    for row in doc.rows:
        ptw = row.get("ptw_id", "")
        if not ptw:
            continue
        nodes.append(node("Permit", ptw, date=row.get("date", ""),
                          permit_type=row.get("type", ""), area=row.get("area", ""),
                          work_description=row.get("work_description", ""),
                          status=row.get("status", "")))
        if row.get("tag") and row["tag"] in onto.known_tags:
            edges.append(edge(f"Equipment:{row['tag']}", f"Permit:{ptw}",
                              "LINKED_TO", via="permit_to_work"))
        if row.get("issued_by"):
            nodes.append(_person(row["issued_by"]))
            edges.append(edge(f"Permit:{ptw}", f"Person:{row['issued_by']}",
                              "LINKED_TO", via="issued_by"))
    return nodes, edges


def _h_pm_log(doc: ParsedDoc, onto: Ontology):
    edges = []
    for row in doc.rows:
        tag, wo = row.get("tag", ""), row.get("linked_wo", "")
        if tag and wo:
            edges.append(edge(f"Equipment:{tag}", f"WorkOrder:{wo}", "HAS_WORKORDER",
                              via="preventive_maintenance_log"))
    return [], edges


def _h_cm_log(doc: ParsedDoc, onto: Ontology):
    edges = []
    for row in doc.rows:
        tag = row.get("tag", "")
        if not tag:
            continue
        if row.get("linked_wo"):
            edges.append(edge(f"Equipment:{tag}", f"WorkOrder:{row['linked_wo']}",
                              "HAS_WORKORDER", via="corrective_maintenance_log"))
        if row.get("linked_failure"):
            edges.append(edge(f"Equipment:{tag}", f"Failure:{row['linked_failure']}",
                              "HAS_FAILURE", via="corrective_maintenance_log"))
    return [], edges


_CSV_HANDLERS = {
    "asset_register.csv": _h_asset_register,
    "equipment_master.csv": _h_equipment_master,
    "work_orders.csv": _h_work_orders,
    "equipment_failure_records.csv": _h_failures,
    "inspection_reports.csv": _h_inspections,
    "calibration_records.csv": _h_calibrations,
    "ncr_register.csv": _h_ncr,
    "capa_register.csv": _h_capa,
    "compliance_register.csv": _h_compliance,
    "spare_parts_database.csv": _h_spare_parts,
    "inventory_register.csv": _h_inventory,
    "permit_to_work.csv": _h_permits,
    "preventive_maintenance_log.csv": _h_pm_log,
    "corrective_maintenance_log.csv": _h_cm_log,
}

# ------------------------------------------------------------- markdown records

_MD_PRIMARY_RE = re.compile(
    r"\b(INC|NM|LL|AUD|INSP)-\d{4}-\d{2,4}\b"
)


def _markdown_record(doc: ParsedDoc, ex: Extraction):
    """Typed node for the record a markdown file IS (INC-2026-07.md -> Incident),
    plus LINKED_TO edges to every record it cross-references."""
    nodes, edges = [], []
    m = _MD_PRIMARY_RE.search(doc.doc_id.rsplit("/", 1)[-1]) or _MD_PRIMARY_RE.search(doc.title)
    if not m:
        return nodes, edges

    primary_id = m.group()
    primary_ref = _record_ref(primary_id)
    ntype = primary_ref.split(":", 1)[0]
    props = {
        "date": doc.metadata.get("Date/time", "") or doc.metadata.get("Scheduled date", ""),
        "status": doc.metadata.get("Status", ""),
        "classification": doc.metadata.get("Classification", ""),
        "title": doc.title,
    }
    nodes.append(node(ntype, primary_id, **props))
    edges.append(edge(f"Document:{doc.doc_id}", primary_ref, "LINKED_TO", via="primary_record"))

    for rtype, ids in ex.records.items():
        for rid in ids:
            if rid == primary_id or rtype == "Drawing":
                continue
            ref = _record_ref(rid)
            if not ref:
                continue
            if ntype == "Audit" and rtype == "NCR":
                edges.append(edge(ref, primary_ref, "FOUND_IN"))
            else:
                edges.append(edge(primary_ref, ref, "LINKED_TO", via="linked_line"))
    return nodes, edges


# ----------------------------------------------------------------- global merge

def merge_contributions(contributions: list[dict], onto: Ontology) -> dict:
    """Dedupe nodes/edges, add SAME_CLASS_AS + CO_OCCURS_WITH + Regulation
    source-document links + stubs. Deterministic given the same inputs."""
    nodes: dict[str, dict] = {}
    edges: dict[tuple, dict] = {}

    def _add_node(n: dict):
        cur = nodes.get(n["id"])
        if cur is None:
            nodes[n["id"]] = {**n, "props": dict(n["props"])}
        else:
            for k, v in n["props"].items():
                if v not in (None, "", []) and not cur["props"].get(k):
                    cur["props"][k] = v

    def _add_edge(e: dict):
        key = (e["source"], e["target"], e["rel"])
        cur = edges.get(key)
        if cur is None:
            edges[key] = {**e, "props": dict(e["props"])}
        else:
            for k, v in e["props"].items():
                if v not in (None, "", []) and not cur["props"].get(k):
                    cur["props"][k] = v

    for contrib in sorted(contributions, key=lambda c: c.get("doc_id", "")):
        for n in contrib["nodes"]:
            _add_node(n)
        for e in contrib["edges"]:
            _add_edge(e)

    # SAME_CLASS_AS cliques from make/model groups
    groups: dict[str, list[str]] = {}
    for tag, mm in onto.make_model.items():
        groups.setdefault(mm.strip().lower(), []).append(tag)
    for mm, tags in groups.items():
        present = sorted(t for t in tags if f"Equipment:{t}" in nodes)
        for a, b in combinations(present, 2):
            _add_edge(edge(f"Equipment:{a}", f"Equipment:{b}", "SAME_CLASS_AS",
                           make_model=onto.make_model[a]))

    # weighted CO_OCCURS_WITH
    weights: Counter = Counter()
    for contrib in contributions:
        for a, b in contrib.get("cooccur_pairs", []):
            weights[(a, b)] += 1
    for (a, b), w in sorted(weights.items()):
        if f"Equipment:{a}" in nodes and f"Equipment:{b}" in nodes:
            _add_edge(edge(f"Equipment:{a}", f"Equipment:{b}", "CO_OCCURS_WITH", weight=w))

    # Regulation -> its source PDF document
    for reg, doc_id in REG_DOC_MAP.items():
        if f"Regulation:{reg}" in nodes and f"Document:{doc_id}" in nodes:
            _add_edge(edge(f"Regulation:{reg}", f"Document:{doc_id}", "LINKED_TO",
                           via="source_document"))

    # stub nodes for referenced-but-undefined endpoints
    for (src, dst, _rel) in list(edges.keys()):
        for ref in (src, dst):
            if ref not in nodes:
                ntype, key = ref.split(":", 1)
                nodes[ref] = node(ntype, key, stub=True)

    return {
        "nodes": sorted(nodes.values(), key=lambda n: n["id"]),
        "edges": sorted(edges.values(), key=lambda e: (e["source"], e["rel"], e["target"])),
    }
