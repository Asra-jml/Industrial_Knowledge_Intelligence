"""Parser tests against real corpus files (local, fixed) + tiny fixtures."""
from pathlib import Path

import pytest

from backend.core import config
from backend.ingestion.parsers import parse_file

CORPUS = config.CORPUS_ROOT


def test_csv_rows_and_bom():
    doc = parse_file(
        CORPUS / "07_work_orders" / "work_orders.csv",
        "07_work_orders/work_orders.csv",
        "work_order",
    )
    assert doc.rows and doc.rows[0]["wo_id"].startswith("WO-")
    assert "wo_id" in doc.metadata["columns"]
    # BOM'd dataset CSV: descriptor only, no rows
    ai4i = parse_file(
        CORPUS / "05_maintenance_datasets" / "AI4I_2020" / "ai4i2020.csv",
        "05_maintenance_datasets/AI4I_2020/ai4i2020.csv",
        "dataset",
    )
    assert ai4i.rows is None
    assert ai4i.metadata["columns"][0] == "UDI"   # utf-8-sig strips the BOM
    assert ai4i.metadata["row_count"] == 10000


def test_markdown_metadata_and_linked_line():
    doc = parse_file(
        CORPUS / "04_incident_reports" / "INTERNAL_plant_incident_INC-2026-07.md",
        "04_incident_reports/INTERNAL_plant_incident_INC-2026-07.md",
        "incident_report",
    )
    assert "INC-2026-07" in doc.title
    assert "Plant" in doc.metadata
    assert "FR-2026-0625" in doc.metadata["linked_line"]


def test_email_persons_and_date():
    doc = parse_file(
        CORPUS / "10_emails" / "2026-05-28_maintenance_P-101_vibration.eml",
        "10_emails/2026-05-28_maintenance_P-101_vibration.eml",
        "email",
    )
    roles = {p["role"] for p in doc.metadata["persons"]}
    assert {"from", "to", "cc"} <= roles
    assert doc.metadata["date"] == "2026-05-28"
    assert "P-101" in doc.text


def test_pdf_digital_extracts_text():
    doc = parse_file(
        CORPUS / "02_manuals" / "Grundfos_CR-CRN-95-255_Install-Operate.pdf",
        "02_manuals/Grundfos_CR-CRN-95-255_Install-Operate.pdf",
        "manual",
    )
    assert doc.readable and len(doc.text) > 1000
    assert doc.metadata["page_count"] > 1


def test_cmapss_descriptor_mode():
    doc = parse_file(
        CORPUS / "05_maintenance_datasets" / "NASA_CMAPSS" / "train_FD001.txt",
        "05_maintenance_datasets/NASA_CMAPSS/train_FD001.txt",
        "dataset",
    )
    assert doc.metadata.get("sensor_data") is True
    assert len(doc.text) < 300   # descriptor, not the raw array


def test_pid_label_sidecar():
    images = sorted((CORPUS / "01_pids" / "images").glob("*.jpg"))
    img = images[0]
    doc = parse_file(img, f"01_pids/images/{img.name}", "pid_drawing")
    assert doc.readable is False
    assert doc.metadata["symbol_count"] > 0
