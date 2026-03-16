import type { CausalStrategyResult } from "@/aurelius/causal/CausalStrategyEngine";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import { DNA_ARCHETYPE_MATRIX, type StrategyDNAArchetype } from "./DNAArchetypeMatrix";
import { buildDNAImpactProfile, type StrategyDNAProfile } from "./DNAImpactModel";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function scoreArchetype(
  archetype: StrategyDNAArchetype,
  source: string,
  levers: StrategicLeverInsight[]
): number {
  const definition = DNA_ARCHETYPE_MATRIX.find((item) => item.archetype === archetype);
  if (!definition) return 0;

  const patternScore = definition.patterns.reduce((total, pattern) => total + (pattern.test(source) ? 2 : 0), 0);
  const leverScore = levers.reduce(
    (total, lever) => total + (definition.preferredLevers.includes(lever.lever) ? Math.max(1, lever.score) : 0),
    0
  );

  return patternScore + leverScore;
}

function fallbackArchetype(levers: StrategicLeverInsight[]): StrategyDNAArchetype {
  const joined = levers.map((item) => item.lever).join(" ");
  if (/(netwerkstrategieën|ecosystemen)/.test(joined)) return "network orchestrator";
  if (/(volumegroei|productiviteit|capaciteitsbenutting|procesoptimalisatie)/.test(joined)) return "scale operator";
  if (/(kapitaalallocatie|investeringsdiscipline|margeverbetering)/.test(joined)) return "capital allocator";
  if (/(cultuur|talentstrategie|leiderschap)/.test(joined)) return "professional partnership";
  return "hybrid organization";
}

export function classifyStrategyDNA(input: {
  organizationDescription?: string;
  strategy?: string;
  levers?: StrategicLeverInsight[];
  causalAnalysis?: CausalStrategyResult | null;
}): StrategyDNAProfile {
  const levers = input.levers || [];
  const source = [
    normalize(input.organizationDescription),
    normalize(input.strategy),
    ...levers.map((item) => item.lever),
    ...(input.causalAnalysis?.items || []).map((item) => item.mechanisme),
  ]
    .filter(Boolean)
    .join("\n");

  const ranked = DNA_ARCHETYPE_MATRIX.map((definition) => ({
    archetype: definition.archetype,
    score: scoreArchetype(definition.archetype, source, levers),
  })).sort((a, b) => b.score - a.score);

  const archetype = ranked[0]?.score ? ranked[0].archetype : fallbackArchetype(levers);

  return buildDNAImpactProfile({
    archetype,
    levers,
    causalAnalysis: input.causalAnalysis,
  });
}
