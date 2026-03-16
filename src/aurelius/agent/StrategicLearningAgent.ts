import { StrategicDatasetCollector } from "@/platform";
import { StrategicCaseIntelligenceStore, InterventionStore } from "@/aurelius/data";
import { StrategicSignalEngine } from "@/aurelius/network";
import {
  StrategicRelationshipEngine,
  StrategicInsightGraphQuery,
  type StrategicPattern,
} from "@/aurelius/knowledge";

export type StrategicLearningOutput = {
  patterns: StrategicPattern[];
  top_strategies_per_sector: StrategicPattern[];
  top_interventions_for_problem: StrategicPattern[];
  frequent_failures: StrategicPattern[];
  graph_stats: {
    nodes: number;
    edges: number;
  };
};

export class StrategicLearningAgent {
  readonly name = "Strategic Learning Agent";

  private readonly dataset = new StrategicDatasetCollector();
  private readonly cases = new StrategicCaseIntelligenceStore();
  private readonly interventions = new InterventionStore();
  private readonly relationship = new StrategicRelationshipEngine();
  private readonly query = new StrategicInsightGraphQuery();
  private readonly signalEngine = new StrategicSignalEngine();

  learn(sector = "Zorg/GGZ", probleemtype = "financiele druk"): StrategicLearningOutput {
    const records = this.dataset.listRecords();
    const caseRows = this.cases.list();
    const interventionRows = this.interventions.list();
    const signals = this.signalEngine
      .detect(
        records.map((item) => ({
          dataset_id: item.record_id,
          sector: item.sector,
          probleemtype: item.probleemtype,
          mechanismen: item.mechanismen,
          interventies: item.interventies,
          outcomes: [],
          created_at: item.created_at,
        }))
      )
      .map((item) => ({
        sector: "Multi-sector",
        signaal: item.type,
        impact: item.implicatie,
        urgentie: item.severity,
      }));

    const connected = this.relationship.connect({
      records,
      cases: caseRows,
      interventions: interventionRows,
      signals,
    });

    return {
      patterns: connected.patterns,
      top_strategies_per_sector: this.query.strategyForSector(connected.patterns, sector),
      top_interventions_for_problem: this.query.interventionForProblem(
        connected.patterns,
        probleemtype
      ),
      frequent_failures: this.query.failingCombinations(connected.patterns),
      graph_stats: {
        nodes: connected.graph.nodes.length,
        edges: connected.graph.edges.length,
      },
    };
  }
}

