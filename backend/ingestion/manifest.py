"""SHA-256 manifest + per-file contribution cache.

Incremental re-ingest: unchanged files load their cached contribution
(doc record, chunks, nodes, edges, co-occurrence pairs) instead of
re-parsing; deleted files simply drop out of the merge. A pipeline_version
mismatch invalidates everything (extractor rules changed).
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path

from backend.core import config


def _cache_name(doc_id: str) -> str:
    return doc_id.replace("/", "__") + ".json"


def file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


@dataclass
class Manifest:
    cache_dir: Path
    files: dict[str, dict] = field(default_factory=dict)   # doc_id -> {sha256,...}
    pipeline_version: str = ""

    @classmethod
    def load(cls, cache_dir: Path | None = None) -> "Manifest":
        cache_dir = cache_dir or config.CACHE_DIR
        path = cache_dir / "manifest.json"
        m = cls(cache_dir=cache_dir)
        if path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            m.files = data.get("files", {})
            m.pipeline_version = data.get("pipeline_version", "")
        return m

    def save(self) -> None:
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        payload = {
            "pipeline_version": config.PIPELINE_VERSION,
            "corpus_root": str(config.CORPUS_ROOT),
            "files": self.files,
        }
        (self.cache_dir / "manifest.json").write_text(
            json.dumps(payload, indent=1, sort_keys=True), encoding="utf-8"
        )

    def diff(self, discovered: dict[str, Path], force_full: bool = False) -> dict:
        """-> {'reuse': [doc_id], 'process': [doc_id], 'deleted': [doc_id]}"""
        stale_pipeline = self.pipeline_version != config.PIPELINE_VERSION
        reuse, process = [], []
        for doc_id, path in discovered.items():
            entry = self.files.get(doc_id)
            if (
                force_full
                or stale_pipeline
                or entry is None
                or entry.get("sha256") != file_sha256(path)
                or not (self.cache_dir / _cache_name(doc_id)).exists()
            ):
                process.append(doc_id)
            else:
                reuse.append(doc_id)
        deleted = [d for d in self.files if d not in discovered]
        return {"reuse": reuse, "process": process, "deleted": deleted}

    def store_contribution(self, doc_id: str, path: Path, contribution: dict) -> None:
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        (self.cache_dir / _cache_name(doc_id)).write_text(
            json.dumps(contribution, ensure_ascii=False, sort_keys=True),
            encoding="utf-8",
        )
        self.files[doc_id] = {"sha256": file_sha256(path), "size": path.stat().st_size}

    def load_contribution(self, doc_id: str) -> dict:
        return json.loads(
            (self.cache_dir / _cache_name(doc_id)).read_text(encoding="utf-8")
        )

    def forget(self, doc_id: str) -> None:
        self.files.pop(doc_id, None)
        cache_file = self.cache_dir / _cache_name(doc_id)
        if cache_file.exists():
            cache_file.unlink()
