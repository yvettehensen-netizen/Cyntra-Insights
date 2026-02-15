import type {
  GovernanceResolverInput,
  GovernanceResolutionOutput,
} from "./types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function governanceResolver(
  input: GovernanceResolverInput
): GovernanceResolutionOutput {
  const maturity = clamp(input.governance_maturity);
  const consistency = clamp(input.consistency_score);
  const quadrant = input.drift_quadrant;

  let state: GovernanceResolutionOutput["state"] = "Gefragmenteerd";

  if (
    maturity >= 88 &&
    consistency >= 85 &&
    quadrant === "Stable"
  ) {
    state = "Zelfregulerend";
  } else if (
    maturity >= 72 &&
    consistency >= 70 &&
    quadrant !== "Chaotic"
  ) {
    state = "Geinstitutionaliseerd";
  } else if (
    maturity >= 56 &&
    consistency >= 55 &&
    quadrant !== "Chaotic"
  ) {
    state = "Gecontroleerd";
  } else if (maturity >= 36 || consistency >= 36) {
    state = "Reactief";
  }

  const confidenceBase =
    state === "Zelfregulerend"
      ? 92
      : state === "Geinstitutionaliseerd"
      ? 82
      : state === "Gecontroleerd"
      ? 70
      : state === "Reactief"
      ? 56
      : 42;

  const confidenceAdjustment =
    quadrant === "Chaotic"
      ? -18
      : quadrant === "Fragile"
      ? -10
      : quadrant === "Stagnating"
      ? -8
      : 4;

  return {
    state,
    confidence: Number(
      clamp(confidenceBase + confidenceAdjustment).toFixed(1)
    ),
  };
}
