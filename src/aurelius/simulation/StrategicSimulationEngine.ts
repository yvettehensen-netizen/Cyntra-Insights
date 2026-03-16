import {
  buildStrategicScenarioModel,
  type StrategicDecisionOptionInput,
} from "./StrategicScenarioModel";
import {
  calculateStrategicImpact,
  type StrategicSimulationInputEnvelope,
  type StrategicSimulationScenarioResult,
} from "./StrategicImpactCalculator";

export type StrategicSimulationResult = {
  simulation: {
    scenario_A: StrategicSimulationScenarioResult & {
      scenario_model: string;
      historical_signal: string;
    };
    scenario_B: StrategicSimulationScenarioResult & {
      scenario_model: string;
      historical_signal: string;
    };
    scenario_C: StrategicSimulationScenarioResult & {
      scenario_model: string;
      historical_signal: string;
    };
  };
};

export type StrategicSimulationEngineInput = StrategicSimulationInputEnvelope & {
  decision_options: StrategicDecisionOptionInput[];
  historical_cases_count?: number;
};

function historicalSignal(code: "A" | "B" | "C", count: number): string {
  if (count <= 0) {
    return "Geen vergelijkbare cases gevonden; first-principles simulatie toegepast.";
  }
  const scenarioName = code === "A" ? "status_quo/parallel" : code === "B" ? "kernconsolidatie" : "gefaseerde strategie";
  return `Vergelijkbare strategie (${scenarioName}) toegepast bij ${count} organisaties in memory.`;
}

export class StrategicSimulationEngine {
  readonly name = "Strategic Simulation Engine";

  run(input: StrategicSimulationEngineInput): StrategicSimulationResult {
    const scenarios = buildStrategicScenarioModel({
      strategic_options: input.decision_options,
    });

    const historicalCount = Math.max(0, Number(input.historical_cases_count ?? 0));

    const scenarioA = scenarios.find((item) => item.key === "scenario_A")!;
    const scenarioB = scenarios.find((item) => item.key === "scenario_B")!;
    const scenarioC = scenarios.find((item) => item.key === "scenario_C")!;

    return {
      simulation: {
        scenario_A: {
          ...calculateStrategicImpact(scenarioA, input),
          scenario_model: scenarioA.model,
          historical_signal: historicalSignal("A", historicalCount),
        },
        scenario_B: {
          ...calculateStrategicImpact(scenarioB, input),
          scenario_model: scenarioB.model,
          historical_signal: historicalSignal("B", historicalCount),
        },
        scenario_C: {
          ...calculateStrategicImpact(scenarioC, input),
          scenario_model: scenarioC.model,
          historical_signal: historicalSignal("C", historicalCount),
        },
      },
    };
  }
}
