"""Read access to the knowledge graph for all features.

F1 writes graph.json + Neo4j; F3/F4/F5 read through these helpers so the
storage backend can change without touching feature code.
"""
from __future__ import annotations

import json
from pathlib import Path

from backend.core import config


def load_graph(path: Path | None = None) -> dict:
    """Load graph.json -> {"nodes": [...], "edges": [...]}."""
    p = path or config.GRAPH_PATH
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def get_neo4j_driver():
    """Return a connected Neo4j driver, or None when credentials are unset."""
    if not config.neo4j_configured():
        return None
    from neo4j import GraphDatabase  # imported lazily; optional dependency at runtime

    return GraphDatabase.driver(
        config.NEO4J_URI,
        auth=(config.NEO4J_USERNAME, config.NEO4J_PASSWORD),
    )
