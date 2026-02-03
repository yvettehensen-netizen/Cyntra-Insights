// ============================================================
// AURELIUS — SCORING ENGINE
// ============================================================

export interface ScoredInsight {
  consultantKey: string;
  insight: string;
  weightedScore: number;
}

export function scoreInsights(
  consultantKey: string,
  insights: string[],
  confidence = 0.7
): ScoredInsight[] {
  return insights.map((insight) => ({
    consultantKey,
    insight,
    weightedScore: Math.min(1, Math.max(0, confidence)),
  }));
}
