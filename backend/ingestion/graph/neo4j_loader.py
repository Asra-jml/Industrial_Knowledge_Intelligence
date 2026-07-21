"""Persist graph.json into Neo4j (Aura) with idempotent MERGE semantics.

- one unique constraint per label on `id`
- batched UNWIND ... MERGE for nodes (by label) and relationships (by type)
- skips cleanly when credentials are unset; falls back to the default
  'neo4j' database if the configured database name is rejected
"""
from __future__ import annotations

from backend.core import config, graph_store

BATCH = 500

# natural key field per label (kg_schema.json node_types + our documented
# extensions) so Cypher like {tag:'P-101'} works, not just {id:'Equipment:P-101'}
KEY_FIELD = {
    "Equipment": "tag", "Document": "doc_id", "WorkOrder": "wo_id",
    "Failure": "failure_id", "Inspection": "insp_id", "Calibration": "cal_id",
    "NCR": "ncr_id", "CAPA": "capa_id", "Audit": "audit_id",
    "Incident": "incident_id", "NearMiss": "nm_id", "Regulation": "name",
    "Person": "name", "SparePart": "part_no", "Permit": "ptw_id",
    "Procedure": "sop_id", "LessonLearned": "ll_id",
}


def load_graph(graph: dict, reset: bool = False) -> dict | None:
    driver = graph_store.get_neo4j_driver()
    if driver is None:
        print("[neo4j] credentials not set - skipping (graph.json is complete)")
        return None

    try:
        return _load(driver, graph, reset)
    except Exception as exc:
        # Aura free instances pause when idle; never fail the ingest over it
        print(f"[neo4j] unreachable ({type(exc).__name__}) - skipped. "
              "Resume the Aura instance at console.neo4j.io and re-run.")
        return None


def _load(driver, graph: dict, reset: bool) -> dict:
    try:
        database = _resolve_database(driver)
        with driver.session(database=database) as session:
            if reset:
                session.run("MATCH (n) DETACH DELETE n")
                print("[neo4j] reset: all nodes deleted")

            labels = sorted({n["type"] for n in graph["nodes"]})
            for label in labels:
                session.run(
                    f"CREATE CONSTRAINT IF NOT EXISTS "
                    f"FOR (n:`{label}`) REQUIRE n.id IS UNIQUE"
                )

            node_count = 0
            for label in labels:
                key_field = KEY_FIELD.get(label, "key")
                rows = [
                    {"id": n["id"], "key": n["key"], "props": _clean(n["props"])}
                    for n in graph["nodes"]
                    if n["type"] == label
                ]
                for batch in _batches(rows):
                    session.run(
                        f"UNWIND $rows AS row "
                        f"MERGE (n:`{label}` {{id: row.id}}) "
                        f"SET n.key = row.key, n.`{key_field}` = row.key, n += row.props",
                        rows=batch,
                    )
                node_count += len(rows)

            edge_count = 0
            rels = sorted({e["rel"] for e in graph["edges"]})
            for rel in rels:
                rows = [
                    {"source": e["source"], "target": e["target"], "props": _clean(e["props"])}
                    for e in graph["edges"]
                    if e["rel"] == rel
                ]
                for batch in _batches(rows):
                    session.run(
                        f"UNWIND $rows AS row "
                        f"MATCH (a {{id: row.source}}) MATCH (b {{id: row.target}}) "
                        f"MERGE (a)-[r:`{rel}`]->(b) SET r += row.props",
                        rows=batch,
                    )
                edge_count += len(rows)

        print(f"[neo4j] loaded {node_count} nodes, {edge_count} relationships "
              f"({config.NEO4J_URI}, db={database})")
        return {"nodes": node_count, "edges": edge_count, "database": database}
    finally:
        driver.close()


def _resolve_database(driver) -> str:
    """Use the configured database; fall back to 'neo4j' if it doesn't exist."""
    candidate = config.NEO4J_DATABASE
    try:
        with driver.session(database=candidate) as s:
            s.run("RETURN 1").consume()
        return candidate
    except Exception:
        if candidate != "neo4j":
            print(f"[neo4j] database '{candidate}' rejected - using 'neo4j'")
            return "neo4j"
        raise


def _clean(props: dict) -> dict:
    """Neo4j properties must be primitives or arrays of primitives."""
    out = {}
    for k, v in props.items():
        if isinstance(v, (str, int, float, bool)):
            out[k] = v
        elif isinstance(v, list) and all(isinstance(x, (str, int, float, bool)) for x in v):
            out[k] = v
        elif isinstance(v, dict):
            out[k] = str(v)
    return out


def _batches(rows: list, size: int = BATCH):
    for i in range(0, len(rows), size):
        yield rows[i : i + size]
