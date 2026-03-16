import type { BoardroomEngineInput } from "./BoardroomIntegrationAdapters";
import {
  StrategicThinkingEngine,
  StrategicPredictionEngine,
  StrategicDecisionSimulator,
} from "./BoardroomIntegrationAdapters";

export type BoardSlide = {
  slide_no: number;
  title: string;
  bullets: string[];
};

export class BoardSlideGenerator {
  readonly name = "Board Slide Generator";

  constructor(
    private readonly thinking = new StrategicThinkingEngine(),
    private readonly prediction = new StrategicPredictionEngine(),
    private readonly simulator = new StrategicDecisionSimulator()
  ) {}

  generate(input: BoardroomEngineInput): BoardSlide[] {
    const model = this.thinking.analyze(input);
    const predicted = this.prediction.predict(input).interventions;
    const simulated = this.simulator.simulate(input);

    return [
      {
        slide_no: 1,
        title: "Context",
        bullets: [
          `Sector: ${input.sector || "Onbekend"}`,
          "Markt- en uitvoeringsdruk vereisen harde prioritering.",
          model.strategic_model,
        ],
      },
      {
        slide_no: 2,
        title: "Kernspanning",
        bullets: [
          input.dominant_problem || "Groeiambitie botst met capaciteit en margedruk.",
          "Bestuurlijke focus versus operationele uitvoerbaarheid.",
          model.rationale,
        ],
      },
      {
        slide_no: 3,
        title: "Strategische opties",
        bullets: [
          "A: Consolideren",
          "B: Verbreden",
          "C: Gefaseerd met stopregels",
        ],
      },
      {
        slide_no: 4,
        title: "Aanbevolen strategie",
        bullets: [
          "Aanbeveling: C (gefaseerd).",
          `Topinterventie: ${predicted[0]?.interventie || "contractdiscipline"}`,
          `Simulatie-analyse: scenario C = ${JSON.stringify(simulated.scenario_C).slice(0, 120)}`,
        ],
      },
      {
        slide_no: 5,
        title: "Interventieplan",
        bullets: predicted.slice(0, 3).map(
          (item, idx) => `${idx + 1}. ${item.interventie} (${item.confidence})`
        ),
      },
      {
        slide_no: 6,
        title: "KPI monitoring",
        bullets: [
          "Cash-runway",
          "Marge",
          "Capaciteit",
          "Besluitritme",
          "Interventie-slaagratio",
        ],
      },
    ];
  }
}

