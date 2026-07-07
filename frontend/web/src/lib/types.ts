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
