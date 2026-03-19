import type { StrategicReport } from "@/platform/types";
import type { AureliusOutputContract } from "@/aurelius/validation/OutputContract";

const REPORTS_KEY = "cyntra_reports";
let memoryCache: StoredReport[] | null = null;

export interface StoredReport {
  id: string;
  sessionId: string;
  report: StrategicReport;
  organizationName?: string;
  result?: AureliusOutputContract;
  savedAt: string;
  isArchived?: boolean;
  archivedAt?: string;
  archiveReason?: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): StoredReport[] {
  if (memoryCache) {
    return [...memoryCache];
  }
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReport[];
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map((item) => {
        const sessionId = String(item?.sessionId || item?.id || item?.report?.session_id || "").trim();
        const reportId = String(item?.id || item?.report?.report_id || sessionId).trim();
        const report = item?.report;
        if (!sessionId || !report?.report_body) return null;
        return {
          id: reportId || sessionId,
          sessionId,
          report,
          organizationName: String(item?.organizationName || "").trim() || undefined,
          result: item?.result,
          savedAt: String(item?.savedAt || item?.report?.generated_at || new Date().toISOString()),
          isArchived: Boolean(item?.isArchived),
          archivedAt: String(item?.archivedAt || "").trim() || undefined,
          archiveReason: String(item?.archiveReason || "").trim() || undefined,
        } satisfies StoredReport;
      })
      .filter((item): item is StoredReport => Boolean(item));
    const dedup = new Map<string, StoredReport>();
    for (const item of normalized) {
      dedup.set(item.id, item);
    }
    memoryCache = Array.from(dedup.values()).sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
    return [...memoryCache];
  } catch {
    return [];
  }
}

function write(rows: StoredReport[]): void {
  memoryCache = [...rows];
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(rows));
  } catch {
    // Ignore local storage write failures.
  }
}

export function saveReport(
  sessionId: string,
  report: StrategicReport,
  meta?: { organizationName?: string; result?: AureliusOutputContract }
): StoredReport {
  const nextItem: StoredReport = {
    id: String(report.report_id || sessionId),
    sessionId,
    report,
    organizationName: meta?.organizationName,
    result: meta?.result,
    savedAt: new Date().toISOString(),
    isArchived: false,
  };
  const rows = read().filter((item) => item.id !== nextItem.id && item.sessionId !== sessionId);
  const next = [nextItem, ...rows].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  write(next);
  return nextItem;
}

export function getReports(): StoredReport[] {
  return read();
}

export function getReport(sessionId: string): StoredReport | undefined {
  return read().find((item) => item.sessionId === sessionId || item.id === sessionId);
}

export function archiveReport(sessionId: string, reason = "manual_archive"): StoredReport | null {
  const rows = read();
  const now = new Date().toISOString();
  let archived: StoredReport | null = null;
  const next = rows.map((item) => {
    if (item.sessionId !== sessionId && item.id !== sessionId) return item;
    archived = {
      ...item,
      isArchived: true,
      archivedAt: now,
      archiveReason: reason,
    };
    return archived;
  });
  write(next);
  return archived;
}

export function restoreReport(sessionId: string): StoredReport | null {
  const rows = read();
  let restored: StoredReport | null = null;
  const next = rows.map((item) => {
    if (item.sessionId !== sessionId && item.id !== sessionId) return item;
    restored = {
      ...item,
      isArchived: false,
      archivedAt: undefined,
      archiveReason: undefined,
    };
    return restored;
  });
  write(next);
  return restored;
}

export function deleteReport(sessionId: string): boolean {
  const rows = read();
  const next = rows.filter((item) => item.sessionId !== sessionId && item.id !== sessionId);
  write(next);
  return next.length !== rows.length;
}
