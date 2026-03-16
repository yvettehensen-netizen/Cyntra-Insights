import type { BoardroomEngineInput } from "./BoardroomIntegrationAdapters";
import { StrategicPredictionEngine, StrategicDecisionSimulator } from "./BoardroomIntegrationAdapters";

export type DecisionBrief = {
  besluitvraag: string;
  opties: string[];
  aanbevolen_keuze: string;
  besluitregels: string[];
  document_text: string;
};

export class DecisionBriefGenerator {
  readonly name = "Decision Brief Generator";

  constructor(
    private readonly prediction = new StrategicPredictionEngine(),
    private readonly simulator = new StrategicDecisionSimulator()
  ) {}

  generate(input: BoardroomEngineInput): DecisionBrief {
    const predicted = this.prediction.predict(input).interventions;
    const simulated = this.simulator.simulate(input);

    const opties = [
      "A. Consolideren van de kernactiviteiten",
      "B. Versneld verbreden met nieuwe initiatieven",
      "C. Gefaseerde strategie met stopregels",
    ];
    const besluitregels = [
      "Geen verbreding zonder margevalidatie en capaciteitsimpact.",
      "Maandelijkse herijking op cash-runway en capaciteit.",
      "Escalatie naar bestuur als KPI-trend 2 perioden verslechtert.",
    ];

    const aanbevolen = `C. Gefaseerde strategie (simulatie C als referentie, eerste interventie: ${predicted[0]?.interventie || "contractdiscipline"}).`;

    const documentText = [
      "BESLISNOTA (1 PAGINA)",
      "",
      `Besluitvraag: ${"Welke keuze reduceert structureel risico zonder uitvoerbaarheid te verliezen?"}`,
      "",
      "Opties:",
      ...opties,
      "",
      `Aanbevolen keuze: ${aanbevolen}`,
      "",
      "Besluitregels:",
      ...besluitregels.map((rule, idx) => `${idx + 1}. ${rule}`),
      "",
      `Simulatie samenvatting: A=${JSON.stringify(simulated.scenario_A).slice(0, 80)} | B=${JSON.stringify(simulated.scenario_B).slice(0, 80)} | C=${JSON.stringify(simulated.scenario_C).slice(0, 80)}`,
    ].join("\n");

    return {
      besluitvraag: "Welke keuze reduceert structureel risico zonder uitvoerbaarheid te verliezen?",
      opties,
      aanbevolen_keuze: aanbevolen,
      besluitregels,
      document_text: documentText,
    };
  }
}

