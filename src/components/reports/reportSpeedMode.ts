import type { ReportSpeedMode, ReportTabKey } from "./types";

const FULL_REPORT_TABS: ReportTabKey[] = ["boardroom", "strategy", "scenario", "engine"];
const SHORT_REPORT_TABS: ReportTabKey[] = ["boardroom"];

export function normalizeReportSpeedMode(value: unknown): ReportSpeedMode {
  return String(value || "").trim().toLowerCase() === "full" ? "full" : "short";
}

export function getDefaultReportTabForMode(mode: ReportSpeedMode): ReportTabKey {
  return mode === "full" ? "strategy" : "boardroom";
}

export function getVisibleReportTabsForMode(mode: ReportSpeedMode): ReportTabKey[] {
  return mode === "full" ? FULL_REPORT_TABS : SHORT_REPORT_TABS;
}

export function deriveReportSpeedModeFromTab(tab: ReportTabKey): ReportSpeedMode {
  return tab === "boardroom" ? "short" : "full";
}

export function getReportModeHint(mode: ReportSpeedMode): string {
  return mode === "full"
    ? "Volledig dossier opent het strategisch rapport, scenario's en technische analyse."
    : "Kort dossier houdt alleen besluitinformatie zichtbaar en voorkomt ruis tijdens boardroomgebruik.";
}
