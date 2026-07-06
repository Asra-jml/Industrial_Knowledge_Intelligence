# F2 — Expert Knowledge Copilot (RAG) · Owner: Teammate 2

**Status:** stub — F1 outputs are ready for you.

## Contract
- **Reads:** `SharedCorpus/shared/corpus_index.jsonl` (one JSON per line:
  `chunk_id, doc_id, doc_type, text, equipment_tags[], record_ids[], dates[], page, source_path`).
  Resolve paths via `backend.core.config` (do not hardcode).
- **Produces:** a FastAPI router at `backend/api/routers/copilot.py` (e.g. `POST /api/copilot/ask`)
  returning `{answer, citations:[{doc_id, chunk_id, page}], confidence}` — every answer cited (PRD NFR).
- **Vector store:** pgvector or Chroma over the chunk embeddings; embed once, persist locally.
- **UI:** desktop-first chat in `frontend/web/` (Next.js 16 + Vercel AI SDK); mobile is deferred.

## Acceptance (PRD)
"What's the status of P-101?" → cited answer drawing from inspection + email + work order + manual.
