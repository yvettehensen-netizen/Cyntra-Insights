#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const reportsPagePath = path.resolve(
  process.cwd(),
  "src/pages/portal/saas/StrategischRapportSaaSPage.tsx"
);
const facadePath = path.resolve(
  process.cwd(),
  "src/platform/SaaSPlatformFacade.ts"
);
const platformServerPath = path.resolve(
  process.cwd(),
  "src/server/platform.js"
);

const reportsPageSource = fs.readFileSync(reportsPagePath, "utf8");
const facadeSource = fs.readFileSync(facadePath, "utf8");
const platformServerSource = fs.readFileSync(platformServerPath, "utf8");

assert(
  reportsPageSource.includes("const [premiumOnly, setPremiumOnly] = useState(false);"),
  "Rapportpagina mag nieuwe rapporten niet standaard achter premium-filter verbergen."
);

assert(
  reportsPageSource.includes("setShowAllReports(true);"),
  "Navigatie naar rapportpagina moet nieuwe rapporten direct zichtbaar maken."
);

const appSource = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
assert(
  appSource.includes(`Route path={PORTAL_DASHBOARD_PATH} element={<CyntraSaaSDashboardPage />} />`),
  "Standaard portaldashboard moet naar de huidige SaaS-dashboardpagina wijzen."
);

assert(
  appSource.includes(`Route path="/portal/saas" element={<CyntraSaaSDashboardPage />} />`),
  "SaaS dashboardroute moet direct de huidige dashboardpagina openen."
);

assert(
  !facadeSource.includes("archiveLegacySessions("),
  "SaaS analyseflow mag rapporten niet automatisch archiveren na elke run."
);

assert(
  !platformServerSource.includes('router.get("/api/platform/health"'),
  "Platform serverroutes mogen geen dubbele /api-prefix meer bevatten."
);

assert(
  platformServerSource.includes('router.get("/platform/health"'),
  "Platform health-route moet onder /platform hangen binnen de API-app."
);

console.log("analysis visibility regression passed");
