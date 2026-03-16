// ============================================================
// NON-LINEAR DECISION TYPES — ADD ONLY
// ============================================================

export interface LensSignalBundle {
  lens_id: string;

  structural_observations: string[];

  tensions: {
    axis: string;
    surface_manifestation: string;
    structural_impact: string;
    severity: 1 | 2 | 3 | 4 | 5;
  }[];

  non_choices: string[];

  decision_weakness_signals: {
    signal: string;
    risk_level: 1 | 2 | 3 | 4 | 5;
  }[];

  trade_offs: {
    competing_values: string;
    unresolved_cost: string;
    system_location: string;
  }[];

  confidence: number;
}

export interface SystemConflictObject {
  axis: string;
  lenses_involved: string[];
  severity_score: number;
  structural_depth: "surface" | "mid" | "core";
  board_risk: string;
  if_unresolved_consequence: string;
}
