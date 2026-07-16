"""F2 answer engine — grounded, cited, confidence-scored.

LLM mode: the model answers ONLY from retrieved passages, citing them as
[1], [2], … Extractive mode (no key / LLM failure): the top passages are
returned directly. Either way every response carries the same citation
objects, so the UI renders identically.
"""
from __future__ import annotations

import re
import time

from backend.core import llm
from backend.rag.retriever import ScoredChunk, retrieve

_SYSTEM = (
    "You are IKI, the expert copilot for the Deccan Refinery & Petrochemicals "
    "plant (Visakhapatnam). Answer the engineer's question using ONLY the "
    "numbered source passages provided. Cite passages inline as [1], [2] "
    "after each fact you take from them. Be concise and specific: quote "
    "dates, readings and record IDs exactly. If the passages do not contain "
    "the answer, say so plainly — never invent plant data."
)

_CITE_RE = re.compile(r"\[(\d{1,2})\]")


def _citation(ref: int, hit: ScoredChunk) -> dict:
    chunk = hit.chunk
    return {
        "ref": ref,
        "chunk_id": chunk["chunk_id"],
        "doc_id": chunk["doc_id"],
        "doc_type": chunk.get("doc_type", ""),
        "page": chunk.get("page"),
        "equipment_tags": chunk.get("equipment_tags", []),
        "record_ids": chunk.get("record_ids", []),
        "snippet": chunk["text"][:280],
        "score": round(hit.score, 2),
    }


def _confidence(hits: list[ScoredChunk], query: str) -> float:
    """Heuristic 0..1: retrieval strength + exact-ID agreement."""
    if not hits:
        return 0.0
    top = hits[0].score
    strength = min(1.0, top / 14.0)          # BM25 scale on this corpus
    boosted = sum(1 for h in hits[:4] if h.boosts) / 4
    breadth = min(1.0, len({h.chunk["doc_id"] for h in hits[:6]}) / 3)
    return round(min(0.98, 0.25 + 0.4 * strength + 0.2 * boosted + 0.15 * breadth), 2)


def ask(question: str, k: int = 8) -> dict:
    start = time.time()
    hits = retrieve(question, k=k)

    if not hits:
        return {
            "answer": "I couldn't find anything in the corpus for that. "
            "Try an equipment tag (P-101) or a record ID (NCR-2026-014).",
            "citations": [],
            "confidence": 0.0,
            "mode": "no_results",
            "latency_ms": int((time.time() - start) * 1000),
        }

    passages = "\n\n".join(
        f"[{i + 1}] ({h.chunk['doc_id']}"
        + (f", page {h.chunk['page']}" if h.chunk.get("page") else "")
        + f")\n{h.chunk['text'][:1100]}"
        for i, h in enumerate(hits)
    )

    mode = "extractive"
    answer = llm.chat(_SYSTEM, f"Sources:\n{passages}\n\nQuestion: {question}")
    if answer:
        mode = "llm"
        cited_refs = {int(m) for m in _CITE_RE.findall(answer)}
    else:
        # extractive fallback: stitch the strongest passages
        answer = "Most relevant records:\n\n" + "\n\n".join(
            f"[{i + 1}] {h.chunk['text'][:320]}" for i, h in enumerate(hits[:3])
        )
        cited_refs = {1, 2, 3}

    citations = [
        _citation(i + 1, h)
        for i, h in enumerate(hits)
        if (i + 1) in cited_refs or not cited_refs
    ] or [_citation(i + 1, h) for i, h in enumerate(hits[:3])]

    return {
        "answer": answer,
        "citations": citations,
        "confidence": _confidence(hits, question),
        "mode": mode,
        "latency_ms": int((time.time() - start) * 1000),
    }
