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

/* ---- F2 Copilot ---- */
export interface Citation {
  ref: number;
  chunk_id: string;
  doc_id: string;
  doc_type: string;
  page: number | null;
  equipment_tags: string[];
  record_ids: string[];
  snippet: string;
  score: number;
}

export interface CopilotResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  mode: "llm" | "extractive" | "no_results";
  latency_ms: number;
}

/* ---- F3 Maintenance & RCA ---- */
export interface EquipmentHealth {
  tag: string;
  readings: number;
  latest_value: number;
  latest_date: string;
  latest_status: string;
  risk: "tripped" | "alarm" | "watch" | "normal";
  alarm: number | null;
  trip: number | null;
}

export interface TrendPoint {
  date: string;
  value: number;
  status: string;
}

export interface TrendPrediction {
  kind: "backtest" | "forecast";
  predicted_alarm?: string | null;
  predicted_trip?: string | null;
  actual_trip?: string;
  alarm_crossed?: string;
  lead_days: number | null;
  note: string;
}

export interface TrendResponse {
  tag: string;
  alarm: number | null;
  trip: number | null;
  equipment_type: string;
  series: TrendPoint[];
  fit: { slope_per_day: number; r2: number } | null;
  projection: { date: string; value: number }[];
  prediction: TrendPrediction | null;
}

export interface RcaStep {
  id: string;
  type: string;
  key: string;
  date: string;
  title: string;
  status: string;
  severity: "danger" | "warning" | "info" | "success";
  overdue: boolean;
}

export interface RcaResponse {
  tag: string;
  equipment: Record<string, unknown>;
  chain: RcaStep[];
  root_cause: string | null;
  regulation_gaps: { regulation: string; clause: string; gap_note: string }[];
  corrective_actions: { key: string; title: string; status: string }[];
  narrative: string | null;
  narrative_mode: "llm" | "rule_based";
}

/* ---- F4 Compliance ---- */
export interface EvidenceItem {
  id: string;
  type: string;
  key: string;
  role: string;
  title: string;
  date: string;
  status: string;
  in_graph: boolean;
}

export interface ComplianceRequirement {
  req_id: string;
  regulation: string;
  clause: string;
  requirement: string;
  applies_to: string;
  linked_procedure: string;
  status: "GAP" | "COMPLIANT" | "OPEN" | string;
  gap_note: string;
  evidence: EvidenceItem[];
}

export interface ComplianceRegister {
  summary: { total: number; gaps: number; compliant: number; open: number };
  requirements: ComplianceRequirement[];
}

/* ---- F5 Lessons ---- */
export interface PatternMember {
  id: string;
  type: string;
  key: string;
  date: string;
  summary: string;
}

export interface Precedent {
  doc_id: string;
  title: string;
  snippet: string;
  page: number | null;
}

export interface FailurePattern {
  pattern: string;
  title: string;
  members: PatternMember[];
  equipment: string[];
  at_risk_siblings: {
    tag: string;
    risk: string;
    latest_value: number | null;
    alarm: number | null;
  }[];
  precedents: Precedent[];
}

export interface LessonsAlert {
  severity: "warning" | "danger";
  target: string;
  pattern: string;
  title: string;
  rationale: string;
  summary: string | null;
  summary_mode: string;
  evidence: { id: string; key: string; date: string; summary: string }[];
  precedents: Precedent[];
  recommended_action: string;
}
