"""F2 — Expert Knowledge Copilot endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.rag.answer import ask

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

SUGGESTIONS = [
    "What's the status of P-101?",
    "Why did P-101 fail on 2026-06-25?",
    "Which inspections are overdue?",
    "What does the Grundfos manual say about bearing vibration limits?",
    "What was NCR-2026-014 raised for?",
    "Is P-205 at risk of the same failure as P-101?",
]


class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=500)


@router.post("/ask")
def copilot_ask(body: AskRequest) -> dict:
    question = body.question.strip()
    if not question:
        raise HTTPException(422, "question is empty")
    return ask(question)


@router.get("/suggestions")
def copilot_suggestions() -> dict:
    return {"suggestions": SUGGESTIONS}
