# IKI — Build Documentation (Judge / Interviewer Guide)

> **Purpose:** a single, always-current record of *what we built, how it works, and why we
> made each decision* — for hackathon judges, interviewers, and teammates.
> **Rule:** no task is "done" until its entry here is written.
>
> Platform: **Industrial Knowledge Intelligence (IKI)** — ET AI Hackathon 2026, Problem 8.
> PRD: [PRD_Industrial_Knowledge_Intelligence.md](PRD_Industrial_Knowledge_Intelligence.md)

---

## 1. What the platform does

Industrial plants scatter knowledge across 7–12 disconnected systems. IKI ingests that
heterogeneous corpus (PDF manuals & regulations, P&ID drawings, CSV registers & logs,
markdown incident reports, email archives), extracts entities against a formal ontology,
and builds a **unified knowledge graph** so the collective intelligence is queryable at
the point of need.

Demo scenario: boiler feed-water pump **P-101** failed on 2026-06-25. The warning signals
existed — a rising-vibration inspection, a field-tech email, an overdue follow-up
inspection — but lived in separate systems. IKI connects them **before** the failure.

### Architecture (F1 — ingestion & knowledge graph, the foundation)

```
SharedCorpus (14 folders, ~1.14 GB, real + synthesized)
   │
   │  backend/ingestion (Python 3.14)
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ 1 ontology load   (14_kg_metadata: schema, dictionary)   │
   │  │ 2 discover        (folder → doc_type map)                │
   │  │ 3 manifest diff   (SHA-256 → only re-parse changes)      │
   │  │ 4 parse           (pdfplumber / pandas / email / OCR /   │
   │  │                    YOLO P&ID labels)                     │
   │  │ 5 extract         (masked regex → spaCy NER → aliases)   │
   │  │ 6 LLM enrich      (Groq, optional, cached)               │
   │  │ 7 merge graph     (15 node types, 13 edge types)         │
   │  │ 8 write           (deterministic, byte-identical re-run) │
   │  └──────────────────────────────────────────────────────────┘
   ▼
shared/  ← single source of truth for ALL features
  documents.jsonl    → F1, F4        (doc registry)
  corpus_index.jsonl → F2, F3, F5    (RAG chunks)
  graph.json         → F1, F3, F5    (knowledge graph)
   │
   ├─→ Neo4j Aura (MERGE upsert, unique constraints)
   ├─→ FastAPI  backend/api  (/api/graph, /api/ingest/status …)
   └─→ frontend/graph_viewer.html  (vis-network, "Golden Thread" view)
```

## 2. How to run

```powershell
# one-time setup
cd f:\ET_hackathon\Industry_intelligence
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m spacy download en_core_web_sm
winget install UB-Mannheim.TesseractOCR        # OCR binary (optional)
copy .env.example .env                          # then fill in keys (optional)

# ingest the corpus (incremental; --full forces re-parse)
.venv\Scripts\python -m backend.ingestion.run_ingest

# verify acceptance criteria
.venv\Scripts\python scripts\verify_f1.py

# run the API + open the graph viewer
.venv\Scripts\uvicorn backend.api.main:app --reload
# then open frontend/graph_viewer.html in a browser

# tests
.venv\Scripts\pytest
```

`.env` keys (all optional): `NEO4J_URI/USERNAME/PASSWORD` (Aura Free), `GROQ_API_KEY`
(LLM enrichment), `TESSERACT_CMD` (if not on PATH).

## 3. PRD requirement → implementation map

| PRD requirement (F1) | Where implemented | Status |
| --- | --- | --- |
| Parse .pdf via pdfplumber | `backend/ingestion/parsers/pdf_parser.py` | pending |
| Parse .csv/.md/.eml/.json/.txt natively | `backend/ingestion/parsers/` | pending |
| P&ID .jpg via YOLO symbol detection + OCR | `backend/cv/` + `parsers/pid_parser.py` | pending |
| Entities per `14_kg_metadata/ontology.md` | `backend/ingestion/extract/ontology.py`, `entities.py` | pending |
| spaCy + regex + LLM extraction (PRD §6 stack) | `extract/entities.py`, `ner.py`, `llm_enrich.py` | pending |
| Build 15 node types / 12+ edge types | `backend/ingestion/graph/builder.py` | pending |
| Persist to Neo4j | `backend/ingestion/graph/neo4j_loader.py` | pending |
| Idempotent, incremental re-ingest | `backend/ingestion/manifest.py` | pending |
| Outputs: documents.jsonl, corpus_index.jsonl, graph.json | `backend/ingestion/writers.py` | pending |
| Acceptance: P-101 one node, ≥90% linkage, add-a-file updates graph | `scripts/verify_f1.py` | pending |
| Graph UI | `frontend/graph_viewer.html` + Neo4j Aura browser | pending |

**ET brief technology coverage** (PRD §6.1): RAG → F2 (reads our `corpus_index.jsonl`) ·
Knowledge Graphs & Ontology → F1 Neo4j + `ontology.md` · Computer Vision (P&ID) → F1 YOLO ·
OCR structured + unstructured → pdfplumber + pytesseract · QMS integration → F4 (reads our
graph) · Agentic AI → F3/F5 (read our graph + index).

## 4. Design-decision log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-07-06 | Monorepo organized for all 5 features + API + frontend from day one (`backend/core` shared config, `backend/api` single FastAPI surface, stub contracts for F2–F5) | Team of 3 integrates without restructuring; PRD build order F1→F5 all read one shared layer |
| 2026-07-06 | Python 3.14 (no downgrade) | Verified torch 2.12.1 / spaCy 3.8.13 ship cp314 wheels |
| 2026-07-06 | LLM = Groq free tier (env-gated), graph = Neo4j Aura Free, YOLO = quick YOLOv8n fine-tune | User decisions; zero-cost, PRD-compliant |
| 2026-07-06 | Replace the naive `SharedCorpus/ingest/ingest.py` baseline | It emitted only Document/Equipment nodes, had regex false positives, and bloated the index to 60k chunks (67 MB) by chunking NASA C-MAPSS sensor arrays |
| 2026-07-06 | Outputs written to `SharedCorpus/shared/` (gitignored there) | PRD contract — teammates' F2–F5 read from that exact path |
| 2026-07-06 | Desktop-first UI; mobile deferred. Landing page will be built in Next.js (`frontend/web/`), not standalone HTML | Team decision — one frontend framework for landing + app |

*(entries appended as tasks complete)*

## 5. Graph schema

Node types (15, keys per `14_kg_metadata/kg_schema.json`): Equipment(tag), Document(doc_id),
WorkOrder(wo_id), Failure(failure_id), Inspection(insp_id), Calibration(cal_id), NCR(ncr_id),
CAPA(capa_id), Audit(audit_id), Incident(incident_id), NearMiss(nm_id), Regulation(name),
Person(name), SparePart(part_no), Permit(ptw_id).

Edge types: the 12 from the ontology (APPEARS_IN, HAS_WORKORDER, HAS_FAILURE, INSPECTED_BY,
RAISED_AS, ADDRESSED_BY, FOUND_IN, GOVERNED_BY, USES_PART, SAME_CLASS_AS, MENTIONS,
CO_OCCURS_WITH) **+ 1 documented extension `LINKED_TO`** (with `via` property) for residual
structured cross-references (markdown `Linked:` lines, `linked_incident` columns,
NCR→Regulation breaches).

*(full construction-rules table added when builder.py lands)*

## 6. Verification scorecard

*(pasted from `scripts/verify_f1.py` after each milestone)*

## 7. Demo script for judges

*(finalized at the end of F1; outline)*
1. `python -m backend.ingestion.run_ingest` — full corpus in minutes, incremental in seconds.
2. Open `frontend/graph_viewer.html` → search **P-101** → click **Golden Thread**: one node
   linked across inspections, work orders, failure, incident, NCR→CAPA, regulations, emails,
   manual — the signals nobody connected, connected.
3. Drop a new work-order file into the corpus → re-run ingest (seconds) → refresh viewer →
   the new node/edges appear (**"continuously updated"** acceptance, live).
4. Neo4j Aura browser: same graph in Cypher, e.g. `MATCH (e:Equipment {tag:'P-101'})-[r]-(n) RETURN *`.
5. YOLO P&ID detection samples + OCR of the scanned OISD regulation (CV/OCR coverage).

## 8. Known limitations

- The 400 P&ID drawings are generic public images (Digitize-PID dataset) — plant tags like
  P-101 come from the asset register (`pid_ref`), not from CV; the YOLO piece demonstrates
  the capability honestly.
- `eval/benchmark_questions.md` referenced by the PRD does not exist in the corpus yet —
  must be authored before F2 scoring.
- Synthetic operational records are clearly labelled (see corpus `DATA_PROVENANCE.md`).
