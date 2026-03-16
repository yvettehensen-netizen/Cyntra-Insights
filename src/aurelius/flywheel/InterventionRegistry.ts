import { StrategicCaseRepository } from "@/aurelius/data/StrategicCaseRepository";
import type { StrategicInterventionRecord } from "@/aurelius/data/StrategicDataSchema";

export type RegisterInterventionsInput = {
  case_id: string;
  interventieplan: string;
  implementatie_datum?: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferType(source: string): StrategicInterventionRecord["interventie_type"] {
  const low = source.toLowerCase();
  if (/\bcontract|verzekeraar|tarief|plafond|heronderhandeling\b/.test(low)) {
    return "contractheronderhandeling";
  }
  if (/\bportfolio|stop-doing|focus|prioritering|rationalisatie\b/.test(low)) {
    return "portfolio rationalisatie";
  }
  if (/\bkosten|kostprijs|overhead|efficiency|margeherstel\b/.test(low)) {
    return "kostenstructuur optimalisatie";
  }
  if (/\bcapaciteit|fte|planning|intake|productiviteit|wachtlijst\b/.test(low)) {
    return "capaciteitsherstructurering";
  }
  if (/\bmandaat|governance|escalatie|rvt|besluitlijn\b/.test(low)) {
    return "governance herstructurering";
  }
  return "strategische interventie";
}

function splitInterventionLines(interventieplan: string): string[] {
  return normalize(interventieplan)
    .split(/\n|[.;](?=\s+[A-Z0-9-])/)
    .map((line) => line.replace(/^[\-\d.\s]+/, "").trim())
    .filter((line) => line.length >= 20)
    .slice(0, 10);
}

export class InterventionRegistry {
  readonly name = "Intervention Registry";

  constructor(private readonly repository = new StrategicCaseRepository()) {}

  register(input: RegisterInterventionsInput): StrategicInterventionRecord[] {
    const baseDate = normalize(input.implementatie_datum) || new Date().toISOString().slice(0, 10);
    const lines = splitInterventionLines(input.interventieplan);
    const interventions = (lines.length ? lines : ["Interventieplan vereist handmatige opdeling en typering."])
      .map((line, index) => ({
        intervention_id: `${input.case_id}-int-${index + 1}`,
        case_id: input.case_id,
        interventie_type: inferType(line),
        beschrijving: line,
        implementatie_datum: baseDate,
      }));

    for (const intervention of interventions) {
      this.repository.upsertIntervention(intervention);
    }

    return interventions;
  }
}

