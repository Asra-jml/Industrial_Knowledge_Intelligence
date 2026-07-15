"""F4 Compliance API router — /api/compliance/*.

Mounts into the main FastAPI app via backend.api.main.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.compliance.compliance_engine import ComplianceEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

# Lazy singleton — built on first request
_engine: ComplianceEngine | None = None


def _get_engine() -> ComplianceEngine:
    global _engine
    if _engine is None:
        _engine = ComplianceEngine()
    if not _engine._built:
        _engine.build()
    return _engine


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class DashboardResponse(BaseModel):
    total_requirements: int
    gaps: int
    compliant: int
    open: int
    ncr_open: int
    capa_open: int
    ncr_total: int
    capa_total: int
    regulation_breakdown: dict
    asset_status: list[dict]


class EvidencePackResponse(BaseModel):
    equipment_tag: str
    compliance_entries: list[dict]
    ncrs: list[dict]
    capas: list[dict]
    graph_edges: list[dict]
    linked_documents: list[dict]
    inspections: list[dict]
    narrative: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/dashboard", response_model=DashboardResponse)
def dashboard() -> DashboardResponse:
    """Aggregate compliance statistics for the dashboard."""
    try:
        engine = _get_engine()
    except Exception as e:
        logger.error("Failed to build ComplianceEngine: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    return DashboardResponse(**engine.get_dashboard())


@router.get("/gaps")
def gaps() -> dict:
    """All compliance entries with status GAP or OPEN."""
    try:
        engine = _get_engine()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"gaps": engine.get_gaps(), "count": len(engine.get_gaps())}


@router.get("/register")
def register() -> dict:
    """Full compliance register."""
    try:
        engine = _get_engine()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    return {"register": engine.get_register(), "count": len(engine.get_register())}


@router.get("/evidence/{equipment_tag}", response_model=EvidencePackResponse)
def evidence_pack(equipment_tag: str) -> EvidencePackResponse:
    """Per-asset evidence pack with compliance entries, NCRs, CAPAs, and narrative."""
    try:
        engine = _get_engine()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    pack = engine.get_evidence_pack(equipment_tag)
    return EvidencePackResponse(**pack.to_dict())


@router.get("/ncr")
def ncr_list() -> dict:
    """All NCRs with linked CAPAs."""
    try:
        engine = _get_engine()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    ncrs = engine.get_ncrs()
    return {"ncrs": ncrs, "count": len(ncrs)}


@router.get("/capa")
def capa_list() -> dict:
    """All CAPAs with linked NCRs."""
    try:
        engine = _get_engine()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
    capas = engine.get_capas()
    return {"capas": capas, "count": len(capas)}
