"""F4 — Quality & Compliance Intelligence endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from backend.compliance.register import gap_narrative, register

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/register")
def compliance_register() -> dict:
    return register()


@router.get("/narrative")
def compliance_narrative() -> dict:
    text = gap_narrative()
    return {"narrative": text, "mode": "llm" if text else "unavailable"}
