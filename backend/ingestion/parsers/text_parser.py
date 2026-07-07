"""Plain text / JSON parser, with a descriptor mode for ML sensor datasets.

NASA C-MAPSS files (train_/test_/RUL_ FD00x) are headerless 26-column sensor
arrays — chunking them as prose bloated the naive index to 60k chunks, so they
are registered with a one-line descriptor instead and left for F3 to read raw.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from backend.core.models import ParsedDoc

_SENSOR_FILE_RE = re.compile(r"^(train|test|RUL)_FD\d{3}", re.IGNORECASE)


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    doc = ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=path.stem.replace("_", " "),
    )

    if doc_type == "dataset" and _SENSOR_FILE_RE.match(path.name):
        with open(path, encoding="utf-8", errors="replace") as f:
            first = f.readline()
            line_count = 1 + sum(1 for _ in f)
        cols = len(first.split())
        doc.text = (
            f"NASA C-MAPSS sensor data {path.name}: {line_count} rows x {cols} "
            f"space-separated numeric columns (unit, cycle, 3 op settings, 21 sensors)."
        )
        doc.metadata.update({"row_count": line_count, "column_count": cols, "sensor_data": True})
        return doc

    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    if path.suffix.lower() == ".json":
        try:
            raw = json.dumps(json.loads(raw), indent=2)
        except json.JSONDecodeError:
            pass
    doc.text = raw
    return doc
