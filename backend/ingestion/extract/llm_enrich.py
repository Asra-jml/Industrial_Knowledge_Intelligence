"""Optional LLM enrichment for external incident PDFs (CSB / OISD case studies).

Uses whichever OpenAI-compatible provider is configured (the user's xAI Grok
key, or Groq if GROQ_API_KEY is set). Extracts failure modes, equipment
classes, and regulation references that regex can't see in narrative prose.

Results live inside the per-file contribution cache, so each document is
billed exactly once — re-runs reuse the cache until the file itself changes.
The whole stage is skipped (quietly) when no key is configured.
"""
from __future__ import annotations

import json
import re

import requests

from backend.core import config

ENRICH_SUFFIX = ".pdf"
ENRICH_DOC_TYPE = "incident_report"
_MAX_INPUT_CHARS = 8_000
_TIMEOUT = 90

_SYSTEM = (
    "You are an industrial reliability analyst. Given an excerpt of an incident "
    "investigation report, return STRICT JSON (no markdown, no prose) with keys: "
    '"failure_modes" (list of short strings), "equipment_classes" (list, e.g. '
    '"centrifugal pump", "distillation column"), "regulations" (list of '
    "standards/regulations referenced), \"summary\" (2-3 sentences, plain text)."
)


def eligible(doc_id: str, doc_type: str) -> bool:
    return doc_type == ENRICH_DOC_TYPE and doc_id.lower().endswith(ENRICH_SUFFIX)


def enrich(doc_id: str, text: str) -> dict | None:
    """None on any failure — enrichment must never break ingestion."""
    if not config.llm_configured() or not text.strip():
        return None
    try:
        resp = requests.post(
            f"{config.LLM_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {config.LLM_API_KEY}"},
            json={
                "model": config.LLM_MODEL,
                "temperature": 0,
                "messages": [
                    {"role": "system", "content": _SYSTEM},
                    {"role": "user", "content": f"Report: {doc_id}\n\n{text[:_MAX_INPUT_CHARS]}"},
                ],
            },
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return _parse_json(content)
    except Exception as exc:
        print(f"[llm] enrichment failed for {doc_id}: {exc}")
        return None


def _parse_json(content: str) -> dict | None:
    content = re.sub(r"^```(?:json)?|```$", "", content.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", content, re.DOTALL)
        if not m:
            return None
        try:
            data = json.loads(m.group())
        except json.JSONDecodeError:
            return None
    if not isinstance(data, dict):
        return None
    return {
        "failure_modes": [str(x) for x in data.get("failure_modes", [])][:10],
        "equipment_classes": [str(x) for x in data.get("equipment_classes", [])][:10],
        "regulations": [str(x) for x in data.get("regulations", [])][:10],
        "summary": str(data.get("summary", ""))[:1500],
    }
