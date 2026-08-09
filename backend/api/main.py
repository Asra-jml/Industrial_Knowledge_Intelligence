"""IKI FastAPI app — the single integration surface for all features.

Run:  uvicorn backend.api.main:app --reload
F1 graph · F2 copilot · F3 rca · F4 compliance · F5 lessons
"""
from __future__ import annotations

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import compliance, copilot, graph, lessons, rca
from backend.core import config

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-5s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("iki.api")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Industrial Knowledge Intelligence (IKI)",
    description="Unified Asset & Operations Brain — ET AI Hackathon 2026, Problem 8",
    version="0.1.0",
)

# CORS — open for demo; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed_ms = (time.time() - start) * 1000
    logger.info(
        "%s %s → %d (%.0fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(graph.router)
app.include_router(copilot.router)
app.include_router(rca.router)
app.include_router(compliance.router)
app.include_router(lessons.router)


# ---------------------------------------------------------------------------
# Health & status
# ---------------------------------------------------------------------------
_START_TIME = time.time()


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "iki-api",
        "uptime_s": round(time.time() - _START_TIME),
        "llm_configured": config.llm_configured(),
        "llm_provider": config.LLM_PROVIDER,
        "neo4j_configured": config.neo4j_configured(),
    }


@app.on_event("startup")
def _startup_log():
    logger.info("IKI API starting")
    logger.info("  LLM: %s (%s)", config.LLM_PROVIDER or "none", config.LLM_MODEL or "n/a")
    logger.info("  Neo4j: %s", "configured" if config.neo4j_configured() else "not configured")
    logger.info("  Corpus: %s", config.CORPUS_ROOT)

