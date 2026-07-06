"""CSV parser — pandas, BOM-safe, everything as strings.

Rows are kept on the ParsedDoc for row-level chunking and edge building,
EXCEPT for ML datasets (05_maintenance_datasets): those only get a descriptor
(the naive baseline chunked them into 60k useless chunks).
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

from backend.core.models import ParsedDoc


def parse(path: Path, doc_id: str, doc_type: str) -> ParsedDoc:
    df = pd.read_csv(path, dtype=str, keep_default_na=False, encoding="utf-8-sig")
    df.columns = [str(c).strip() for c in df.columns]

    doc = ParsedDoc(
        doc_id=doc_id,
        doc_type=doc_type,
        source_path=str(path),
        title=path.stem.replace("_", " "),
        metadata={"columns": list(df.columns), "row_count": int(len(df))},
    )

    if doc_type == "dataset":
        # e.g. ai4i2020.csv — sensor dataset for F3, not a text corpus
        doc.text = (
            f"Dataset {path.name}: {len(df)} rows, columns: {', '.join(df.columns)}"
        )
        return doc

    doc.rows = [
        {k: str(v).strip() for k, v in row.items()}
        for row in df.to_dict(orient="records")
    ]
    # a text view lets whole-doc entity extraction see every cell
    doc.text = "\n".join(
        " | ".join(f"{k}: {v}" for k, v in row.items() if v) for row in doc.rows
    )
    return doc
