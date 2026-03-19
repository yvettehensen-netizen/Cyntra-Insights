import type { StrategicReport } from "@/platform/types";
import type { BoardroomDocument } from "@/types/BoardroomDocument";
import type { StrategicReport as CanonicalStrategicReport } from "@/types/StrategicReport";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Delay revoke to avoid races in Safari/strict browser policies.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function toCsvRow(values: string[]): string {
  return values
    .map((value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    })
    .join(",");
}

function normalizeOrganizationName(value: unknown): string {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^org-[a-z0-9-]+$/i.test(text) || /^(seeded-report|upload|onbekend)$/i.test(text)) {
    return "";
  }
  return text;
}

export async function exportPDF(
  report: StrategicReport,
  filenameBase?: string,
  options?: {
    organizationName?: string;
    sector?: string;
    analysisType?: string;
    documentType?: string;
    generatedAt?: string;
    rawInput?: string;
    titleOverride?: string;
    subtitle?: string;
    preview?: boolean;
    download?: boolean;
    previewWindow?: Window | null;
    canonicalReport?: CanonicalStrategicReport;
    boardroomDocument?: BoardroomDocument;
  }
): Promise<void> {
  const { downloadStyledReportPdf, metaFromReport } = await import("./reportPdf");
  const filename = filenameBase ? `${filenameBase}.pdf` : `cyntra_report_${report.session_id}.pdf`;
  const normalizedOrganizationName =
    normalizeOrganizationName(options?.organizationName) ||
    normalizeOrganizationName(report.organization_id) ||
    normalizeOrganizationName(report.title) ||
    "Organisatie";
  const shouldPreview = options?.preview !== false;
  const previewWindow =
    options?.previewWindow ??
    (typeof window !== "undefined" && shouldPreview
      ? window.open("", "_blank")
      : null);
  if (previewWindow) {
    try {
      previewWindow.opener = null;
      previewWindow.document.title = filename;
      previewWindow.document.body.innerHTML = '<div style="font-family: Georgia, serif; padding: 32px; color: #142030; background: #f8f7f4;">PDF wordt voorbereid...</div>';
    } catch {
      // Ignore cross-context access issues; the window is only a preview host.
    }
  }
  await downloadStyledReportPdf({
    filename,
    title: options?.titleOverride || `Cyntra Executive Dossier — ${normalizedOrganizationName}`,
    subtitle: options?.subtitle || "Bestuurlijk analyse- en besluitdocument",
    reportBody: report.report_body || "Geen rapportinhoud beschikbaar.",
    meta: metaFromReport(report, options),
    sourceStrategicReport: options?.canonicalReport,
    sourceBoardroomDocument: options?.boardroomDocument,
    previewWindow,
    skipDownload: options?.download === false,
  });
}

export async function createPdfPreviewUrl(
  report: StrategicReport,
  options?: {
    organizationName?: string;
    sector?: string;
    analysisType?: string;
    documentType?: string;
    generatedAt?: string;
    rawInput?: string;
    titleOverride?: string;
    subtitle?: string;
    canonicalReport?: CanonicalStrategicReport;
    boardroomDocument?: BoardroomDocument;
  }
): Promise<string> {
  const { buildStyledReportPdfBlob, metaFromReport } = await import("./reportPdf");
  const normalizedOrganizationName =
    normalizeOrganizationName(options?.organizationName) ||
    normalizeOrganizationName(report.organization_id) ||
    normalizeOrganizationName(report.title) ||
    "Organisatie";
  const pdfOutput = await buildStyledReportPdfBlob({
    title: options?.titleOverride || `Cyntra Executive Dossier — ${normalizedOrganizationName}`,
    subtitle: options?.subtitle || "Bestuurlijk analyse- en besluitdocument",
    reportBody: report.report_body || "Geen rapportinhoud beschikbaar.",
    meta: metaFromReport(report, options),
    sourceStrategicReport: options?.canonicalReport,
    sourceBoardroomDocument: options?.boardroomDocument,
  });
  const pdfBlob = pdfOutput instanceof Blob ? pdfOutput : new Blob([pdfOutput], { type: "application/pdf" });
  return URL.createObjectURL(pdfBlob);
}

export function exportCSV(report: StrategicReport, filenameBase?: string): void {
  const filename = filenameBase ? `${filenameBase}.csv` : `cyntra_report_${report.session_id}.csv`;
  const header = toCsvRow(["session_id", "title", "generated_at", "sections", "report_body"]);
  const body = toCsvRow([
    report.session_id,
    report.title,
    report.generated_at,
    (report.sections || []).join(" | "),
    report.report_body,
  ]);
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename);
}

export function exportJSON(report: StrategicReport, filenameBase?: string): void {
  const filename = filenameBase ? `${filenameBase}.json` : `cyntra_report_${report.session_id}.json`;
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
  triggerDownload(blob, filename);
}
