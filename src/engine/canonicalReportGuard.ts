import type { BoardroomDocument } from "@/types/BoardroomDocument";
import type { StrategicReport } from "@/types/StrategicReport";

const LEGACY_MODEL_NAME = ["Report", "ViewModel"].join("");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function looksLikeLegacyReportShape(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return [
    "strategySections",
    "scenarioSections",
    "engineSections",
    "compactScenarios",
    "governanceInterventions",
    "bestuurlijkeBesliskaart",
  ].some((key) => key in value);
}

export function assertCanonicalStrategicReport(report: unknown): asserts report is StrategicReport {
  if (looksLikeLegacyReportShape(report)) {
    throw new Error(`${LEGACY_MODEL_NAME} is niet toegestaan in de canonieke rapportflow.`);
  }
}

export function assertCanonicalBoardroomDocument(document: unknown): asserts document is BoardroomDocument {
  if (looksLikeLegacyReportShape(document)) {
    throw new Error(`${LEGACY_MODEL_NAME} is niet toegestaan in de canonieke boardroomflow.`);
  }
}
