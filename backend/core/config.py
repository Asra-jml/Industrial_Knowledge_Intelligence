"""Central configuration — the ONLY place paths and environment are read.

Every feature (F1-F5) imports from here so nobody hardcodes paths or env names.
"""
from __future__ import annotations

import os
import shutil
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")

# Bump to force a full re-parse after parser/extractor changes.
PIPELINE_VERSION = "2026-07-07.3"


def _path_from_env(var: str, default: Path) -> Path:
    raw = os.getenv(var, "").strip()
    if not raw:
        return default
    p = Path(raw)
    return p if p.is_absolute() else (REPO_ROOT / p).resolve()


CORPUS_ROOT = _path_from_env("CORPUS_ROOT", REPO_ROOT.parent / "SharedCorpus").resolve()
SHARED_DIR = _path_from_env("SHARED_DIR", CORPUS_ROOT / "shared")
CACHE_DIR = SHARED_DIR / ".ingest_cache"
KG_METADATA_DIR = CORPUS_ROOT / "14_kg_metadata"

DOCUMENTS_PATH = SHARED_DIR / "documents.jsonl"
CORPUS_INDEX_PATH = SHARED_DIR / "corpus_index.jsonl"
GRAPH_PATH = SHARED_DIR / "graph.json"

# corpus folder -> doc_type carried on every document/chunk/node
FOLDER_DOC_TYPE = {
    "01_pids": "pid_drawing",
    "02_manuals": "manual",
    "03_regulations": "regulation",
    "04_incident_reports": "incident_report",
    "05_maintenance_datasets": "dataset",
    "06_asset_register": "asset_register",
    "07_work_orders": "work_order",
    "08_inspection_calibration": "inspection",
    "09_inventory_spares": "inventory",
    "10_emails": "email",
    "11_quality_compliance": "compliance",
    "12_permits_shutdown": "permit",
    "13_project_docs": "project_doc",
    "14_kg_metadata": "kg_metadata",
}
SKIP_FOLDERS = {"ingest", "shared", "eval", ".git", ".ingest_cache"}

# --- Neo4j Aura (optional — loader skips cleanly when unset) ---
NEO4J_URI = os.getenv("NEO4J_URI", "").strip()
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "").strip()
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "").strip()
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "").strip() or "neo4j"


def neo4j_configured() -> bool:
    return bool(NEO4J_URI and NEO4J_USERNAME and NEO4J_PASSWORD)


# --- LLM enrichment (optional). Both providers are OpenAI-compatible;
# Groq wins if both keys are present, else the user's xAI Grok key. ---
_GROQ_KEY = os.getenv("GROQ_API_KEY", "").strip()
_XAI_KEY = os.getenv("GROK_API_KEY", "").strip() or os.getenv("XAI_API_KEY", "").strip()

if _GROQ_KEY:
    LLM_PROVIDER = "groq"
    LLM_API_KEY = _GROQ_KEY
    LLM_BASE_URL = "https://api.groq.com/openai/v1"
    _DEFAULT_MODEL = "llama-3.3-70b-versatile"
elif _XAI_KEY:
    LLM_PROVIDER = "xai"
    LLM_API_KEY = _XAI_KEY
    LLM_BASE_URL = "https://api.x.ai/v1"
    _DEFAULT_MODEL = "grok-3-mini"
else:
    LLM_PROVIDER = None
    LLM_API_KEY = ""
    LLM_BASE_URL = ""
    _DEFAULT_MODEL = ""

LLM_MODEL = os.getenv("LLM_MODEL", "").strip() or _DEFAULT_MODEL


def llm_configured() -> bool:
    return bool(LLM_API_KEY)


# --- OCR ---
PID_OCR_SAMPLE = int(os.getenv("PID_OCR_SAMPLE", "3") or 3)

_TESSERACT_DEFAULTS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]


def find_tesseract() -> str | None:
    """Resolve the tesseract binary: env override, PATH, then default installs."""
    override = os.getenv("TESSERACT_CMD", "").strip()
    if override and Path(override).exists():
        return override
    on_path = shutil.which("tesseract")
    if on_path:
        return on_path
    for candidate in _TESSERACT_DEFAULTS:
        if Path(candidate).exists():
            return candidate
    return None
