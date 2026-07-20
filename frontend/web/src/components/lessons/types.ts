export interface LessonsAnalysis {
  pattern_found: string;
  root_causes: string[];
  repeated_risks: string[];
  lessons_learned: string[];
  preventive_actions: string[];
}

export interface LessonsResponse {
  risk: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  matched_cases: number;
  analysis: LessonsAnalysis;
}