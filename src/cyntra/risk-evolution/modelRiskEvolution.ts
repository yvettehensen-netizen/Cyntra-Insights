import type {
  RiskEvolutionModelInput,
  RiskEvolutionModelOutput,
} from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function severityWeight(state: string): number {
  const normalized = String(state || "low").toLowerCase();
  if (normalized === "critical" || normalized === "freeze") return 1;
  if (normalized === "high") return 0.72;
  if (normalized === "medium") return 0.45;
  return 0.2;
}

function project(base: number, growthPer30d: number, months: number): number {
  const curvature = 1 + months * 0.06;
  return clamp(base + growthPer30d * months * curvature);
}

export function modelRiskEvolution(
  input: RiskEvolutionModelInput
): RiskEvolutionModelOutput {
  const current = clamp(Number(input.current_risk_score || 0));

  const driftIntensification = clamp(
    ((Number(input.drift_execution || 0) + Number(input.drift_structural || 0)) / 2) * 100
  );

  const governanceDecay = clamp(
    severityWeight(input.governance_state) * 45 +
      Number(input.governance_freeze_flags || 0) * 12 +
      Number(input.governance_escalations || 0) * 2.5
  );

  const riskAcceleration = Number(
    (
      Number(input.risk_velocity || 0) +
      Number(input.risk_trend_7d || 0) * 0.65 +
      driftIntensification * 0.018 +
      governanceDecay * 0.012
    ).toFixed(3)
  );

  const growthPer30d =
    riskAcceleration * 5.8 +
    driftIntensification * 0.06 +
    governanceDecay * 0.04;

  const projection30 = project(current, growthPer30d, 1);
  const projection60 = project(current, growthPer30d, 2);
  const projection90 = project(current, growthPer30d, 3);

  const uncertainty = clamp(
    Math.abs(riskAcceleration) * 2.1 +
      driftIntensification * 0.05 +
      governanceDecay * 0.035,
    4,
    22
  );

  const threshold = Number.isFinite(input.drift_alarm_threshold)
    ? Number(input.drift_alarm_threshold)
    : 2.8;

  const driftAlarm = riskAcceleration > threshold;

  return {
    risk_acceleration: riskAcceleration,
    governance_decay: Number(governanceDecay.toFixed(2)),
    drift_intensification: Number(driftIntensification.toFixed(2)),
    projection_30d: Number(projection30.toFixed(2)),
    projection_60d: Number(projection60.toFixed(2)),
    projection_90d: Number(projection90.toFixed(2)),
    confidence_band: [
      Number(clamp(projection90 - uncertainty).toFixed(2)),
      Number(clamp(projection90 + uncertainty).toFixed(2)),
    ],
    drift_alarm: driftAlarm,
  };
}
