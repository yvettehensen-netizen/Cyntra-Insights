import { validateContentIntegrity } from "@/engine/contentIntegrityGuard";
import type { StrategicReport } from "@/types/StrategicReport";

const MIN_SECTION_LENGTH = 30;

function normalizeLength(value: string): number {
  return value.replace(/\s+/g, " ").trim().length;
}

function endsWithSentence(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || /[.!?]$/.test(trimmed);
}

function createInvalidError(message: string): Error {
  const error = new Error(`INVALID_REPORT_STRUCTURE: ${message}`);
  error.name = "INVALID_REPORT_STRUCTURE";
  return error;
}

export function validateStrategicReport(report: StrategicReport): true {
  if (!report.executiveCore) {
    throw createInvalidError("missing executiveCore");
  }
  if (!report.decisionQuestion) {
    throw createInvalidError("missing decisionQuestion");
  }

  if (!Array.isArray(report.scenarios) || report.scenarios.length < 3) {
    throw createInvalidError("fewer than 3 scenarios");
  }

  const titles = report.scenarios.map((scenario) => scenario.title.trim().toLowerCase());
  const duplicateTitle = titles.find((title, index) => title && titles.indexOf(title) !== index);
  if (duplicateTitle) {
    throw createInvalidError(`duplicate scenario title detected (${duplicateTitle})`);
  }

  const sectionFields = [
    report.executiveCore,
    report.decisionQuestion,
    report.situation,
    report.mechanismAnalysis.explanation,
  ];
  sectionFields.forEach((field) => {
    if (normalizeLength(field) < MIN_SECTION_LENGTH) {
      throw createInvalidError("section length below minimum threshold");
    }
    if (!endsWithSentence(field)) {
      throw createInvalidError("section contains a truncated sentence");
    }
    if (validateContentIntegrity(field).length > 0) {
      throw createInvalidError("section failed content integrity guard");
    }
  });

  const scenarioFields = report.scenarios.flatMap((scenario) => [
    scenario.title,
    scenario.mechanism,
    scenario.risk,
    scenario.governanceImplication,
  ]);

  scenarioFields.forEach((field) => {
    if (!field) {
      return;
    }
    if (normalizeLength(field) < MIN_SECTION_LENGTH / 2) {
      throw createInvalidError("scenario field too short");
    }
    if (!endsWithSentence(field)) {
      throw createInvalidError("scenario field contains a truncated sentence");
    }
    if (validateContentIntegrity(field).length > 0) {
      throw createInvalidError("scenario field failed content integrity guard");
    }
  });

  const integritySensitiveFields = [
    report.strategicTension.axisA,
    report.strategicTension.axisB,
    report.strategicTension.explanation,
    report.mechanismAnalysis.coreMechanism || "",
    report.mechanismAnalysis.boardInterpretation || "",
    ...(report.mechanismAnalysis.causalChain || []),
    ...(report.stopRules || []),
  ];

  integritySensitiveFields.forEach((field) => {
    if (!field) return;
    if (validateContentIntegrity(field).length > 0) {
      throw createInvalidError("content integrity guard rejected report");
    }
  });

  return true;
}

export function validateDecisionIntelligence(intel: { errors: string[] }): true {
  if (intel.errors.length > 0) {
    throw new Error(`INVALID_DECISION_INTELLIGENCE: ${intel.errors.join(", ")}`);
  }
  const candidate = intel as Record<string, unknown>;
  const thesis = String(candidate.thesis || "");
  const tradeOff = String(candidate.tradeOff || "");
  const inevitability = String(candidate.inevitability || "");
  const forcedDecision = String(candidate.forcedDecision || "");
  const breakpoints = Array.isArray(candidate.breakpoints) ? candidate.breakpoints : [];

  if (!thesis.trim()) throw new Error("INVALID_DECISION_INTELLIGENCE: MISSING_STRONG_THESIS");
  if (!/kan .*niet tegelijkertijd|cannot simultaneously/i.test(tradeOff)) {
    throw new Error("INVALID_DECISION_INTELLIGENCE: NO_FORCED_TRADEOFF");
  }
  if (!/onvermijdelijk|inevitable/i.test(inevitability)) {
    throw new Error("INVALID_DECISION_INTELLIGENCE: NO_INEVITABILITY");
  }
  if (!breakpoints.length) {
    throw new Error("INVALID_DECISION_INTELLIGENCE: NO_BREAKPOINTS");
  }
  if (!/enige verdedigbare keuze|only viable path|enige werkbare route/i.test(forcedDecision)) {
    throw new Error("INVALID_DECISION_INTELLIGENCE: NO_FORCED_DECISION");
  }
  return true;
}
