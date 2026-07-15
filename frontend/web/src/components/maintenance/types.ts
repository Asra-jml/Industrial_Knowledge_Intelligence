export interface RootCause {
  cause: string;
  evidence: string | null;
  finding: string;
}

export interface Vibration {
  equipment: string;
  current_vibration: number;
  condition: string;
  alarm_limit: number;
  trip_limit: number;
  history: number[];
  latest_status?: string;
  trend?: string;
}

export interface Prediction {
  risk: string;
  failure_mode: string;
  probability: number;
  lead_time_days: number | null;
  message: string;
}

export interface Evidence {
  source: string;
  finding: string;
  relation: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  severity: string;
}

export interface WorkOrder {
  source: string;
  details: Record<string, any>;
}

export interface FailureHistory {
  source: string;
  record: Record<string, any>;
}

export interface OEMGuideline {
  manual: string;
  recommendation: string;
}

export interface MaintenanceSchedule {
  urgent: string;
  preventive: string;
}

export interface WorkOrderAnalysis {
  total: number;
  preventive: number;
  corrective: number;
  inspection: number;
  overdue: number;
}

export interface FailureAnalysis {
  repeat_failures: number;
  trend: string;
}

export interface Regulation {
  name: string;
  status: string;
  gap: string;
}

export interface GraphReasoning {
  asset: string;
  inspection: string[];
  work_orders: string[];
  failures: string[];
  manuals: string[];
  regulations: Regulation[];
  spare_parts: string[];
  related_assets: string[];
  permits: string[];
  summary: string;
}

export interface OptimizedSchedule {
  inspection: string;
  lubrication: string;
  alignment: string;
  bearing_check: string;
}

export interface RCAResponse {
  equipment: string;
  fault: string;

  executive_summary: string;

  root_cause: RootCause;

  confidence_score: number;

  vibration: Vibration;

  prediction: Prediction;

  evidence_chain: Evidence[];

  work_order_analysis: WorkOrderAnalysis;

  failure_analysis: FailureAnalysis;

  graph_reasoning: GraphReasoning;

  optimized_schedule: OptimizedSchedule;

  timeline: TimelineEvent[];

  recommendations: string[];

  work_orders: WorkOrder[];

  failure_history: FailureHistory[];

  oem_guidelines: OEMGuideline[];

  maintenance_schedule: MaintenanceSchedule;

  spare_parts: string[];
}