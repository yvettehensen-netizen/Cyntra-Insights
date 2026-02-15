import type { PerformanceCaseStudy } from "./types";

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generatePerformanceCase(input: {
  organisation_id: string;
  baseline_dsi: number;
  current_dsi: number;
  baseline_execution_score: number;
  current_execution_score: number;
  time_window_days: number;
}): PerformanceCaseStudy {
  const baselineDsi = clamp(input.baseline_dsi, 0, 10);
  const currentDsi = clamp(input.current_dsi, 0, 10);
  const baselineExecution = clamp(input.baseline_execution_score, 0, 100);
  const currentExecution = clamp(input.current_execution_score, 0, 100);

  const improvementPct =
    baselineDsi <= 0 ? 0 : ((currentDsi - baselineDsi) / baselineDsi) * 100;
  const executionChange = currentExecution - baselineExecution;

  return {
    organisation_id: input.organisation_id,
    baseline_dsi: round(baselineDsi),
    current_dsi: round(currentDsi),
    improvement_pct: round(improvementPct),
    execution_stability_change: round(executionChange),
    time_window_days: Math.max(0, Math.round(input.time_window_days)),
  };
}
