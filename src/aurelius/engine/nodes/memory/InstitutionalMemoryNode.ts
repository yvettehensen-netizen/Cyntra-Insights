// @ts-ignore
import seedPatterns from "../../../../../data/strategy_patterns.json";
import type { DetectedStrategyPattern } from "../strategy/TensionEngineNode";

export type InstitutionalMemoryNodeInput = {
  organizationName?: string;
  sector?: string;
  coreProblem: string;
  strategicTension: string;
  recommendedDecision: string;
  detectedPatterns?: DetectedStrategyPattern[];
};

export type InstitutionalMemoryReference = {
  id: string;
  sector: string;
  pattern: string;
  organizations: number;
  score?: number;
  decisionFit?: boolean;
};

export type InstitutionalMemoryNodeOutput = {
  summary: string;
  references: InstitutionalMemoryReference[];
  memoryFile: string;
  block: string;
};

type SeedPattern = {
  id: string;
  sector: string;
  pattern: string;
  dominant_problem: string;
  strategic_tension: string;
  recommended_decision: string;
  evidence_markers: string[];
  organizations: number;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function overlapScore(left: string, right: string): number {
  const a = new Set(normalize(left).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((token) => token.length >= 4));
  const b = new Set(normalize(right).toLowerCase().split(/[^a-z0-9à-ÿ]+/i).filter((token) => token.length >= 4));
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / Math.max(a.size, b.size);
}

function scorePatternForDecision(pattern: SeedPattern, input: InstitutionalMemoryNodeInput, source: string) {
  const sectorMatch = normalize(pattern.sector).toLowerCase() === normalize(input.sector).toLowerCase() ? 6 : 0;
  const patternMatch = source.includes(normalize(pattern.pattern).toLowerCase()) ? 3 : 0;
  const problemScore = overlapScore(input.coreProblem, pattern.dominant_problem) * 3;
  const tensionScore = overlapScore(input.strategicTension, pattern.strategic_tension) * 4;
  const decisionScore = overlapScore(input.recommendedDecision, pattern.recommended_decision) * 5;
  const evidenceWeight = Math.min(2.5, pattern.organizations * 0.3);
  const score = Number((sectorMatch + patternMatch + problemScore + tensionScore + decisionScore + evidenceWeight).toFixed(2));
  return { score, decisionFit: decisionScore >= 1.5 };
}

export function runInstitutionalMemoryNode(input: InstitutionalMemoryNodeInput): InstitutionalMemoryNodeOutput {
  const source = [
    normalize(input.organizationName),
    normalize(input.sector),
    normalize(input.coreProblem),
    normalize(input.strategicTension),
    normalize(input.recommendedDecision),
    ...(input.detectedPatterns ?? []).map((item) => normalize(item.pattern)),
  ].join(" ").toLowerCase();

  const ranked = (seedPatterns as SeedPattern[])
    .map((item) => ({ item, ...scorePatternForDecision(item, input, source) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const references = ranked.map(({ item, score, decisionFit }) => ({
    id: item.id,
    sector: item.sector,
    pattern: item.pattern,
    organizations: item.organizations,
    score,
    decisionFit,
  }));

  return {
    summary: references.length
      ? `Deze spanning sluit aan op ${references.reduce((sum, item) => sum + item.organizations, 0)} eerdere patronen. Dominant geheugenpatroon: ${references[0].pattern}.`
      : "Nog geen sterk institutioneel patroon gevonden.",
    references,
    memoryFile: "/data/strategy_patterns.json",
    block: "",
  };
}
