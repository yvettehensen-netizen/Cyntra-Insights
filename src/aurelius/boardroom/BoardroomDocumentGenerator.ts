import type { BoardroomEngineInput } from "./BoardroomIntegrationAdapters";
import { ExecutiveSummaryEngine, type ExecutiveSummary } from "./ExecutiveSummaryEngine";
import { DecisionBriefGenerator, type DecisionBrief } from "./DecisionBriefGenerator";
import { BoardSlideGenerator, type BoardSlide } from "./BoardSlideGenerator";

export type BoardroomDocumentType =
  | "beslisnota"
  | "strategisch_rapport"
  | "executive_samenvatting";

export type BoardroomDocuments = {
  beslisnota: DecisionBrief;
  strategisch_rapport: string;
  executive_samenvatting: ExecutiveSummary;
  board_slides: BoardSlide[];
};

export class BoardroomDocumentGenerator {
  readonly name = "Boardroom Document Generator";

  constructor(
    private readonly summaryEngine = new ExecutiveSummaryEngine(),
    private readonly briefGenerator = new DecisionBriefGenerator(),
    private readonly slideGenerator = new BoardSlideGenerator()
  ) {}

  generate(input: BoardroomEngineInput): BoardroomDocuments {
    const executive = this.summaryEngine.generate(input);
    const brief = this.briefGenerator.generate(input);
    const slides = this.slideGenerator.generate(input);

    const strategischRapport = [
      "STRATEGISCH BOARDROOM RAPPORT",
      "",
      "1. Besluitvraag",
      executive.besluitvraag,
      "",
      "2. Kernanalyse",
      executive.kernanalyse,
      "",
      "3. Aanbevolen strategie",
      executive.aanbevolen_strategie,
      "",
      "4. Belangrijkste risico",
      executive.belangrijkste_risico,
      "",
      "5. Interventieplan",
      executive.interventieplan,
      "",
      "6. Besluitregels",
      ...brief.besluitregels.map((row, idx) => `${idx + 1}. ${row}`),
    ].join("\n");

    return {
      beslisnota: brief,
      strategisch_rapport: strategischRapport,
      executive_samenvatting: executive,
      board_slides: slides,
    };
  }
}

