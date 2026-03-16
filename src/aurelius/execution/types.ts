// ============================================================
// src/aurelius/execution/types.ts
// EXECUTION TYPES — CANONICAL
// ADD ONLY
// ============================================================

export type ExecutionRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type ExecutionLayer = {
  execution_layer: {
    "90_day_priorities": string[];
    measurable_outcomes: string[];
    risk_level: ExecutionRiskLevel;
    owner_map: string[];
  };
};

export type ExecutionMetrics = {
  conflict_intensity_score_0_100?: number;
  governance_integrity_score_0_100?: number;
  decision_strength_index_0_100?: number;
  execution_risk_level?: ExecutionRiskLevel | string;
  decision_certainty_0_1?: number;
};
