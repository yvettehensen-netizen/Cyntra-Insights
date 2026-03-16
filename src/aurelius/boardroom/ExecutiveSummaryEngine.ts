import type { BoardroomEngineInput } from "./BoardroomIntegrationAdapters";
import {
  StrategicThinkingEngine,
  StrategicPredictionEngine,
  StrategicDecisionSimulator,
} from "./BoardroomIntegrationAdapters";

export type ExecutiveSummary = {
  besluitvraag: string;
  kernanalyse: string;
  aanbevolen_strategie: string;
  belangrijkste_risico: string;
  interventieplan: string;
};

export class ExecutiveSummaryEngine {
  readonly name = "Executive Summary Engine";

  constructor(
    private readonly thinking = new StrategicThinkingEngine(),
    private readonly prediction = new StrategicPredictionEngine(),
    private readonly simulator = new StrategicDecisionSimulator()
  ) {}

  generate(input: BoardroomEngineInput): ExecutiveSummary {
    const thinking = this.thinking.analyze(input);
    const prediction = this.prediction.predict(input);
    const simulation = this.simulator.simulate(input);
    const topIntervention = prediction.interventions[0];

    return {
      besluitvraag: "Welke strategische keuze stabiliseert risico en verhoogt uitvoerbaarheid binnen 90 dagen?",
      kernanalyse: `${thinking.strategic_model}: ${thinking.rationale}`,
      aanbevolen_strategie: "Gefaseerde strategie: eerst kernstabilisatie, daarna gecontroleerde verbreding.",
      belangrijkste_risico: "Onvoldoende contract- en capaciteitsdiscipline versnelt margedruk en uitvoeringsfrictie.",
      interventieplan: topIntervention
        ? `${topIntervention.interventie} met KPI-focus op ${topIntervention.kpi_effect}. Simulatie referentie: scenario C = ${JSON.stringify(simulation.scenario_C).slice(0, 120)}`
        : "Start met margetransparantie, contractdiscipline en wekelijks escalatieritme.",
    };
  }
}

