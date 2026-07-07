"""Chunking policy tests."""
import pytest

from backend.core import config
from backend.ingestion.chunking import _split_paragraph_aware, build_chunks, CHUNK_CHARS
from backend.ingestion.extract.entities import extract_entities
from backend.ingestion.extract.ontology import load_ontology
from backend.ingestion.parsers import parse_file


@pytest.fixture(scope="module")
def onto():
    return load_ontology()


def _chunks_for(rel_path: str, doc_type: str, onto):
    doc = parse_file(config.CORPUS_ROOT / rel_path, rel_path, doc_type)
    return build_chunks(doc, extract_entities(doc.text, onto), onto)


def test_split_respects_size_and_covers_text():
    text = ("Paragraph one about pumps.\n\n" + "x" * 400 + "\n\n") * 6
    pieces = _split_paragraph_aware(text)
    assert all(len(p) <= CHUNK_CHARS for p in pieces)
    assert "".join(pieces).count("Paragraph one") >= 6   # nothing lost


def test_csv_rows_become_tagged_chunks(onto):
    chunks = _chunks_for("07_work_orders/work_orders.csv", "work_order", onto)
    wo625 = next(c for c in chunks if "WO-2026-0625" in c["record_ids"])
    assert "P-101" in wo625["equipment_tags"]
    assert wo625["chunk_id"].startswith("07_work_orders/work_orders.csv#row")


def test_vibration_csv_indexes_only_nonnormal(onto):
    chunks = _chunks_for(
        "08_inspection_calibration/condition_monitoring_vibration.csv", "inspection", onto
    )
    assert chunks[0]["chunk_id"].endswith("#descriptor") or any(
        c["chunk_id"].endswith("#descriptor") for c in chunks
    )
    row_chunks = [c for c in chunks if "#row" in c["chunk_id"]]
    assert row_chunks
    # plain-normal readings are excluded; watch/alarm/trip/recovery rows stay
    assert all(not c["text"].rstrip().endswith("status: normal") for c in row_chunks)


def test_dataset_descriptor_only(onto):
    chunks = _chunks_for(
        "05_maintenance_datasets/NASA_CMAPSS/train_FD001.txt", "dataset", onto
    )
    assert len(chunks) == 1 and chunks[0]["chunk_id"].endswith("#descriptor")


def test_pid_images_produce_no_chunks(onto):
    images = sorted((config.CORPUS_ROOT / "01_pids" / "images").glob("*.jpg"))
    rel = f"01_pids/images/{images[0].name}"
    assert _chunks_for(rel, "pid_drawing", onto) == []
