import type { CausalStrategyResult } from "@/aurelius/causal/CausalStrategyEngine";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import { DNA_ARCHETYPE_MATRIX, type DNAArchetypeDefinition, type StrategyDNAArchetype } from "./DNAArchetypeMatrix";

export type StrategyDNAProfile = {
  archetype: StrategyDNAArchetype;
  coreMechanism: string;
  growthModel: string;
  strategicRisk: string;
  strategyPreference: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function topLever(
  levers: StrategicLeverInsight[],
  definition: DNAArchetypeDefinition
): StrategicLeverInsight | undefined {
  return levers.find((item) => definition.preferredLevers.includes(item.lever));
}

export function buildDNAImpactProfile(input: {
  archetype: StrategyDNAArchetype;
  levers?: StrategicLeverInsight[];
  causalAnalysis?: CausalStrategyResult | null;
}): StrategyDNAProfile {
  const definition =
    DNA_ARCHETYPE_MATRIX.find((item) => item.archetype === input.archetype) || DNA_ARCHETYPE_MATRIX[DNA_ARCHETYPE_MATRIX.length - 1];
  const matchingLever = topLever(input.levers || [], definition);
  const causalItem =
    (input.causalAnalysis?.items || []).find((item) => definition.preferredLevers.includes(item.hefboom)) ||
    input.causalAnalysis?.items?.[0];

  return {
    archetype: definition.archetype,
    coreMechanism:
      normalize(causalItem?.mechanisme) ||
      (matchingLever
        ? `${definition.coreMechanism} Dominante hefboom: ${matchingLever.lever}.`
        : definition.coreMechanism),
    growthModel:
      normalize(causalItem?.operationeelEffect) ||
      (matchingLever ? `${definition.growthModel} Prioritaire hefboom: ${matchingLever.lever}.` : definition.growthModel),
    strategicRisk:
      normalize(causalItem?.strategischRisico) ||
      (matchingLever ? `${definition.strategicRisk} Kritieke hefboom: ${matchingLever.lever}.` : definition.strategicRisk),
    strategyPreference:
      matchingLever
        ? `${definition.strategyPreference} Primaire stuurhefboom: ${matchingLever.lever}.`
        : definition.strategyPreference,
  };
}
