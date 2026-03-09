import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { EmptyState, PageShell, Panel } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode, formatReportShortDate } from "./reportIdentity";
import type { StrategicReport } from "@/platform/types";
import BoardroomView from "@/components/reports/BoardroomView";
import type { BoardIntervention, ReportTabKey, ReportSection, ReportViewModel } from "@/components/reports/types";
import { useAnalysisStore } from "@/state/analysisStore";
import { getReports as getStoredReports, saveReport as persistReport } from "@/services/reportStorage";
import { exportCSV, exportJSON, exportPDF } from "@/services/exportService";
import { parseContactLines } from "@/services/reportPdf";

const StrategyReportView = lazy(() => import("@/components/reports/StrategyReportView"));
const EngineAnalysisView = lazy(() => import("@/components/reports/EngineAnalysisView"));

function downloadReport(file: { filename: string; mime_type: string; content: string }) {
  const isDataUri = file.content.startsWith("data:");
  const href = isDataUri ? file.content : URL.createObjectURL(new Blob([file.content], { type: file.mime_type }));
  const link = document.createElement("a");
  link.href = href;
  link.download = file.filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (!isDataUri) {
    // Some browsers need the blob URL for a short period after click.
    setTimeout(() => URL.revokeObjectURL(href), 1500);
  }
}

function fmtDate(value?: string) {
  return formatReportShortDate(value);
}

function sanitizeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeDownloadSlug(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rapport";
}

function cleanPlaceholderText(value: string): string {
  return String(value || "")
    .split("\n")
    .filter((line) => !/Placeholder toegevoegd door NarrativeStructureGuard/i.test(line))
    .join("\n")
    .trim();
}

function sanitizeDisplayText(value: string): string {
  const text = cleanPlaceholderText(String(value || ""));
  if (!text) return "";
  const markers: RegExp[] = [
    /\bbron\s*:/i,
    /\bnotes\b/i,
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

type MemoSection = { title: string; body: string };

type ReportPresentationMeta = {
  sector: string;
  contactLines: string[];
};

function parseMemoSections(value: string): MemoSection[] {
  const text = sanitizeDisplayText(value);
  if (!text) return [];
  const headings = [
    "EXECUTIVE SAMENVATTING",
    "BESTUURLIJKE HYPOTHESE",
    "FEITENBASIS",
    "KILLER INSIGHTS",
    "STRATEGISCHE INTERVENTIES",
    "90 DAGEN ACTIEPLAN",
    "VROEGSIGNALERING",
    "BESTUURLIJKE VRAAG",
    "BESTUURLIJKE ANALYSE & INTERVENTIE",
    "DOMINANTE THESE",
    "DOMINANT MECHANISM",
    "BOARDROOM INSIGHT",
    "MISDIAGNOSIS INSIGHT",
    "STRATEGISCH CONFLICT",
    "BESTUURLIJKE KEUZE",
    "KEERZIJDE VAN DE KEUZE",
    "INTERVENTIES",
    "SCENARIO: GEEN INTERVENTIE",
    "WIJ BESLUITEN",
    "BOARDROOM QUESTION",
    "APPENDIX",
    "BESLISNOTA RvT / MT",
    "Bestuurlijke hypothese",
    "Feitenbasis",
    "Killer insights",
    "Kernconflict (A/B keuze)",
    "Besluitvoorstel",
    "Consequenties",
    "Opvolging 90 dagen",
    "Open vragen",
    "Killer insight",
    "STRATEGIC CONFLICT",
    "STRATEGIC PATTERN",
    "STRATEGY SIMULATION",
    "DECISION MEMORY",
    "EARLY WARNING SYSTEM",
    "BOARDROOM COACH",
    "SCENARIO: GEEN INTERVENTIE",
    "BESTUURLIJKE KEUZE",
    "STRATEGISCHE VRAAG",
  ];
  const escaped = headings.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`^(${escaped})\\s*$`, "gmi");
  const matches = Array.from(text.matchAll(pattern));
  if (!matches.length) return [{ title: "Board memo", body: text }];

  const sections: MemoSection[] = [];
  for (let idx = 0; idx < matches.length; idx += 1) {
    const match = matches[idx];
    const next = matches[idx + 1];
    const title = String(match[1] || "").trim();
    const start = (match.index || 0) + match[0].length;
    const end = next?.index ?? text.length;
    const body = text.slice(start, end).trim();
    sections.push({ title, body });
  }
  return sections.filter((item) => item.title || item.body);
}

function getMemoSectionBody(sections: MemoSection[], title: string): string {
  return sections.find((section) => section.title.toUpperCase() === title.toUpperCase())?.body?.trim() || "";
}

function extractStrategyAlert(text: string): string {
  const normalized = sanitizeDisplayText(text);
  if (!normalized) return "";
  const match = normalized.match(/STRATEGIE ALERT[\s\S]*?(?=\n[A-Z][A-Z :/()-]{3,}\n|$)/i);
  return match?.[0]?.trim() || "";
}

async function copyText(value: string): Promise<boolean> {
  const text = String(value || "").trim();
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  return ok;
}

function buildPresentationMeta(input: { sector?: string; rawInput?: string }): ReportPresentationMeta {
  return {
    sector: sanitizeDisplayText(String(input.sector || "")) || "Onbekende sector",
    contactLines: parseContactLines(input.rawInput).slice(0, 4),
  };
}

function deriveReportDeckSubtitle(sector: string): string {
  const value = String(sector || "").toLowerCase();
  if (value.includes("zorg") || value.includes("ggz")) {
    return "Besluitdocument voor directie, bestuur en RvT met focus op kwaliteit, schaal en bestuurlijke keuze.";
  }
  if (value.includes("industrie")) {
    return "Besluitdocument voor directie en toezicht met focus op schaal, marge en uitvoeringsdiscipline.";
  }
  if (value.includes("logistiek")) {
    return "Besluitdocument voor directie en toezicht met focus op ketenregie, capaciteit en prioritering.";
  }
  return "Besluitdocument voor directie, bestuurders en toezichthouders met focus op scherpe strategische keuzes.";
}

function parseBlockedFlags(errorMessage?: string): string[] {
  const text = String(errorMessage || "");
  const match = text.match(/Publicatie geblokkeerd:\s*(.+)$/i);
  if (!match?.[1]) return [];
  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

const CRITICAL_FLAG_SET = new Set([
  "missing_killer_insight_engine",
  "missing_boardroom_pressure_scenario",
  "missing_decision_pressure_block",
  "missing_strategic_framing",
  "missing_strategic_conflict_engine",
  "missing_strategic_conflict_choice",
  "missing_forcing_choice",
  "missing_strategic_pattern",
  "missing_strategy_simulation",
  "missing_boardroom_coach",
  "missing_boardroom_assumptions",
  "missing_boardroom_decision_pressure",
  "interventions_not_measurable",
]);

function splitGateFlags(flags: string[]): { critical: string[]; nonCritical: string[] } {
  const unique = Array.from(new Set((flags || []).map((item) => String(item).trim()).filter(Boolean)));
  return {
    critical: unique.filter((item) => CRITICAL_FLAG_SET.has(item)),
    nonCritical: unique.filter((item) => !CRITICAL_FLAG_SET.has(item)),
  };
}

function deriveQualityForView(input: {
  score?: number;
  tier?: string;
  summary?: string;
  memo?: string;
  reportBody?: string;
}): { score: number; tier: "premium" | "standard" | "low" } {
  if (typeof input.score === "number" && Number.isFinite(input.score) && input.tier) {
    const tier =
      input.tier === "premium" || input.tier === "standard" || input.tier === "low"
        ? (input.tier as "premium" | "standard" | "low")
        : input.score >= 80
          ? "premium"
          : input.score >= 60
            ? "standard"
            : "low";
    return { score: Math.max(0, Math.min(100, Math.round(input.score))), tier };
  }

  let score = 70;
  const memo = String(input.memo || "");
  const report = String(input.reportBody || "");
  const summary = String(input.summary || "");
  if (/Bestuurlijke hypothese|Feitenbasis|Besluitvoorstel|Consequenties|Opvolging 90 dagen/i.test(memo)) score += 15;
  if (/output 1\b|context layer|diagnosis layer|mechanism layer|decision layer/i.test(memo)) score -= 30;
  if (summary.length > 120) score += 5;
  if (report.length < 900) score -= 10;
  const bounded = Math.max(0, Math.min(100, score));
  return { score: bounded, tier: bounded >= 80 ? "premium" : bounded >= 60 ? "standard" : "low" };
}

function evaluateBoardMemoQuality(memo: string, _reportBody: string): {
  level: "hoog" | "middel" | "laag";
  checks: string[];
} {
  const memoSource = String(memo || "").trim();
  const source = memoSource
    .replace(/\[meeting,\s*\d{2}-\d{2}-\d{4}\]/gi, "")
    .toLowerCase();
  const checks: string[] = [];

  if (/bestuurlijke hypothese|dominante strategische these/.test(source)) checks.push("These aanwezig");
  if (/kernconflict|kernspanning|a:\s|b:\s/.test(source)) checks.push("Kernconflict expliciet");
  if (/mechanisme|waardoor|leidt tot|daardoor/.test(source)) checks.push("Mechanistische redenering");
  if (/kpi|deadline|owner|eigenaar|escalatie/.test(source)) checks.push("Besluitdwang met KPI/owner");
  if (/interventie|board interventies|90-dagen|opvolging 90 dagen/.test(source)) checks.push("Interventielijn aanwezig");

  const hasOperationalNoise = /\btraining\b|\bworkshop\b|\bmeeting\b|\bprocesverbetering\b|\bwekelijkse ritmiek\b/.test(source);
  if (hasOperationalNoise) checks.push("Let op: operationele taal gedetecteerd");

  if (checks.length >= 5 && !hasOperationalNoise) return { level: "hoog", checks };
  if (checks.length >= 4) return { level: "middel", checks };
  return { level: "laag", checks };
}

function normalizeInline(text: string): string {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function extractBoardOptions(body: string): string[] {
  const text = String(body || "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  const options = Array.from(text.matchAll(/(?:^|\s)([ABC])\s+(.+?)(?=(?:\s[ABC]\s+)|Aanbevolen optie:|$)/g)).map((match) =>
    normalizeInline(`${match[1]} ${match[2]}`),
  );
  return Array.from(new Set(options)).slice(0, 3);
}

function extractRecommendedDirection(body: string, options: string[], executiveSummary: string): string {
  const choice = String(body || executiveSummary || "").match(/Aanbevolen optie:?\s*(?:Optie\s*)?([ABC])/i)?.[1]?.toUpperCase();
  if (choice) {
    const option = options.find((item) => item.startsWith(choice));
    return option ? `${choice} — ${option.slice(2).trim()}` : `${choice} — aanbevolen richting`;
  }
  return options[0] || normalizeInline(body).slice(0, 160);
}

function extractTopInterventions(interventionsBody: string, predictions: any[]): BoardIntervention[] {
  const body = String(interventionsBody || "");
  const parsed = Array.from(
    body.matchAll(/Interventie\s+\d+\s*\|\s*Actie:\s*(.+?)\s+Mechanisme:\s*(.+?)\s+KPI:\s*(.+?)(?=Interventie\s+\d+\s*\||$)/gis),
  ).map((match) => ({
    title: normalizeInline(match[1]),
    mechanism: normalizeInline(match[2]),
    kpi: normalizeInline(match[3]),
  }));
  if (parsed.length) return parsed.slice(0, 3);
  return (predictions || []).slice(0, 3).map((row: any) => ({
    title: normalizeInline(row.interventie || row.title || "Onbekende interventie"),
    mechanism: normalizeInline(row.impact || row.mechanism || ""),
    kpi: normalizeInline(row.kpi_effect || row.kpi || ""),
  }));
}

function compactBoardQuestion(text: string): string {
  const normalized = normalizeInline(text);
  if (!normalized) return "";
  const match = normalized.match(/maar[:\s]+(.+)$/i);
  return normalizeInline(match?.[1] || normalized);
}

function compactNoIntervention(text: string): string {
  return normalizeInline(String(text || "")).slice(0, 260);
}

function buildStrategySections(reportSections: MemoSection[], memoSections: MemoSection[]): ReportSection[] {
  const source = reportSections.length ? reportSections : memoSections;
  const preferredTitles = [
    "EXECUTIVE SAMENVATTING",
    "BESTUURLIJKE HYPOTHESE",
    "FEITENBASIS",
    "STRATEGISCH CONFLICT",
    "KILLER INSIGHTS",
    "STRATEGISCHE INTERVENTIES",
    "90 DAGEN ACTIEPLAN",
    "VROEGSIGNALERING",
  ];
  return preferredTitles
    .map((title) => source.find((section) => section.title.toUpperCase() === title.toUpperCase()))
    .filter((section): section is MemoSection => Boolean(section && section.body))
    .map((section) => ({ title: section.title, body: section.body }));
}

function buildEngineSections(memoSections: MemoSection[]): ReportSection[] {
  const excluded = new Set([
    "EXECUTIVE SAMENVATTING",
    "BESTUURLIJKE HYPOTHESE",
    "FEITENBASIS",
    "KILLER INSIGHTS",
    "STRATEGISCHE INTERVENTIES",
    "90 DAGEN ACTIEPLAN",
    "VROEGSIGNALERING",
    "DOMINANTE THESE",
    "DOMINANT MECHANISM",
    "BOARDROOM INSIGHT",
    "MISDIAGNOSIS INSIGHT",
    "STRATEGISCH CONFLICT",
    "BESTUURLIJKE KEUZE",
    "KEERZIJDE VAN DE KEUZE",
    "INTERVENTIES",
    "SCENARIO: GEEN INTERVENTIE",
    "WIJ BESLUITEN",
    "BOARDROOM QUESTION",
    "Bestuurlijke hypothese",
    "Killer insights",
    "Kernconflict (A/B keuze)",
    "Feitenbasis",
    "Besluitvoorstel",
  ]);
  return memoSections
    .filter((section) => section.body && !excluded.has(section.title))
    .map((section) => ({ title: section.title, body: section.body }));
}

export default function StrategischRapportSaaSPage() {
  const location = useLocation();
  const api = usePlatformApiBridge();
  const [sessions, setSessions] = useState<any[]>([]);
  const analyses = useAnalysisStore((state) => state.getAnalyses());
  const [hint, setHint] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showAllReports, setShowAllReports] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Record<string, ReportTabKey>>({});
  const [archiving, setArchiving] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(true);

  async function load() {
    const rows = await api.listSessions(undefined, { includeArchived: false });
    setSessions((rows || []).filter((row: any) => row.status === "voltooid" || row.status === "fout"));
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const initial = (location.state as { sessionId?: string } | null)?.sessionId;
    if (initial) setSelectedSessionId(initial);
  }, [location.state]);

  async function handleSummary(sessionId: string) {
    const file = await api.executiveSummary(sessionId);
    const session = mergedReports.find((row) => row.sessionId === sessionId);
    const filename = `${safeDownloadSlug(session?.organizationName || "organisatie")}-${safeDownloadSlug(sessionId)}-executive-summary.txt`;
    const cleanedContent = sanitizeDisplayText(file.content);
    downloadReport({ ...file, filename, content: cleanedContent || file.content });
    setHint(`Executive summary gedownload voor ${sessionId}`);
  }

  async function handleMemo(sessionId: string) {
    const file = await api.boardMemo(sessionId);
    const session = mergedReports.find((row) => row.sessionId === sessionId);
    const cleanedContent = sanitizeDisplayText(file.content);
    const fallbackMemo = sanitizeDisplayText(session?.boardMemo || "");
    const filename = `${safeDownloadSlug(session?.organizationName || "organisatie")}-${safeDownloadSlug(sessionId)}-board-memo.txt`;
    downloadReport({
      ...file,
      filename,
      content: cleanedContent || fallbackMemo || file.content,
    });
    setHint(`Board memo gedownload voor ${sessionId}`);
  }

  async function handlePdf(sessionId: string) {
    const file = await api.pdf(sessionId);
    downloadReport(file);
    setHint(`PDF gegenereerd voor ${sessionId}`);
  }

  async function handleArchiveLegacy() {
    setArchiving(true);
    try {
      const result = await api.archiveOldSessions(6);
      setHint(`${result.archived} oude rapporten gearchiveerd. ${result.kept} recente rapporten actief.`);
      await load();
      setShowAllReports(false);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Archiveren mislukt.");
    } finally {
      setArchiving(false);
    }
  }

  function handlePrint(session: {
    sessionId: string;
    executiveSummary: string;
    boardMemo: string;
    report?: StrategicReport;
  }) {
    const reportBody = sanitizeDisplayText(String(session.report?.report_body || "").trim());
    const content =
      reportBody ||
      [sanitizeDisplayText(session.executiveSummary), sanitizeDisplayText(session.boardMemo)]
        .filter(Boolean)
        .join("\n\n");
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!popup) {
      setHint("Printen geblokkeerd door browser. Sta pop-ups toe.");
      return;
    }
    const title = `Strategisch rapport ${session.sessionId}`;
    popup.document.write(
      `<!doctype html><html><head><title>${sanitizeHtml(title)}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;line-height:1.5;color:#111;}
      h1{font-size:20px;margin-bottom:12px;}
      pre{white-space:pre-wrap;font:14px/1.5 Arial,sans-serif;}
      </style></head><body><h1>${sanitizeHtml(title)}</h1><pre>${sanitizeHtml(content || "Geen rapportinhoud beschikbaar.")}</pre></body></html>`
    );
    popup.document.close();
    popup.focus();
    popup.print();
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    let imported = 0;
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      try {
        const text = await file.text();
        let parsed: Record<string, unknown> | null = null;
        if (/\.json$/i.test(file.name)) {
          try {
            parsed = JSON.parse(text) as Record<string, unknown>;
          } catch {
            parsed = null;
          }
        }
        const sessionId = String(parsed?.session_id || `upload-${Date.now()}-${index + 1}`);
        const reportBody = sanitizeDisplayText(String(parsed?.report_body || parsed?.report || text || "").trim());
        if (!reportBody) continue;
        const report: StrategicReport = {
          report_id: String(parsed?.report_id || `report-${sessionId}`),
          session_id: sessionId,
          organization_id: String(parsed?.organization_id || "upload"),
          title: String(parsed?.title || `Geupload rapport ${sessionId}`),
          sections: Array.isArray(parsed?.sections)
            ? (parsed.sections as unknown[]).map((item) => String(item ?? "").trim()).filter(Boolean)
            : [],
          generated_at: String(parsed?.generated_at || new Date().toISOString()),
          report_body: reportBody,
        };
        persistReport(sessionId, report);
        imported += 1;
        if (!selectedSessionId) setSelectedSessionId(sessionId);
      } catch {
        // Ignore invalid upload files and continue.
      }
    }
    setHint(imported ? `${imported} rapport(en) geupload.` : "Geen geldige rapportbestanden gevonden.");
  }

  const mergedReports = (() => {
    const fromApi = sessions
      .filter((row: any) => row?.session_id)
      .map((row: any) => ({
        sessionId: String(row.session_id),
        organizationName: String(row.organization_name || row.organisatie_naam || "Onbekende organisatie"),
        sector: String(row.strategic_metadata?.sector || ""),
        rawInput: String(row.input_data || ""),
        sourceType: "analysis" as const,
        createdAt: String(row.updated_at || row.analyse_datum || new Date().toISOString()),
        executiveSummary: sanitizeDisplayText(String(row.executive_summary || "")),
        boardMemo: sanitizeDisplayText(String(row.board_memo || "")),
        analysisRuntimeMs: Number(row.analysis_runtime_ms || 0),
        engineMode: String(row.engine_mode || ""),
        qualityScore: Number(row.quality_score || 0),
        qualityTier: String(row.quality_tier || ""),
        qualityFlags: Array.isArray(row.quality_flags) ? row.quality_flags : [],
        status: String(row.status || "voltooid"),
        errorMessage: String(row.error_message || ""),
        interventions: row.intervention_predictions || [],
        mvpEngine: row.strategic_metadata?.mvp_engine || null,
        strategicAgent: row.strategic_agent || null,
        report:
          (row.strategic_report as StrategicReport | undefined) ||
          (row.board_report
            ? ({
                report_id: `report-${row.session_id}`,
                session_id: String(row.session_id),
                organization_id: String(row.organization_id || "onbekend"),
                title: `Cyntra Executive Dossier — ${row.organization_name || row.organisatie_naam || "Organisatie"} — ${row.session_id}`,
                sections: [],
                generated_at: String(row.updated_at || row.analyse_datum || new Date().toISOString()),
                report_body: sanitizeDisplayText(String(row.board_report || "")),
              } satisfies StrategicReport)
            : undefined),
      }));
    const fromStore = analyses
      .filter((item) => item.report)
      .map((item) => ({
        sessionId: item.id,
        organizationName: item.organization || "Onbekende organisatie",
        sector: "",
        rawInput: "",
        sourceType: "analysis" as const,
        createdAt: item.createdAt,
        executiveSummary: "",
        boardMemo: "",
        analysisRuntimeMs: 0,
        engineMode: "",
        qualityScore: 0,
        qualityTier: "",
        qualityFlags: [],
        status: "voltooid",
        errorMessage: "",
        interventions: item.interventions || [],
        mvpEngine: null,
        strategicAgent: null,
        report: item.report,
      }));
    const fromStorage = getStoredReports().map((item) => ({
      sessionId: item.sessionId,
      organizationName: String(item.report?.organization_id || "Geuploade bron"),
      sector: "",
      rawInput: "",
      sourceType: /^Geupload rapport/i.test(String(item.report?.title || "")) ? ("upload" as const) : ("analysis" as const),
      createdAt: item.savedAt,
      executiveSummary: "",
      boardMemo: "",
      analysisRuntimeMs: 0,
      engineMode: "",
      qualityScore: 0,
      qualityTier: "",
      qualityFlags: [],
      status: "voltooid",
      errorMessage: "",
      interventions: [],
      mvpEngine: null,
        strategicAgent: null,
        report: item.report,
      }));
    const dedup = new Map<string, (typeof fromApi)[number]>();
    for (const row of [...fromApi, ...fromStore, ...fromStorage]) {
      const existing = dedup.get(row.sessionId);
      if (!existing) {
        dedup.set(row.sessionId, row);
        continue;
      }
      dedup.set(row.sessionId, {
        sessionId: row.sessionId,
        organizationName: existing.organizationName || row.organizationName,
        sourceType: existing.sourceType === "analysis" ? existing.sourceType : row.sourceType,
        createdAt: existing.createdAt < row.createdAt ? row.createdAt : existing.createdAt,
        sector: existing.sector || row.sector,
        rawInput: existing.rawInput || row.rawInput,
        executiveSummary: existing.executiveSummary || row.executiveSummary,
        boardMemo: existing.boardMemo || row.boardMemo,
        interventions: (existing.interventions || []).length ? existing.interventions : row.interventions,
        mvpEngine: existing.mvpEngine || row.mvpEngine,
        strategicAgent: existing.strategicAgent || row.strategicAgent,
        analysisRuntimeMs: existing.analysisRuntimeMs || row.analysisRuntimeMs,
        engineMode: existing.engineMode || row.engineMode,
        qualityScore: existing.qualityScore || row.qualityScore,
        qualityTier: existing.qualityTier || row.qualityTier,
        qualityFlags: (existing.qualityFlags || []).length ? existing.qualityFlags : row.qualityFlags,
        status: existing.status === "fout" ? "fout" : row.status,
        errorMessage: existing.errorMessage || row.errorMessage,
        report: existing.report || row.report,
      });
    }
    return Array.from(dedup.values())
      .map((row) => {
        const quality = deriveQualityForView({
          score: row.qualityScore,
          tier: row.qualityTier,
          summary: sanitizeDisplayText(row.executiveSummary),
          memo: sanitizeDisplayText(row.boardMemo),
          reportBody: sanitizeDisplayText(row.report?.report_body || ""),
        });
        return {
          ...row,
          executiveSummary: sanitizeDisplayText(row.executiveSummary),
          boardMemo: sanitizeDisplayText(row.boardMemo),
          report: row.report
            ? {
                ...row.report,
                report_body: sanitizeDisplayText(String(row.report.report_body || "")),
              }
            : row.report,
          presentationMeta: buildPresentationMeta({
            sector: row.sector,
            rawInput: row.rawInput,
          }),
          qualityScore: quality.score,
          qualityTier: quality.tier,
        };
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  })();
  const blockedReports = mergedReports.filter((row) => row.status === "fout" && /Publicatie geblokkeerd/i.test(row.errorMessage || ""));
  const filteredReports = premiumOnly ? mergedReports.filter((row) => row.qualityTier === "premium" && row.status !== "fout") : mergedReports.filter((row) => row.status !== "fout");
  const analysisReports = filteredReports.filter((row) => row.sourceType !== "upload");
  const uploadReports = filteredReports.filter((row) => row.sourceType === "upload");
  const visibleAnalysisReports = showAllReports ? analysisReports : analysisReports.slice(0, 8);
  const visibleUploadReports = showAllReports ? uploadReports : uploadReports.slice(0, 8);

  function buildViewModel(session: (typeof mergedReports)[number]): ReportViewModel {
    const memoSections = parseMemoSections(cleanPlaceholderText(session.boardMemo || ""));
    const reportSections = parseMemoSections(cleanPlaceholderText(session.report?.report_body || ""));
    const reportExecutive = getMemoSectionBody(reportSections, "EXECUTIVE SAMENVATTING");
    const reportHypothesis = getMemoSectionBody(reportSections, "BESTUURLIJKE HYPOTHESE");
    const reportConflict = getMemoSectionBody(reportSections, "STRATEGISCH CONFLICT");
    const reportInterventions = getMemoSectionBody(reportSections, "STRATEGISCHE INTERVENTIES");
    const dominantThesis =
      reportHypothesis ||
      getMemoSectionBody(memoSections, "DOMINANTE THESE") ||
      session.executiveSummary ||
      "Dominante these niet beschikbaar.";
    const conflict = reportConflict || getMemoSectionBody(memoSections, "STRATEGISCH CONFLICT");
    const optionsBody =
      getMemoSectionBody(reportSections, "STRATEGISCH CONFLICT") ||
      getMemoSectionBody(memoSections, "BESTUURLIJKE KEUZE");
    const interventionsBody = reportInterventions || getMemoSectionBody(memoSections, "INTERVENTIES");
    const boardQuestion =
      getMemoSectionBody(reportSections, "BESTUURLIJKE VRAAG") ||
      getMemoSectionBody(memoSections, "BOARDROOM QUESTION");
    const noIntervention =
      getMemoSectionBody(reportSections, "VROEGSIGNALERING") ||
      getMemoSectionBody(memoSections, "SCENARIO: GEEN INTERVENTIE");
    const decisionMemory = getMemoSectionBody(memoSections, "DECISION MEMORY");
    const quality = evaluateBoardMemoQuality(cleanPlaceholderText(session.boardMemo || ""), String(session.report?.report_body || ""));
    const gate = splitGateFlags(Array.isArray(session.qualityFlags) ? session.qualityFlags : []);
    const boardOptions = extractBoardOptions(optionsBody);

    return {
      organizationName: session.organizationName || "Onbekende organisatie",
      sessionId: formatReportCode(session.sessionId),
      createdAt: session.createdAt,
      sector: session.presentationMeta?.sector || "Onbekende sector",
      deckSubtitle: deriveReportDeckSubtitle(session.presentationMeta?.sector || ""),
      contactLines: session.presentationMeta?.contactLines || [],
      qualityScore: session.qualityScore,
      qualityTier: session.qualityTier,
      dominantThesis: dominantThesis,
      strategicConflict: conflict,
      boardOptions,
      recommendedDirection: extractRecommendedDirection(optionsBody, boardOptions, reportExecutive || session.executiveSummary || ""),
      topInterventions: extractTopInterventions(interventionsBody, session.interventions || []),
      boardQuestion: compactBoardQuestion(boardQuestion),
      executiveSummary: reportExecutive || session.executiveSummary || "",
      strategyAlert: extractStrategyAlert(decisionMemory || session.boardMemo || ""),
      noIntervention: compactNoIntervention(noIntervention),
      strategySections: buildStrategySections(reportSections, memoSections),
      engineSections: buildEngineSections(memoSections),
      qualityLevel: quality.level,
      qualityChecks: quality.checks,
      criticalFlags: gate.critical,
      nonCriticalFlags: gate.nonCritical,
    };
  }

  return (
    <PageShell
      title="Strategisch rapport"
      subtitle="Overzicht van analyse-rapporten met duidelijke downloads en print."
      showDownloadBar={false}
    >
      <Panel title="Rapport upload">
        <div className="mb-4 rounded-lg border border-dashed border-white/20 bg-black/20 p-3">
          <p className="text-xs text-gray-300">Upload rapportbestand (.json/.txt/.md) om toe te voegen aan de bibliotheek.</p>
          <input
            type="file"
            accept=".json,.txt,.md,.csv"
            multiple
            className="mt-2 block w-full text-xs text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Panel>

      <Panel title="Analyse-rapporten">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-xs text-gray-300">Archiveer oude rapporten automatisch en houd alleen recente rapporten actief zichtbaar.</p>
          <button
            type="button"
            disabled={archiving}
            onClick={() => void handleArchiveLegacy()}
            className="rounded-md border border-white/20 px-3 py-1 text-xs text-white disabled:opacity-60"
          >
            {archiving ? "Archiveren..." : "Archiveer oude rapporten"}
          </button>
        </div>
        {blockedReports.length ? (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-xs font-semibold text-red-200">Publicatie geblokkeerd ({blockedReports.length})</p>
            <div className="mt-2 space-y-1 text-xs text-red-100">
              {blockedReports.slice(0, 5).map((row) => {
                const flags = parseBlockedFlags(row.errorMessage);
                return (
                  <p key={`blocked-${row.sessionId}`}>
                    {formatReportCode(row.sessionId)}: {flags.length ? flags.join(", ") : (row.errorMessage || "onbekende reden")}
                  </p>
                );
              })}
            </div>
          </div>
        ) : null}
        {!mergedReports.length ? <EmptyState text="Nog geen voltooide analyses beschikbaar." /> : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-gray-300">
                {showAllReports
                  ? `${premiumOnly ? "Premium" : "Alle"} rapporten (${filteredReports.length})`
                  : `Compact overzicht (analyse ${visibleAnalysisReports.length}/${analysisReports.length}, upload ${visibleUploadReports.length}/${uploadReports.length})`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-white/20 px-3 py-1 text-xs text-white"
                  onClick={() => setPremiumOnly((prev) => !prev)}
                >
                  {premiumOnly ? "Toon alle niveaus" : "Alleen premium rapporten"}
                </button>
                {filteredReports.length > 8 ? (
                  <button
                    type="button"
                    className="rounded-md border border-white/20 px-3 py-1 text-xs text-white"
                    onClick={() => setShowAllReports((prev) => !prev)}
                  >
                    {showAllReports ? "Toon compact" : "Toon alle rapporten"}
                  </button>
                ) : null}
              </div>
            </div>
            {!filteredReports.length ? (
              <EmptyState text={premiumOnly ? "Nog geen premium rapporten. Zet filter uit om alle rapporten te zien." : "Geen rapporten beschikbaar."} />
            ) : null}
            {visibleAnalysisReports.length ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Recente analyses</p>
            ) : null}
            {visibleAnalysisReports.map((session) => (
            <article
              key={session.sessionId}
              className={`rounded-xl border bg-gradient-to-br from-[#0B1220] via-[#0F172A] to-[#141B2D] p-4 transition-colors ${
                selectedSessionId === session.sessionId ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : "border-white/10"
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedSessionId(session.sessionId)}
              >
                <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Onbekende organisatie"} • Analyse</p>
                {session.status === "fout" && /Publicatie geblokkeerd/i.test(session.errorMessage || "") ? (
                  <p className="mt-1 text-[11px] text-red-300">
                    Publicatie geblokkeerd: {(parseBlockedFlags(session.errorMessage).slice(0, 3).join(", ") || session.errorMessage)}
                  </p>
                ) : null}
                {(session.engineMode || session.analysisRuntimeMs > 0) ? (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Engine: {session.engineMode || "onbekend"}
                    {session.analysisRuntimeMs > 0 ? ` • Runtime: ${Math.round(session.analysisRuntimeMs / 1000)}s` : ""}
                    {` • Kwaliteit: ${session.qualityScore}/100 (${session.qualityTier})`}
                  </p>
              ) : null}
                <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
              </button>
              {selectedSessionId === session.sessionId ? (
                <>
                  {(() => {
                    const model = buildViewModel(session);
                    const activeTab = activeTabs[session.sessionId] || "boardroom";
                    const tabs: Array<{ key: ReportTabKey; label: string }> = [
                      { key: "boardroom", label: "Bestuurlijk overzicht" },
                      { key: "strategy", label: "Strategisch rapport" },
                      { key: "engine", label: "Technische analyse" },
                    ];

                    return (
                      <div className="mt-4 space-y-4">
                        <nav className="rounded-xl border border-white/10 bg-black/20 p-2">
                          <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                              <button
                                key={`${session.sessionId}-${tab.key}`}
                                type="button"
                                className={`rounded-lg px-4 py-2 text-sm transition ${
                                  activeTab === tab.key
                                    ? "bg-[#D4AF37] font-semibold text-black"
                                    : "border border-white/10 bg-white/5 text-white"
                                }`}
                                onClick={() =>
                                  setActiveTabs((prev) => ({
                                    ...prev,
                                    [session.sessionId]: tab.key,
                                  }))
                                }
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            Het bestuurlijk overzicht toont alleen besluitinformatie. Strategisch rapport en technische analyse laden pas als je ze opent.
                          </p>
                        </nav>

                        {activeTab === "boardroom" ? (
                          <BoardroomView
                            model={model}
                            onCopyDecision={() => {
                              void copyText(model.recommendedDirection).then((ok) =>
                                setHint(ok ? "Aanbevolen richting gekopieerd." : "Kopiëren mislukt."),
                              );
                            }}
                          />
                        ) : null}

                        {activeTab !== "boardroom" ? (
                          <Suspense
                            fallback={
                              <section className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                                Analyseweergave laden...
                              </section>
                            }
                          >
                            {activeTab === "strategy" ? <StrategyReportView model={model} /> : null}
                            {activeTab === "engine" ? <EngineAnalysisView model={model} /> : null}
                          </Suspense>
                        ) : null}
                      </div>
                    );
                  })()}
                </>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black" onClick={() => void handleSummary(session.sessionId)}>Download samenvatting (.txt)</button>
                <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => void handleMemo(session.sessionId)}>Download bestuursmemo (.txt)</button>
                {session.report ? (
                  <button
                    className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white"
                    onClick={() =>
                      void exportPDF(
                        session.report!,
                        `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-cyntra-dossier`,
                        {
                          organizationName: session.organizationName,
                          sector: session.presentationMeta?.sector,
                          analysisType: "Strategische analyse",
                          generatedAt: session.createdAt,
                          rawInput: (session as any).rawInput || "",
                        }
                      )
                    }
                  >
                    Download Cyntra rapport (.pdf)
                  </button>
                ) : (
                  <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => void handlePdf(session.sessionId)}>Download Cyntra rapport (.pdf)</button>
                )}
                <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => handlePrint(session)}>Print rapport</button>
                {session.report ? (
                  <>
                    <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => exportCSV(session.report, `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-rapport-data`)}>Download data (.csv)</button>
                    <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => exportJSON(session.report, `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-rapport-data`)}>Download data (.json)</button>
                  </>
                ) : null}
              </div>
              <p className="mt-2 text-[11px] text-gray-400">
                JSON = machine-leesbare rapportdata voor API, tooling of hergebruik in dashboards.
              </p>
            </article>
          ))}
            {visibleUploadReports.length ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Geuploade rapporten</p>
            ) : null}
            {visibleUploadReports.map((session) => (
            <article
              key={session.sessionId}
              className={`rounded-xl border bg-gradient-to-br from-[#0B1220] via-[#0F172A] to-[#141B2D] p-4 transition-colors ${
                selectedSessionId === session.sessionId ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : "border-white/10"
              }`}
            >
                <button type="button" className="w-full text-left" onClick={() => setSelectedSessionId(session.sessionId)}>
                  <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                  <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                  <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Geuploade bron"} • Upload</p>
                  <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.report ? (
                    <button
                      className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white"
                      onClick={() =>
                        void exportPDF(
                          session.report!,
                          `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-cyntra-dossier`,
                          {
                            organizationName: session.organizationName,
                            sector: session.presentationMeta?.sector,
                            analysisType: "Strategische analyse",
                            generatedAt: session.createdAt,
                            rawInput: (session as any).rawInput || "",
                          }
                        )
                      }
                    >
                      Download Cyntra rapport (.pdf)
                    </button>
                  ) : null}
                  <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => handlePrint(session)}>Print rapport</button>
                  {session.report ? (
                    <>
                      <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => exportCSV(session.report, `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-rapport-data`)}>Download data (.csv)</button>
                      <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => exportJSON(session.report, `${safeDownloadSlug(session.organizationName || "organisatie")}-${safeDownloadSlug(session.sessionId)}-rapport-data`)}>Download data (.json)</button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
      {hint ? <p className="text-sm text-gray-300">{hint}</p> : null}
    </PageShell>
  );
}
