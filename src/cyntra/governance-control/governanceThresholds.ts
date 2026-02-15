export const GOVERNANCE_CONTROL_THRESHOLDS = {
  sri: {
    controlled_min: 65,
    escalation_max: 45,
  },
  board_index: {
    controlled_min: 7,
    escalation_max: 6,
  },
  risk_acceleration: {
    stable_max: 2.2,
    elevated_min: 2.2,
    critical_min: 3.3,
  },
  governance_decay: {
    stable_max: 42,
    elevated_min: 42,
    critical_min: 62,
  },
  decision_strength: {
    controlled_min: 70,
    weak_max: 58,
  },
  drift_quadrant: {
    escalation: ["Chaotic"],
    risk: ["Fragile", "Stagnating"],
  },
  composite_risk: {
    at_risk_min: 0.48,
    escalation_min: 0.72,
  },
} as const;
