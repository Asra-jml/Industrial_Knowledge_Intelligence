"""Shared LLM chat helper for all features (F2 answers, F3 RCA narratives,
F4 gap explanations, F5 pattern summaries).

Uses whichever OpenAI-compatible provider is configured (Groq preferred,
xAI Grok otherwise — see backend.core.config). Always returns None on any
failure so every feature keeps a deterministic non-LLM fallback.
"""
from __future__ import annotations

import requests

from backend.core import config

_TIMEOUT = 60


def chat(
    system: str,
    user: str,
    max_tokens: int = 1024,
    temperature: float = 0.2,
) -> str | None:
    if not config.llm_configured():
        return None
    try:
        resp = requests.post(
            f"{config.LLM_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {config.LLM_API_KEY}"},
            json={
                "model": config.LLM_MODEL,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return content.strip() if content else None
    except Exception:
        return None
