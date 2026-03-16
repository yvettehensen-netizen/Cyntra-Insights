import type { StrategicInterventionRecord } from "./StrategicDataSchema";

export type InterventionTrackingInput = {
  case_id: string;
  sector: string;
  interventieprogramma: string;
  analyse_datum: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferInterventionType(source: string): string {
  const text = source.toLowerCase();
  if (/contract|heronderhandeling|verzekeraar|plafond/.test(text)) return "contractheronderhandeling";
  if (/portfolio|stop-doing|prioritering|rationalisatie/.test(text)) return "portfolio rationalisatie";
  if (/kosten|besparing|efficiency|overhead/.test(text)) return "kostenreductie";
  if (/capaciteit|fte|planning|productiviteit|casemix/.test(text)) return "capaciteitsherstructurering";
  return "strategische interventie";
}

export class InterventionTrackingEngine {
  readonly name = "Intervention Tracking Engine";

  extract(input: InterventionTrackingInput): StrategicInterventionRecord[] {
    const lines = normalize(input.interventieprogramma)
      .split(/[\n.;]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 20)
      .slice(0, 6);

    const baseDate = normalize(input.analyse_datum) || new Date().toISOString().slice(0, 10);

    const interventions = lines.map((line, index) => ({
      intervention_id: `${input.case_id}-int-${index + 1}`,
      case_id: input.case_id,
      interventie_type: inferInterventionType(line),
      beschrijving: line,
      implementatie_datum: baseDate,
    }));

    if (interventions.length) return interventions;

    return [
      {
        intervention_id: `${input.case_id}-int-1`,
        case_id: input.case_id,
        interventie_type: "strategische interventie",
        beschrijving: "Geen expliciete interventieregels gevonden; handmatige classificatie vereist.",
        implementatie_datum: baseDate,
      },
    ];
  }
}
