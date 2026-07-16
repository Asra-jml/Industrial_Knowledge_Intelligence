"""F5 — Lessons Learned & Failure Intelligence endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from backend.lessons.patterns import alerts, patterns

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


@router.get("/patterns")
def lessons_patterns() -> dict:
    return patterns()


@router.get("/alerts")
def lessons_alerts() -> dict:
    return alerts()
