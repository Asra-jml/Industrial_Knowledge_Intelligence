"""IKI FastAPI app — the single integration surface for all features.

Run:  uvicorn backend.api.main:app --reload
F1 graph · F2 copilot · F3 rca · F4 compliance · F5 lessons
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import compliance, copilot, graph, lessons, rca

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
app.include_router(copilot.router)
app.include_router(rca.router)
app.include_router(compliance.router)
app.include_router(lessons.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "iki-api"}
