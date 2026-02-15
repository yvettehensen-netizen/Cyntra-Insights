export type DecisionEvolutionState = "Verbetering" | "Verslechtering" | "Stilstand";

export interface DecisionSnapshot {
  analysis_id?: string | null;
  timestamp: string;
  gate_score: number;
  gate_status: string;
  repair_attempts: number;
  decision_velocity: number;
  single_call_mode: boolean;
  duration_ms: number;
  activated_lenses: string[];
  dominant_risk_axes: string[];
}

export interface DecisionIntelligenceInput {
  history: DecisionSnapshot[];
  irreversibility_score?: number;
  ownership_clarity_score?: number;
  ownership_clarity?: number;
  execution_probability?: number;
  decision_strength_index?: number;
}

export interface DecisionIntelligenceOutput {
  irreversibility_score: number;
  ownership_clarity_score: number;
  ownership_clarity: number;
  execution_probability: number;
  decision_strength_index: number;
  evolution_state: DecisionEvolutionState;
  evolution_delta: number;
  compared_window_size: number;
}
