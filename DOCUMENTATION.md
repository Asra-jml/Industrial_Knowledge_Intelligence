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
| Parse .pdf via pdfplumber | `backend/ingestion/parsers/pdf_parser.py` (per-page; scanned-PDF detection at <100 extractable chars) | done |
| Parse .csv/.md/.eml/.json/.txt natively | `backend/ingestion/parsers/` (pandas CSV w/ BOM handling; markdown bold-metadata + Linked: lines; RFC-822 email w/ From/To/Cc persons; C-MAPSS descriptor mode) | done |
| P&ID .jpg via YOLO symbol detection + OCR | `parsers/pid_parser.py` (ground-truth label stats per drawing) + `backend/cv/` (YOLOv8n fine-tune harness, detection samples, OCR tag pass) | done — demo uses ground-truth replay (quick fine-tune mAP50 0.004 recorded; overnight run recommended) |
| OCR scanned documents (pytesseract + Pillow) | `parsers/ocr.py` + pdf_parser fallback (renders pages via pypdfium2 → Tesseract; caps at 15 pages) | done |
| Entities per `14_kg_metadata/ontology.md` | `extract/ontology.py` (known-tag set, alias map, regulation normalizer) + `extract/entities.py` (masked-regex, slash-shorthand expansion) | done |
| spaCy + regex + LLM extraction (PRD §6 stack) | regex: `entities.py` · spaCy NER: `extract/ner.py` (PERSON, unstructured docs only) · LLM: `extract/llm_enrich.py` (xAI Grok/Groq, CSB/OISD PDFs, cached per file) | done |
| Build 15 node types / 12+ edge types | `graph/builder.py` — 15 schema types + Procedure/LessonLearned extensions; 12 ontology edges + LINKED_TO extension | done |
| Persist to Neo4j | `graph/neo4j_loader.py` (unique constraints, batched UNWIND MERGE, --reset, DB-name fallback) | done (smoke test pending) |
| Idempotent, incremental re-ingest | `manifest.py` (SHA-256 + per-file contribution cache) + deterministic `writers.py` | done |
| Outputs: documents.jsonl, corpus_index.jsonl, graph.json | `writers.py` → `SharedCorpus/shared/` | done |
| Acceptance: P-101 one node, ≥90% linkage, add-a-file updates graph | `scripts/verify_f1.py` (11-check scorecard incl. live probe-file test) | **11/11 passed — 100% recall** (§6) |
| Graph UI | `frontend/graph_viewer.html` (vis-network, Golden Thread mode) + FastAPI `/api/graph` + Neo4j Aura browser | done |

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
| 2026-07-07 | Masked-regex extraction: specific record IDs (WO-, FR-, NCR-, INSP-…) matched and masked BEFORE the bare equipment pattern; survivors gated through the register-backed known-tag set | Kills the baseline's false positives ("WO-2026" was becoming a phantom pump); unknown-but-plausible tags stay as `candidate_tags`, never nodes |
| 2026-07-07 | Calibration register added as a known-tag source (instruments like PIT-301) | Structured `instrument_tag` column is authoritative; keeps the invariant "every Equipment node is register-backed" |
| 2026-07-07 | Parallel parsing (ProcessPoolExecutor, cores−2) | Full corpus 18.5 min → ≈ 8 min, meeting the PRD < 10 min NFR; incremental stays ≈ 12 s |
| 2026-07-07 | Neo4j nodes carry both `id` and their natural key field (`tag`, `wo_id`, …) | Judges' intuitive Cypher (`{tag:'P-101'}`) works, not just our internal id scheme |
| 2026-07-07 | LessonLearned + Procedure node types and LINKED_TO edge added as documented schema extensions | LL-/SOP- records exist in the corpus but not in kg_schema.json; extensions are explicit, not silent |
| 2026-07-07 | P&ID CV ships on ground-truth label replay + OCR; quick YOLOv8n fine-tune recorded at mAP50 0.004 (5 epochs / 512 px / CPU — insufficient for ~1,500 tiny symbols × 32 classes per drawing) | PRD explicitly allows "degrade gracefully to tag sidecars"; honest metric beats a hidden one. Rerun with `YOLO_EPOCHS=40 YOLO_IMGSZ=640` overnight for a real mAP |
| 2026-07-07 | Frontend design system (`frontend/web`): dark graphite tokens with ONE accent (steel blue #4DA3FF, same hue as the graph's Equipment nodes), Space Grotesk display + Inter body + JetBrains Mono data, hand-rolled shadcn-style primitives (`components/ui/`), framer-motion micro-interactions only (no particle/blob effects) | Premium, intentional look; 3 tiny deps (framer-motion, clsx, tailwind-merge) instead of a component-library payload; icon-name registry keeps pages as Server Components across the RSC boundary |
| 2026-07-07 | Landing hero is a handcrafted animated SVG of the REAL P-101 golden thread (nodes/edges from the corpus), not stock art; module placeholders show each feature's live data contract | The marketing surface demonstrates the actual product data — judges see the same story on the landing page, in the viewer, and in Neo4j |

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

Run of `scripts/verify_f1.py` on 2026-07-07 (full corpus, pipeline 2026-07-07.3):

```
F1 VERIFICATION SCORECARD
============================================================
  PASS  shared/ outputs exist (documents, corpus_index, graph)
  PASS  exactly one canonical P-101 node  (found ['Equipment:P-101'])
  PASS  P-101 carries asset-register properties  (make=Grundfos, model=CR 95-4, criticality=A)
  PASS  golden-thread recall >= 90% (got 100%)  (all 21 expected records linked)
  PASS  P-101 documents span >= 6 doc_types (got 12)
  PASS  no sensor-array chunks in corpus_index  (8050 chunks total)
  PASS  chunk count sane (8050 < 20000)
  PASS  every Equipment node is in the known-tag set  (20 equipment nodes)
  PASS  idempotency: re-run produces byte-identical outputs
  PASS  add-a-file: new work order appears linked to P-101
  PASS  remove-a-file: probe work order gone after re-ingest
============================================================
RESULT: 11/11 checks passed
```

**Headline numbers for judges:**
- 475 documents ingested across 9 formats → **664 nodes / 589 edges**, 17 node types, 13 edge types
- **100% golden-thread recall** (PRD target ≥ 90%): every warning signal around the P-101
  failure is connected to one node
- P-101 linked across **12 document types** (emails, inspections, work orders, incident
  reports, compliance register, manual, P&ID, permits…)
- corpus_index: **8,050 quality chunks** vs 60,664 from the naive baseline (87% reduction —
  sensor arrays excluded, CSV rows serialized row-level with tags)
- Full ingest ≈ 8 min parallel / incremental re-ingest **≈ 12 s** including the Neo4j upsert
- Neo4j Aura: 664 nodes / 589 relationships;
  `MATCH (e:Equipment {tag:'P-101'})-[r]-(x) RETURN *` → 58 relationships, 10 types
- pytest: 27/27 unit tests green

## 7. Demo script for judges (~4 minutes)

1. **The problem** (30 s): P-101 failed 2026-06-25. The warning signals existed — a
   watch-item inspection (INSP-2026-0412), a field-tech email (May 28), an overdue
   follow-up (INSP-2026-0615, inspector reassigned) — in four different systems.
2. **Ingest** (30 s): `python -m backend.ingestion.run_ingest` → incremental run finishes
   in ~12 s: *"475 documents, 8,050 chunks, 664 nodes, 589 edges + Neo4j upsert"*.
3. **Golden Thread** (90 s): open `frontend/graph_viewer.html` → press **⭑ Golden Thread**.
   P-101 (gold) at the center; the OVERDUE inspection glows red. Walk the chain out loud:
   email → inspection → work orders → failure → incident → NCR → CAPA → Factories Act /
   OISD → and SAME_CLASS_AS to P-102 (had the same near-miss in 2025) and **P-205 —
   whose vibration is rising right now** (F3/F5 hook).
4. **Continuously updated** (45 s): drop a new work-order markdown into
   `SharedCorpus/07_work_orders/`, re-run ingest (~12 s), refresh viewer — the new node
   is linked to P-101. Delete it, re-run — it's gone. (This is exactly what
   `verify_f1.py` asserts automatically.)
5. **Neo4j Aura** (30 s): `MATCH (e:Equipment {tag:'P-101'})-[r]-(x) RETURN *`
   → 58 relationships, 10 types. Real graph database, not a picture.
6. **CV/OCR coverage** (30 s): `python -m backend.cv.detect_pid --ground-truth` —
   annotated P&ID samples (90–120 symbols per drawing from the Digitize-PID labels,
   in `backend/cv/samples/`) + live OCR reading tag text off the drawings; plus OCR of
   the scanned OISD regulation PDF (the one unreadable file in the corpus). Say it
   straight: a 35-min CPU fine-tune doesn't converge on 32 tiny-symbol classes
   (mAP50 0.004 — recorded, not hidden); the training harness is one env var away
   from an overnight GPU/CPU run, and the ground-truth path is the PRD's own
   documented degradation.

## 8. Known limitations

- **LLM enrichment currently inactive:** the configured xAI Grok key has no team credits
  (API returns 403). The stage degrades gracefully (skipped, everything else works).
  Fix: add credits at console.x.ai, **or** create a free Groq key at console.groq.com and
  set `GROQ_API_KEY` in `.env` — the config auto-detects and prefers it.

- The 400 P&ID drawings are generic public images (Digitize-PID dataset) — plant tags like
  P-101 come from the asset register (`pid_ref`), not from CV; the YOLO piece demonstrates
  the capability honestly.
- `eval/benchmark_questions.md` referenced by the PRD does not exist in the corpus yet —
  must be authored before F2 scoring.
- Synthetic operational records are clearly labelled (see corpus `DATA_PROVENANCE.md`).
