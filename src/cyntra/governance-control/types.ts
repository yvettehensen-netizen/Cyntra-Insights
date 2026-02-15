export type GovernanceState =
  | "CONTROLLED"
  | "AT_RISK"
  | "ESCALATION_REQUIRED";

export interface GovernanceControlInput {
  sri: number;
  board_index: number;
  risk_acceleration: number;
  governance_decay: number;
  drift_quadrant: string;
  decision_strength_index: number;
  updated_at?: string;
}

export interface GovernanceControlOutput {
  state: GovernanceState;
  sri: number;
  board_index: number;
  risk_acceleration: number;
  drift_quadrant: string;
  escalation_flag: boolean;
  advisory_flag: boolean;
  rationale: string;
  updated_at: string;
}
