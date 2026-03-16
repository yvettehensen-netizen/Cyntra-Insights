import {
  STRATEGIC_LEVER_MATRIX,
  type StrategicLever,
  type StrategicLeverDefinition,
} from "./StrategicLeverMatrix";
import { analyzeLeverCombination, type LeverCombinationInsight } from "./LeverCombinationAnalyzer";

export type StrategicLeverInsight = {
  lever: StrategicLever;
  mechanism: string;
  risk: string;
  boardImplication: string;
  score: number;
  category: StrategicLeverDefinition["category"];
  mechanismCluster: StrategicLeverDefinition["mechanismCluster"];
};

export type StrategicLeverDetectionResult = {
  levers: StrategicLeverInsight[];
  dominantCombination: LeverCombinationInsight | null;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function scoreDefinition(definition: StrategicLeverDefinition, source: string): number {
  return definition.patterns.reduce((sum, pattern) => sum + (pattern.test(source) ? 1 : 0), 0);
}

function buildFallbackLevers(source: string): StrategicLever[] {
  const normalized = source.toLowerCase();
  const fallbacks: StrategicLever[] = [];

  if (/partner|netwerk|alliantie|licentie/.test(normalized)) fallbacks.push("netwerkstrategieën");
  if (/triage|capaciteit|wachtdruk|doorstroom/.test(normalized)) fallbacks.push("capaciteitsbenutting");
  if (/governance|mandaat|bestuur|besluit/.test(normalized)) fallbacks.push("governance");
  if (/marge|kosten|tarief|contract/.test(normalized)) fallbacks.push("prijsstrategie", "kostenstructuur");
  if (/data|kpi|dashboard|ritme/.test(normalized)) fallbacks.push("data-infrastructuur", "besluitritme");
  if (/cultuur|eigenaarschap|retentie/.test(normalized)) fallbacks.push("cultuur");
  if (/positie|propositie|segment|markt/.test(normalized)) fallbacks.push("positionering", "nieuwe segmenten");

  return Array.from(new Set<StrategicLever>([...fallbacks, "governance", "capaciteitsbenutting", "besluitritme"])).slice(
    0,
    3
  );
}

function toInsight(definition: StrategicLeverDefinition, score: number): StrategicLeverInsight {
  return {
    lever: definition.lever,
    mechanism: definition.mechanism,
    risk: definition.risk,
    boardImplication: definition.boardImplication,
    score,
    category: definition.category,
    mechanismCluster: definition.mechanismCluster,
  };
}

export function detectStrategicLevers(input: {
  organizationName?: string;
  sourceText: string;
  killerInsights?: string[];
}): StrategicLeverInsight[] {
  return detectStrategicLeverMatrix(input).levers;
}

export function detectStrategicLeverMatrix(input: {
  organizationName?: string;
  sourceText: string;
  killerInsights?: string[];
}): StrategicLeverDetectionResult {
  const source = [normalize(input.organizationName), normalize(input.sourceText), ...(input.killerInsights || []).map(normalize)]
    .filter(Boolean)
    .join("\n");

  const ranked = STRATEGIC_LEVER_MATRIX.map((definition) =>
    toInsight(definition, scoreDefinition(definition, source))
  )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const selected = [...ranked];
  if (selected.length < 3) {
    const fallbackLevers = buildFallbackLevers(source);
    for (const lever of fallbackLevers) {
      if (selected.some((item) => item.lever === lever)) continue;
      const definition = STRATEGIC_LEVER_MATRIX.find((item) => item.lever === lever);
      if (!definition) continue;
      selected.push(toInsight(definition, 1));
      if (selected.length >= 3) break;
    }
  }

  const levers = selected.slice(0, Math.max(3, Math.min(5, selected.length)));
  return {
    levers,
    dominantCombination: analyzeLeverCombination(levers, source),
  };
}
