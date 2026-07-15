/* API client — talks to the FastAPI backend */
import type { GraphData, IngestStatus, CopilotResponse, CopilotStatus, ComplianceDashboardData, ComplianceEntry, EvidencePack, NCRRecord, CAPARecord } from "./types";

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

/* ------------------------------------------------------------------ */
/* F2 Copilot                                                          */
/* ------------------------------------------------------------------ */

export async function askCopilot(
  query: string,
  topK: number = 8
): Promise<CopilotResponse> {
  const res = await fetch(`${API_BASE}/api/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Copilot error (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function fetchCopilotStatus(): Promise<CopilotStatus> {
  const res = await fetch(`${API_BASE}/api/copilot/status`);
  if (!res.ok) throw new Error(`Failed to fetch copilot status: ${res.status}`);
  return res.json();
}

export async function fetchCopilotSuggestions(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/copilot/suggest`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

/* ------------------------------------------------------------------ */
/* F4 Compliance                                                       */
/* ------------------------------------------------------------------ */

export async function fetchComplianceDashboard(): Promise<ComplianceDashboardData> {
  const res = await fetch(`${API_BASE}/api/compliance/dashboard`);
  if (!res.ok) throw new Error(`Failed to fetch compliance dashboard: ${res.status}`);
  return res.json();
}

export async function fetchComplianceGaps(): Promise<{ gaps: ComplianceEntry[]; count: number }> {
  const res = await fetch(`${API_BASE}/api/compliance/gaps`);
  if (!res.ok) throw new Error(`Failed to fetch compliance gaps: ${res.status}`);
  return res.json();
}

export async function fetchComplianceRegister(): Promise<{ register: ComplianceEntry[]; count: number }> {
  const res = await fetch(`${API_BASE}/api/compliance/register`);
  if (!res.ok) throw new Error(`Failed to fetch compliance register: ${res.status}`);
  return res.json();
}

export async function fetchEvidencePack(equipmentTag: string): Promise<EvidencePack> {
  const res = await fetch(`${API_BASE}/api/compliance/evidence/${encodeURIComponent(equipmentTag)}`);
  if (!res.ok) throw new Error(`Failed to fetch evidence pack: ${res.status}`);
  return res.json();
}

export async function fetchNCRs(): Promise<{ ncrs: NCRRecord[]; count: number }> {
  const res = await fetch(`${API_BASE}/api/compliance/ncr`);
  if (!res.ok) throw new Error(`Failed to fetch NCRs: ${res.status}`);
  return res.json();
}

export async function fetchCAPAs(): Promise<{ capas: CAPARecord[]; count: number }> {
  const res = await fetch(`${API_BASE}/api/compliance/capa`);
  if (!res.ok) throw new Error(`Failed to fetch CAPAs: ${res.status}`);
export interface LessonsResponse {
  risk: string;
  message: string;
  matched_cases: number;
  analysis: {
    pattern_found: string;
    root_causes: string[];
    repeated_risks: string[];
    lessons_learned: string[];
    preventive_actions: string[];
  };
}

export async function analyzeLessons(
  query: string
): Promise<LessonsResponse> {
  const res = await fetch(`${API_BASE}/api/lessons/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Lessons API Error (${res.status}): ${detail}`);
  }

  return res.json();
}

