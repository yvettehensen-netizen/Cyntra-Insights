export interface DecisionStrengthIndexFactors {
  clarity_score: number;
  decision_certainty: number;
  execution_probability: number;
  pattern_learning_coherence: number;
  drift_stability_inverse: number;
  risk_projection_confidence: number;
}

export interface DecisionStrengthIndexOutput {
  organisationId: string;
  baseline_dsi: number;
  current_dsi: number;
  trend_30d: number;
  trend_60d: number;
  trend_90d: number;
  improvement_pct: number;
  timestamp: string;
}

export interface PerformanceEvolution {
  baseline_dsi: number;
  current_dsi: number;
  improvement_pct: number;
  improvement_velocity: number;
  stagnation_flag: boolean;
  regression_flag: boolean;
  days_since_baseline: number;
}

export interface OrganisationPerformanceBaselineRow {
  organisation_id: string;
  baseline_dsi: number;
  baseline_timestamp: string;
  baseline_sri: number;
  baseline_execution_score: number;
}

export interface OrganisationPerformanceSnapshotRow {
  organisation_id: string;
  measurement_date: string;
  snapshot_timestamp: string;
  dsi: number;
  execution_score: number;
  decision_velocity: number;
}

export interface PerformanceTrajectoryPoint {
  dag: number;
  label: string;
  dsi: number;
  verbetering_pct: number;
  execution_score: number;
}

export interface PerformanceTrajectoryOutput {
  dsi: DecisionStrengthIndexOutput;
  evolution: PerformanceEvolution;
  trajectory: PerformanceTrajectoryPoint[];
}

export interface PerformanceBenchmarkSnapshot {
  gemiddelde_dsi_verbetering_pct: number;
  top_25_pct_grens: number;
  mediaan_verbetering_pct: number;
  stagnatie_pct: number;
  organisatie_aantal: number;
}

export interface PerformanceCaseStudy {
  organisation_id: string;
  baseline_dsi: number;
  current_dsi: number;
  improvement_pct: number;
  execution_stability_change: number;
  time_window_days: number;
}

export interface PerformanceSurfaceModel {
  factors: DecisionStrengthIndexFactors;
  evolution: PerformanceEvolution;
  dsi: DecisionStrengthIndexOutput;
  trajectory: PerformanceTrajectoryPoint[];
  execution_stability_change: number;
  benchmark: PerformanceBenchmarkSnapshot | null;
  case_study: PerformanceCaseStudy;
  milestones: Array<{
    day: number;
    target_dsi: number;
    current_dsi: number;
    status: "voor op schema" | "op schema" | "achterstand";
  }>;
  focus_area: string;
  key_intervention: string;
  measurable_target: string;
  expected_dsi_lift: number;
}
