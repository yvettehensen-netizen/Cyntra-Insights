import { runCyntraStrategicAgent } from "./runCyntraStrategicAgent";
import {
  OrganisationDataCollector,
  StrategicContextBuilder,
  type DiscoveredOrganisation,
} from "@/aurelius/discovery";
import type { AnalysisSession } from "@/platform";
import { StrategicDatasetCollector } from "@/platform";

export type StrategicResearchPipelineInput = {
  organisation: DiscoveredOrganisation;
};

export type StrategicResearchPipelineOutput = {
  session: AnalysisSession;
  report: string;
  executive_summary: string;
};

function createSessionId(): string {
  return `agent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export class StrategicResearchPipeline {
  readonly name = "Strategic Research Pipeline";

  private readonly collector = new OrganisationDataCollector();
  private readonly contextBuilder = new StrategicContextBuilder();
  private readonly datasetCollector = new StrategicDatasetCollector();

  async run(input: StrategicResearchPipelineInput): Promise<StrategicResearchPipelineOutput> {
    const orgContext = this.collector.collect(input.organisation);
    const strategicContext = this.contextBuilder.build({ organisationContext: orgContext });
    const raw = [
      strategicContext.organisatiecontext,
      strategicContext.sectorcontext,
      "Strategische spanningen:",
      ...strategicContext.strategische_spanningen.map((row, idx) => `${idx + 1}. ${row}`),
    ].join("\n");

    const result = await runCyntraStrategicAgent({
      context: {
        analysisType: "AI Agent analyse",
        companyName: input.organisation.organisation_name,
        rawText: raw,
        documents: [],
        userContext: {
          companyName: input.organisation.organisation_name,
          sector: input.organisation.sector,
        },
        brutalMode: false,
      },
      narrativeMode: "deterministic",
    });

    const report = result.narrative.boardroom_narrative || result.narrative.board_memo || "Rapport niet beschikbaar.";
    const session: AnalysisSession = {
      session_id: createSessionId(),
      organization_id: `agent-${input.organisation.organisation_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      organization_name: input.organisation.organisation_name,
      analyse_datum: new Date().toISOString(),
      input_data: raw,
      board_report: report,
      status: "completed",
      analysis_type: "AI Agent analyse",
      executive_summary: result.decision.dominant_thesis,
      board_memo: result.narrative.board_memo,
      strategic_metadata: {
        sector: input.organisation.sector,
        probleemtype: result.diagnosis.dominant_problem,
        mechanismen: result.mechanisms.map((row) => row.mechanism),
        interventies: result.insights.map((row) => row.recommended_focus),
        strategische_opties: result.decision.strategic_options.map((row) => row.description),
        gekozen_strategie: result.decision.recommended_option,
      },
      updated_at: new Date().toISOString(),
    };

    this.datasetCollector.collectFromSession(session);

    return {
      session,
      report,
      executive_summary: session.executive_summary || "",
    };
  }
}
