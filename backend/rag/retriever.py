"""F2 retrieval — BM25 over shared/corpus_index.jsonl with domain boosts.

Pure Python (no vector-store dependency): 8k chunks rank in milliseconds,
works fully offline, and is deterministic. Chunks whose equipment_tags or
record_ids literally match tokens in the query get a strong boost — in an
industrial corpus, an exact tag hit ("P-101") beats any embedding.

The index is a lazy singleton, rebuilt automatically when the underlying
corpus_index.jsonl changes (mtime check) — so a re-ingest is picked up
without restarting the API.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field

from backend.core import config

_TOKEN_RE = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
_ID_RE = re.compile(r"\b[A-Z]{1,4}-\d{2,4}(?:-\d{2,4})?\b")

# BM25 parameters
K1 = 1.5
B = 0.75


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


@dataclass
class ScoredChunk:
    chunk: dict
    score: float
    boosts: list[str] = field(default_factory=list)


class Bm25Index:
    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        self.doc_freq: Counter = Counter()
        self.postings: dict[str, list[tuple[int, int]]] = defaultdict(list)
        self.lengths: list[int] = []
        for i, chunk in enumerate(chunks):
            tokens = _tokenize(chunk["text"])
            self.lengths.append(len(tokens))
            counts = Counter(tokens)
            for token, tf in counts.items():
                self.postings[token].append((i, tf))
            self.doc_freq.update(counts.keys())
        self.avg_len = (sum(self.lengths) / len(self.lengths)) if chunks else 1.0
        self.n = len(chunks)

    def scores(self, query_tokens: list[str]) -> dict[int, float]:
        scores: dict[int, float] = defaultdict(float)
        for token in set(query_tokens):
            df = self.doc_freq.get(token)
            if not df:
                continue
            idf = math.log(1 + (self.n - df + 0.5) / (df + 0.5))
            for idx, tf in self.postings[token]:
                denom = tf + K1 * (1 - B + B * self.lengths[idx] / self.avg_len)
                scores[idx] += idf * (tf * (K1 + 1)) / denom
        return scores


_index: Bm25Index | None = None
_index_mtime: float = 0.0


def get_index() -> Bm25Index:
    global _index, _index_mtime
    path = config.CORPUS_INDEX_PATH
    mtime = path.stat().st_mtime
    if _index is None or mtime != _index_mtime:
        chunks = [
            json.loads(line)
            for line in path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        _index = Bm25Index(chunks)
        _index_mtime = mtime
    return _index


def retrieve(
    query: str,
    k: int = 8,
    doc_type: str | None = None,
) -> list[ScoredChunk]:
    """Top-k chunks for a query, with exact tag/record-ID boosting and a
    per-document cap so one long manual can't monopolize the results."""
    index = get_index()
    query_tokens = _tokenize(query)
    ids_in_query = set(_ID_RE.findall(query)) | {
        t.upper() for t in query_tokens if re.fullmatch(r"[a-z]{1,4}-\d{2,4}", t)
    }

    base = index.scores(query_tokens)
    results: list[ScoredChunk] = []
    for idx, score in base.items():
        chunk = index.chunks[idx]
        if doc_type and chunk.get("doc_type") != doc_type:
            continue
        boosts: list[str] = []
        tag_hits = ids_in_query & set(chunk.get("equipment_tags", []))
        record_hits = ids_in_query & set(chunk.get("record_ids", []))
        if tag_hits:
            score *= 2.2
            boosts.append(f"equipment:{','.join(sorted(tag_hits))}")
        if record_hits:
            score *= 2.5
            boosts.append(f"record:{','.join(sorted(record_hits))}")
        results.append(ScoredChunk(chunk=chunk, score=score, boosts=boosts))

    results.sort(key=lambda r: -r.score)

    # diversity: at most 3 chunks per source document
    per_doc: Counter = Counter()
    picked: list[ScoredChunk] = []
    for r in results:
        doc_id = r.chunk["doc_id"]
        if per_doc[doc_id] >= 3:
            continue
        per_doc[doc_id] += 1
        picked.append(r)
        if len(picked) >= k:
            break
    return picked
