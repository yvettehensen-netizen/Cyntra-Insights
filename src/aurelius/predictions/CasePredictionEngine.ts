import type { StrategicCaseSnapshot } from "@/aurelius/cases/CaseStore";
import type { Intervention } from "@/aurelius/interventions/types";

export type CasePrediction = {
  interventie: string;
  kans: number;
  succesratio: number;
  risico_trend: "dalend" | "stabiel" | "stijgend";
  sector: string;
  bron_cases: number;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toRiskScore(value: string): number {
  const lowered = normalize(value).toLowerCase();
  if (lowered === "hoog") return 3;
  if (lowered === "laag") return 1;
  return 2;
}

export class CasePredictionEngine {
  readonly name = "Case Prediction Engine";

  predict(cases: StrategicCaseSnapshot[], interventions: Intervention[]): CasePrediction[] {
    const usage = new Map<string, { count: number; confidence: number; riskTotal: number; sectors: Map<string, number> }>();

    for (const intervention of interventions) {
      const key = normalize(intervention.title || intervention.description);
      if (!key) continue;
      const row = usage.get(key) || {
        count: 0,
        confidence: 0,
        riskTotal: 0,
        sectors: new Map<string, number>(),
      };
      row.count += 1;
      row.confidence += Number(intervention.confidence ?? 0.7);
      row.riskTotal += toRiskScore(normalize(intervention.risk || "middel"));
      const sector = normalize(intervention.sector) || "Multi-sector";
      row.sectors.set(sector, (row.sectors.get(sector) ?? 0) + 1);
      usage.set(key, row);
    }

    const caseCount = Math.max(cases.length, 1);
    return Array.from(usage.entries())
      .map(([interventie, row]) => {
        const avgRisk = row.riskTotal / Math.max(row.count, 1);
        const topSector = Array.from(row.sectors.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Multi-sector";
        return {
          interventie,
          kans: Number(Math.min(0.95, row.count / caseCount).toFixed(2)),
          succesratio: Number((row.confidence / Math.max(row.count, 1)).toFixed(2)),
          risico_trend: avgRisk > 2.3 ? "stijgend" : avgRisk < 1.8 ? "dalend" : "stabiel",
          sector: topSector,
          bron_cases: row.count,
        } satisfies CasePrediction;
      })
      .sort((a, b) => b.kans - a.kans)
      .slice(0, 12);
  }
}
