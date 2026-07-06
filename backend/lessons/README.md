# F5 — Lessons Learned & Failure Intelligence Engine · Owner: shared

**Status:** stub — F1 outputs are ready for you.

## Contract
- **Reads:** `SharedCorpus/shared/corpus_index.jsonl` filtered to
  `doc_type == "incident_report"` (internal INC/NM/LL markdowns + CSB/OISD PDF chunks +
  IHM row chunks), plus the graph's SAME_CLASS_AS edges (P-101 ↔ P-102 ↔ P-205).
- **Produces:** router at `backend/api/routers/lessons.py` — clustered failure patterns
  (sentence-transformers + HDBSCAN/BERTopic) + proactive alerts.

## Acceptance (PRD)
Connects P-102 near-miss (NM-2025-31) + P-101 failure (FR-2026-0625) → warns **P-205**
before recurrence, citing external precedents.
