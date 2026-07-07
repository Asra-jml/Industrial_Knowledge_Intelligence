"""Graph builder tests over real corpus files."""
import pytest

from backend.core import config
from backend.ingestion.extract.entities import extract_entities
from backend.ingestion.extract.ontology import load_ontology
from backend.ingestion.graph.builder import build_contribution, merge_contributions
from backend.ingestion.parsers import parse_file

CORPUS = config.CORPUS_ROOT


@pytest.fixture(scope="module")
def onto():
    return load_ontology()


def _contrib(rel_path: str, doc_type: str, onto):
    path = CORPUS / rel_path
    doc = parse_file(path, rel_path.replace("\\", "/"), doc_type)
    ex = extract_entities(doc.text, onto)
    c = build_contribution(doc, ex, onto)
    c["doc_id"] = doc.doc_id
    return c


def _edges(graph, rel):
    return [(e["source"], e["target"]) for e in graph["edges"] if e["rel"] == rel]


def test_work_orders_produce_has_workorder(onto):
    graph = merge_contributions(
        [_contrib("07_work_orders/work_orders.csv", "work_order", onto)], onto
    )
    assert ("Equipment:P-101", "WorkOrder:WO-2026-0625") in _edges(graph, "HAS_WORKORDER")


def test_ncr_chain_raised_as_and_addressed_by(onto):
    graph = merge_contributions(
        [_contrib("11_quality_compliance/ncr_register.csv", "compliance", onto)], onto
    )
    assert ("Inspection:INSP-2026-0615", "NCR:NCR-2026-014") in _edges(graph, "RAISED_AS")
    assert ("NCR:NCR-2026-014", "CAPA:CAPA-2026-009") in _edges(graph, "ADDRESSED_BY")
    # regulation breach normalized to canonical names
    linked = _edges(graph, "LINKED_TO")
    assert ("NCR:NCR-2026-014", "Regulation:Factories Act 1948") in linked
    assert ("NCR:NCR-2026-014", "Regulation:OISD-STD-128") in linked


def test_compliance_governed_by(onto):
    graph = merge_contributions(
        [_contrib("11_quality_compliance/compliance_register.csv", "compliance", onto)], onto
    )
    gov = _edges(graph, "GOVERNED_BY")
    assert ("Equipment:P-101", "Regulation:Factories Act 1948") in gov
    gap = [e for e in graph["edges"]
           if e["rel"] == "GOVERNED_BY" and e["props"].get("status") == "GAP"]
    assert gap, "seeded GAP rows must survive as edge properties"


def test_same_class_as_clique_and_uses_part(onto):
    contribs = [
        _contrib("06_asset_register/asset_register.csv", "asset_register", onto),
        _contrib("09_inventory_spares/spare_parts_database.csv", "inventory", onto),
    ]
    graph = merge_contributions(contribs, onto)
    same = _edges(graph, "SAME_CLASS_AS")
    assert ("Equipment:P-101", "Equipment:P-102") in same
    assert ("Equipment:P-101", "Equipment:P-205") in same
    assert ("Equipment:P-101", "SparePart:SKF-6312-C3") in _edges(graph, "USES_PART")


def test_markdown_incident_record_links(onto):
    graph = merge_contributions(
        [_contrib("04_incident_reports/INTERNAL_plant_incident_INC-2026-07.md",
                  "incident_report", onto)], onto
    )
    node_ids = {n["id"] for n in graph["nodes"]}
    assert "Incident:INC-2026-07" in node_ids
    linked = _edges(graph, "LINKED_TO")
    assert ("Incident:INC-2026-07", "Failure:FR-2026-0625") in linked
    assert ("Incident:INC-2026-07", "CAPA:CAPA-2026-009") in linked
    # slash shorthand expanded
    assert ("Incident:INC-2026-07", "WorkOrder:WO-2026-0622") in linked
    assert ("Incident:INC-2026-07", "WorkOrder:WO-2026-0625") in linked


def test_stub_nodes_created_for_dangling_refs(onto):
    graph = merge_contributions(
        [_contrib("04_incident_reports/INTERNAL_plant_incident_INC-2026-07.md",
                  "incident_report", onto)], onto
    )
    stubs = {n["id"] for n in graph["nodes"] if n["props"].get("stub")}
    assert "Failure:FR-2026-0625" in stubs   # defined in a CSV not ingested here


def test_equipment_node_carries_register_props(onto):
    graph = merge_contributions(
        [_contrib("06_asset_register/asset_register.csv", "asset_register", onto)], onto
    )
    p101 = next(n for n in graph["nodes"] if n["id"] == "Equipment:P-101")
    assert p101["props"]["make"] == "Grundfos"
    assert p101["props"]["criticality"] == "A"
