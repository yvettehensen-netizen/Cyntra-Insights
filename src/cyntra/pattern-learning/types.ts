export interface DecisionMemorySignal {
  analysis_id?: string | null;
  timestamp: string;
  gate_score: number;
  gate_status: string;
  repair_attempts: number;
  decision_velocity: number;
  activated_lenses: string[];
  dominant_risk_axes: string[];
  dominant_claim_axes: string[];
}

export interface AuditSignal {
  analysis_id?: string | null;
  timestamp: string;
  repair_attempts: number;
  single_call_mode: boolean;
  duration_ms: number;
}

export interface PatternLearningInput {
  recurrent_patterns?: string[];
  decision_type_cluster?: string[];
  stagnation_signals?: number;
  escalation_frequency?: number;
  decision_memory: DecisionMemorySignal[];
  audit_logs: AuditSignal[];
  lookback_days?: number;
}

export interface PatternLearningOutput {
  recurrent_patterns: string[];
  decision_type_cluster: string[];
  stagnation_signals: number;
  escalation_frequency: number;
}
