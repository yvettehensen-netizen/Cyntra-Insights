import type { CaseDatasetRecord, InterventionDatasetRecord } from "@/aurelius/data";
import type { AnonymizedStrategicRecord } from "@/platform";
import type { AutopilotStrategicSignal } from "@/aurelius/autopilot/SignalMonitor";
import { StrategicKnowledgeGraph, type StrategicKnowledgeGraphState } from "./StrategicKnowledgeGraph";
import { StrategicPatternExtractor, type StrategicPattern } from "./StrategicPatternExtractor";

export type RelationshipUpdateInput = {
  records: AnonymizedStrategicRecord[];
  cases: CaseDatasetRecord[];
  interventions: InterventionDatasetRecord[];
  signals?: AutopilotStrategicSignal[];
};

export type RelationshipUpdateOutput = {
  graph: StrategicKnowledgeGraphState;
  patterns: StrategicPattern[];
};

export class StrategicRelationshipEngine {
  readonly name = "Strategic Relationship Engine";

  constructor(
    private readonly graph = new StrategicKnowledgeGraph(),
    private readonly extractor = new StrategicPatternExtractor()
  ) {}

  connect(input: RelationshipUpdateInput): RelationshipUpdateOutput {
    const graphState = this.graph.buildFromData({
      records: input.records,
      cases: input.cases,
      interventions: input.interventions,
      signals: input.signals,
    });
    const patterns = this.extractor.extract(input.cases, input.interventions);
    return {
      graph: graphState,
      patterns,
    };
  }
}
