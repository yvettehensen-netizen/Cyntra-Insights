import {
  StrategicDiscoveryAgent,
  type StrategicDiscoveredOrganisation,
} from "./StrategicDiscoveryAgent";
import { StrategicResearchPipeline } from "./StrategicResearchPipeline";
import { StrategicLearningAgent } from "./StrategicLearningAgent";
import { StrategicMonitoringAgent } from "./StrategicMonitoringAgent";

export type StrategicAgentInput = {
  sector: string;
  zoekterm: string;
  max_organisations?: number;
  max_analyses?: number;
};

export type StrategicAgentOutput = {
  discovered_organisations: StrategicDiscoveredOrganisation[];
  new_cases: Array<{
    session_id: string;
    organisation_name: string;
    sector: string;
    executive_summary: string;
  }>;
  sector_patterns: Array<{
    sector: string;
    probleemtype: string;
    strategie: string;
    interventie: string;
    succesratio: number;
  }>;
  agent_activity: string[];
  monitoring: {
    organisation_events: Array<{
      organisation_name: string;
      type: string;
      impact: string;
    }>;
    strategic_signals: Array<{
      sector: string;
      signaal: string;
      impact: string;
      urgentie: string;
    }>;
  };
};

export class StrategicAgent {
  readonly name = "Strategic Agent";

  private readonly discovery = new StrategicDiscoveryAgent();
  private readonly research = new StrategicResearchPipeline();
  private readonly learning = new StrategicLearningAgent();
  private readonly monitoring = new StrategicMonitoringAgent();

  async run(input: StrategicAgentInput): Promise<StrategicAgentOutput> {
    const maxOrganisations = Math.max(1, Math.min(input.max_organisations ?? 6, 20));
    const maxAnalyses = Math.max(1, Math.min(input.max_analyses ?? 3, maxOrganisations));

    const activity: string[] = [];
    activity.push("Discovery gestart.");
    const discovered = this.discovery.discover({
      sector: input.sector,
      zoekterm: input.zoekterm,
      max_results: maxOrganisations,
    });
    activity.push(`${discovered.length} organisaties ontdekt.`);

    const new_cases: StrategicAgentOutput["new_cases"] = [];
    const selected = discovered.slice(0, maxAnalyses);
    for (const organisation of selected) {
      activity.push(`Analyse gestart: ${organisation.organisation_name}`);
      const result = await this.research.run({
        organisation,
      });
      new_cases.push({
        session_id: result.session.session_id,
        organisation_name: result.session.organization_name || result.session.organization_id,
        sector: result.session.strategic_metadata?.sector || "Onbekende sector",
        executive_summary: result.executive_summary,
      });
      activity.push(`Case opgeslagen: ${result.session.session_id}`);
    }

    activity.push("Learning update gestart.");
    const learned = this.learning.learn(input.sector);
    activity.push(`Kennisgraph geüpdatet (nodes: ${learned.graph_stats.nodes}, edges: ${learned.graph_stats.edges}).`);

    activity.push("Monitoring gestart.");
    const monitored = this.monitoring.monitor(discovered);
    activity.push(`Monitoring events: ${monitored.organisation_events.length}`);

    return {
      discovered_organisations: discovered,
      new_cases,
      sector_patterns: learned.patterns.slice(0, 30),
      agent_activity: activity,
      monitoring: monitored,
    };
  }
}

