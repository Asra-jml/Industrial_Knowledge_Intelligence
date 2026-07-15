"""F4 — Quality & Regulatory Compliance Intelligence engine.

Reads the compliance register, NCR/CAPA registers, knowledge graph, and
documents.jsonl to detect compliance gaps, assemble per-asset evidence packs,
and optionally generate LLM narrative summaries.

No writes to the corpus — everything is read-only.
"""
from __future__ import annotations

import csv
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from backend.core import config
from backend.core.graph_store import load_graph

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class ComplianceEntry:
    req_id: str
    regulation: str
    clause: str
    requirement: str
    applies_to: str
    linked_procedure: str
    evidence: str
    status: str          # GAP | COMPLIANT | OPEN
    gap_note: str

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class NCRRecord:
    ncr_id: str
    date_raised: str
    raised_by: str
    severity: str
    tag: str
    description: str
    procedure_breached: str
    regulation_breached: str
    status: str
    linked_capa: str

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class CAPARecord:
    capa_id: str
    linked_ncr: str
    date_opened: str
    capa_type: str
    root_cause: str
    corrective_action: str
    preventive_action: str
    owner: str
    target_date: str
    status: str

    def to_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


@dataclass
class EvidencePack:
    """Per-asset evidence pack — everything linked to one equipment tag."""
    equipment_tag: str
    compliance_entries: list[dict] = field(default_factory=list)
    ncrs: list[dict] = field(default_factory=list)
    capas: list[dict] = field(default_factory=list)
    graph_edges: list[dict] = field(default_factory=list)
    linked_documents: list[dict] = field(default_factory=list)
    inspections: list[dict] = field(default_factory=list)
    narrative: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "equipment_tag": self.equipment_tag,
            "compliance_entries": self.compliance_entries,
            "ncrs": self.ncrs,
            "capas": self.capas,
            "graph_edges": self.graph_edges,
            "linked_documents": self.linked_documents,
            "inspections": self.inspections,
            "narrative": self.narrative,
        }


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

class ComplianceEngine:
    """Stateless-ish engine — reloads data on each build() for freshness."""

    def __init__(self) -> None:
        self._compliance: list[ComplianceEntry] = []
        self._ncrs: list[NCRRecord] = []
        self._capas: list[CAPARecord] = []
        self._graph: dict = {"nodes": [], "edges": []}
        self._documents: list[dict] = []
        self._built = False

    # ---- loading ----------------------------------------------------------

    def build(self) -> None:
        """Load all data sources. Safe to call repeatedly."""
        self._load_compliance_register()
        self._load_ncr_register()
        self._load_capa_register()
        self._load_graph()
        self._load_documents()
        self._built = True
        logger.info(
            "ComplianceEngine built: %d compliance entries, %d NCRs, %d CAPAs, "
            "%d graph nodes, %d documents",
            len(self._compliance), len(self._ncrs), len(self._capas),
            len(self._graph.get("nodes", [])), len(self._documents),
        )

    def _csv_path(self, filename: str) -> Path:
        return config.CORPUS_ROOT / "11_quality_compliance" / filename

    def _load_compliance_register(self) -> None:
        path = self._csv_path("compliance_register.csv")
        if not path.exists():
            logger.warning("compliance_register.csv not found at %s", path)
            return
        with open(path, encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            self._compliance = [
                ComplianceEntry(
                    req_id=row.get("req_id", "").strip(),
                    regulation=row.get("regulation", "").strip(),
                    clause=row.get("clause", "").strip(),
                    requirement=row.get("requirement", "").strip(),
                    applies_to=row.get("applies_to", "").strip(),
                    linked_procedure=row.get("linked_procedure", "").strip(),
                    evidence=row.get("evidence", "").strip(),
                    status=row.get("status", "").strip(),
                    gap_note=row.get("gap_note", "").strip(),
                )
                for row in reader
                if row.get("req_id", "").strip()
            ]

    def _load_ncr_register(self) -> None:
        path = self._csv_path("ncr_register.csv")
        if not path.exists():
            logger.warning("ncr_register.csv not found at %s", path)
            return
        with open(path, encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            self._ncrs = [
                NCRRecord(
                    ncr_id=row.get("ncr_id", "").strip(),
                    date_raised=row.get("date_raised", "").strip(),
                    raised_by=row.get("raised_by", "").strip(),
                    severity=row.get("severity", "").strip(),
                    tag=row.get("tag", "").strip(),
                    description=row.get("description", "").strip(),
                    procedure_breached=row.get("procedure_breached", "").strip(),
                    regulation_breached=row.get("regulation_breached", "").strip(),
                    status=row.get("status", "").strip(),
                    linked_capa=row.get("linked_capa", "").strip(),
                )
                for row in reader
                if row.get("ncr_id", "").strip()
            ]

    def _load_capa_register(self) -> None:
        path = self._csv_path("capa_register.csv")
        if not path.exists():
            logger.warning("capa_register.csv not found at %s", path)
            return
        with open(path, encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            self._capas = [
                CAPARecord(
                    capa_id=row.get("capa_id", "").strip(),
                    linked_ncr=row.get("linked_ncr", "").strip(),
                    date_opened=row.get("date_opened", "").strip(),
                    capa_type=row.get("type", "").strip(),
                    root_cause=row.get("root_cause", "").strip(),
                    corrective_action=row.get("corrective_action", "").strip(),
                    preventive_action=row.get("preventive_action", "").strip(),
                    owner=row.get("owner", "").strip(),
                    target_date=row.get("target_date", "").strip(),
                    status=row.get("status", "").strip(),
                )
                for row in reader
                if row.get("capa_id", "").strip()
            ]

    def _load_graph(self) -> None:
        try:
            self._graph = load_graph()
        except FileNotFoundError:
            logger.warning("graph.json not found — graph features disabled")
            self._graph = {"nodes": [], "edges": []}

    def _load_documents(self) -> None:
        path = config.DOCUMENTS_PATH
        if not path.exists():
            logger.warning("documents.jsonl not found at %s", path)
            return
        self._documents = []
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    self._documents.append(json.loads(line))

    # ---- ensure built -----------------------------------------------------

    def _ensure(self) -> None:
        if not self._built:
            self.build()

    # ---- queries ----------------------------------------------------------

    def get_register(self) -> list[dict]:
        """Full compliance register as list of dicts."""
        self._ensure()
        return [e.to_dict() for e in self._compliance]

    def get_gaps(self) -> list[dict]:
        """All entries with status GAP or OPEN."""
        self._ensure()
        result = []
        for entry in self._compliance:
            if entry.status.upper() in ("GAP", "OPEN"):
                d = entry.to_dict()
                # enrich with graph edge data
                equip_id = f"Equipment:{entry.applies_to}"
                governed = [
                    e for e in self._graph.get("edges", [])
                    if e["rel"] == "GOVERNED_BY"
                    and e["source"] == equip_id
                    and e.get("props", {}).get("req_id") == entry.req_id
                ]
                if governed:
                    d["graph_edge"] = governed[0]
                result.append(d)
        return result

    def get_ncrs(self) -> list[dict]:
        """All NCRs, each enriched with its linked CAPA (if any)."""
        self._ensure()
        capa_map = {c.linked_ncr: c.to_dict() for c in self._capas}
        result = []
        for ncr in self._ncrs:
            d = ncr.to_dict()
            d["capa"] = capa_map.get(ncr.ncr_id)
            result.append(d)
        return result

    def get_capas(self) -> list[dict]:
        """All CAPAs, each enriched with its linked NCR (if any)."""
        self._ensure()
        ncr_map = {n.ncr_id: n.to_dict() for n in self._ncrs}
        result = []
        for capa in self._capas:
            d = capa.to_dict()
            d["ncr"] = ncr_map.get(capa.linked_ncr)
            result.append(d)
        return result

    def get_dashboard(self) -> dict:
        """Aggregate stats for the compliance dashboard."""
        self._ensure()
        total = len(self._compliance)
        gaps = sum(1 for e in self._compliance if e.status.upper() == "GAP")
        compliant = sum(1 for e in self._compliance if e.status.upper() == "COMPLIANT")
        open_items = sum(1 for e in self._compliance if e.status.upper() == "OPEN")
        ncr_open = sum(1 for n in self._ncrs if n.status.lower() in ("open",))
        capa_open = sum(1 for c in self._capas if c.status.lower() in ("open", "in progress"))

        # per-regulation breakdown
        reg_breakdown: dict[str, dict[str, int]] = {}
        for entry in self._compliance:
            reg = entry.regulation
            if reg not in reg_breakdown:
                reg_breakdown[reg] = {"total": 0, "gap": 0, "compliant": 0, "open": 0}
            reg_breakdown[reg]["total"] += 1
            status_key = entry.status.lower()
            if status_key in reg_breakdown[reg]:
                reg_breakdown[reg][status_key] += 1

        # per-asset status
        asset_status: dict[str, dict[str, Any]] = {}
        for entry in self._compliance:
            tag = entry.applies_to
            if tag not in asset_status:
                asset_status[tag] = {"tag": tag, "total": 0, "gap": 0, "compliant": 0, "open": 0}
            asset_status[tag]["total"] += 1
            status_key = entry.status.lower()
            if status_key in asset_status[tag]:
                asset_status[tag][status_key] += 1

        return {
            "total_requirements": total,
            "gaps": gaps,
            "compliant": compliant,
            "open": open_items,
            "ncr_open": ncr_open,
            "capa_open": capa_open,
            "ncr_total": len(self._ncrs),
            "capa_total": len(self._capas),
            "regulation_breakdown": reg_breakdown,
            "asset_status": list(asset_status.values()),
        }

    def get_evidence_pack(self, equipment_tag: str) -> EvidencePack:
        """Build a complete evidence pack for one equipment tag."""
        self._ensure()
        pack = EvidencePack(equipment_tag=equipment_tag)

        # compliance entries for this asset
        pack.compliance_entries = [
            e.to_dict() for e in self._compliance
            if e.applies_to.upper() == equipment_tag.upper()
        ]

        # NCRs for this asset
        asset_ncrs = [n for n in self._ncrs if n.tag.upper() == equipment_tag.upper()]
        pack.ncrs = [n.to_dict() for n in asset_ncrs]

        # CAPAs linked to those NCRs
        ncr_ids = {n.ncr_id for n in asset_ncrs}
        pack.capas = [
            c.to_dict() for c in self._capas
            if c.linked_ncr in ncr_ids
        ]

        # graph edges for this equipment
        equip_id = f"Equipment:{equipment_tag}"
        pack.graph_edges = [
            e for e in self._graph.get("edges", [])
            if equip_id in (e.get("source"), e.get("target"))
        ]

        # linked inspections from graph nodes
        inspection_ids: set[str] = set()
        for edge in pack.graph_edges:
            for endpoint in (edge.get("source", ""), edge.get("target", "")):
                if endpoint.startswith("Inspection:"):
                    inspection_ids.add(endpoint)
        pack.inspections = [
            n for n in self._graph.get("nodes", [])
            if n["id"] in inspection_ids
        ]

        # linked document records
        evidence_ids: set[str] = set()
        for entry in pack.compliance_entries:
            ev = entry.get("evidence", "")
            if ev:
                evidence_ids.add(ev)
        for ncr in pack.ncrs:
            ncr_id = ncr.get("ncr_id", "")
            if ncr_id:
                evidence_ids.add(ncr_id)

        # find documents that mention this equipment or contain evidence IDs
        pack.linked_documents = [
            {
                "doc_id": doc.get("doc_id", ""),
                "doc_type": doc.get("doc_type", ""),
                "title": doc.get("title", ""),
            }
            for doc in self._documents
            if equipment_tag.upper() in (t.upper() for t in doc.get("equipment_tags", []))
            or any(eid in doc.get("doc_id", "") for eid in evidence_ids if eid)
            or any(eid in (doc.get("title", "") or "") for eid in evidence_ids if eid)
        ]

        # LLM narrative (optional)
        pack.narrative = self._generate_narrative(pack)

        return pack

    def _generate_narrative(self, pack: EvidencePack) -> str:
        """Generate a compliance summary narrative using the configured LLM."""
        if not config.llm_configured():
            return self._fallback_narrative(pack)

        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=config.LLM_API_KEY,
                base_url=config.LLM_BASE_URL,
            )

            # Build a concise context from the evidence pack
            context_parts = [
                f"Equipment: {pack.equipment_tag}",
                f"Compliance entries ({len(pack.compliance_entries)}):",
            ]
            for entry in pack.compliance_entries:
                context_parts.append(
                    f"  - {entry['req_id']}: {entry['regulation']} / {entry['clause']} — "
                    f"Status: {entry['status']}. {entry['gap_note']}"
                )

            if pack.ncrs:
                context_parts.append(f"NCRs ({len(pack.ncrs)}):")
                for ncr in pack.ncrs:
                    context_parts.append(
                        f"  - {ncr['ncr_id']} ({ncr['severity']}): {ncr['description']} — "
                        f"Regulation breached: {ncr['regulation_breached']}"
                    )

            if pack.capas:
                context_parts.append(f"CAPAs ({len(pack.capas)}):")
                for capa in pack.capas:
                    context_parts.append(
                        f"  - {capa['capa_id']}: Root cause: {capa['root_cause']}. "
                        f"Corrective: {capa['corrective_action']}. "
                        f"Preventive: {capa['preventive_action']}. Status: {capa['status']}"
                    )

            if pack.inspections:
                context_parts.append(f"Inspections ({len(pack.inspections)}):")
                for insp in pack.inspections:
                    props = insp.get("props", {})
                    context_parts.append(
                        f"  - {insp['key']}: {props.get('inspection_type', 'N/A')} on "
                        f"{props.get('date', 'N/A')} — {props.get('finding', 'N/A')} "
                        f"(Result: {props.get('result', 'N/A')})"
                    )

            context = "\n".join(context_parts)

            response = client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an industrial compliance analyst at Deccan Refinery & "
                            "Petrochemicals. Write a concise compliance status summary for the "
                            "given equipment. Highlight gaps, their regulatory implications, "
                            "corrective actions in progress, and any remaining risks. "
                            "Use professional, audit-ready language. Keep it under 200 words."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Generate a compliance narrative for this evidence pack:\n\n{context}",
                    },
                ],
                temperature=0.3,
                max_tokens=500,
            )
            return response.choices[0].message.content or self._fallback_narrative(pack)

        except Exception as e:
            logger.warning("LLM narrative generation failed: %s", e)
            return self._fallback_narrative(pack)

    def _fallback_narrative(self, pack: EvidencePack) -> str:
        """Deterministic narrative when LLM is unavailable."""
        gaps = [e for e in pack.compliance_entries if e["status"].upper() == "GAP"]
        open_items = [e for e in pack.compliance_entries if e["status"].upper() == "OPEN"]
        compliant = [e for e in pack.compliance_entries if e["status"].upper() == "COMPLIANT"]

        parts = [f"Compliance summary for {pack.equipment_tag}:"]

        if not pack.compliance_entries:
            return f"No compliance requirements mapped to {pack.equipment_tag}."

        parts.append(
            f"{len(pack.compliance_entries)} regulatory requirement(s) mapped — "
            f"{len(compliant)} compliant, {len(gaps)} gap(s), {len(open_items)} open."
        )

        for gap in gaps:
            parts.append(
                f"⚠ GAP [{gap['req_id']}]: {gap['regulation']} ({gap['clause']}) — "
                f"{gap['gap_note']}"
            )

        for item in open_items:
            parts.append(
                f"⏳ OPEN [{item['req_id']}]: {item['regulation']} ({item['clause']}) — "
                f"{item['gap_note']}"
            )

        if pack.ncrs:
            parts.append(
                f"{len(pack.ncrs)} NCR(s) raised; "
                f"{len(pack.capas)} CAPA(s) in response."
            )
            for ncr in pack.ncrs:
                parts.append(
                    f"  NCR {ncr['ncr_id']} ({ncr['severity']}): {ncr['description']}"
                )

        if pack.capas:
            for capa in pack.capas:
                parts.append(
                    f"  CAPA {capa['capa_id']} ({capa['status']}): "
                    f"{capa['corrective_action']}"
                )

        return "\n".join(parts)
