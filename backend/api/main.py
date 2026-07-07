"""IKI FastAPI app — the single integration surface for all features.

Run:  uvicorn backend.api.main:app --reload
F2 adds routers/copilot.py, F3 routers/rca.py, F4 routers/compliance.py,
F5 routers/lessons.py — mount them here.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import graph

app = FastAPI(
    title="Industrial Knowledge Intelligence (IKI)",
    description="Unified Asset & Operations Brain — ET AI Hackathon 2026, Problem 8",
    version="0.1.0",
)

# open CORS for the hackathon demo (Next.js dev server, file:// viewer)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "iki-api"}
