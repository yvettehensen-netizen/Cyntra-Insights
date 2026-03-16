import { StrategicSimulationEngine } from "@/aurelius/simulation/StrategicSimulationEngine";
import type {
  StrategicSimulationEngineInput,
  StrategicSimulationResult,
} from "@/aurelius/simulation/StrategicSimulationEngine";
import { StrategicLearningLoop } from "./StrategicLearningLoop";

export type FlywheelEnhancedSimulationResult = StrategicSimulationResult & {
  simulation: StrategicSimulationResult["simulation"] & {
    scenario_A: StrategicSimulationResult["simulation"]["scenario_A"] & {
      historical_success_probability: number;
    };
    scenario_B: StrategicSimulationResult["simulation"]["scenario_B"] & {
      historical_success_probability: number;
    };
    scenario_C: StrategicSimulationResult["simulation"]["scenario_C"] & {
      historical_success_probability: number;
    };
  };
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function probabilityByScenario(base: number, scenarioCode: "A" | "B" | "C"): number {
  if (scenarioCode === "A") return clamp01(base * 0.9);
  if (scenarioCode === "B") return clamp01(base * 1.05);
  return clamp01(base);
}

export class FlywheelEnhancedSimulationEngine {
  readonly name = "Flywheel Enhanced Strategic Simulation Engine";

  constructor(
    private readonly simulationEngine = new StrategicSimulationEngine(),
    private readonly learningLoop = new StrategicLearningLoop()
  ) {}

  run(
    input: StrategicSimulationEngineInput & {
      sector: string;
      interventie_type_hint?: string;
    }
  ): FlywheelEnhancedSimulationResult {
    const base = this.simulationEngine.run(input);
    const historicalBase = this.learningLoop.historicalSuccessProbability({
      sector: input.sector,
      interventie_type: input.interventie_type_hint,
    });

    return {
      ...base,
      simulation: {
        scenario_A: {
          ...base.simulation.scenario_A,
          historical_success_probability: probabilityByScenario(historicalBase, "A"),
        },
        scenario_B: {
          ...base.simulation.scenario_B,
          historical_success_probability: probabilityByScenario(historicalBase, "B"),
        },
        scenario_C: {
          ...base.simulation.scenario_C,
          historical_success_probability: probabilityByScenario(historicalBase, "C"),
        },
      },
    };
  }
}

export function buildPatternLearningPayload(loop: StrategicLearningLoop, sector: string): {
  sector: string;
  historical_success_probability: number;
} {
  return {
    sector,
    historical_success_probability: loop.historicalSuccessProbability({ sector }),
  };
}

export function buildLeverageLearningHints(loop: StrategicLearningLoop, sector: string): string[] {
  const probability = loop.historicalSuccessProbability({ sector });
  if (probability >= 0.7) {
    return [
      "Verhoog allocatie naar interventies met bewezen historisch succes in vergelijkbare cases.",
      "Versnel implementatie van contract- en marge-interventies met hoge slaagkans.",
    ];
  }
  if (probability >= 0.4) {
    return [
      "Gebruik gefaseerde implementatie met extra validatiegates; historische slaagkans is gemengd.",
      "Versterk meetdiscipline op operationele outcome-signalen voor snellere bijsturing.",
    ];
  }
  return [
    "Beperk risicovolle parallelle interventies; historische slaagkans is laag.",
    "Kies eerst voor kernstabilisatie met korte feedbackcycli en harde stopregels.",
  ];
}

