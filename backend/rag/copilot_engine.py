"""F2 — Expert Knowledge Copilot RAG engine.

Loads corpus_index.jsonl → embeds chunks → FAISS vector store → retrieves
top-k → LLM generates a cited answer with confidence score.

All paths/keys come from backend.core.config — nothing hardcoded.
"""
from __future__ import annotations

import json
import logging
import os
import re
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import faiss
import numpy as np
from openai import OpenAI
from sentence_transformers import SentenceTransformer

from backend.core import config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class Citation:
    doc_id: str
    chunk_id: str
    doc_type: str
    page: int | None = None
    snippet: str = ""
    score: float = 0.0

    def to_dict(self) -> dict:
        return {
            "doc_id": self.doc_id,
            "chunk_id": self.chunk_id,
            "doc_type": self.doc_type,
            "page": self.page,
            "snippet": self.snippet,
            "score": round(self.score, 4),
        }


@dataclass
class CopilotResponse:
    answer: str
    citations: list[Citation]
    confidence: float
    sources_used: int
    latency_ms: int = 0

    def to_dict(self) -> dict:
        return {
            "answer": self.answer,
            "citations": [c.to_dict() for c in self.citations],
            "confidence": round(self.confidence, 3),
            "sources_used": self.sources_used,
            "latency_ms": self.latency_ms,
        }


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

EMBED_MODEL = "all-MiniLM-L6-v2"
INDEX_DIR_NAME = ".faiss_index"
SNIPPET_LEN = 200


class CopilotEngine:
    """Singleton-style RAG engine.  Call `build()` once, then `ask()` freely."""

    def __init__(self) -> None:
        self.chunks: list[dict] = []
        self.index: faiss.IndexFlatIP | None = None
        self.embedder: SentenceTransformer | None = None
        self._built = False

    # -- build ---------------------------------------------------------------

    def build(self) -> None:
        """Load corpus, embed, build FAISS index (or load cached)."""
        if self._built:
            return

        corpus_path = config.CORPUS_INDEX_PATH
        if not corpus_path.exists():
            raise FileNotFoundError(
                f"corpus_index.jsonl not found at {corpus_path}. "
                "Run the F1 ingest first: python -m backend.ingestion.run_ingest"
            )

        logger.info("Loading embedding model %s …", EMBED_MODEL)
        self.embedder = SentenceTransformer(EMBED_MODEL)

        logger.info("Loading corpus from %s …", corpus_path)
        self.chunks = []
        with open(corpus_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    self.chunks.append(json.loads(line))

        logger.info("Loaded %d chunks", len(self.chunks))

        index_dir = config.SHARED_DIR / INDEX_DIR_NAME
        index_path = index_dir / "faiss.index"
        meta_path = index_dir / "meta.json"

        # Try loading a cached index
        if index_path.exists() and meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            if (
                meta.get("model") == EMBED_MODEL
                and meta.get("chunk_count") == len(self.chunks)
            ):
                logger.info("Loading cached FAISS index from %s", index_path)
                self.index = faiss.read_index(str(index_path))
                self._built = True
                return

        # Build fresh
        logger.info("Embedding %d chunks (this may take a minute) …", len(self.chunks))
        texts = [c.get("text", "") for c in self.chunks]
        embeddings = self.embedder.encode(
            texts, show_progress_bar=True, normalize_embeddings=True, batch_size=8
        )
        embeddings = np.array(embeddings, dtype=np.float32)

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)  # inner-product on normalized = cosine
        self.index.add(embeddings)

        # Cache
        index_dir.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(index_path))
        meta_path.write_text(
            json.dumps({"model": EMBED_MODEL, "chunk_count": len(self.chunks)}),
            encoding="utf-8",
        )
        logger.info("FAISS index built and cached (%d vectors, dim=%d)", len(self.chunks), dim)
        self._built = True

    # -- ask -----------------------------------------------------------------

    def ask(self, query: str, top_k: int = 8) -> CopilotResponse:
        """Retrieve relevant chunks and generate a cited answer via LLM."""
        if not self._built:
            self.build()

        t0 = time.perf_counter()

        # 1. Retrieve
        retrieved = self._retrieve(query, top_k)

        # 2. Build prompt
        context_block = self._build_context(retrieved)
        system_prompt = self._system_prompt()
        user_prompt = self._user_prompt(query, context_block)

        # 3. LLM call
        if not config.llm_configured():
            return CopilotResponse(
                answer="⚠️ No LLM API key configured. Set GROQ_API_KEY or GROK_API_KEY in your .env file.",
                citations=[r[0] for r in retrieved],
                confidence=0.0,
                sources_used=len(retrieved),
                latency_ms=int((time.perf_counter() - t0) * 1000),
            )

        client = OpenAI(
            api_key=config.LLM_API_KEY,
            base_url=config.LLM_BASE_URL,
        )

        try:
            completion = client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=1500,
            )
            raw_answer = completion.choices[0].message.content or ""
        except Exception as e:
            logger.error("LLM call failed: %s", e)
            return CopilotResponse(
                answer=f"⚠️ LLM call failed: {e}",
                citations=[r[0] for r in retrieved],
                confidence=0.0,
                sources_used=len(retrieved),
                latency_ms=int((time.perf_counter() - t0) * 1000),
            )

        # 4. Parse response
        answer, confidence = self._parse_answer(raw_answer)

        # 5. Match cited doc_ids back to retrieved citations
        cited_citations = self._match_citations(answer, retrieved)

        latency = int((time.perf_counter() - t0) * 1000)
        return CopilotResponse(
            answer=answer,
            citations=cited_citations if cited_citations else [r[0] for r in retrieved[:5]],
            confidence=confidence,
            sources_used=len(retrieved),
            latency_ms=latency,
        )

    # -- internals -----------------------------------------------------------

    def _retrieve(self, query: str, top_k: int) -> list[tuple[Citation, dict]]:
        """Embed query, search FAISS, return (Citation, chunk_dict) pairs."""
        q_emb = self.embedder.encode([query], normalize_embeddings=True)
        q_emb = np.array(q_emb, dtype=np.float32)

        scores, indices = self.index.search(q_emb, top_k)
        results: list[tuple[Citation, dict]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            ch = self.chunks[idx]
            text = ch.get("text", "")
            snippet = text[:SNIPPET_LEN] + ("…" if len(text) > SNIPPET_LEN else "")
            cit = Citation(
                doc_id=ch.get("doc_id", ""),
                chunk_id=ch.get("chunk_id", ""),
                doc_type=ch.get("doc_type", ""),
                page=ch.get("page"),
                snippet=snippet,
                score=float(score),
            )
            results.append((cit, ch))
        return results

    @staticmethod
    def _build_context(retrieved: list[tuple[Citation, dict]]) -> str:
        parts: list[str] = []
        for i, (cit, ch) in enumerate(retrieved, 1):
            header = f"[SOURCE {i}] doc_id={cit.doc_id} | type={cit.doc_type}"
            if cit.page is not None:
                header += f" | page={cit.page}"
            tags = ch.get("equipment_tags", [])
            if tags:
                header += f" | tags={','.join(tags)}"
            parts.append(f"{header}\n{ch.get('text', '')}")
        return "\n\n---\n\n".join(parts)

    @staticmethod
    def _system_prompt() -> str:
        return """You are IKI Expert Copilot — an AI assistant for industrial plant engineers at Deccan Refinery & Petrochemicals (DRP), Visakhapatnam.

You answer questions about equipment, maintenance, inspections, compliance, incidents, and operations using ONLY the provided source documents. You are precise, factual, and always cite your sources.

RULES:
1. Answer ONLY from the provided sources. If the sources don't contain enough information, say so clearly.
2. CITE every claim using [SOURCE N] references from the context.
3. At the end of your answer, add a line "CONFIDENCE: X%" where X is 0-100 indicating how confident you are that the answer is correct and complete based on the sources.
4. At the end, list "CITED_DOCS: doc_id1, doc_id2, ..." for all documents you referenced.
5. Be concise but thorough. Use bullet points for multiple items.
6. When discussing equipment status, mention relevant dates, findings, and any actions taken or pending.
7. For technical questions, include specific values (vibration readings, temperatures, pressures) when available in sources."""

    @staticmethod
    def _user_prompt(query: str, context: str) -> str:
        return f"""CONTEXT (retrieved from the industrial knowledge base):

{context}

---

QUESTION: {query}

Provide a comprehensive, cited answer. Remember to include CONFIDENCE: X% and CITED_DOCS: ... at the end."""

    @staticmethod
    def _parse_answer(raw: str) -> tuple[str, float]:
        """Extract the answer text and confidence score from LLM output."""
        confidence = 0.75  # default

        # Extract confidence
        conf_match = re.search(r"CONFIDENCE:\s*(\d+(?:\.\d+)?)\s*%", raw, re.IGNORECASE)
        if conf_match:
            confidence = min(float(conf_match.group(1)) / 100.0, 1.0)

        # Clean the answer: remove the metadata lines
        answer = raw
        # Remove CONFIDENCE line
        answer = re.sub(r"\n*CONFIDENCE:\s*\d+(?:\.\d+)?\s*%\s*", "", answer, flags=re.IGNORECASE)
        # Remove CITED_DOCS line
        answer = re.sub(r"\n*CITED_DOCS:\s*[^\n]*", "", answer, flags=re.IGNORECASE)
        answer = answer.strip()

        return answer, confidence

    @staticmethod
    def _match_citations(
        answer: str, retrieved: list[tuple[Citation, dict]]
    ) -> list[Citation]:
        """Return citations that were actually referenced in the answer via [SOURCE N]."""
        cited: list[Citation] = []
        seen_ids: set[str] = set()
        for m in re.finditer(r"\[SOURCE\s+(\d+)\]", answer):
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(retrieved):
                cit = retrieved[idx][0]
                if cit.chunk_id not in seen_ids:
                    seen_ids.add(cit.chunk_id)
                    cited.append(cit)
        return cited

    # -- status --------------------------------------------------------------

    def status(self) -> dict:
        return {
            "built": self._built,
            "chunk_count": len(self.chunks),
            "embed_model": EMBED_MODEL,
            "llm_provider": config.LLM_PROVIDER,
            "llm_model": config.LLM_MODEL if config.llm_configured() else None,
            "llm_configured": config.llm_configured(),
        }
