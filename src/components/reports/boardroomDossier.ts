import type { GovernanceIntervention, ReportSection, ReportViewModel } from "./types";

type BoardroomDossier = {
  mainSections: ReportSection[];
  appendixSections: ReportSection[];
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sanitizeBody(value: unknown): string {
  return String(value || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function findSectionBodyByAliases(sections: ReportSection[], titles: string[]): string {
  const aliases = titles.map((title) => title.toUpperCase());
  return sanitizeBody(sections.find((section) => aliases.includes(String(section.title || "").trim().toUpperCase()))?.body || "");
}

function renderBoardActions(actions: GovernanceIntervention[]): string {
  return actions.slice(0, 3).map((item, index) => [
    `Actie ${index + 1}`,
    `ACTIE\n${sanitizeBody(item.action)}`,
    `MECHANISME\n${sanitizeBody(item.mechanism)}`,
    `BESTUURLIJK BESLUIT\n${sanitizeBody(item.boardDecision)}`,
    `VERANTWOORDELIJKE\n${sanitizeBody(`${item.owner} • ${item.deadline}`)}`,
    `KPI\n${sanitizeBody(item.kpi)}`,
  ].join("\n\n")).join("\n\n");
}

export function buildBoardroomDossier(model: ReportViewModel): BoardroomDossier {
  const appendixSections = model.strategySections.filter((section) => normalize(section.body));
  return {
    mainSections: [
      {
        title: "BESLUIT",
        body: [
          `KERNPROBLEEM\n${sanitizeBody(model.bestuurlijkeBesliskaart.coreProblem)}`,
          `KERNSTELLING\n${sanitizeBody(model.bestuurlijkeBesliskaart.coreStatement)}`,
          `AANBEVOLEN KEUZE\n${sanitizeBody(model.bestuurlijkeBesliskaart.recommendedChoice)}`,
        ].join("\n\n"),
      },
      {
        title: "SPANNING",
        body: sanitizeBody(model.strategicConflict || model.bestuurlijkeBesliskaart.coreStatement),
      },
      {
        title: "WAAROM DIT GEBEURT",
        body: findSectionBodyByAliases(model.strategySections, ["WAAROM DIT GEBEURT", "MECHANISME ANALYSE"]) || sanitizeBody(model.boardDecisionPressure.financial),
      },
      {
        title: "SCENARIO'S",
        body: model.compactScenarios.slice(0, 3).map((scenario, index) => [
          `SCENARIO ${String.fromCharCode(65 + index)} — ${sanitizeBody(scenario.title)}`,
          `MECHANISME\n${sanitizeBody(scenario.mechanism)}`,
          `RISICO\n${sanitizeBody(scenario.risk)}`,
          `BESTUURLIJKE IMPLICATIE\n${sanitizeBody(scenario.boardImplication)}`,
        ].join("\n\n")).join("\n\n"),
      },
      {
        title: "DOORBRAAKINZICHTEN",
        body: model.structuredKillerInsights.slice(0, 4).map((item) => [
          `KERNINZICHT — ${sanitizeBody(item.insight)}`,
          `ONDERLIGGENDE OORZAAK — ${sanitizeBody(item.mechanism)}`,
          `BESTUURLIJK GEVOLG — ${sanitizeBody(item.implication)}`,
        ].join("\n")).join("\n\n"),
      },
      {
        title: "BESTUURLIJKE ACTIES",
        body: renderBoardActions(model.governanceInterventions),
      },
      {
        title: "STOPREGELS",
        body: model.bestuurlijkeBesliskaart.stopRules.slice(0, 5).map((item) => `- ${sanitizeBody(item)}`).join("\n"),
      },
    ].filter((section) => normalize(section.body)),
    appendixSections,
  };
}
