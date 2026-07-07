"""Extraction unit tests — run against the real corpus ontology (local, fixed)."""
import pytest

from backend.ingestion.extract.entities import extract_entities
from backend.ingestion.extract.ontology import load_ontology, normalize_regulation


@pytest.fixture(scope="session")
def onto():
    return load_ontology()


def test_record_ids_are_masked_not_equipment(onto):
    ex = extract_entities("WO-2026-0625 replaced DE bearing on P-101", onto)
    assert ex.records["WorkOrder"] == {"WO-2026-0625"}
    assert ex.equipment == {"P-101"}
    assert "WO-2026" not in ex.candidates


def test_slash_shorthand_expands(onto):
    ex = extract_entities("Linked: WO-2026-0622/0625, INSP-2026-0412/0615", onto)
    assert ex.records["WorkOrder"] == {"WO-2026-0622", "WO-2026-0625"}
    assert ex.records["Inspection"] == {"INSP-2026-0412", "INSP-2026-0615"}


def test_alias_resolution(onto):
    ex = extract_entities("the BFW Pump A tripped; P101 vibration rising", onto)
    assert "P-101" in ex.equipment


def test_unknown_tag_stays_candidate(onto):
    ex = extract_entities("Replaced air filter AF-301 during service", onto)
    assert "AF-301" in ex.candidates
    assert "AF-301" not in ex.equipment


def test_known_spare_part_routed_to_parts(onto):
    ex = extract_entities("Installed new SKF-6312-C3 on the drive end", onto)
    assert "SKF-6312-C3" in ex.parts
    assert "SKF-6312-C3" not in ex.equipment


def test_regulations_found(onto):
    ex = extract_entities(
        "Breach of Factories Act 1948; OISD-STD-128; ISO 9001:2015 9.1", onto
    )
    assert {"Factories Act 1948", "OISD-STD-128", "ISO 9001:2015"} <= ex.regulations


def test_dates_extracted(onto):
    ex = extract_entities("Failed on 2026-06-25, next due 2026-09-15", onto)
    assert ex.dates == {"2026-06-25", "2026-09-15"}


def test_normalize_regulation_with_clause():
    assert normalize_regulation("ISO 9001:2015 9.1") == ("ISO 9001:2015", "9.1")
    name, _ = normalize_regulation("Factories Act 1948")
    assert name == "Factories Act 1948"
    assert normalize_regulation("Some Unknown Law 2001") is None


def test_ontology_known_tags(onto):
    for tag in ("P-101", "P-102", "P-205", "VFD-101", "PT-101", "K-301", "M-101"):
        assert tag in onto.known_tags
    assert "SKF-6312-C3" in onto.known_parts
    assert onto.make_model["P-101"] == onto.make_model["P-205"]
