import type { AnalysisSession, DeliveredReport, StrategicReport } from "./types";
import { normalize } from "./storage";
import { buildStyledReportPdfDataUri, metaFromSession } from "@/services/reportPdf";

function safeFilename(value: string): string {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rapport";
}

function sessionFileBase(session: AnalysisSession): string {
  const org = safeFilename(session.organization_name || "organisatie");
  const sess = safeFilename(session.session_id || "sessie");
  return `${org}-${sess}`;
}

function extractSection(report: string, headingNumber: number): string {
  const regex = new RegExp(`^${headingNumber}\\.\\s+[^\\n]+$`, "m");
  const match = report.match(regex);
  if (!match || match.index == null) return "";
  const start = match.index + match[0].length;
  const nextRegex = /\n\d\.\s+[^\n]+/g;
  nextRegex.lastIndex = start;
  const next = nextRegex.exec(report);
  const end = next?.index ?? report.length;
  return report.slice(start, end).trim();
}

function humanPdfFilename(session: AnalysisSession): string {
  const org = normalize(session.organization_name || "Organisatie").replace(/[\\/:*?"<>|]/g, "").trim() || "Organisatie";
  return `Bestuurlijke Analyse & Interventie - ${org}.pdf`;
}

function sanitizeForDelivery(value: string): string {
  const text = normalize(value);
  if (!text) return "";
  const markers: RegExp[] = [
    /\bbron\s*:/i,
    /\bnotes\b/i,
    /\baction items\b/i,
    /\bwhat are the top 5\b/i,
    /\bread more\b/i,
  ];
  let cutIndex = text.length;
  for (const marker of markers) {
    const match = marker.exec(text);
    if (!match || match.index == null) continue;
    cutIndex = Math.min(cutIndex, match.index);
  }
  return text.slice(0, cutIndex).replace(/\n{3,}/g, "\n\n").trim();
}

async function toPdfLikeText(session: AnalysisSession): Promise<string> {
  if (typeof window === "undefined") {
    return sanitizeForDelivery(session.board_report || "Geen rapportinhoud beschikbaar.");
  }

  const report: StrategicReport = {
    report_id: session.session_id,
    session_id: session.session_id,
    organization_id: session.organization_name || session.organization_id || "Organisatie",
    title: session.organization_name || session.organization_id || "Organisatie",
    sections: [],
    generated_at: session.analyse_datum || new Date().toISOString(),
    report_body: sanitizeForDelivery(session.board_report || "Geen rapportinhoud beschikbaar."),
  };

  try {
    return await buildStyledReportPdfDataUri({
      title: "Bestuurlijke Analyse & Interventie",
      subtitle: "Cyntra Executive Dossier",
      reportBody: report.report_body,
      meta: metaFromSession(session),
      sourceReport: report,
    });
  } catch {
    return sanitizeForDelivery(session.board_report || "Geen rapportinhoud beschikbaar.");
  }
}

export class ReportDeliveryService {
  readonly name = "Report Delivery Service";

  createExecutiveSummary(session: AnalysisSession): DeliveredReport {
    const report = sanitizeForDelivery(session.board_report || "");
    const summary = [
      "Executive Summary",
      extractSection(report, 1),
      extractSection(report, 2),
      extractSection(report, 5),
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    return {
      session_id: session.session_id,
      filename: `${sessionFileBase(session)}-executive-summary.txt`,
      mime_type: "text/plain",
      content: sanitizeForDelivery(summary) || "Executive summary niet beschikbaar.",
      generated_at: new Date().toISOString(),
    };
  }

  createBoardMemo(session: AnalysisSession): DeliveredReport {
    const report = sanitizeForDelivery(session.board_report || "");
    const memo = [
      "Board Memo",
      extractSection(report, 2),
      extractSection(report, 4),
      extractSection(report, 6),
      extractSection(report, 9),
    ]
      .filter(Boolean)
      .join("\n\n")
      .trim();

    return {
      session_id: session.session_id,
      filename: `${sessionFileBase(session)}-board-memo.txt`,
      mime_type: "text/plain",
      content: sanitizeForDelivery(memo) || "Board memo niet beschikbaar.",
      generated_at: new Date().toISOString(),
    };
  }

  async createPdf(session: AnalysisSession): Promise<DeliveredReport> {
    const content = await toPdfLikeText(session);
    return {
      session_id: session.session_id,
      filename: humanPdfFilename(session),
      mime_type: content.startsWith("data:application/pdf") ? "application/pdf" : "text/plain",
      content,
      generated_at: new Date().toISOString(),
    };
  }
}
