export type BoardIndexClassification =
  | "Laag"
  | "Kwetsbaar"
  | "Stabiel"
  | "Geïnstitutionaliseerd";

export type BoardLegitimacyInput = {
  sliders: number[];
  interventionState?: {
    gateCompliance?: number; // 0-10 or 0-100
    gateMissedCount?: number;
  };
  executionMetrics?: {
    adoptionWithin72hRate?: number; // 0-10 or 0-100 or 0-1
    escalationResolutionHours?: number;
    escalationResolutionScore?: number; // 0-10 direct
  };
  decisionHistory?: {
    totalDecisions?: number;
    reopenedDecisions?: number;
    decisionStabilityScore?: number; // 0-10 direct
  };
};

export type BoardIndexResult = {
  baliScore: number;
  classification: BoardIndexClassification;
  spread: { min: number; max: number };
  reliabilityBand: { low: number; high: number };
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toFinite(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeScaleTo10(value: number): number {
  if (value <= 1) return clamp(value * 10, 0, 10);
  if (value <= 10) return clamp(value, 0, 10);
  return clamp(value / 10, 0, 10);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = avg(values);
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function classify(score: number): BoardIndexClassification {
  if (score < 4) return "Laag";
  if (score < 6) return "Kwetsbaar";
  if (score < 8) return "Stabiel";
  return "Geïnstitutionaliseerd";
}

export function computeBoardIndex({
  sliders,
  interventionState,
  executionMetrics,
  decisionHistory,
}: BoardLegitimacyInput): BoardIndexResult {
  const sliderValues = (sliders || [])
    .map((value) => normalizeScaleTo10(toFinite(value)))
    .filter((value) => Number.isFinite(value));

  const sliderAvg = avg(sliderValues.length ? sliderValues : [0]);

  const rawGateCompliance = toFinite(interventionState?.gateCompliance, 0);
  const gateCompliance = normalizeScaleTo10(rawGateCompliance);
  const gateMissedPenalty = clamp(
    toFinite(interventionState?.gateMissedCount, 0) * 0.3,
    0,
    3
  );
  const gateComplianceAdjusted = clamp(gateCompliance - gateMissedPenalty, 0, 10);

  const adoptionRaw = toFinite(executionMetrics?.adoptionWithin72hRate, 0);
  const executionAdoption = normalizeScaleTo10(adoptionRaw);

  const escalationResolutionScore =
    Number.isFinite(toFinite(executionMetrics?.escalationResolutionScore, NaN))
      ? normalizeScaleTo10(toFinite(executionMetrics?.escalationResolutionScore, 0))
      : clamp(
          10 - toFinite(executionMetrics?.escalationResolutionHours, 72) / 24,
          0,
          10
        );

  const explicitDecisionStability = toFinite(
    decisionHistory?.decisionStabilityScore,
    NaN
  );
  const decisionStabilityScore = Number.isFinite(explicitDecisionStability)
    ? normalizeScaleTo10(explicitDecisionStability)
    : (() => {
        const total = Math.max(1, toFinite(decisionHistory?.totalDecisions, 0));
        const reopened = clamp(toFinite(decisionHistory?.reopenedDecisions, 0), 0, total);
        const reopenRatio = reopened / total;
        return clamp((1 - reopenRatio) * 10, 0, 10);
      })();

  const baliRaw =
    sliderAvg * 0.4 +
    gateComplianceAdjusted * 0.2 +
    executionAdoption * 0.2 +
    escalationResolutionScore * 0.1 +
    decisionStabilityScore * 0.1;

  const baliScore = Number(clamp(baliRaw, 0, 10).toFixed(2));

  const components = [
    sliderAvg,
    gateComplianceAdjusted,
    executionAdoption,
    escalationResolutionScore,
    decisionStabilityScore,
  ];
  const min = Number(clamp(Math.min(...components), 0, 10).toFixed(2));
  const max = Number(clamp(Math.max(...components), 0, 10).toFixed(2));
  const margin = clamp(1.96 * (std(components) / Math.sqrt(components.length)), 0, 2);

  return {
    baliScore,
    classification: classify(baliScore),
    spread: { min, max },
    reliabilityBand: {
      low: Number(clamp(baliScore - margin, 0, 10).toFixed(2)),
      high: Number(clamp(baliScore + margin, 0, 10).toFixed(2)),
    },
  };
}

