/* Graph helper utilities — two-hop subgraph, search, etc. */
import type { GraphData, GraphEdge, GraphNode } from "./types";

/** Compute the set of node IDs within N hops of a start node */
export function nHopNeighborhood(
  startId: string,
  edges: GraphEdge[],
  hops: number = 2
): Set<string> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  }
  const seen = new Set([startId]);
  let frontier = [startId];
  for (let h = 0; h < hops; h++) {
    const next: string[] = [];
    for (const f of frontier) {
      for (const n of adj.get(f) || []) {
        if (!seen.has(n)) {
          seen.add(n);
          next.push(n);
        }
      }
    }
    frontier = next;
  }
  return seen;
}

/** Search nodes by query string (ID, key, or properties) */
export function searchNodes(
  nodes: GraphNode[],
  query: string
): GraphNode | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  return (
    nodes.find((n) => n.id.toLowerCase() === q) ||
    nodes.find((n) => n.key.toLowerCase() === q) ||
    nodes.find(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.key.toLowerCase().includes(q) ||
        String(n.props?.title || "")
          .toLowerCase()
          .includes(q)
    )
  );
}

/** Get edges connected to a specific node */
export function getNodeEdges(nodeId: string, edges: GraphEdge[]): GraphEdge[] {
  return edges.filter((e) => e.source === nodeId || e.target === nodeId);
}

/** Count nodes by type */
export function countByType(nodes: GraphNode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const n of nodes) {
    counts[n.type] = (counts[n.type] || 0) + 1;
  }
  return counts;
}

/** Short label for display */
export function shortLabel(key: string, maxLen: number = 22): string {
  const name = key.includes("/") ? key.split("/").pop()! : key;
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}
