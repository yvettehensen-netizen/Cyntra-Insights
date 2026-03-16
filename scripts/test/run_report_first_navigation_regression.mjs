#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const repoRoot = process.cwd();
const analysisPage = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/StrategischeAnalyseSaaSPage.tsx"),
  "utf8"
);
const saasDashboardPage = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/CyntraSaaSDashboardPage.tsx"),
  "utf8"
);
const reportPage = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"),
  "utf8"
);
const portalPaths = fs.readFileSync(
  path.join(repoRoot, "src/pages/portal/portalPaths.ts"),
  "utf8"
);

assert(
  portalPaths.includes('export const PORTAL_REPORT_PATH = "/portal/rapport";'),
  "portal report path ontbreekt"
);
assert(
  portalPaths.includes("export function buildPortalReportPath(reportId?: string"),
  "buildPortalReportPath ontbreekt"
);
assert(
  analysisPage.includes("navigate(buildPortalReportPath(reportId)"),
  "analysepagina navigeert niet report-first"
);
assert(
  !saasDashboardPage.includes("api.startSession("),
  "SaaS dashboard gebruikt nog directe sessiestart"
);
assert(
  saasDashboardPage.includes("const analysis = await api.runAnalysis("),
  "SaaS dashboard gebruikt nog geen report-first analyseflow"
);
assert(
  saasDashboardPage.includes("formatReportCode(analysis.reportId)"),
  "SaaS dashboard toont nog geen rapport-first resultaat na analyse"
);
assert(
  reportPage.includes("const { id: routeReportId } = useParams"),
  "rapportpagina ondersteunt geen directe /portal/rapport/:id route"
);

console.log("report-first navigation regression passed");
