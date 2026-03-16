import { StrategicCaseRepository } from "@/aurelius/data/StrategicCaseRepository";
import type {
  StrategicInterventionRecord,
  StrategicOutcomeRecord,
} from "@/aurelius/data/StrategicDataSchema";

export type InterventionOutcomeSignal = {
  intervention_id: string;
  financieel_effect?: string;
  operationeel_effect?: string;
  implementatie_succes?: "laag" | "middel" | "hoog";
  evaluatie_datum?: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferSuccess(financial: string, operational: string): "laag" | "middel" | "hoog" {
  const source = `${financial} ${operational}`.toLowerCase();
  if (/\bsterk|hoog|duidelijk positief|structureel|boven target\b/.test(source)) return "hoog";
  if (/\bbeperkt|laag|negatief|achterstand|onder target\b/.test(source)) return "laag";
  return "middel";
}

export class OutcomeEvaluationEngine {
  readonly name = "Outcome Evaluation Engine";

  constructor(private readonly repository = new StrategicCaseRepository()) {}

  evaluate(
    intervention: StrategicInterventionRecord,
    signal?: Omit<InterventionOutcomeSignal, "intervention_id">
  ): StrategicOutcomeRecord {
    const financieelEffect = normalize(signal?.financieel_effect) || "Financieel effect nog niet formeel geëvalueerd";
    const operationeelEffect =
      normalize(signal?.operationeel_effect) || "Operationeel effect nog niet formeel geëvalueerd";
    const succes = signal?.implementatie_succes ?? inferSuccess(financieelEffect, operationeelEffect);
    const evaluatieDatum = normalize(signal?.evaluatie_datum) || new Date().toISOString().slice(0, 10);

    const outcome: StrategicOutcomeRecord = {
      outcome_id: `${intervention.intervention_id}-outcome-${evaluatieDatum.replace(/-/g, "")}`,
      intervention_id: intervention.intervention_id,
      financieel_effect: financieelEffect,
      operationeel_effect: operationeelEffect,
      implementatie_succes: succes,
      evaluatie_datum: evaluatieDatum,
    };

    this.repository.upsertOutcome(outcome);
    return outcome;
  }

  evaluateBatch(
    interventions: StrategicInterventionRecord[],
    signals: InterventionOutcomeSignal[] = []
  ): StrategicOutcomeRecord[] {
    const signalByIntervention = new Map(signals.map((item) => [item.intervention_id, item]));
    return interventions.map((intervention) =>
      this.evaluate(intervention, signalByIntervention.get(intervention.intervention_id))
    );
  }
}

