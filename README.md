# Industrial Knowledge Intelligence (IKI)
**Unified Asset & Operations Brain**

Industrial plants run on knowledge scattered across disconnected systems—P&IDs, work orders, SOPs, inspection records, OEM manuals, regulatory PDFs, and email archives. This fragmentation causes engineers to spend ~35% of their time searching for information and accounts for ~20% of unplanned downtime in heavy industries. 

**Industrial Knowledge Intelligence (IKI)** is an AI-powered platform that ingests heterogeneous industrial documents, builds a unified Knowledge Graph, and makes collective intelligence queryable, actionable, and continuously updated at the point of need. 

By connecting the dots before failures happen, IKI transforms reactive maintenance into proactive reliability.

## Key Features (Modules)

1. **Universal Document Ingestion & Knowledge Graph (F1)**
   A pipeline that ingests PDFs, P&ID images (via YOLO CV + OCR), scanned forms, spreadsheets, and emails to extract entities (equipment tags, parameters, regulations) and build a unified Knowledge Graph (Neo4j).
   
2. **Expert Knowledge Copilot (F2)**
   A mobile-first, conversational RAG AI that answers operational, maintenance, and engineering queries across the full corpus. It provides highly accurate answers with direct citations, linked sources, and a confidence score.

3. **Maintenance Intelligence & RCA Agent (F3)**
   Fuses work-order history, failure records, OEM manuals, and real-time operating conditions to generate predictive-maintenance recommendations, root cause analyses (RCA), and optimized schedules.

4. **Quality & Regulatory Compliance Intelligence (F4)**
   Automatically maps regulatory requirements (e.g., Factories Act, OISD, ISO) against procedures and inspection records. It flags compliance gaps (NCRs to CAPAs) and auto-generates audit evidence packages.

5. **Lessons Learned & Failure Intelligence Engine (F5)**
   Analyzes historical incident reports, near-misses, and external databases to surface systemic patterns and proactively push warnings before recurrences happen (e.g., recognizing a bearing failure pattern across similar assets).

## Architecture & Tech Stack

IKI uses a modern, AI-native stack tailored for high performance and extensibility:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts.
- **Backend:** Python 3.12, FastAPI (Uvicorn).
- **AI & ML:** 
  - **LLMs & RAG:** LlamaIndex, pgvector, FAISS, Claude / Groq / Gemini, sentence-transformers.
  - **Computer Vision:** YOLO (Ultralytics), pdfplumber, pytesseract.
  - **Workflow Agents:** LangGraph.
- **Data Stores:** Neo4j (Knowledge Graph), PostgreSQL 17 (App DB & Vectors).

## Getting Started

### Prerequisites
- Node.js ≥ 20.9
- Python 3.12+
- Neo4j (Local or Aura Free)

### Backend Setup
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn backend.api.main:app --reload
```

### Frontend Setup
```bash
cd frontend/web

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard!

## The Corpus & Evaluation
IKI was tested on a shared corpus of ~1.14 GB containing real and synthesized operational records, including Digitize-PID drawings, CSB reports, and NASA C-MAPSS datasets. The platform is designed to be source-agnostic and fully capable of ingesting any live plant records in production.
