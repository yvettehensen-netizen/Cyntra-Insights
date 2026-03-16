import { StrategicCaseRepository } from "./StrategicCaseRepository";
import { InterventionTrackingEngine } from "./InterventionTrackingEngine";
import { OutcomeLearningEngine } from "./OutcomeLearningEngine";
import type {
  StrategicCaseRecord,
  StrategicInterventionRecord,
  StrategicOutcomeRecord,
} from "./StrategicDataSchema";

export type StrategicDatasetIngestInput = {
  case_record: StrategicCaseRecord;
};

export type StrategicDatasetSummary = {
  case_count: number;
  intervention_count: number;
  outcome_count: number;
  intervention_success_patterns: Array<{
    sector: string;
    interventie: string;
    resultaat: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
};

export class StrategicDatasetManager {
  constructor(
    private readonly repo = new StrategicCaseRepository(),
    private readonly tracking = new InterventionTrackingEngine(),
    private readonly outcomeLearning = new OutcomeLearningEngine()
  ) {}

  ingestAnalysis(input: StrategicDatasetIngestInput): {
    case_record: StrategicCaseRecord;
    interventions: StrategicInterventionRecord[];
  } {
    this.repo.upsertCase(input.case_record);

    const interventions = this.tracking.extract({
      case_id: input.case_record.case_id,
      sector: input.case_record.sector,
      interventieprogramma: input.case_record.interventieprogramma,
      analyse_datum: input.case_record.analyse_datum,
    });

    for (const intervention of interventions) {
      this.repo.upsertIntervention(intervention);
    }

    return {
      case_record: input.case_record,
      interventions,
    };
  }

  trackOutcome(outcome: StrategicOutcomeRecord): void {
    this.repo.upsertOutcome(outcome);
  }

  summaryForSector(sector: string): StrategicDatasetSummary {
    const cases = this.repo.listCases();
    const interventions = this.repo.listInterventions();
    const outcomes = this.repo.listOutcomes();

    const learning = this.outcomeLearning.analyze({
      cases,
      interventions,
      outcomes,
      sector,
    });

    return {
      case_count: cases.length,
      intervention_count: interventions.length,
      outcome_count: outcomes.length,
      intervention_success_patterns: learning.intervention_success_patterns,
    };
  }

  findSimilarCases(input: { sector: string; dominant_problem: string; topK?: number }): StrategicCaseRecord[] {
    return this.repo.findSimilarCases(input);
  }
}
