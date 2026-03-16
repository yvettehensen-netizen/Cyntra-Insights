export type PortalReportView = "short" | "full";

export const PORTAL_DASHBOARD_PATH = "/portal/dashboard";
export const PORTAL_ANALYSIS_PATH = "/portal/saas/analyse";
export const PORTAL_REPORT_LIBRARY_PATH = "/portal/rapporten";
export const PORTAL_REPORT_PATH = "/portal/rapport";
export const PORTAL_INTERVENTIONS_PATH = "/portal/interventies";
export const PORTAL_CASES_PATH = "/portal/cases";
export const PORTAL_BENCHMARK_PATH = "/portal/benchmark";
export const PORTAL_SECTOR_INSIGHTS_PATH = "/portal/sectoren";
export const PORTAL_SIGNALS_PATH = "/portal/signalen";
export const PORTAL_DATASET_PATH = "/portal/dataset";
export const PORTAL_ORGANIZATION_SCANNER_PATH = "/portal/organisatie-scanner";
export const PORTAL_SETTINGS_PATH = "/portal/instellingen";

function withReportView(path: string, view?: PortalReportView): string {
  if (view !== "full") return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}view=full`;
}

export function buildPortalReportLibraryPath(sessionId?: string, view?: PortalReportView): string {
  const normalized = String(sessionId || "").trim();
  if (!normalized) return withReportView(PORTAL_REPORT_LIBRARY_PATH, view);
  return withReportView(`${PORTAL_REPORT_LIBRARY_PATH}?session=${encodeURIComponent(normalized)}`, view);
}

export function buildPortalReportPath(reportId?: string, view?: PortalReportView): string {
  const normalized = String(reportId || "").trim();
  if (!normalized) return withReportView(PORTAL_REPORT_LIBRARY_PATH, view);
  return withReportView(`${PORTAL_REPORT_PATH}/${encodeURIComponent(normalized)}`, view);
}
