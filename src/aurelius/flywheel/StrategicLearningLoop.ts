import { StrategicCaseRepository } from "@/aurelius/data/StrategicCaseRepository";
import type {
  StrategicCaseRecord,
  StrategicInterventionRecord,
  StrategicOutcomeRecord,
} from "@/aurelius/data/StrategicDataSchema";
import { OutcomeLearningEngine } from "@/aurelius/data/OutcomeLearningEngine";
import {
  StrategicCaseBuilder,
  type StrategicCaseBuilderInput,
  type StrategicCase,
} from "./StrategicCaseBuilder";
import {
  CaseNormalizationEngine,
  type NormalizedStrategicCase,
} from "./CaseNormalizationEngine";
import { InterventionRegistry } from "./InterventionRegistry";
import {
  OutcomeEvaluationEngine,
  type InterventionOutcomeSignal,
} from "./OutcomeEvaluationEngine";

export type StrategicLearningLoopInput = StrategicCaseBuilderInput & {
  intervention_outcomes?: InterventionOutcomeSignal[];
};

export type StrategicLearningLoopResult = {
  strategic_case: NormalizedStrategicCase;
  interventions: StrategicInterventionRecord[];
  outcomes: StrategicOutcomeRecord[];
  dataset_update: {
    case_count: number;
    intervention_count: number;
    outcome_count: number;
  };
  pattern_engine_update: {
    refreshed: true;
    intervention_success_patterns: Array<{
      sector: string;
      interventie: string;
      resultaat: string;
      confidence: "laag" | "middel" | "hoog";
    }>;
  };
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toRepositoryCase(caseRecord: StrategicCase): StrategicCaseRecord {
  return {
    case_id: caseRecord.case_id,
    organisatie_type: caseRecord.organisatie_type,
    sector: caseRecord.sector,
    organisatie_grootte: caseRecord.organisatie_grootte,
    verdienmodel: caseRecord.verdienmodel,
    dominant_problem: caseRecord.dominant_problem,
    dominant_thesis: caseRecord.dominant_thesis,
    mechanisms: caseRecord.mechanisms,
    strategic_options: caseRecord.strategic_options,
    gekozen_strategie: caseRecord.gekozen_strategie,
    interventieprogramma: caseRecord.interventieplan,
    analyse_datum: caseRecord.analyse_datum,
  };
}

function ratio(successCount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, successCount / total));
}

export class StrategicLearningLoop {
  readonly name = "Strategic Learning Loop";

  constructor(
    private readonly repository = new StrategicCaseRepository(),
    private readonly builder = new StrategicCaseBuilder(),
    private readonly normalizer = new CaseNormalizationEngine(),
    private readonly registry = new InterventionRegistry(repository),
    private readonly evaluator = new OutcomeEvaluationEngine(repository),
    private readonly outcomeLearning = new OutcomeLearningEngine()
  ) {}

  run(input: StrategicLearningLoopInput): StrategicLearningLoopResult {
    const strategicCase = this.builder.build(input);
    const normalized = this.normalizer.normalize(strategicCase);
    this.repository.upsertCase(toRepositoryCase(normalized));

    const interventions = this.registry.register({
      case_id: normalized.case_id,
      interventieplan: normalized.interventieplan,
      implementatie_datum: normalized.analyse_datum,
    });
    const outcomes = this.evaluator.evaluateBatch(interventions, input.intervention_outcomes ?? []);

    const cases = this.repository.listCases();
    const allInterventions = this.repository.listInterventions();
    const allOutcomes = this.repository.listOutcomes();

    const learning = this.outcomeLearning.analyze({
      cases,
      interventions: allInterventions,
      outcomes: allOutcomes,
      sector: normalized.sector,
    });

    return {
      strategic_case: normalized,
      interventions,
      outcomes,
      dataset_update: {
        case_count: cases.length,
        intervention_count: allInterventions.length,
        outcome_count: allOutcomes.length,
      },
      pattern_engine_update: {
        refreshed: true,
        intervention_success_patterns: learning.intervention_success_patterns,
      },
    };
  }

  historicalSuccessProbability(input: {
    sector: string;
    interventie_type?: string;
  }): number {
    const sector = normalize(input.sector).toLowerCase();
    const requestedType = normalize(input.interventie_type).toLowerCase();
    const cases = this.repository.listCases();
    const interventions = this.repository.listInterventions();
    const outcomes = this.repository.listOutcomes();

    const sectorCaseIds = new Set(
      cases.filter((item) => !sector || item.sector.toLowerCase() === sector).map((item) => item.case_id)
    );

    const candidateInterventions = interventions.filter((item) => {
      if (!sectorCaseIds.has(item.case_id)) return false;
      if (!requestedType) return true;
      return item.interventie_type.toLowerCase() === requestedType;
    });
    if (!candidateInterventions.length) return 0;

    const outcomeByIntervention = new Map(outcomes.map((item) => [item.intervention_id, item]));
    let successCount = 0;
    for (const intervention of candidateInterventions) {
      const outcome = outcomeByIntervention.get(intervention.intervention_id);
      if (!outcome) continue;
      if (outcome.implementatie_succes === "middel" || outcome.implementatie_succes === "hoog") {
        successCount += 1;
      }
    }

    return ratio(successCount, candidateInterventions.length);
  }
}

