/* Graph node type colors — used by the graph component and legend */
export const NODE_COLORS: Record<string, string> = {
  Equipment: "#4da3ff",
  Document: "#5f6f91",
  WorkOrder: "#57c785",
  Failure: "#ff5d5d",
  Inspection: "#ffd479",
  Calibration: "#c9b4ff",
  NCR: "#ff9950",
  CAPA: "#67e0d2",
  Audit: "#e08ee0",
  Incident: "#ff7597",
  NearMiss: "#ffb3c1",
  Regulation: "#b0d94e",
  Person: "#9aa7ba",
  SparePart: "#6fd3ff",
  Permit: "#d4c26a",
  Procedure: "#8de08e",
  LessonLearned: "#f2a1ff",
};

export const NODE_SIZES: Record<string, number> = {
  Equipment: 12,
  Regulation: 8,
  Failure: 8,
  Incident: 8,
};

export const DEFAULT_NODE_SIZE = 5;

/* Graph types matching the backend graph.json schema */
export interface GraphNode {
  id: string;
  type: string;
  key: string;
  props?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  rel: string;
  props?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface IngestStatus {
  ingested: boolean;
  pipeline_version?: string;
  files_tracked?: number;
  documents?: number;
  chunks?: number;
  nodes?: number;
  edges?: number;
  node_types?: Record<string, number>;
  edge_types?: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/* F2 Copilot types                                                    */
/* ------------------------------------------------------------------ */

export interface Citation {
  doc_id: string;
  chunk_id: string;
  doc_type: string;
  page: number | null;
  snippet: string;
  score: number;
}

export interface CopilotResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  sources_used: number;
  latency_ms: number;
}

export interface CopilotStatus {
  built: boolean;
  chunk_count: number;
  embed_model: string;
  llm_provider: string | null;
  llm_model: string | null;
  llm_configured: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  confidence?: number;
  sources_used?: number;
  latency_ms?: number;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/* F4 Compliance types                                                 */
/* ------------------------------------------------------------------ */

export interface ComplianceEntry {
  req_id: string;
  regulation: string;
  clause: string;
  requirement: string;
  applies_to: string;
  linked_procedure: string;
  evidence: string;
  status: "GAP" | "COMPLIANT" | "OPEN";
  gap_note: string;
  graph_edge?: Record<string, unknown>;
}

export interface NCRRecord {
  ncr_id: string;
  date_raised: string;
  raised_by: string;
  severity: string;
  tag: string;
  description: string;
  procedure_breached: string;
  regulation_breached: string;
  status: string;
  linked_capa: string;
  capa?: CAPARecord | null;
}

export interface CAPARecord {
  capa_id: string;
  linked_ncr: string;
  date_opened: string;
  capa_type: string;
  root_cause: string;
  corrective_action: string;
  preventive_action: string;
  owner: string;
  target_date: string;
  status: string;
  ncr?: NCRRecord | null;
}

export interface ComplianceDashboardData {
  total_requirements: number;
  gaps: number;
  compliant: number;
  open: number;
  ncr_open: number;
  capa_open: number;
  ncr_total: number;
  capa_total: number;
  regulation_breakdown: Record<string, { total: number; gap: number; compliant: number; open: number }>;
  asset_status: Array<{ tag: string; total: number; gap: number; compliant: number; open: number }>;
}

export interface EvidencePack {
  equipment_tag: string;
  compliance_entries: ComplianceEntry[];
  ncrs: NCRRecord[];
  capas: CAPARecord[];
  graph_edges: GraphEdge[];
  linked_documents: Array<{ doc_id: string; doc_type: string; title: string }>;
  inspections: GraphNode[];
  narrative: string;
}

