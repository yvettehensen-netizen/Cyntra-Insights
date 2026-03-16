import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

export function metadataConsistencyCheck(text: string, analysisMap?: StrategicAnalysisMap): {
  pass: boolean;
  mismatches: string[];
} {
  const mismatches: string[] = [];
  if (!analysisMap) {
    return { pass: true, mismatches };
  }
  const source = String(text ?? "");
  const required = [
    analysisMap.organisation,
    analysisMap.sector,
    analysisMap.analysisDate,
    analysisMap.recommendedOption,
  ].filter(Boolean);

  required.forEach((value) => {
    if (!source.includes(value)) {
      mismatches.push(value);
    }
  });

  return {
    pass: mismatches.length === 0,
    mismatches,
  };
}
