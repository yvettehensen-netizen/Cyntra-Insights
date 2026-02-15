import type { DriftAnalysisInput, DriftAnalysisOutput } from "./types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeRegressies(value: number): number {
  return clamp01(value / 12);
}

export function driftAnalysis(input: DriftAnalysisInput): DriftAnalysisOutput {
  const writeCoverageRisk = 1 - clamp01(input.write_coverage);
  const regressieDruk = normalizeRegressies(input.single_call_regressies);
  const ratio422 = clamp01(input.ratio_422);
  const governanceRisk = 1 - clamp01(input.governance_maturity);

  const execution_drift = clamp01(
    writeCoverageRisk * 0.45 + regressieDruk * 0.35 + ratio422 * 0.2
  );

  const structural_drift = clamp01(
    governanceRisk * 0.55 + ratio422 * 0.25 + regressieDruk * 0.2
  );

  let quadrant: DriftAnalysisOutput["quadrant"] = "Stable";

  if (execution_drift >= 0.55 && structural_drift >= 0.55) {
    quadrant = "Chaotic";
  } else if (execution_drift >= 0.55 && structural_drift < 0.55) {
    quadrant = "Fragile";
  } else if (execution_drift < 0.55 && structural_drift >= 0.55) {
    quadrant = "Stagnating";
  }

  return {
    structural_drift: Number(structural_drift.toFixed(3)),
    execution_drift: Number(execution_drift.toFixed(3)),
    quadrant,
  };
}
