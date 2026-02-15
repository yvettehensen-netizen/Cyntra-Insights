export interface RiskEvolutionModelInput {
  current_risk_score: number;
  risk_velocity: number;
  risk_trend_7d: number;
  governance_state: string;
  governance_freeze_flags: number;
  governance_escalations: number;
  drift_execution: number;
  drift_structural: number;
  drift_alarm_threshold?: number;
}

export interface RiskEvolutionModelOutput {
  risk_acceleration: number;
  governance_decay: number;
  drift_intensification: number;
  projection_30d: number;
  projection_60d: number;
  projection_90d: number;
  confidence_band: [number, number];
  drift_alarm: boolean;
}
