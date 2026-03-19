#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const reportPagePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"
);

const source = fs.readFileSync(reportPagePath, "utf8");

assert(
  source.includes("function toSortableTimestamp("),
  "rapportpagina mist canonieke recency-helper"
);

assert(
  source.includes("const sortedRows = [...safeRows].sort((left: any, right: any) => {"),
  "load() sorteert sessies niet expliciet op recency"
);

assert(
  source.includes("toSortableTimestamp(right?.updated_at || right?.analyse_datum)") &&
    !source.includes("const prioritizedRows = nonFallbackRows.length ? nonFallbackRows : fallbackRows;"),
  "load() geeft fallback/non-fallback nog voorrang boven nieuwste rapport"
);

assert(
  source.includes("const createdDelta = toSortableTimestamp(b.createdAt) - toSortableTimestamp(a.createdAt);"),
  "rapportbibliotheek sorteert merged reports niet primair op createdAt"
);

assert(
  source.includes("const activeReports = mergedReports.filter((row) => !row.isArchived || matchesReportSelection(row, selectedSessionId));"),
  "archived rapporten worden niet uit de actieve bibliotheek gefilterd"
);

assert(
  source.includes('const newestVisibleReport = filteredReports[0] || null;') &&
    source.includes('const reportMapReports = newestVisibleReport') &&
    source.includes('row.sessionId !== newestVisibleReport.sessionId'),
  "rapportbibliotheek splitst nieuwste dossier en rapportmap niet expliciet"
);

assert(
  source.includes('>Nieuwste dossier<') &&
    source.includes('>Rapportmap<'),
  "rapportpagina toont geen expliciete secties voor nieuwste dossier en rapportmap"
);

assert(
  source.includes("function resolveRecommendedScenarioIndex("),
  "rapportpagina mist helper om aanbevolen scenario aan aanbevolen keuze te koppelen"
);

assert(
  source.includes("const recommendedScenarioIndex = resolveRecommendedScenarioIndex(uniqueScenarios, resolvedRecommendedDirection);") &&
    source.includes("recommended: index === recommendedScenarioIndex"),
  "scenariovergelijking kan nog steeds een ander aanbevolen scenario tonen dan de aanbevolen keuze"
);

console.log("report recency consistency regression passed");
