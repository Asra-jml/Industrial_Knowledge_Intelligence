"""F2 Copilot API router — POST /api/copilot/ask, GET status/suggest.

Mounts into the main FastAPI app via backend.api.main.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.rag.copilot_engine import CopilotEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/copilot", tags=["copilot"])

# Lazy singleton — built on first request
_engine: CopilotEngine | None = None


def _get_engine() -> CopilotEngine:
    global _engine
    if _engine is None:
        _engine = CopilotEngine()
    if not _engine._built:
        _engine.build()
    return _engine


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class AskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="The user's question")
    top_k: int = Field(default=8, ge=1, le=25, description="Number of chunks to retrieve")


class CitationSchema(BaseModel):
    doc_id: str
    chunk_id: str
    doc_type: str
    page: int | None = None
    snippet: str = ""
    score: float = 0.0


class AskResponse(BaseModel):
    answer: str
    citations: list[CitationSchema]
    confidence: float
    sources_used: int
    latency_ms: int = 0


class StatusResponse(BaseModel):
    built: bool
    chunk_count: int
    embed_model: str
    llm_provider: str | None
    llm_model: str | None
    llm_configured: bool


# ---------------------------------------------------------------------------
# Suggested queries (domain-expert, from PRD benchmark)
# ---------------------------------------------------------------------------

SUGGESTED_QUERIES = [
    "What is the current status of pump P-101?",
    "What inspections are overdue for P-101 and why?",
    "Show me all failure records related to bearing faults",
    "What are the vibration readings trend for P-101?",
    "Which regulations govern boiler feed-water pump maintenance?",
    "What corrective actions were taken after the P-102 near-miss?",
    "List all work orders linked to pump P-101",
    "What does the OEM manual say about vibration limits for CR 95-4?",
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/ask", response_model=AskResponse)
def ask(req: AskRequest) -> AskResponse:
    """Ask the IKI Expert Copilot a question about the plant."""
    try:
        engine = _get_engine()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    result = engine.ask(req.query, top_k=req.top_k)
    return AskResponse(**result.to_dict())


@router.get("/status", response_model=StatusResponse)
def status() -> StatusResponse:
    """Health check: is the index built? Which LLM is configured?"""
    try:
        engine = _get_engine()
        return StatusResponse(**engine.status())
    except FileNotFoundError:
        return StatusResponse(
            built=False,
            chunk_count=0,
            embed_model="all-MiniLM-L6-v2",
            llm_provider=None,
            llm_model=None,
            llm_configured=False,
        )
    except Exception as e:
        logger.error("Status check failed: %s", e)
        return StatusResponse(
            built=False,
            chunk_count=0,
            embed_model="all-MiniLM-L6-v2",
            llm_provider=None,
            llm_model=None,
            llm_configured=False,
        )


@router.get("/suggest")
def suggest() -> dict:
    """Return suggested queries for the chat UI empty state."""
    return {"suggestions": SUGGESTED_QUERIES}
