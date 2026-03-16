// ============================================================
// AURELIUS — DECISION READINESS SCORE
// ROUTE: src/aurelius/decision/scoreDecisionReadiness.ts
//
// DOEL:
// - Objectieve board-readiness score (0–100)
// - Gewicht op besluit, eigenaarschap, executie
// ============================================================

export interface DecisionReadinessScore {
  score: number;
  breakdown: {
    decision: number;
    ownership: number;
    irreversibility: number;
    execution: number;
  };
}

export function scoreDecisionReadiness(
  text: string
): DecisionReadinessScore {
  const lc = text.toLowerCase();

  const decision =
    lc.includes("besluit") || lc.includes("is besloten") ? 25 : 0;

  const ownership =
    lc.includes("eindverantwoordelijk") ||
    lc.includes("mandaat ligt bij")
      ? 25
      : 0;

  const irreversibility =
    lc.includes("onomkeerbaar") ||
    lc.includes("per direct") ||
    lc.includes("wordt beëindigd")
      ? 25
      : 0;

  const execution =
    lc.includes("90-dagen") ||
    lc.includes("week") ||
    lc.includes("deadline")
      ? 25
      : 0;

  const score = decision + ownership + irreversibility + execution;

  return {
    score,
    breakdown: {
      decision,
      ownership,
      irreversibility,
      execution,
    },
  };
}
