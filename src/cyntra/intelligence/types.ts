import type {
  BoardSummaryResponse,
  DecisionIntelligenceResponse,
  DriftResponse,
  GovernanceResponse,
  PatternLearningResponse,
  RiskEvolutionResponse,
  SriResponse,
} from "@/dashboard/executive/api/types";

export type DriftQuadrant = "Stable" | "Fragile" | "Chaotic" | "Stagnating";

export type GovernanceState =
  | "Gefragmenteerd"
  | "Reactief"
  | "Gecontroleerd"
  | "Geinstitutionaliseerd"
  | "Zelfregulerend";

export interface StrategicHealthFactors {
  governance_score: number;
  execution_consistency: number;
  drift_stability_inverse: number;
  risk_density_inverse: number;
  decision_velocity: number;
}

export interface StrategicHealthOutput {
  score: number;
  trend7d: number;
  trend30d: number;
  volatility_flag: boolean;
}

export interface DriftAnalysisInput {
  write_coverage: number;
  single_call_regressies: number;
  ratio_422: number;
  governance_maturity: number;
}

export interface DriftAnalysisOutput {
  structural_drift: number;
  execution_drift: number;
  quadrant: DriftQuadrant;
}

export interface RiskTrajectoryOutput {
  current_risk_score: number;
  projected_risk_30d: number;
  projected_risk_90d: number;
  confidence_band: [number, number];
}

export interface GovernanceResolverInput {
  governance_maturity: number;
  drift_quadrant: DriftQuadrant;
  consistency_score: number;
}

export interface GovernanceResolutionOutput {
  state: GovernanceState;
  confidence: number;
}

export interface ExecutiveDecisionCardData {
  dominant_thesis: string;
  central_tension: string;
  irreversible_choice: string;
  confidence_pct: number;
  window_30d: string;
  narrative: string;
}

export interface PatternLearningSignal {
  recurrent_patterns: string[];
  decision_type_cluster: string[];
  stagnation_signals: number;
  escalation_frequency: number;
}

export interface DecisionIntelligenceSignal {
  irreversibility_score: number;
  ownership_clarity: number;
  execution_probability: number;
  decision_strength_index: number;
  evolution_state: "Verbetering" | "Verslechtering" | "Stilstand";
  evolution_delta: number;
  compared_window_size: number;
}

export interface RiskEvolutionIntelligenceSignal {
  risk_acceleration: number;
  governance_decay: number;
  drift_intensification: number;
  projection_30d: number;
  projection_60d: number;
  projection_90d: number;
  confidence_band: [number, number];
  drift_alarm: boolean;
}

export interface IntelligenceAggregateInput {
  sri: SriResponse;
  drift: DriftResponse;
  risk: RiskEvolutionResponse;
  governance: GovernanceResponse;
  patternLearning: PatternLearningResponse;
  decisionIntelligence: DecisionIntelligenceResponse;
  boardSummary: BoardSummaryResponse;
}

export interface AggregatedSignals {
  strategic_health: StrategicHealthOutput;
  drift: DriftAnalysisOutput;
  risk: RiskTrajectoryOutput;
  risk_evolution: RiskEvolutionIntelligenceSignal;
  governance_state: GovernanceResolutionOutput;
  pattern_learning: PatternLearningSignal;
  decision_intelligence: DecisionIntelligenceSignal;
  executive_decision: ExecutiveDecisionCardData;
}
