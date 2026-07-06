# Product Requirements Document (PRD)
# Industrial Knowledge Intelligence — Unified Asset & Operations Brain

**Event:** ET AI Hackathon 2026 — Problem Statement 8
**Theme:** Industrial Intelligence · Document Management · Knowledge Engineering · Quality
**Team size:** 3 · **Status:** Draft v1.0 · **Date:** July 2026
**Repo (corpus):** https://github.com/adivish31/iki-corpus

---

## 1. Overview

Industrial plants run on knowledge scattered across 7–12 disconnected systems — P&IDs, work orders, SOPs, inspection records, OEM manuals, regulatory PDFs, and email archives. A 2024 McKinsey survey found asset-intensive professionals spend ~35% of their time searching for information; BIS Research attributes 18–22% of unplanned downtime in Indian heavy industry to this fragmentation. Meanwhile ~25% of experienced Indian industrial engineers will retire within a decade, taking undocumented knowledge with them.

**Industrial Knowledge Intelligence (IKI)** is an AI platform that ingests heterogeneous industrial documents, builds a unified knowledge graph, and makes the collective intelligence queryable, actionable, and continuously updated at the point of need — on any device.

### The problem, concretely (our demo scenario)
At *Deccan Refinery & Petrochemicals (DRP), Visakhapatnam*, boiler feed-water pump **P-101** (Grundfos CR 95-4) failed on 2026-06-25. The warning signals existed — a rising-vibration inspection note, a field-tech email, an overdue follow-up inspection caused by a documented staffing decision — but they lived in separate systems and no one connected them in time. IKI connects them **before** the failure.

---

## 2. Goals & Success Metrics

Metrics map directly to the Problem-8 evaluation focus.

| Goal | Metric | Target |
| --- | --- | --- |
| Accurate extraction across document types | Entity-extraction accuracy (tags, dates, regs, people) | ≥ 90% on labelled sample |
| High-quality answers | Query answer quality on the domain-expert benchmark (15 Qs) | ≥ 12/15 correct + cited |
| Connected knowledge | Knowledge-graph linkage completeness (Q12: all P-101-linked docs) | ≥ 90% recall |
| Faster than search | Time-to-answer vs. manual Ctrl-F baseline | ≥ 5× faster |
| Compliance detection | Compliance-gap detection accuracy | ≥ 90% on seeded gaps |
| Cross-functional discovery | Surface the P-102 → P-101 → P-205 pattern | Demonstrated, unprompted |

---

## 3. Users & Personas

| Persona | Device | Primary need | Feature(s) |
| --- | --- | --- | --- |
| Field technician | Mobile | Fast, cited answers on the plant floor | F2 Copilot |
| Reliability / maintenance engineer | Desktop | RCA + predictive maintenance | F3 RCA |
| QA / compliance officer | Desktop | Gap detection + audit evidence packs | F4 Compliance |
| Plant / reliability manager | Desktop | Systemic patterns, proactive warnings | F5 Lessons Learned |
| Knowledge / data engineer | Desktop | Ingest + maintain the graph | F1 Ingestion |

---

## 4. Scope — Features (Modules)

Five illustrative modules from the brief. All read from one shared ingestion layer (`shared/graph.json`, `shared/corpus_index.jsonl`, `shared/documents.jsonl`).

### F1 — Universal Document Ingestion & Knowledge Graph *(Owner: Aditya)*
**What:** A pipeline that ingests PDFs, P&ID images, scanned forms, spreadsheets, and email archives; extracts entities (equipment tags, process parameters, regulatory references, personnel, dates); and builds a unified knowledge graph that updates as new records arrive.
**Requirements:**
- Parse `.pdf` (pdfplumber), `.csv/.md/.eml/.json/.txt` natively; P&ID `.jpg` via YOLO symbol detection + OCR.
- Extract entities using the ontology in `14_kg_metadata/ontology.md`.
- Build nodes (Equipment, Document, WorkOrder, Failure, Inspection, NCR, CAPA, Regulation, Person, SparePart…) and edges (APPEARS_IN, HAS_FAILURE, GOVERNED_BY, SAME_CLASS_AS…).
- Persist to Neo4j; re-ingest is idempotent ("continuously updated").
**Acceptance:** P-101 appears as one node linked across all document types; re-running ingest after adding a file updates the graph.

### F2 — Expert Knowledge Copilot (RAG) *(Owner: Teammate 2)*
**What:** Conversational AI answering operational/maintenance/engineering queries across the full corpus with citations, confidence scores, and links to source documents. Mobile-first.
**Requirements:**
- Embed `corpus_index.jsonl` into a vector store (FAISS/Chroma); retrieve top-k with metadata.
- Every answer cites `doc_id`(s) and shows a confidence score.
- Responsive/mobile UI for field technicians.
**Acceptance:** "What's the status of P-101?" returns a cited answer drawing from inspection + email + work order + manual.

### F3 — Maintenance Intelligence & RCA Agent *(Owner: Teammate 3)*
**What:** Fuses work-order history, failure records, OEM manuals, inspection findings, and real-time operating conditions to generate predictive-maintenance recommendations, RCA, and optimised schedules.
**Requirements:**
- Trend model over `08_inspection_calibration/condition_monitoring_vibration.csv` + AI4I/C-MAPSS.
- RCA that fuses failure record + OEM vibration limit + overdue inspection into a root cause.
- Predictive alert with lead-time estimate.
**Acceptance:** "Bearing fault on P-101" → root cause = missed inspection; predicts failure ~7 days ahead from vibration trend.

### F4 — Quality & Regulatory Compliance Intelligence *(Owner: shared)*
**What:** Maps regulatory requirements (Factories Act, OISD, PESO, environmental, ISO 9001) against procedures, equipment states, and inspection records; flags compliance gaps; auto-generates audit evidence packages.
**Requirements:**
- Join `11_quality_compliance/compliance_register.csv` to real regulation PDFs and inspection records.
- Detect GAP rows; assemble an evidence pack (linked docs) per asset.
**Acceptance:** Flags the P-101 inspection gap against Factories Act/OISD and generates its evidence pack.

### F5 — Lessons Learned & Failure Intelligence Engine *(Owner: shared)*
**What:** Analyses incident reports, near-misses, audit findings, and NCRs across history + external industry databases; surfaces systemic patterns; proactively pushes warnings.
**Requirements:**
- Cluster internal incidents (INC/NM/LL) + real external DBs (CSB, OISD case studies, IHM Kaggle).
- Detect the recurring DE-bearing failure mode; push a proactive P-205 warning.
**Acceptance:** Connects P-102 near-miss + P-101 failure → warns P-205 before recurrence, citing external precedents.

---

## 5. Data / Corpus

One shared corpus (`SharedCorpus/`, 14 folders, ~1.14 GB) mixing **real public** datasets and **synthesized** operational records, all anchored to real assets (Grundfos CR 95-4 pumps, Siemens G120 drive, Emerson Rosemount 3051). See `DATA_PROVENANCE.md`.

| Folder | Contents | Provenance |
| --- | --- | --- |
| 01_pids | 500 Digitize-PID drawings + YOLO labels | Real |
| 02_manuals | Grundfos / Siemens / Emerson manuals | Real |
| 03_regulations | Factories Act, OISD, PESO ×3, EP Act, NAAQS | Real |
| 04_incident_reports | CSB reports + OISD case studies + IHM CSV + internal INC/NM/LL | Real + synth |
| 05_maintenance_datasets | AI4I 2020, NASA C-MAPSS | Real |
| 06–14 | asset register, work orders, PM/CM logs, inspections, calibration, inventory, spares, emails, audit/NCR/CAPA, permits, shutdown, project docs, KG metadata | Synthesized |

Benchmark for scoring: `eval/benchmark_questions.md` (15 domain-expert Q&A with expected sources).

---

## 6. Architecture & Tech Stack

```
Documents (01–14)
   │  ingest.py  (parse → extract entities/dates → chunk)
   ▼
shared/                         ← single source of truth
  documents.jsonl   → F1, F4
  corpus_index.jsonl→ F2, F3, F5   (embed → vector store)
  graph.json        → F1, F3, F5   (load → Neo4j)
   │
   ├── F1 Knowledge Graph (Neo4j + graph UI)
   ├── F2 Copilot (RAG: FAISS/Chroma + LLM, mobile web)
   ├── F3 RCA (trend model + graph traversal + LLM)
   ├── F4 Compliance (register join + rule engine + LLM)
   └── F5 Lessons Learned (clustering + LLM + alerts)
```

### Tech stack (latest, as of July 2026)

**Frontend / Landing:** Next.js **16.2** (App Router, Turbopack) + React **19.2** + TypeScript · Tailwind CSS **v4** + shadcn/ui + lucide · Vercel AI SDK v5 (streaming chat) · Recharts (dashboards) · deployed on **Vercel**. Requires Node.js ≥ 20.9.

**Backend / API:** Python **3.12** + **FastAPI** (Uvicorn) · orchestration with **LlamaIndex** (or LangChain) · **LangGraph** for agentic workflows.

**Data / stores:** **Neo4j 5.x** (knowledge graph — the differentiator) · **PostgreSQL 17 + pgvector** as combined app DB + vector store (Chroma as a lighter alternative).

| Feature | Key technologies |
| --- | --- |
| F1 Ingestion + Graph | pdfplumber / PyMuPDF · pytesseract + Pillow (OCR) · **YOLO (Ultralytics)** on Digitize-PID labels · spaCy + regex + LLM · Neo4j driver |
| F2 Copilot (RAG) | Embeddings: OpenAI `text-embedding-3-large` or open **BGE-M3 / Qwen3-Embedding** · retrieval via LlamaIndex over pgvector · LLM: **Claude Sonnet 5 / GPT-5-class / Gemini 3.1 Pro**, or open **Llama 4 / Qwen3 / DeepSeek** via **Groq / Ollama** |
| F3 Maintenance + RCA | scikit-learn / XGBoost on AI4I + C-MAPSS + vibration trend · Neo4j traversal + LangGraph agent · Recharts |
| F4 Compliance | pandas rule-joins · LLM narrative · WeasyPrint / reportlab (evidence-pack PDFs) |
| F5 Lessons Learned | sentence-transformers + HDBSCAN / BERTopic clustering · LLM pattern summary · WebSocket alerts |

**Deployment:** Vercel (frontend) · Railway / Render / Fly.io or Docker Compose (FastAPI + Neo4j + Postgres) · Neo4j Aura Free for the graph.

**Minimal build-first stack:** Next.js 16 + Tailwind v4 + shadcn (Vercel) · FastAPI · Neo4j Aura Free · pgvector · LlamaIndex · Claude Sonnet 5 / Groq · YOLO · Recharts.

**Stretch (add only after F1→F3 work end to end):** LangGraph multi-agent workflows · real-time WebSocket alerting · auth (Auth.js/Clerk) · WeasyPrint compliance-pack export · BERTopic pattern mining · Dockerised one-command deploy · embedded Neo4j graph view in the app.

> Note on versions: model names/versions move fast — treat "Claude Sonnet 5 / GPT-5.x / Gemini 3.1" as *"the current best in this tier at build time."* Pin exact library minors from each release page.

### 6.1 Alignment with the ET Problem-8 brief (suggested technologies)

Every technology the brief lists is covered by a feature with real data behind it.

| Suggested technology (ET brief) | Covered by | Implementation |
| --- | --- | --- |
| RAG over heterogeneous industrial corpora | F2 Copilot | LlamaIndex + pgvector + embeddings + LLM, with citations |
| Knowledge Graphs & Industrial Ontology Engineering | F1 | Neo4j + `14_kg_metadata/ontology.md` + `kg_schema.json` |
| Computer Vision (P&ID parsing, drawing digitisation) | F1 | YOLO (Ultralytics) on the 500 Digitize-PID drawings + labels |
| OCR & Document Intelligence (structured + unstructured) | F1 | pdfplumber/PyMuPDF (structured) + pytesseract OCR (scanned/unstructured) |
| Quality Management System (QMS) Integration | F4 | compliance register → procedure → inspection → gap → NCR → CAPA chain |
| Agentic AI for maintenance & compliance workflows | F3, F4, F5 | LangGraph multi-step agents (RCA, gap-detection, pattern alerts) |

**Emphasise in the demo:** (1) QMS = show a regulation mapped through procedure → inspection → gap → CAPA; (2) OCR "structured + unstructured" = run *both* a clean digital PDF and a scanned image through the pipeline.

---

## 7. Non-Functional Requirements

- **Mobile-first** for F2 (field technicians), desktop for engineering roles.
- **Citations & confidence** on every generated answer (trust for industrial use).
- **Continuously updated:** re-ingest is incremental and idempotent.
- **Performance:** answer latency target < 5 s; ingest of the full corpus < 10 min on a laptop.
- **Scalability:** corpus- and source-agnostic; in production ingests the customer's own live records.
- **Auditability:** every answer traceable to source documents.

---

## 8. Team & Workstreams

| Owner | Feature | Reads | Produces |
| --- | --- | --- | --- |
| Aditya | F1 Ingestion + Graph | all folders | `shared/` + Neo4j |
| Teammate 2 | F2 Copilot | corpus_index | mobile chat UI |
| Teammate 3 | F3 RCA | corpus_index + graph + sensors | RCA + predictions |
| Shared | F4 + F5 | documents + graph | compliance packs, pattern alerts |

Build order: **F1 → F2 → F3**, then F4/F5 layered on the same graph.

---

## 9. Milestones

| Phase | Deliverable |
| --- | --- |
| Data (done) | Shared corpus assembled, ingested, on GitHub |
| Build 1 | F1 graph in Neo4j; F2 RAG answering benchmark Qs |
| Build 2 | F3 RCA + prediction; F4 compliance packs |
| Build 3 | F5 pattern alerts; mobile polish |
| Submission | Working prototype, architecture diagram, deck, demo video |

---

## 10. Deliverables (per brief)
- Working prototype
- Architecture diagram
- Presentation deck
- Demo video

---

## 11. Risks & Assumptions
- **P&ID CV accuracy** on real drawings is hard → provide YOLO labels as ground truth; degrade gracefully to tag sidecars.
- **Synthetic operational data** → clearly labelled; anchored to real assets; production uses the customer's records.
- **OSH Code 2020** not yet downloaded (optional; Factories Act covers the core).
- **Scanned PDFs** (e.g., one OSH/OISD file) need OCR to ingest.
- LLM factuality → enforced via citations + confidence + retrieval grounding.

---

## 12. Out of Scope (this hackathon)
- Live SCADA/IoT streaming integration (we use recorded sensor trends).
- Write-back into source systems (read-only intelligence layer).
- Multi-plant deployment (single-plant demo).

---

## 13. Judging Alignment

| Criterion | Weight | How we address it |
| --- | --- | --- |
| Innovation | 25% | Cross-document pattern discovery (P-102→P-101→P-205) no single reviewer connects |
| Business Impact | 25% | Prevents unplanned downtime; quantified lead-time on a real failure mode |
| Technical Excellence | 20% | Real datasets + KG + RAG + CV/OCR + agentic RCA on one pipeline |
| Scalability | 15% | Source-agnostic ingest; idempotent re-ingest; Neo4j graph |
| User Experience | 15% | Mobile copilot with citations + confidence |

---

## 14. Landing Page (Project Showcase)

A single, public-facing landing page that presents the whole IKI platform to judges and visitors — the "front door" that frames the problem, the solution, and the five modules before anyone opens the app.

**Purpose:** communicate value in < 60 seconds; funnel to the live demo / copilot.
**Audience:** hackathon judges, evaluators, prospective users.
**File:** `landing_page.html` (single self-contained file, no build step, mobile-responsive).

**Required sections:**
1. **Hero** — product name, one-line value prop ("Connect the dots your best engineer can't"), primary CTA ("Try the Copilot") + secondary ("See how it works").
2. **Problem** — the three stat cards (35% time searching, 18–22% downtime, 25% workforce retiring).
3. **The connected story** — the P-101 timeline showing signals that existed but weren't connected → the failure IKI prevents.
4. **Five modules** — cards for F1–F5 with one-line descriptions.
5. **How it works** — the ingest → shared layer → features pipeline.
6. **Proof / metrics** — the evaluation-focus targets (entity accuracy, graph linkage, lead-time).
7. **Tech stack** — RAG · Knowledge Graph · CV/OCR · Agentic AI.
8. **Team + footer** — three members, repo link, hackathon tag.

**Acceptance:** opens standalone in any browser, renders on mobile, and a first-time viewer understands the product and its five capabilities without scrolling documentation.
