# F3 — Maintenance Intelligence & RCA Agent · Owner: Teammate 3

**Status:** stub — F1 outputs are ready for you.

## Contract
- **Reads:**
  - Knowledge graph via `backend.core.graph_store` (`load_graph()` for `graph.json`,
    `get_neo4j_driver()` for Cypher traversals).
  - `SharedCorpus/08_inspection_calibration/condition_monitoring_vibration.csv`
    (P-101 trend; alarm 4.5 mm/s, trip 7.1 mm/s from `equipment_master.csv`).
  - `SharedCorpus/05_maintenance_datasets/` (AI4I 2020 CSV, NASA C-MAPSS — headerless
    26-col sensor arrays; deliberately NOT chunked into the RAG index).
- **Produces:** router at `backend/api/routers/rca.py` — RCA narrative + predictive alert
  with lead-time estimate; Recharts trend on the frontend.

## Acceptance (PRD)
"Bearing fault on P-101" → root cause = missed inspection (INSP-2026-0615 OVERDUE);
predicts failure ~7 days ahead from the vibration trend.
