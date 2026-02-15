import type {
  DecisionStrengthIndexFactors,
  PerformanceEvolution,
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function clamp01(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

export function calculateDSIScore(
  factors: DecisionStrengthIndexFactors
): number {
  const normalized = [
    clamp01(factors.clarity_score),
    clamp01(factors.decision_certainty),
    clamp01(factors.execution_probability),
    clamp01(factors.pattern_learning_coherence),
    clamp01(factors.drift_stability_inverse),
    clamp01(factors.risk_projection_confidence),
  ];

  const avg = normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
  return round(clamp(avg * 10, 0, 10), 2);
}

export function calculateDSIImprovement(input: {
  baseline_dsi: number;
  current_dsi: number;
  baseline_timestamp: string;
  timestamp?: string;
}): PerformanceEvolution {
  const baseline = clamp(Number(input.baseline_dsi || 0), 0, 10);
  const current = clamp(Number(input.current_dsi || 0), 0, 10);
  const now = new Date(input.timestamp || new Date().toISOString());
  const baselineDate = new Date(input.baseline_timestamp || now.toISOString());

  const elapsedMs = Math.max(0, now.getTime() - baselineDate.getTime());
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / 86_400_000));

  const improvementPct =
    baseline <= 0
      ? 0
      : ((current - baseline) / baseline) * 100;

  const velocityPer30Days =
    elapsedDays <= 0
      ? 0
      : (improvementPct / elapsedDays) * 30;

  return {
    baseline_dsi: round(baseline),
    current_dsi: round(current),
    improvement_pct: round(improvementPct),
    improvement_velocity: round(velocityPer30Days),
    stagnation_flag: elapsedDays >= 30 && Math.abs(improvementPct) < 1.0,
    regression_flag: elapsedDays >= 7 && improvementPct < -1.0,
    days_since_baseline: elapsedDays,
  };
}
