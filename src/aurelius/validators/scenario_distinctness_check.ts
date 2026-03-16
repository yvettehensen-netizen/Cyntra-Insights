import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

function normalize(value: string): string {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function scenarioDistinctnessCheck(analysisMap?: StrategicAnalysisMap): {
  pass: boolean;
  issues: string[];
} {
  if (!analysisMap) return { pass: true, issues: [] };
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const scenario of analysisMap.scenarios) {
    const key = [
      normalize(scenario.mechanism),
      normalize(scenario.risk),
      normalize(scenario.governanceImplication),
    ].join("|");
    if (seen.has(key)) {
      issues.push(`Scenario niet onderscheidend: ${scenario.name}`);
    }
    seen.add(key);
  }
  return {
    pass: issues.length === 0 && analysisMap.scenarios.length >= 2,
    issues,
  };
}
