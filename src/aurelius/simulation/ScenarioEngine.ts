import { predictScenario } from "./OutcomePredictor";
import { scoreScenarioRisk } from "./ScenarioRiskModel";
import type {
  ScenarioEngineInput,
  ScenarioResult,
  ScenarioSimulationBlock,
  StrategyScenario,
} from "./ScenarioModel";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toScenarioResult(item: StrategyScenario): ScenarioResult {
  return {
    scenario: item.scenario,
    title: item.name,
    mechanism: item.mechanism,
    operationalEffect: item.operational_effect,
    financialEffect: item.financial_effect,
    boardRisk: `${item.strategic_risk} (${item.risk_level})`,
    implication: item.board_implication,
    riskLevel: item.risk_level,
  };
}

export function generateStrategicScenarios(input: ScenarioEngineInput): StrategyScenario[] {
  if (input.strategic_scenarios?.length) return input.strategic_scenarios.slice(0, 3);

  const scenarios = (["A", "B", "C"] as const).map((code) => {
    const scenario = predictScenario(code, input);
    return {
      ...scenario,
      risk_level: scoreScenarioRisk(scenario, input),
    };
  });

  return scenarios;
}

export function evaluateScenarios(input?: ScenarioEngineInput): ScenarioResult[] {
  return generateStrategicScenarios(input || {}).map(toScenarioResult);
}

function formatScenarioBody(item: ScenarioResult): string {
  return [
    item.title,
    "",
    "Mechanisme",
    item.mechanism,
    "",
    "Operationeel effect",
    item.operationalEffect,
    "",
    "Financieel effect",
    item.financialEffect,
    "",
    "Strategisch risico",
    item.boardRisk,
    "",
    "Bestuurlijke implicatie",
    item.implication,
  ].join("\n");
}

export function buildScenarioSimulationBlock(
  input?: ScenarioEngineInput
): ScenarioSimulationBlock | null {
  const scenarios = evaluateScenarios(input).slice(0, 3);
  if (!scenarios.length) return null;

  return {
    title: "Strategische scenario simulatie",
    body: scenarios.map(formatScenarioBody).join("\n\n"),
  };
}

export function buildScenarioMemoBlock(input?: ScenarioEngineInput): string {
  const scenarios = evaluateScenarios(input).slice(0, 3);
  if (!scenarios.length) return "";

  return [
    "STRATEGISCHE SCENARIO'S",
    ...scenarios.map((item) =>
      [
        item.title,
        item.scenario === "A"
          ? `Belangrijkste risico: ${normalize(item.boardRisk)}`
          : item.scenario === "B"
            ? `Belangrijkste effect: ${normalize(item.operationalEffect)}`
            : `Status quo risico: ${normalize(item.boardRisk)}`,
      ].join("\n")
    ),
  ].join("\n\n");
}
