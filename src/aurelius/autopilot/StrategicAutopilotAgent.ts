import { runCyntraStrategicAgent } from "@/aurelius/agent";
import { OrganisationDataCollector, StrategicContextBuilder } from "@/aurelius/discovery";
import { SectorPatternEngine } from "@/aurelius/network";
import type { StrategicDatasetRecord } from "@/aurelius/data";
import type { AnalysisContext } from "@/aurelius/engine/types";
import type { AnalysisSession, AnonymizedStrategicRecord } from "@/platform";
import { StrategicDatasetCollector } from "@/platform";
import { OrganisationCrawler, type OrganisationCrawlerInput } from "./OrganisationCrawler";
import { SignalMonitor, type AutopilotStrategicSignal } from "./SignalMonitor";

export type StrategicAutopilotInput = OrganisationCrawlerInput & {
  max_analyses?: number;
};

export type AutopilotAnalysisResult = {
  organisation_name: string;
  sector: string;
  report: string;
  analyse_datum: string;
};

export type StrategicAutopilotOutput = {
  run_id: string;
  executed_at: string;
  analyses: AutopilotAnalysisResult[];
  signalen: AutopilotStrategicSignal[];
  sectorpatronen: ReturnType<SectorPatternEngine["detectIntelligence"]>;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toContext(input: {
  organisation_name: string;
  sector: string;
  contextText: string;
}): AnalysisContext {
  return {
    analysisType: "Autopilot analyse",
    companyName: input.organisation_name,
    rawText: input.contextText,
    documents: [],
    userContext: {
      companyName: input.organisation_name,
      sector: input.sector,
    },
    brutalMode: false,
  };
}

export class StrategicAutopilotAgent {
  readonly name = "Strategic Autopilot Agent";

  private readonly crawler = new OrganisationCrawler();
  private readonly dataCollector = new OrganisationDataCollector();
  private readonly contextBuilder = new StrategicContextBuilder();
  private readonly datasetCollector = new StrategicDatasetCollector();
  private readonly signalMonitor = new SignalMonitor();
  private readonly patternEngine = new SectorPatternEngine();

  async run(input: StrategicAutopilotInput): Promise<StrategicAutopilotOutput> {
    const crawled = this.crawler.crawl(input);
    const selected = crawled.organisations.slice(0, Math.max(1, Math.min(input.max_analyses ?? 3, 10)));
    const analyses: AutopilotAnalysisResult[] = [];

    for (const organisation of selected) {
      const orgContext = this.dataCollector.collect(organisation);
      const strategicContext = this.contextBuilder.build({ organisationContext: orgContext });
      const raw = [
        strategicContext.organisatiecontext,
        strategicContext.sectorcontext,
        "Strategische spanningen:",
        ...strategicContext.strategische_spanningen.map((item, idx) => `${idx + 1}. ${item}`),
      ].join("\n");

      const output = await runCyntraStrategicAgent({
        context: toContext({
          organisation_name: organisation.organisation_name,
          sector: organisation.sector,
          contextText: raw,
        }),
        narrativeMode: "deterministic",
      });

      const report = output.narrative.boardroom_narrative || output.narrative.board_memo || "Rapport niet beschikbaar.";
      const analyzeDate = new Date().toISOString();

      const sessionLike: AnalysisSession = {
        session_id: `autopilot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        organization_id: `auto-${normalize(organisation.organisation_name).toLowerCase().replace(/\s+/g, "-")}`,
        organization_name: organisation.organisation_name,
        analyse_datum: analyzeDate,
        input_data: raw,
        board_report: report,
        status: "completed",
        analysis_type: "Autopilot analyse",
        executive_summary: output.decision.dominant_thesis,
        board_memo: output.narrative.board_memo,
        strategic_metadata: {
          sector: organisation.sector,
          probleemtype: output.diagnosis.dominant_problem,
          mechanismen: output.mechanisms.map((item) => item.mechanism),
          interventies: output.insights.map((item) => item.recommended_focus),
          strategische_opties: output.decision.strategic_options.map((item) => item.description),
          gekozen_strategie: output.decision.recommended_option,
        },
        updated_at: analyzeDate,
      };

      this.datasetCollector.collectFromSession(sessionLike);

      analyses.push({
        organisation_name: organisation.organisation_name,
        sector: organisation.sector,
        report,
        analyse_datum: analyzeDate,
      });
    }

    const records: AnonymizedStrategicRecord[] = this.datasetCollector.listRecords();
    const mapped: StrategicDatasetRecord[] = records.map((item) => ({
      dataset_id: item.record_id,
      sector: item.sector,
      probleemtype: item.probleemtype,
      mechanismen: item.mechanismen,
      interventies: item.interventies,
      outcomes: [],
      created_at: item.created_at,
    }));

    return {
      run_id: `autopilot-${Date.now().toString(36)}`,
      executed_at: new Date().toISOString(),
      analyses,
      signalen: this.signalMonitor.detectFromDatasetRecords(records),
      sectorpatronen: this.patternEngine.detectIntelligence(mapped, input.sector),
    };
  }
}
