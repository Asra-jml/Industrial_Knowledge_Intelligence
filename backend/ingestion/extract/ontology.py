"""Load the corpus ontology into lookup structures that drive extraction.

Sources (all under SharedCorpus):
- 14_kg_metadata/kg_schema.json      -> node keys, edge types, field_to_edge_map, id regexes
- 14_kg_metadata/entity_dictionary.csv -> canonical tags, aliases, make/model classes
- 06_asset_register/asset_register.csv + equipment_master.csv -> known equipment + properties
- 09_inventory_spares/*.csv          -> known spare-part numbers

The known-tag set is what kills the naive baseline's false positives: a bare
`[A-Z]{1,3}-\\d{2,4}` match only becomes an Equipment reference if it is in here.
"""
from __future__ import annotations

import csv
import json
import re
from dataclasses import dataclass, field
from pathlib import Path

from backend.core import config

# Regulation name normalization: pattern -> canonical node name.
# Order matters (most specific first).
REG_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"OISD[\s_-]*STD[\s_-]*128", re.I), "OISD-STD-128"),
    (re.compile(r"OISD[\s_-]*DOC[\s_-]*2016-1", re.I), "OISD DOC-2016-1"),
    (re.compile(r"Factories\s+Act(?:\s*,?\s*1948)?", re.I), "Factories Act 1948"),
    (re.compile(r"ISO\s*9001(?:\s*:\s*2015)?", re.I), "ISO 9001:2015"),
    (re.compile(r"PESO\s+SMPV\s+Rules(?:\s*,?\s*2016)?", re.I), "PESO SMPV Rules 2016"),
    (re.compile(r"(?:PESO\s+)?Gas\s+Cylinder\s+Rules(?:\s*,?\s*2016)?", re.I), "PESO Gas Cylinder Rules 2016"),
    (re.compile(r"(?:PESO\s+)?Petroleum\s+Rules(?:\s*,?\s*2002)?", re.I), "PESO Petroleum Rules 2002"),
    (re.compile(r"Environment\s*\(?\s*Protection\s*\)?\s*Act(?:\s*,?\s*1986)?", re.I), "Environment Protection Act 1986"),
    (re.compile(r"NAAQS(?:\s*,?\s*2009)?", re.I), "NAAQS 2009"),
    (re.compile(r"CPCB\s+NAAQMS", re.I), "CPCB NAAQMS Guideline"),
]

# Regulation node -> the real PDF in 03_regulations (when we have it).
REG_DOC_MAP = {
    "Factories Act 1948": "03_regulations/Factories_Act_1948.pdf",
    "OISD DOC-2016-1": "03_regulations/OISD_DOC-2016-1_Construction_Safety_Practices.pdf",
    "PESO SMPV Rules 2016": "03_regulations/PESO_SMPV_Rules_2016.pdf",
    "PESO Gas Cylinder Rules 2016": "03_regulations/PESO_Gas_Cylinder_Rules_2016.pdf",
    "PESO Petroleum Rules 2002": "03_regulations/PESO_Petroleum_Rules_2002.pdf",
    "Environment Protection Act 1986": "03_regulations/Environment_Protection_Act_1986.pdf",
    "NAAQS 2009": "03_regulations/NAAQS_2009.pdf",
    "CPCB NAAQMS Guideline": "03_regulations/CPCB_NAAQMS_Guideline.pdf",
    # OISD-STD-128 / ISO 9001:2015 are referenced but their PDFs are not in the corpus
}


@dataclass
class Ontology:
    schema: dict
    node_key: dict[str, str]                 # node type -> key field
    edge_types: list[str]
    field_to_edge_map: dict[str, str]
    id_regex: dict[str, str]
    known_tags: set[str] = field(default_factory=set)
    known_parts: set[str] = field(default_factory=set)
    equipment_props: dict[str, dict] = field(default_factory=dict)
    part_props: dict[str, dict] = field(default_factory=dict)
    alias_map: dict[str, str] = field(default_factory=dict)   # lowercased alias -> canonical tag
    make_model: dict[str, str] = field(default_factory=dict)  # tag -> make/model class
    alias_regex: re.Pattern | None = None


def _read_csv(path: Path) -> list[dict[str, str]]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        return [
            {(k or "").strip(): (v or "").strip() for k, v in row.items()}
            for row in csv.DictReader(f)
        ]


def load_ontology(corpus_root: Path | None = None) -> Ontology:
    root = corpus_root or config.CORPUS_ROOT

    schema = json.loads((root / "14_kg_metadata" / "kg_schema.json").read_text(encoding="utf-8-sig"))
    onto = Ontology(
        schema=schema,
        node_key={nt["type"]: nt["key"] for nt in schema["node_types"]},
        edge_types=list(schema["edge_types"]),
        field_to_edge_map=dict(schema.get("field_to_edge_map", {})),
        id_regex=dict(schema.get("id_regex", {})),
    )

    # --- entity dictionary: canonical tags + aliases + make/model classes ---
    for row in _read_csv(root / "14_kg_metadata" / "entity_dictionary.csv"):
        tag = row["canonical_tag"]
        props = {
            "name": row.get("canonical_name", ""),
            "make_model": row.get("make_model", ""),
            "aliases": [a.strip() for a in row.get("aliases", "").split(";") if a.strip()],
        }
        if row.get("type") == "SparePart":
            onto.known_parts.add(tag)
            onto.part_props.setdefault(tag, {}).update(props)
        else:
            onto.known_tags.add(tag)
            onto.equipment_props.setdefault(tag, {}).update(props)
            if row.get("make_model"):
                onto.make_model[tag] = row["make_model"]
        onto.alias_map[tag.lower()] = tag
        for alias in props["aliases"]:
            onto.alias_map[alias.lower()] = tag

    # --- asset register: authoritative equipment list + properties ---
    for row in _read_csv(root / "06_asset_register" / "asset_register.csv"):
        tag = row["tag"]
        onto.known_tags.add(tag)
        onto.equipment_props.setdefault(tag, {}).update(
            {
                "name": onto.equipment_props.get(tag, {}).get("name") or row.get("description", ""),
                "make": row.get("make", ""),
                "model": row.get("model", ""),
                "unit": row.get("unit", ""),
                "area": row.get("area", ""),
                "criticality": row.get("criticality", ""),
                "install_date": row.get("install_date", ""),
            }
        )
        if row.get("make") and row.get("model"):
            onto.make_model.setdefault(tag, f"{row['make']} {row['model']}")

    # --- equipment master: limits + secondary tags (motors, drives) ---
    for row in _read_csv(root / "06_asset_register" / "equipment_master.csv"):
        tag = row["tag"]
        onto.known_tags.add(tag)
        onto.equipment_props.setdefault(tag, {}).update(
            {
                "equipment_type": row.get("equipment_type", ""),
                "de_bearing": row.get("DE_bearing", ""),
                "nde_bearing": row.get("NDE_bearing", ""),
                "vibration_alarm_mm_s": row.get("vibration_alarm_mm_s", ""),
                "vibration_trip_mm_s": row.get("vibration_trip_mm_s", ""),
            }
        )
        for col in ("motor_tag", "drive_tag"):
            sub = row.get(col, "")
            if sub:
                onto.known_tags.add(sub)
                onto.equipment_props.setdefault(sub, {}).setdefault(
                    "name", f"{col.replace('_tag', '').title()} for {tag}"
                )

    # --- calibration register: instruments are equipment too (e.g. PIT-301) ---
    cal_path = root / "08_inspection_calibration" / "calibration_records.csv"
    if cal_path.exists():
        for row in _read_csv(cal_path):
            tag = row.get("instrument_tag", "")
            if tag:
                onto.known_tags.add(tag)
                onto.equipment_props.setdefault(tag, {}).setdefault(
                    "name", row.get("instrument", "")
                )
                onto.equipment_props[tag].setdefault("equipment_type", "Instrument")

    # --- spare parts: known part numbers (part_no matches the bare tag regex) ---
    for fname in ("spare_parts_database.csv", "inventory_register.csv"):
        path = root / "09_inventory_spares" / fname
        if path.exists():
            for row in _read_csv(path):
                pn = row.get("part_no", "")
                if pn:
                    onto.known_parts.add(pn)
                    onto.part_props.setdefault(pn, {}).setdefault(
                        "description", row.get("description", "")
                    )

    # --- one alternation regex over all aliases (longest first, word-bounded) ---
    aliases = sorted(onto.alias_map.keys(), key=len, reverse=True)
    onto.alias_regex = re.compile(
        r"(?<![\w-])(" + "|".join(re.escape(a) for a in aliases) + r")(?![\w-])",
        re.IGNORECASE,
    )
    return onto


def normalize_regulation(raw: str) -> tuple[str, str] | None:
    """'ISO 9001:2015 9.1' -> ('ISO 9001:2015', '9.1'); None if unrecognized."""
    text = raw.strip()
    if not text:
        return None
    for pattern, canonical in REG_PATTERNS:
        m = pattern.search(text)
        if m:
            clause = (text[: m.start()] + " " + text[m.end():]).strip(" ;,-")
            return canonical, clause
    return None


def find_regulations(text: str) -> set[str]:
    return {canonical for pattern, canonical in REG_PATTERNS if pattern.search(text)}
