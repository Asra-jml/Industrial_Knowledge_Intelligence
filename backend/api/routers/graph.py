"""F1 graph endpoints: serve the knowledge graph + ingestion status."""
from __future__ import annotations

import json
from collections import Counter

from fastapi import APIRouter, HTTPException

from backend.core import config, graph_store

router = APIRouter(prefix="/api", tags=["graph"])


@router.get("/graph")
def get_graph() -> dict:
    """The full knowledge graph (graph.json)."""
    try:
        return graph_store.load_graph()
    except FileNotFoundError:
        raise HTTPException(404, "graph.json not found - run the ingest first")


@router.get("/graph/node/{node_id:path}")
def get_node(node_id: str) -> dict:
    """One node + its direct relationships (node_id like 'Equipment:P-101')."""
    graph = graph_store.load_graph()
    node = next((n for n in graph["nodes"] if n["id"] == node_id), None)
    if node is None:
        raise HTTPException(404, f"node '{node_id}' not found")
    edges = [e for e in graph["edges"] if node_id in (e["source"], e["target"])]
    return {"node": node, "edges": edges}


@router.get("/ingest/status")
def ingest_status() -> dict:
    """What the shared layer currently contains."""
    if not config.GRAPH_PATH.exists():
        return {"ingested": False}
    graph = graph_store.load_graph()
    manifest_path = config.CACHE_DIR / "manifest.json"
    manifest = (
        json.loads(manifest_path.read_text(encoding="utf-8"))
        if manifest_path.exists()
        else {}
    )
    doc_count = sum(1 for _ in open(config.DOCUMENTS_PATH, encoding="utf-8")) \
        if config.DOCUMENTS_PATH.exists() else 0
    chunk_count = sum(1 for _ in open(config.CORPUS_INDEX_PATH, encoding="utf-8")) \
        if config.CORPUS_INDEX_PATH.exists() else 0
    return {
        "ingested": True,
        "pipeline_version": manifest.get("pipeline_version", ""),
        "files_tracked": len(manifest.get("files", {})),
        "documents": doc_count,
        "chunks": chunk_count,
        "nodes": len(graph["nodes"]),
        "edges": len(graph["edges"]),
        "node_types": dict(Counter(n["type"] for n in graph["nodes"])),
        "edge_types": dict(Counter(e["rel"] for e in graph["edges"])),
    }
