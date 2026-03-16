import type { LeverCombinationInsight } from "@/aurelius/strategy/LeverCombinationAnalyzer";
import type { StrategicLeverInsight } from "@/aurelius/strategy/StrategicLeverDetector";
import { mapLeverMechanism } from "./MechanismMapper";
import { predictFinancialEffect, predictOperationalEffect } from "./ImpactPredictor";
import { deriveStrategicRisk } from "./RiskModel";
import { buildStrategyGraph, type StrategyGraph } from "./StrategyGraph";

export type CausalStrategyItem = {
  hefboom: StrategicLeverInsight["lever"];
  mechanisme: string;
  operationeelEffect: string;
  financieelEffect: string;
  strategischRisico: string;
  bestuurlijkeImplicatie: string;
};

export type CausalStrategyResult = {
  items: CausalStrategyItem[];
  graph: StrategyGraph;
  summary: string;
  block: string;
  dominantCombination: LeverCombinationInsight | null;
};

function formatItem(item: CausalStrategyItem): string {
  return [
    `Strategische hefboom: ${item.hefboom}`,
    "",
    "Mechanisme",
    item.mechanisme,
    "",
    "Operationeel effect",
    item.operationeelEffect,
    "",
    "Financieel effect",
    item.financieelEffect,
    "",
    "Strategisch risico",
    item.strategischRisico,
    "",
    "Bestuurlijke implicatie",
    item.bestuurlijkeImplicatie,
  ].join("\n");
}

export function runCausalStrategyEngine(input: {
  levers: StrategicLeverInsight[];
  dominantCombination?: LeverCombinationInsight | null;
}): CausalStrategyResult {
  const items = input.levers.slice(0, 3).map((lever) => {
    const mapped = mapLeverMechanism(lever);
    return {
      hefboom: lever.lever,
      mechanisme: mapped.mechanisme,
      operationeelEffect: mapped.operationeelEffect || predictOperationalEffect(lever),
      financieelEffect: predictFinancialEffect(lever),
      strategischRisico: deriveStrategicRisk(lever),
      bestuurlijkeImplicatie: mapped.bestuurlijkeImplicatie,
    };
  });

  const graph = buildStrategyGraph(
    items.map((item) => ({
      lever: item.hefboom,
      mechanism: item.mechanisme,
      operationalEffect: item.operationeelEffect,
      financialEffect: item.financieelEffect,
      strategicRisk: item.strategischRisico,
    }))
  );

  const block = [
    "### Causale strategieanalyse",
    items.map(formatItem).join("\n\n"),
    ...(input.dominantCombination
      ? [
          "",
          "### Dominante hefboomcombinatie",
          input.dominantCombination.levers.join("\n"),
          "",
          "Strategisch effect",
          input.dominantCombination.strategicEffect,
        ]
      : []),
  ].join("\n");

  return {
    items,
    graph,
    summary: items[0]?.mechanisme || "Causale strategieanalyse niet beschikbaar.",
    block,
    dominantCombination: input.dominantCombination ?? null,
  };
}
