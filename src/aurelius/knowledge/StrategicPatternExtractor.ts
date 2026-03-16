import type { CaseDatasetRecord, InterventionDatasetRecord } from "@/aurelius/data";

export type StrategicPattern = {
  sector: string;
  probleemtype: string;
  strategie: string;
  interventie: string;
  succesratio: number;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function ratio(part: number, total: number): number {
  if (!total) return 0;
  return Number((part / total).toFixed(4));
}

export class StrategicPatternExtractor {
  readonly name = "Strategic Pattern Extractor";

  extract(
    cases: CaseDatasetRecord[],
    interventions: InterventionDatasetRecord[]
  ): StrategicPattern[] {
    const groups = new Map<
      string,
      {
        sector: string;
        probleemtype: string;
        strategie: string;
        interventie: string;
        total: number;
        successSum: number;
      }
    >();

    for (const caseRow of cases) {
      const relatedInterventions = interventions.filter((item) => {
        return (
          normalize(item.sector).toLowerCase() === normalize(caseRow.sector).toLowerCase() &&
          normalize(item.probleemtype).toLowerCase() === normalize(caseRow.probleemtype).toLowerCase()
        );
      });

      const interventionsForCase = relatedInterventions.length
        ? relatedInterventions
        : [
            {
              intervention_id: `synthetic-${caseRow.case_id}`,
              sector: caseRow.sector,
              probleemtype: caseRow.probleemtype,
              interventie: caseRow.interventie,
              impact: "",
              risico: "",
              succes_score: /succes|voltooid|verbeter/i.test(caseRow.resultaat) ? 0.75 : 0.45,
              created_at: caseRow.created_at,
            },
          ];

      for (const intervention of interventionsForCase) {
        const key = [
          normalize(caseRow.sector).toLowerCase(),
          normalize(caseRow.probleemtype).toLowerCase(),
          normalize(caseRow.gekozen_strategie).toLowerCase(),
          normalize(intervention.interventie).toLowerCase(),
        ].join("|");

        const current = groups.get(key) ?? {
          sector: normalize(caseRow.sector) || "Onbekende sector",
          probleemtype: normalize(caseRow.probleemtype) || "overig",
          strategie: normalize(caseRow.gekozen_strategie) || "onbekend",
          interventie: normalize(intervention.interventie) || "onbekend",
          total: 0,
          successSum: 0,
        };
        current.total += 1;
        current.successSum += Number(intervention.succes_score ?? 0);
        groups.set(key, current);
      }
    }

    return Array.from(groups.values())
      .map((item) => ({
        sector: item.sector,
        probleemtype: item.probleemtype,
        strategie: item.strategie,
        interventie: item.interventie,
        succesratio: ratio(item.successSum, item.total),
      }))
      .sort((a, b) => b.succesratio - a.succesratio)
      .slice(0, 500);
  }
}

