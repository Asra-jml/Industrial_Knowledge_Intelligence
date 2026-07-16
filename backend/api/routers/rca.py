"""F3 — Maintenance Intelligence & RCA endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.rca.analyze import analyze
from backend.rca.trend import equipment_list, trend

router = APIRouter(prefix="/api/rca", tags=["rca"])


@router.get("/equipment")
def rca_equipment() -> dict:
    return {"equipment": equipment_list()}


@router.get("/trend/{tag}")
def rca_trend(tag: str) -> dict:
    result = trend(tag.upper())
    if result is None:
        raise HTTPException(404, f"no condition-monitoring data for '{tag}'")
    return result


@router.get("/analyze/{tag}")
def rca_analyze(tag: str) -> dict:
    result = analyze(tag.upper())
    if result is None:
        raise HTTPException(404, f"equipment '{tag}' not found in the graph")
    return result
