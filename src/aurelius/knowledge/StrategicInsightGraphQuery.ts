import type { StrategicPattern } from "./StrategicPatternExtractor";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export class StrategicInsightGraphQuery {
  readonly name = "Strategic Insight Graph Query";

  strategyForSector(patterns: StrategicPattern[], sector: string): StrategicPattern[] {
    const scoped = patterns.filter((item) => normalize(item.sector) === normalize(sector));
    return scoped.sort((a, b) => b.succesratio - a.succesratio).slice(0, 5);
  }

  interventionForProblem(patterns: StrategicPattern[], probleemtype: string): StrategicPattern[] {
    const scoped = patterns.filter((item) => normalize(item.probleemtype) === normalize(probleemtype));
    return scoped.sort((a, b) => b.succesratio - a.succesratio).slice(0, 5);
  }

  failingCombinations(patterns: StrategicPattern[]): StrategicPattern[] {
    return patterns
      .filter((item) => item.succesratio <= 0.45)
      .sort((a, b) => a.succesratio - b.succesratio)
      .slice(0, 8);
  }
}

