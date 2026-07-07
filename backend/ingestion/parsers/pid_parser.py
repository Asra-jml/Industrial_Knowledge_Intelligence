"""P&ID drawing parser — reads the ground-truth YOLO label sidecar
(01_pids/labels/<stem>.txt) so every drawing carries symbol statistics.
Live YOLO inference + OCR tag reading is done separately in backend/cv.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path

from backend.core.models import ParsedDoc


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    doc = ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=f"P&ID drawing {path.stem}",
        readable=False,   # image; no plant text inside (generic public drawings)
    )

    label_path = path.parent.parent / "labels" / f"{path.stem}.txt"
    if label_path.exists():
        classes = Counter()
        for line in label_path.read_text(encoding="utf-8").splitlines():
            parts = line.split()
            if parts:
                classes[parts[0]] += 1
        doc.metadata["symbol_count"] = sum(classes.values())
        doc.metadata["symbol_classes"] = dict(sorted(classes.items(), key=lambda kv: -kv[1]))
        doc.metadata["label_file"] = str(label_path)
    return doc
