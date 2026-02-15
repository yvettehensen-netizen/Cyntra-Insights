import { GOVERNANCE_CONTROL_THRESHOLDS } from "./governanceThresholds";
import type {
  GovernanceControlInput,
  GovernanceControlOutput,
  GovernanceState,
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function normalizedSRIStress(sri: number): number {
  return clamp((70 - sri) / 35, 0, 1);
}

function normalizedBoardStress(boardIndex: number): number {
  return clamp((7.5 - boardIndex) / 3.5, 0, 1);
}

function normalizedRiskAccelerationStress(riskAcceleration: number): number {
  const stableMax = GOVERNANCE_CONTROL_THRESHOLDS.risk_acceleration.stable_max;
  const criticalMin = GOVERNANCE_CONTROL_THRESHOLDS.risk_acceleration.critical_min;
  return clamp((riskAcceleration - stableMax) / (criticalMin - stableMax), 0, 1);
}

function normalizedGovernanceDecayStress(governanceDecay: number): number {
  const stableMax = GOVERNANCE_CONTROL_THRESHOLDS.governance_decay.stable_max;
  const criticalMin = GOVERNANCE_CONTROL_THRESHOLDS.governance_decay.critical_min;
  return clamp((governanceDecay - stableMax) / (criticalMin - stableMax), 0, 1);
}

function normalizedDecisionStress(decisionStrength: number): number {
  return clamp((75 - decisionStrength) / 30, 0, 1);
}

function normalizedDriftStress(quadrant: string): number {
  if (GOVERNANCE_CONTROL_THRESHOLDS.drift_quadrant.escalation.includes(quadrant)) {
    return 1;
  }
  if (GOVERNANCE_CONTROL_THRESHOLDS.drift_quadrant.risk.includes(quadrant)) {
    return 0.65;
  }
  return 0.2;
}

function severeSignalCount(input: {
  sri: number;
  boardIndex: number;
  riskAcceleration: number;
  governanceDecay: number;
  decisionStrength: number;
  driftQuadrant: string;
}): number {
  let count = 0;
  if (input.sri <= GOVERNANCE_CONTROL_THRESHOLDS.sri.escalation_max) count += 1;
  if (input.boardIndex <= GOVERNANCE_CONTROL_THRESHOLDS.board_index.escalation_max) count += 1;
  if (input.riskAcceleration >= GOVERNANCE_CONTROL_THRESHOLDS.risk_acceleration.critical_min) count += 1;
  if (input.governanceDecay >= GOVERNANCE_CONTROL_THRESHOLDS.governance_decay.critical_min) count += 1;
  if (input.decisionStrength <= GOVERNANCE_CONTROL_THRESHOLDS.decision_strength.weak_max) count += 1;
  if (GOVERNANCE_CONTROL_THRESHOLDS.drift_quadrant.escalation.includes(input.driftQuadrant)) count += 1;
  return count;
}

function stressSignalCount(input: {
  sri: number;
  boardIndex: number;
  riskAcceleration: number;
  governanceDecay: number;
  decisionStrength: number;
  driftQuadrant: string;
}): number {
  let count = 0;
  if (input.sri < GOVERNANCE_CONTROL_THRESHOLDS.sri.controlled_min) count += 1;
  if (input.boardIndex < GOVERNANCE_CONTROL_THRESHOLDS.board_index.controlled_min) count += 1;
  if (input.riskAcceleration >= GOVERNANCE_CONTROL_THRESHOLDS.risk_acceleration.elevated_min) count += 1;
  if (input.governanceDecay >= GOVERNANCE_CONTROL_THRESHOLDS.governance_decay.elevated_min) count += 1;
  if (input.decisionStrength < GOVERNANCE_CONTROL_THRESHOLDS.decision_strength.controlled_min) count += 1;
  if (
    GOVERNANCE_CONTROL_THRESHOLDS.drift_quadrant.risk.includes(input.driftQuadrant) ||
    GOVERNANCE_CONTROL_THRESHOLDS.drift_quadrant.escalation.includes(input.driftQuadrant)
  ) {
    count += 1;
  }
  return count;
}

function determineState(params: {
  compositeRisk: number;
  severeSignals: number;
  stressSignals: number;
}): GovernanceState {
  if (
    (params.compositeRisk >= GOVERNANCE_CONTROL_THRESHOLDS.composite_risk.escalation_min &&
      params.severeSignals >= 2) ||
    params.severeSignals >= 3
  ) {
    return "ESCALATION_REQUIRED";
  }

  if (
    (params.compositeRisk >= GOVERNANCE_CONTROL_THRESHOLDS.composite_risk.at_risk_min &&
      params.stressSignals >= 2) ||
    params.stressSignals >= 3
  ) {
    return "AT_RISK";
  }

  return "CONTROLLED";
}

function buildRationale(params: {
  state: GovernanceState;
  sri: number;
  boardIndex: number;
  riskAcceleration: number;
  driftQuadrant: string;
}): string {
  if (params.state === "CONTROLLED") {
    return (
      "Strategische stabiliteit is aantoonbaar binnen vastgestelde governancebandbreedte. " +
      `SRI ${params.sri.toFixed(1)}, board-legitimiteitsindex ${params.boardIndex.toFixed(
        1
      )} en risicoversnelling ${params.riskAcceleration.toFixed(
        2
      )} ondersteunen continuering onder regulier toezichtregime.`
    );
  }

  if (params.state === "AT_RISK") {
    return (
      "Geaggregeerde signalen tonen een materiële afwijking van de governancebandbreedte. " +
      `Driftkwadrant ${params.driftQuadrant} en risicoversnelling ${params.riskAcceleration.toFixed(
        2
      )} vereisen bestuurlijke bijsturing binnen het eerstvolgende besluitvenster, inclusief expliciete eigenaar en toetsmoment.`
    );
  }

  return (
    "Geaggregeerde indicatoren overschrijden de escalatiedrempel. " +
    `SRI ${params.sri.toFixed(1)} en board-legitimiteitsindex ${params.boardIndex.toFixed(
      1
    )} in combinatie met risicoversnelling ${params.riskAcceleration.toFixed(
      2
    )} maken formele interventie verplicht. Continuering zonder escalatie vergroot bestuurlijke verantwoordings- en aansprakelijkheidsblootstelling.`
  );
}

export function calculateGovernanceState(
  input: GovernanceControlInput
): GovernanceControlOutput {
  const sri = clamp(Number(input.sri || 0), 0, 100);
  const boardIndex = clamp(Number(input.board_index || 0), 0, 10);
  const riskAcceleration = Number(input.risk_acceleration || 0);
  const governanceDecay = clamp(Number(input.governance_decay || 0), 0, 100);
  const decisionStrength = clamp(Number(input.decision_strength_index || 0), 0, 100);
  const driftQuadrant = String(input.drift_quadrant || "Stable");

  const compositeRisk = clamp(
    normalizedSRIStress(sri) * 0.24 +
      normalizedBoardStress(boardIndex) * 0.2 +
      normalizedRiskAccelerationStress(riskAcceleration) * 0.22 +
      normalizedGovernanceDecayStress(governanceDecay) * 0.14 +
      normalizedDriftStress(driftQuadrant) * 0.1 +
      normalizedDecisionStress(decisionStrength) * 0.1,
    0,
    1
  );

  const severeSignals = severeSignalCount({
    sri,
    boardIndex,
    riskAcceleration,
    governanceDecay,
    decisionStrength,
    driftQuadrant,
  });
  const stressSignals = stressSignalCount({
    sri,
    boardIndex,
    riskAcceleration,
    governanceDecay,
    decisionStrength,
    driftQuadrant,
  });

  const state = determineState({
    compositeRisk,
    severeSignals,
    stressSignals,
  });

  return {
    state,
    sri: round(sri),
    board_index: round(boardIndex),
    risk_acceleration: round(riskAcceleration, 3),
    drift_quadrant: driftQuadrant,
    escalation_flag: state === "ESCALATION_REQUIRED",
    advisory_flag: state === "AT_RISK",
    rationale: buildRationale({
      state,
      sri,
      boardIndex,
      riskAcceleration,
      driftQuadrant,
    }),
    updated_at: input.updated_at || new Date().toISOString(),
  };
}
