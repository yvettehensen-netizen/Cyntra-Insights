import type { StrategicPatternMemoryRecord } from "./StrategicMemoryStore";

export type IndexedStrategicPattern = {
  memoryId: string;
  sector: string;
  organizationType: string;
  dominantProblem: string;
  recommendedStrategy: string;
  signature: string;
};

export type SimilarPatternMatch = {
  pattern: StrategicPatternMemoryRecord;
  score: number;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .toLowerCase()
    .split(/[^a-z0-9à-ÿ]+/i)
    .filter((token) => token.length >= 3);
}

function overlapScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  for (const token of setA) {
    if (setB.has(token)) overlap += 1;
  }
  return overlap / Math.max(setA.size, setB.size);
}

export class StrategyPatternIndex {
  buildSignature(pattern: StrategicPatternMemoryRecord): string {
    return [
      pattern.sector,
      pattern.organizationType,
      pattern.dominantProblem,
      pattern.dominantParadox ?? "",
      pattern.recommendedStrategy,
      (pattern.keyRisks ?? []).join(" "),
      pattern.leveragePoints.join(" "),
      pattern.blindSpots.join(" "),
      pattern.interventions.join(" "),
    ]
      .filter(Boolean)
      .join(" ");
  }

  indexPattern(pattern: StrategicPatternMemoryRecord): IndexedStrategicPattern {
    return {
      memoryId: pattern.memoryId,
      sector: normalize(pattern.sector),
      organizationType: normalize(pattern.organizationType),
      dominantProblem: normalize(pattern.dominantProblem),
      recommendedStrategy: normalize(pattern.recommendedStrategy),
      signature: this.buildSignature(pattern),
    };
  }

  findSimilarPatterns(
    query: StrategicPatternMemoryRecord,
    patterns: StrategicPatternMemoryRecord[],
    topK = 5
  ): SimilarPatternMatch[] {
    const queryTokens = tokenize(this.buildSignature(query));
    return patterns
      .filter((pattern) => pattern.memoryId !== query.memoryId)
      .map((pattern) => ({
        pattern,
        score: overlapScore(queryTokens, tokenize(this.buildSignature(pattern))),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, topK));
  }
}
