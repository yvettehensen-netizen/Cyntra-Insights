import type { StrategicDatasetRecord } from "@/aurelius/data";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type BenchmarkMetrics = {
  groei: number;
  marge: number;
  capaciteit: number;
  risico: number;
};

export type BenchmarkResult = {
  sector: string;
  organisaties: number;
  gemiddelden: BenchmarkMetrics;
  strategische_duiding: string;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export class BenchmarkEngine {
  readonly name = "Benchmark Engine";

  compare(records: StrategicDatasetRecord[], sector?: string): BenchmarkResult {
    const scoped = records.filter((row) => {
      if (!sector) return true;
      return normalize(row.sector).toLowerCase() === normalize(sector).toLowerCase();
    });

    const growthScores = scoped.map((row) => (row.interventies.length >= 2 ? 65 : 45));
    const marginScores = scoped.map((row) => (/financ/i.test(row.probleemtype) ? 42 : 58));
    const capacityScores = scoped.map((row) => (/capaciteit/i.test(row.probleemtype) ? 40 : 60));
    const riskScores = scoped.map((row) => (/contract|versnipper/i.test(row.probleemtype) ? 68 : 52));

    const gemiddelden: BenchmarkMetrics = {
      groei: Math.round(avg(growthScores)),
      marge: Math.round(avg(marginScores)),
      capaciteit: Math.round(avg(capacityScores)),
      risico: Math.round(avg(riskScores)),
    };

    const duiding =
      gemiddelden.risico > 60
        ? "Risicoprofiel is verhoogd; prioriteit op kernstabilisatie en contractdiscipline."
        : "Risicoprofiel is beheersbaar; gecontroleerde verbreding is mogelijk.";

    return {
      sector: sector || "Alle sectoren",
      organisaties: scoped.length,
      gemiddelden,
      strategische_duiding: duiding,
    };
  }

  analyzeStandard(records: StrategicDatasetRecord[], sector?: string): StrategicEngineResult {
    const benchmark = this.compare(records, sector);
    return {
      insights: uniqueLines([
        `Sector: ${benchmark.sector}`,
        `Organisaties: ${benchmark.organisaties}`,
      ]),
      risks: uniqueLines([`Risico-index: ${benchmark.gemiddelden.risico}`]),
      opportunities: uniqueLines([
        `Groei-index: ${benchmark.gemiddelden.groei}`,
        `Marge-index: ${benchmark.gemiddelden.marge}`,
        `Capaciteit-index: ${benchmark.gemiddelden.capaciteit}`,
      ]),
      recommendations: uniqueLines([benchmark.strategische_duiding]),
      confidence: clampConfidence(benchmark.organisaties >= 5 ? 0.71 : 0.55),
    };
  }
}
