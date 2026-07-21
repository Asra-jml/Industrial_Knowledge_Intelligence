/* API client — talks to the FastAPI backend */
import type {
  ComplianceRegister,
  CopilotResponse,
  EquipmentHealth,
  FailurePattern,
  GraphData,
  IngestStatus,
  LessonsAlert,
  RcaResponse,
  TrendResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

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

/* ---- F2 Copilot ---- */
export async function askCopilot(
  question: string,
  history: { question: string; answer: string }[] = []
): Promise<CopilotResponse> {
  const res = await fetch(`${API_BASE}/api/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history: history.slice(-3) }),
  });
  if (!res.ok) throw new Error(`Copilot request failed: ${res.status}`);
  return res.json();
}

export async function fetchSuggestions(): Promise<string[]> {
  const data = await getJson<{ suggestions: string[] }>("/api/copilot/suggestions");
  return data.suggestions;
}

/* ---- F3 Maintenance & RCA ---- */
export async function fetchRcaEquipment(): Promise<EquipmentHealth[]> {
  const data = await getJson<{ equipment: EquipmentHealth[] }>("/api/rca/equipment");
  return data.equipment;
}

export function fetchRcaTrend(tag: string): Promise<TrendResponse> {
  return getJson(`/api/rca/trend/${encodeURIComponent(tag)}`);
}

export function fetchRcaAnalysis(tag: string): Promise<RcaResponse> {
  return getJson(`/api/rca/analyze/${encodeURIComponent(tag)}`);
}

/* ---- F4 Compliance ---- */
export function fetchComplianceRegister(): Promise<ComplianceRegister> {
  return getJson("/api/compliance/register");
}

export async function fetchComplianceNarrative(): Promise<string | null> {
  const data = await getJson<{ narrative: string | null }>("/api/compliance/narrative");
  return data.narrative;
}

/* ---- F5 Lessons ---- */
export async function fetchLessonsPatterns(): Promise<FailurePattern[]> {
  const data = await getJson<{ patterns: FailurePattern[] }>("/api/lessons/patterns");
  return data.patterns;
}

export async function fetchLessonsAlerts(): Promise<LessonsAlert[]> {
  const data = await getJson<{ alerts: LessonsAlert[] }>("/api/lessons/alerts");
  return data.alerts;
}
