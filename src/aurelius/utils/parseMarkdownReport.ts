// ============================================================
// src/aurelius/utils/parseMarkdownReport.ts
// AURELIUS — MARKDOWN REPORT PARSER (CANON)
// ============================================================

/* =========================
   CANONICAL RESULT TYPE
========================= */

export interface ParsedMarkdownReport {
  executive_summary?: string;
  insights?: string[];
  risks?: string[];
  opportunities?: string[];
}

/* =========================
   PARSER
========================= */

export function parseMarkdownReport(
  markdown: string
): ParsedMarkdownReport {
  const lines = markdown.split("\n");

  const result: ParsedMarkdownReport = {};
  let section: keyof ParsedMarkdownReport | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    /* =========================
       SECTION DETECTION
    ========================= */

    if (/^#{1,3}\s*Executive Summary/i.test(line)) {
      section = "executive_summary";
      result.executive_summary = "";
      continue;
    }

    if (/^#{1,3}\s*(Insights|Inzichten)/i.test(line)) {
      section = "insights";
      result.insights = [];
      continue;
    }

    if (/^#{1,3}\s*(Risks|Risico)/i.test(line)) {
      section = "risks";
      result.risks = [];
      continue;
    }

    if (/^#{1,3}\s*(Opportunities|Kansen)/i.test(line)) {
      section = "opportunities";
      result.opportunities = [];
      continue;
    }

    /* =========================
       CONTENT PARSING
    ========================= */

    if (section === "executive_summary") {
      result.executive_summary +=
        (result.executive_summary ? "\n" : "") + line;
      continue;
    }

    if (
      section &&
      Array.isArray(result[section])
    ) {
      (result[section] as string[]).push(
        line.replace(/^[-*•]\s*/, "")
      );
    }
  }

  return result;
}
