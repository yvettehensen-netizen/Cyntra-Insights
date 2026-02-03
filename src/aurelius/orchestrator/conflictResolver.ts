import type { ScoredInsight } from "./scoring";

export type ConflictResolution =
  | { type: "consensus"; insight: ScoredInsight }
  | { type: "majority"; insight: ScoredInsight }
  | { type: "escalation"; insights: readonly ScoredInsight[] };

export function resolveConflicts(
  insights: readonly ScoredInsight[]
): ConflictResolution {
  if (insights.length === 0) {
    throw new Error("No insights to resolve");
  }

  const sorted = [...insights].sort(
    (a, b) => b.weightedScore - a.weightedScore
  );

  const top = sorted[0];
  if (!top) {
    throw new Error("Top insight missing after sort");
  }

  if (top.weightedScore >= 0.75) {
    return { type: "consensus", insight: top };
  }

  if (top.weightedScore >= 0.6) {
    return { type: "majority", insight: top };
  }

  return {
    type: "escalation",
    insights: sorted.slice(0, 3),
  };
}
