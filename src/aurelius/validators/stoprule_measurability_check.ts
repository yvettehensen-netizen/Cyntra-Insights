import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

const MEASURABLE_TRIGGER = /\b(>\s*\d+|<\s*\d+|\b\d+\s*(weken|dagen|maanden|%|fte|caseload)\b|marge\s*[<>]=?\s*\d+|wachttijd\s*[<>]=?\s*\d+)/i;

export function stopruleMeasurabilityCheck(analysisMap?: StrategicAnalysisMap): {
  pass: boolean;
  issues: string[];
} {
  if (!analysisMap) return { pass: true, issues: [] };
  const issues = analysisMap.interventions
    .filter((item) => !MEASURABLE_TRIGGER.test(item.stopRule))
    .map((item) => `Stopregel niet meetbaar: ${item.action}`);
  return {
    pass: issues.length === 0,
    issues,
  };
}
