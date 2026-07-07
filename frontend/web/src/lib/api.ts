/* API client — talks to the FastAPI backend */
import type { GraphData, IngestStatus } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchGraph(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/api/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph: ${res.status}`);
  return res.json();
}

export async function fetchNodeDetail(
  nodeId: string
): Promise<{ node: GraphData["nodes"][0]; edges: GraphData["edges"] }> {
  const res = await fetch(
    `${API_BASE}/api/graph/node/${encodeURIComponent(nodeId)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch node: ${res.status}`);
  return res.json();
}

export async function fetchIngestStatus(): Promise<IngestStatus> {
  const res = await fetch(`${API_BASE}/api/ingest/status`);
  if (!res.ok) throw new Error(`Failed to fetch ingest status: ${res.status}`);
  return res.json();
}
