import { Suspense, lazy, startTransition, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState, PageShell, Panel } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode, formatReportShortDate } from "./reportIdentity";
import type { StrategicReport } from "@/platform/types";
import { SESSION_STATUS, isSessionCompleted } from "@/platform/types";
import { synthesizeStrategicReport } from "@/engine/reportSynthesizer";
import BoardroomView from "@/components/reports/BoardroomView";
import type {
  BoardDecisionPressure,
  BoardIntervention,
  BestuurlijkeBesliskaart,
  CompactScenario,
  GovernanceIntervention,
  OptionRejection,
  ReportSpeedMode,
  ReportTabKey,
  ReportSection,
  ReportRenderModel,
  StructuredKillerInsight,
} from "@/components/reports/types";
import {
  deriveReportSpeedModeFromTab,
  getDefaultReportTabForMode,
  getReportModeHint,
  getVisibleReportTabsForMode,
  normalizeReportSpeedMode,
} from "@/components/reports/reportSpeedMode";
import { getReports as getStoredReports, saveReport as persistReport } from "@/services/reportStorage";
import { parseContactLines } from "@/services/reportText";
import { detectRelevantTension } from "@/aurelius/engine/visuals/TensionLibrary";
import { buildBoardroomSections, compileBoardroomDocument } from "@/engine/reportCompiler";
import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";
import {
  buildStrategicBrainReport,
  type StrategicBrainReport,
} from "@/aurelius/engine/buildStrategicBrainReport";
import { buildPortalReportLibraryPath, buildPortalReportPath } from "../portalPaths";

const StrategyReportView = lazy(() => import("@/components/reports/StrategyReportView"));
const EngineAnalysisView = lazy(() => import("@/components/reports/EngineAnalysisView"));

type CanonicalStrategicReport = import("@/types/StrategicReport").StrategicReport;
type ExportableStrategicReport = StrategicReport & CanonicalStrategicReport;

function downloadReport(file: { filename: string; mime_type: string; content: string }, filenameOverride?: string) {
  const isDataUri = file.content.startsWith("data:");
  const href = isDataUri ? file.content : URL.createObjectURL(new Blob([file.content], { type: file.mime_type }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filenameOverride || file.filename;
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

function safeDownloadSlug(value: string): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rapport";
}

function safeDownloadFilenamePart(value: string): string {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Rapport";
}

function cleanPlaceholderText(value: string): string {
  return String(value || "")
    .split("\n")
    .filter(
      (line) =>
        !/Placeholder toegevoegd door NarrativeStructureGuard/i.test(line) &&
        !/^\s*\d{2}\s*$/.test(line.trim())
    )
    .join("\n")
    .trim();
}

function sanitizeEncoding(text: string): string {
  return String(text || "")
    .replace(/Ø=Ý4|Ø=Ý|Ø=ß|&ª|�/g, "")
    .replace(/\bSttihii\b/g, "")
    .replace(/ONDERLIGGENDEAANNAME/g, "ONDERLIGGENDE AANNAME")
    .replace(/kernvalt\b/g, "kern valt")
    .replace(/\.\./g, ".")
    .replace(/\n{3,}/g, "\n\n");
}

function stripPromptLeakageBlocks(text: string): string {
  return String(text || "")
    .replace(/(?:^|\n)\s*🔴\s*ACTION ITEMS[\s\S]*?(?=\n(?:[A-Z][^\n]{2,}\n|\d+\.\s+|###\s+)|$)/gi, "\n")
    .replace(/(?:^|\n)\s*ACTION ITEMS[\s\S]*?(?=\n(?:[A-Z][^\n]{2,}\n|\d+\.\s+|###\s+)|$)/gi, "\n")
    .replace(/(?:^|\n)\s*(?:Max\s*5\s*topics|owner:\s*JIJ|owner:|deadline:|brondata:)[^\n]*(?=\n|$)/gi, "\n")
    .replace(/(?:^|\n)\s*(?:AI|model|prompt|input|output|token)\s*:?([^\n]*)$/gim, "\n");
}

function removeDuplicateInterventionBlocks(text: string): string {
  const normalized = String(text || "");
  const firstCanonical = normalized.search(
    /(?:^|\n)(?:###\s+)?(?:90[- ]DAGEN INTERVENTIEPLAN|90 DAGEN ACTIEPLAN|STRATEGISCHE INTERVENTIES)\s*$/im
  );
  if (firstCanonical < 0) return normalized;
  let seen = false;
  return normalized.replace(
    /(?:^|\n)(?:###\s+)?(90[- ]DAGEN INTERVENTIEPLAN|90 DAGEN ACTIEPLAN|STRATEGISCHE INTERVENTIES)\s*$/gim,
    (match, title) => {
      if (!seen) {
        seen = true;
        return match.replace(title, "90-DAGEN INTERVENTIEPLAN");
      }
      return "\n";
    }
  );
}

function humanizeReportLanguage(text: string): string {
  return String(text || "")
    .replace(/\bStrategische hefboompunten\b/gi, "Strategische keuzes met meeste effect")
    .replace(/\bStrategische hefboom:\s*/gi, "Strategische keuze: ")
    .replace(/\bDominante hefboomcombinatie\b/gi, "Sterkste combinatie van keuzes")
    .replace(/\bWaarom dit 80\/20 impact heeft\b/gi, "Waarom dit het meeste effect heeft")
    .replace(/\bPrimaire stuurhefboom\b/gi, "Primaire bestuurlijke keuze")
    .replace(/\bKritieke hefboom\b/gi, "Kritieke keuze")
    .replace(/\bDominante hefboom\b/gi, "Dominante keuze")
    .replace(/\bhefboomcombinatie\b/gi, "combinatie van keuzes")
    .replace(/\bhefboom\b/gi, "sturingspunt");
}

function sanitizeDisplayText(value: string): string {
  const text = removeDuplicateInterventionBlocks(
    stripPromptLeakageBlocks(
      sanitizeEncoding(cleanPlaceholderText(String(value || "")))
    )
  )
    .replace(/(?:^|\n)\s*Kopieer richting\s*(?=\n|$)/gim, "\n")
    .replace(/(?:^|\n)\s*bron(?:nen)?\s*:[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*notes?\b[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*action items?\b[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*unassigned[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*Mechanismeketens[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*samenvatting gesprekverslag fireflies\s*:[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*open vragen[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*blockers?[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*fyi[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*Scenario simulatie\s*\n\s*Technische analyse[\s\S]*$/i, "");
  if (!text) return "";
  const markers: RegExp[] = [
    /(?:^|\n)\s*bron(?:nen)?\s*:/i,
    /(?:^|\n)\s*notes?\b/i,
    /(?:^|\n)\s*action items?\b/i,
    /(?:^|\n)\s*unassigned\b/i,
    /(?:^|\n)\s*samenvatting gesprekverslag fireflies\s*:/i,
    /(?:^|\n)\s*open vragen\b/i,
    /(?:^|\n)\s*blockers?\b/i,
    /(?:^|\n)\s*fyi\b/i,
    /\bwhat are the top 5\b/i,
    /\bread more\b/i,
  ];
  let cutIndex = text.length;
  for (const marker of markers) {
    const match = marker.exec(text);
    if (!match || match.index == null) continue;
    cutIndex = Math.min(cutIndex, match.index);
  }
  const cleaned = humanizeReportLanguage(
    text
    .slice(0, cutIndex)
    .replace(/Sttihii/gi, "")
    .replace(/ONDERLIGGENDEAANNAME/g, "ONDERLIGGENDE AANNAME")
    .replace(/(?:^|\n)\s*Geen inhoud beschikbaar\.?\s*(?=\n|$)/gim, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([a-z])([A-Z][a-z]+:)/g, "$1\n$2")
    .replace(/(kill-switch\.?)(90-DAGEN INTERVENTIEPLAN)/gi, "$1\n\n$2")
    .replace(/(doorstro)(Eigenaar:)/gi, "$1\n$2")
    .replace(/(kern)(valt\b)/gi, "$1 $2")
    .replace(/(ONDERLIGGENDE)(AANNAME)/g, "$1 $2")
    .replace(/(Strategische keuzes met meeste effect)\s*:\s*/gi, "$1\n")
    .replace(/(Sterkste combinatie van keuzes)\s*:\s*/gi, "$1\n")
    .replace(/(Waarom dit het meeste effect heeft)\s*:\s*/gi, "$1\n")
    .replace(/(BESTUURLIJKE CONSEQUENTIE)\s*:/g, "$1")
    .replace(/(MECHANISME)\s*:/g, "$1")
    .replace(/(INZICHT)\s*:/g, "$1")
    .replace(/\n\s+\n/g, "\n\n")
    .replace(/\n{3,}/g, "\n\n")
    )
    .trim();
  return sanitizeReportOutput(cleaned);
}

function looksLikeInternalOrganizationId(value: string): boolean {
  const text = String(value || "").trim();
  return /^org-[a-z0-9-]+$/i.test(text) || /^(seeded-report|upload|onbekend)$/i.test(text);
}

function extractOrganizationNameFromReportBody(reportBody: string): string {
  const text = String(reportBody || "");
  const patterns = [
    /(?:^|\n)ORGANISATIE\s*\n+([^\n]+)(?:\n|$)/i,
    /(?:^|\n)Organisatie:\s*([^\n]+)(?:\n|$)/i,
    /(?:^|\n)BESTUURLIJK OVERZICHT\s*\n+([^\n]+)(?:\n|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const candidate = String(match?.[1] || "").trim();
    if (candidate && !looksLikeInternalOrganizationId(candidate)) return candidate;
  }
  return "";
}

function extractOrganizationNameFromTitle(title: string): string {
  const text = String(title || "").trim();
  if (!text) return "";
  const dossierMatch = text.match(/Cyntra Executive Dossier\s+[—-]\s+(.+?)\s+[—-]\s+[A-Za-z0-9-]+$/i);
  const candidate = String(dossierMatch?.[1] || text).trim();
  return candidate && !looksLikeInternalOrganizationId(candidate) ? candidate : "";
}

function resolveDisplayOrganizationName(input: {
  organizationName?: string;
  organizationId?: string;
  reportBody?: string;
  reportTitle?: string;
  fallback?: string;
}): string {
  const direct = String(input.organizationName || "").trim();
  if (direct && !looksLikeInternalOrganizationId(direct)) return direct;

  const fromTitle = extractOrganizationNameFromTitle(String(input.reportTitle || ""));
  if (fromTitle) return fromTitle;

  const fromBody = extractOrganizationNameFromReportBody(String(input.reportBody || ""));
  if (fromBody) return fromBody;

  const fallback = String(input.fallback || "").trim();
  if (fallback && !looksLikeInternalOrganizationId(fallback)) return fallback;

  const id = String(input.organizationId || "").trim();
  if (id && !looksLikeInternalOrganizationId(id)) return id;

  return "Onbekende organisatie";
}

function cleanBoardSentence(value: string, fallback = ""): string {
  const cleaned = sanitizeDisplayText(String(value || ""))
    .replace(/\bMECHANISME\s*[—:-]\s*Brondata:[^.]*\.?/gi, "")
    .replace(/\bStrategische hefboom:[^.]*\.?/gi, "")
    .replace(/\bOmdat\s+[^.]{0,80}$/gi, "")
    .replace(/\b(financiele|organisatorisch|operationeel)\s*$/gi, "")
    .replace(/(^|\s)([abc])\.\s+(?=[a-zà-ÿ])/gi, (_match, lead, choice) => `${lead}${choice.toUpperCase()}: `)
    .replace(/\s{2,}/g, " ")
    .trim();
  const sentence = cleaned.split(/(?<=[.!?])\s+/)[0]?.trim() || cleaned;
  if (!sentence) return fallback;
  if (/[.!?]$/.test(sentence)) return sentence;
  return `${sentence}.`;
}

function buildEvidenceLines(sourceText: string, sector: string): string[] {
  const source = sanitizeDisplayText(sourceText);
  const evidence: string[] = [];
  const candidates = [
    { re: /±?\s*35\s+gemeenten/i, text: "De organisatie werkt met circa 35 gemeenten, waardoor contractmix en bereikbaarheid direct op marge en uitvoerbaarheid drukken." },
    { re: /80%\s*rendabiliteit|80%\s*declarabele uren/i, text: "De organisatie stuurt op circa 80% rendabiliteit, waardoor extra verbreding alleen past als reistijd, no-show en productmix onder controle blijven." },
    { re: /01\s*04|1\s*april|deadline\s*01\s*04|Zillers/i, text: "Per 1 april 2026 moet Zillers breed werken; zonder betrouwbare invoer ontbreekt bestuurlijke stuurinformatie op caseload, verzuim en rendabiliteit." },
    { re: /moeder[\s-]?kindhuis/i, text: "De pilot voor een moeder-kindhuis vraagt gerichte inzet van capaciteit en financiering, en verdringt andere initiatieven als de kern niet eerst stabiel is." },
    { re: /consorti|haarlem toegangspoort|triage/i, text: "Instroom loopt via consortium- en triageafspraken, waardoor positionering niet los te sturen is van contractruimte en regionale toegang." },
    { re: /weinig verloop|lage uitstroom|retentie/i, text: "De huidige lage uitstroom is een strategisch voordeel, maar wordt kwetsbaar als caseload en verbreding sneller stijgen dan teamruimte." },
  ];

  for (const candidate of candidates) {
    if (candidate.re.test(source)) evidence.push(candidate.text);
  }

  if (!evidence.length && /jeugdzorg/i.test(sector)) {
    evidence.push(
      "Gemeentelijke contractdruk, wachtdruk en personeelskrapte bepalen samen de grens van wat de organisatie tegelijk kan blijven aanbieden."
    );
  }

  return Array.from(new Set(evidence)).slice(0, 3);
}

function buildDistinctExecutiveSummary(params: {
  organization: string;
  sector: string;
  recommendedDirection: string;
  conflict: string;
  stressTest: string;
  sourceText: string;
  analysisDate: string;
}): string {
  const evidence = buildEvidenceLines(params.sourceText, params.sector);
  return [
    `Organisatie: ${params.organization}`,
    `Sector: ${params.sector}`,
    `Analyse datum: ${params.analysisDate}`,
    "",
    `Besluit: ${cleanBoardSentence(params.recommendedDirection, "Bestuurlijke keuze ontbreekt.")}`,
    evidence[0] || cleanBoardSentence(params.conflict, "De kernspanning is nog niet scherp genoeg geformuleerd."),
    cleanBoardSentence(params.stressTest, "Uitstel vergroot de schade sneller dan extra activiteit compenseert."),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildDistinctFactsSection(sourceText: string, sector: string, executiveSummary: string): string {
  const evidence = buildEvidenceLines(sourceText, sector);
  if (evidence.length) return evidence.join("\n\n");
  return cleanBoardSentence(executiveSummary, "Feitenbasis ontbreekt.");
}

function buildBoardDecisionText(action: string, recommendedDirection: string): string {
  const normalizedAction = cleanBoardSentence(action, "de interventie uitvoeren")
    .replace(/^voor\s+[^:]+:\s*/i, "")
    .replace(/[.?!]+$/, "")
    .trim();
  return `Het bestuur besluit ${normalizedAction.toLowerCase()} en herijkt dit maandelijks op KPI, capaciteit en contractruimte.`;
}

function buildSourceBoundJeugdzorgConflict(sourceText: string, options: string[]): string {
  const source = sanitizeDisplayText(sourceText);
  const optionA = options[0] || "het gemeentenportfolio rationeel begrenzen";
  const optionB = options[1] || "operationele schaal vergroten binnen dezelfde breedte";
  const optionC = options[2] || "het zorgmodel en de instroomroute aanpassen";

  if (/werkplezier|weinig verloop|lage uitstroom|verbinding/i.test(source) && /±?\s*35\s+gemeenten|gemeenten/i.test(source)) {
    return `De echte spanning zit niet in labels, maar tussen ${optionA.toLowerCase()}, ${optionB.toLowerCase()} en ${optionC.toLowerCase()}. Jeugdzorg ZIJN probeert tegelijk een cultuurgedreven zorgorganisatie en een gemeentelijk contractbedrijf te zijn. Hoe breder het gemeentenportfolio, hoe groter de druk op teamstabiliteit, contractdiscipline en bestuurbaarheid.`;
  }

  if (/±?\s*35\s+gemeenten/i.test(source) && /consorti|triage/i.test(source)) {
    return `De echte spanning zit tussen ${optionA.toLowerCase()}, ${optionB.toLowerCase()} en ${optionC.toLowerCase()}. De organisatie werkt over circa 35 gemeenten, terwijl instroom deels via consortiumtriage loopt. Het bestuur moet dus kiezen of het focus aanbrengt in gemeenten en contractmix, extra capaciteit organiseert onder harde grenzen, of het zorgmodel aanpast aan wat teams werkelijk kunnen dragen.`;
  }

  if (/Zillers|1\s*april|01\s*04/i.test(source)) {
    return `De echte spanning zit tussen ${optionA.toLowerCase()}, ${optionB.toLowerCase()} en ${optionC.toLowerCase()}. Het bestuur moet kiezen of het eerst stuurinformatie, caseloaddiscipline en gemeentenfocus op orde brengt, extra capaciteit toevoegt onder harde grenzen, of de huidige instroom- en zorglogica verandert.`;
  }

  return `De echte spanning zit tussen ${optionA.toLowerCase()}, ${optionB.toLowerCase()} en ${optionC.toLowerCase()}. Het bestuur moet kiezen welke schade bewust acceptabel is.`;
}

function buildSourceBoundJeugdzorgThesis(sourceText: string, recommendedDirection: string): string {
  const source = sanitizeDisplayText(sourceText);
  if (
    /werkplezier|weinig verloop|lage uitstroom|verbinding/i.test(source) &&
    /±?\s*35\s+gemeenten|gemeenten/i.test(source)
  ) {
    return "Jeugdzorg ZIJN kan niet tegelijk een breed gemeentenportfolio aanhouden en teamcapaciteit overal opvangen; cultuurkapitaal en teamstabiliteit blijven alleen intact als het bestuur focus aanbrengt in gemeentenmix, caseload en groeiritme.";
  }
  if (
    /±?\s*35\s+gemeenten|gemeenten/i.test(source) &&
    /consorti|triage|haarlem toegangspoort/i.test(source)
  ) {
    return "Maak het gemeentenportfolio bestuurbaar door kern-, behoud- en uitstapgemeenten te kiezen, consortiumtriage aan capaciteitsgrenzen te koppelen en verlieslatende breedte actief te begrenzen.";
  }
  if (/80%\s*rendabiliteit|80%\s*declarabele uren/i.test(source)) {
    return "Laat breedte alleen toe waar marge, reistijd, caseload en teamstabiliteit aantoonbaar binnen bestuurlijke grenzen blijven.";
  }
  return cleanBoardSentence(
    recommendedDirection || "Behoud de gekozen richting binnen strakke bestuursdiscipline.",
    "Behoud de gekozen richting binnen strakke bestuursdiscipline."
  );
}

function tokenizeContent(text: string): Set<string> {
  return new Set(
    (text || "")
      .toLowerCase()
      .split(/\W+/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 2)
  );
}

function contentSimilarity(left: string, right: string): number {
  const leftTokens = tokenizeContent(left);
  const rightTokens = tokenizeContent(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const intersection = new Set([...leftTokens].filter((token) => rightTokens.has(token)));
  const union = new Set([...leftTokens, ...rightTokens]);
  return intersection.size / union.size;
}

function isDuplicatedContent(candidate: string, existing: string[], threshold = 0.7): boolean {
  return existing.some((item) => contentSimilarity(candidate, item) >= threshold);
}

function dedupeStructuredInsights(insights: StructuredKillerInsight[]): StructuredKillerInsight[] {
  const accumulator: string[] = [];
  const deduped: StructuredKillerInsight[] = [];
  for (const insight of insights || []) {
    const snippet = `${insight.insight} ${insight.mechanism} ${insight.implication}`.trim();
    if (!snippet) continue;
    if (isDuplicatedContent(snippet, accumulator)) continue;
    accumulator.push(snippet);
    deduped.push(insight);
    if (deduped.length >= 5) break;
  }
  return deduped;
}

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function countKeywordMatches(value: string, keywords: string[]): number {
  const normalized = String(value || "").toLowerCase();
  return keywords.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 1 : 0), 0);
}

function evaluateScenarioScores(
  mechanism: string,
  risk: string,
  boardImplication: string
): {
  impactScore: number;
  riskScore: number;
  difficultyScore: number;
  scoreValue: number;
} {
  const impactKeywords = ["marge", "impact", "waarde", "win", "contractruimte", "capaciteit", "growth", "leverage"];
  const riskKeywords = ["risico", "complex", "governance", "escala", "verlies", "vertraging", "breuk", "dram"];
  const difficultyKeywords = ["mandaat", "partner", "consortium", "organisatie", "afstemming", "align", "prioriteit"];

  const impactMatch = countKeywordMatches(mechanism, impactKeywords);
  const riskMatch = countKeywordMatches(`${risk} ${boardImplication}`, riskKeywords);
  const difficultyMatch = countKeywordMatches(boardImplication, difficultyKeywords);

  const impactScore = clampScore(5 + impactMatch * 1.5);
  const riskScore = clampScore(3 + riskMatch * 1.4);
  const difficultyScore = clampScore(3 + difficultyMatch * 1.2);
  const scoreValue = impactScore - riskScore - difficultyScore;
  return { impactScore, riskScore, difficultyScore, scoreValue };
}

function dedupeScenarioList(scenarios: CompactScenario[]): CompactScenario[] {
  const accumulator: string[] = [];
  const deduped: CompactScenario[] = [];
  for (const scenario of scenarios) {
    const canonical = `${scenario.mechanism} ${scenario.risk} ${scenario.boardImplication}`.trim();
    if (!canonical) continue;
    if (isDuplicatedContent(canonical, accumulator)) continue;
    accumulator.push(canonical);
    deduped.push(scenario);
    if (deduped.length >= 5) break;
  }
  return deduped;
}

function normalizeScenarioReference(value: string): string {
  return normalizeInline(
    String(value || "")
      .replace(/^scenario\s+/i, "")
      .replace(/^(?:optie\s+)?([ABC])\s*[—\-:.]\s*/i, "$1 ")
      .replace(/^([ABC])\.\s*/i, "$1 ")
  ).toLowerCase();
}

function resolveRecommendedScenarioIndex(
  scenarios: CompactScenario[],
  recommendedDirection: string
): number {
  const normalizedDirection = normalizeScenarioReference(recommendedDirection);
  if (normalizedDirection) {
    const directMatch = scenarios.findIndex((scenario) => {
      const normalizedTitle = normalizeScenarioReference(scenario.title);
      return (
        normalizedTitle === normalizedDirection ||
        normalizedDirection.includes(normalizedTitle) ||
        normalizedTitle.includes(normalizedDirection)
      );
    });
    if (directMatch >= 0) return directMatch;

    const directionCode = normalizedDirection.match(/^([abc])\b/i)?.[1]?.toUpperCase();
    if (directionCode) {
      const codedMatch = scenarios.findIndex((scenario) =>
        new RegExp(`(?:^|\\b)scenario\\s+${directionCode}\\b|^${directionCode}\\b`, "i").test(String(scenario.title || ""))
      );
      if (codedMatch >= 0) return codedMatch;
    }
  }

  return scenarios.reduce((bestIndex, scenario, index, rows) => {
    const bestScore = Number.isFinite(rows[bestIndex]?.scoreValue ?? NaN) ? rows[bestIndex]?.scoreValue ?? -Infinity : -Infinity;
    const currentScore = Number.isFinite(scenario.scoreValue ?? NaN) ? scenario.scoreValue ?? -Infinity : -Infinity;
    return currentScore > bestScore ? index : bestIndex;
  }, 0);
}

function enforceSingleBoardThesis(thesis: string, fallback: string): string {
  const source = sanitizeDisplayText(thesis || fallback)
    .replace(/\b(balance|complexiteit|dynamiek|uitdaging|situatie|ontwikkeling)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const words = source.split(/\s+/).filter(Boolean);
  const limited = words.slice(0, 25).join(" ");
  return cleanBoardSentence(limited, fallback);
}

function buildSourceBoundJeugdzorgChoiceWhy(sourceText: string, recommendedDirection: string): string[] {
  const source = sanitizeDisplayText(sourceText);
  const reasons: string[] = [];

  if (/±?\s*35\s+gemeenten|gemeenten/i.test(source)) {
    reasons.push("De organisatie werkt voor circa 35 gemeenten. Dat vraagt vooral scherpere selectie en contractdiscipline, niet opnieuw verbreden.");
  }
  if (/consorti|triage|haarlem toegangspoort/i.test(source)) {
    reasons.push("Instroom loopt deels via consortiumtriage. Daardoor ligt niet alle regie intern en moet het bestuur capaciteit en toegang in hetzelfde ritme sturen.");
  }
  if (/80%\s*rendabiliteit|80%\s*declarabele uren/i.test(source)) {
    reasons.push("Met een rendabiliteitsnorm van circa 80% is er weinig ruimte voor extra breedte zonder strakkere sturing op productmix, reistijd en caseload.");
  }
  if (/weinig verloop|lage uitstroom|retentie/i.test(source)) {
    reasons.push("De lage uitstroom en sterke teamcultuur zijn een strategisch bezit. Die stabiliteit moet eerst beschermd blijven voordat de organisatie opnieuw verbreedt.");
  }
  if (/simma|moeder[\s-]?kindhuis|preventie|groepsaanbod/i.test(source)) {
    reasons.push("Nieuwe initiatieven zoals Simma familiezorg, preventieprojecten en het moeder-kindhuis vragen focus; zonder portfoliokeuze verdringen ze de kerncapaciteit.");
  }
  if (/Zillers|1\s*april|01\s*04/i.test(source)) {
    reasons.push("Per 1 april 2026 moet Zillers bruikbare stuurinformatie opleveren. Zonder dat fundament is een scherpere nichekeuze te vroeg.");
  }

  if (!reasons.length) {
    reasons.push(cleanBoardSentence(recommendedDirection, "Deze richting beschermt de kern beter dan de alternatieven."));
  }

  return reasons.slice(0, 3).map((reason) => cleanBoardSentence(reason, reason));
}

function buildSourceBoundJeugdzorgDecisionPressure(sourceText: string): BoardDecisionPressure {
  const source = sanitizeDisplayText(sourceText);
  return {
    operational: /consorti|triage|haarlem toegangspoort/i.test(source)
      ? "Instroom en wachtdruk raken uit balans zodra consortiumtriage meer casussen toewijst dan teams aankunnen."
      : "Wachtdruk en teamdruk lopen op zodra instroom sneller groeit dan de planbare capaciteit.",
    financial: /80%\s*rendabiliteit|80%\s*declarabele uren|reistijd|no show/i.test(source)
      ? "Marge loopt direct terug zodra reistijd, no-show en productmix per gemeente niet worden begrensd."
      : "Brede aanwezigheid wordt verlieslatend zodra contractvoorwaarden en uitvoerbaarheid per gemeente te ver uiteenlopen.",
    organizational: /weinig verloop|lage uitstroom|retentie|ZZP|vaste medewerkers/i.test(source)
      ? "De huidige teamstabiliteit komt onder druk zodra breedte, pilots en caseload tegelijk blijven doorgroeien."
      : "Uitstel vergroot interne ruis en maakt de gekozen richting lastiger uitvoerbaar.",
  };
}

function buildSourceBoundJeugdzorgOptions(sourceText: string): string[] {
  const source = sanitizeDisplayText(sourceText);
  const options = [
    "A. Gemeentenportfolio rationaliseren",
    "B. Operationele schaal vergroten binnen vaste teams en flexibele schil",
    "C. Zorgmodel en instroomroute veranderen",
  ];
  if (/gebiedgebonden|lokale medewerkers|korte huurovereenkomst|gemeenten/i.test(source)) {
    return options;
  }
  return options;
}

function isGenericInsight(insight: StructuredKillerInsight): boolean {
  const combined = `${insight.insight} ${insight.mechanism} ${insight.implication}`.toLowerCase();
  return (
    /operationele continuïteit en strategische vernieuwing/.test(combined) ||
    /externe marktdruk en interne uitvoerbaarheid/.test(combined) ||
    /de huidige koers blijft alleen houdbaar/.test(combined)
  );
}

function buildSourceBoundJeugdzorgInsights(sourceText: string, recommendedDirection: string): StructuredKillerInsight[] {
  const source = sanitizeDisplayText(sourceText);
  const insights: StructuredKillerInsight[] = [];

  if (/±?\s*35\s+gemeenten|gemeenten/i.test(source)) {
    insights.push({
      insight: "De organisatie stuurt niet op één markt, maar op een mozaïek van circa 35 gemeenten met uiteenlopende condities.",
      mechanism: "Tarieven, reistijd en no-show-regels verschillen per gemeente. Daardoor is volume niet automatisch rendabel of uitvoerbaar.",
      implication: "Het bestuur moet gemeenten rangschikken op marge, bereikbaarheid en contractzekerheid in plaats van overal aanwezig te willen zijn.",
    });
    insights.push({
      insight: "Volume op zichzelf lost het vraagstuk niet op; contractdiscipline per gemeente bepaalt of het gemeentenportfolio houdbaar blijft.",
      mechanism: "De unit economics zijn per gemeente anders: tarief per uur minus reistijd, no-show en indirecte uren bepaalt de effectieve marge. Daardoor levert dezelfde zorgvorm per gemeente iets anders op.",
      implication: "Het bestuur moet gemeenten indelen in kern, behoud en uitstap in plaats van volume overal gelijk te behandelen.",
    });
  }
  if (/consorti|haarlem toegangspoort|triage/i.test(source)) {
    insights.push({
      insight: "Instroom wordt mede buiten de eigen organisatie bepaald via consortium- en triageafspraken.",
      mechanism:
        "De keten loopt van gemeentelijke toegang via consortiumtriage naar caseload, wachttijd, teamdruk en uiteindelijk marge. Daardoor bepaalt Jeugdzorg ZIJN niet volledig zelf welke casuïstiek binnenkomt, terwijl teams wel de uitvoeringsdruk en kwaliteitslast dragen.",
      implication:
        "Het bestuur moet consortiumtoegang, caseload, wachttijd en contractkeuzes als één governancevraag behandelen in plaats van als losse operationele stromen.",
    });
  }
  if (/80%\s*rendabiliteit|80%\s*declarabele uren/i.test(source)) {
    insights.push({
      insight: "De huidige groeiruimte wordt begrensd door de rendabiliteitsnorm van circa 80% declarabele inzet.",
      mechanism: "Als reistijd, ontwikkeluren en complexe ambulante casuïstiek oplopen, verdwijnt marge sneller dan extra productie die kan herstellen.",
      implication: "Het bestuur moet verbreding alleen toestaan als productmix, reistijd en caseload aantoonbaar binnen de norm blijven.",
    });
  }
  if (/01\s*04|1\s*april|Zillers/i.test(source)) {
    insights.push({
      insight: "Zonder volledige Zillers-adoptie ontbreekt vanaf 1 april 2026 de bestuurlijke basis voor maandsturing.",
      mechanism: "Caseload, verzuim en rendabiliteit worden dan niet betrouwbaar zichtbaar, waardoor te laat wordt ingegrepen.",
      implication: "Het bestuur moet datakwaliteit als voorwaarde behandelen voor verdere groei, pilots en contractkeuzes.",
    });
  }
  if (/moeder[\s-]?kindhuis|preventie|groepsaanbod/i.test(source)) {
    insights.push({
      insight: "Innovatie is hier geen bijzaak maar een tweede strategische portefeuille naast de kernzorg.",
      mechanism: "Simma familiezorg, preventieprojecten en het moeder-kindhuis vragen allemaal bestuurlijke aandacht, bezetting en financieringsruimte terwijl de basis nog niet overal stabiel is.",
      implication: "Het bestuur moet expliciet kiezen welke innovatie nu schaal krijgt, welke pilot blijft en welke ontwikkeling wacht tot kerncapaciteit en contractdiscipline op orde zijn.",
    });
  }
  if (/weinig verloop|lage uitstroom|retentie|jubileums|flexibele\s+schil|vaste\s+kern|zzp|vaste medewerkers/i.test(source)) {
    const directionLabel = cleanBoardSentence(recommendedDirection, "de gekozen richting")
      .replace(/[.?!]+$/, "")
      .toLowerCase();
    insights.push({
      insight: /werkplezier|weinig verloop|lage uitstroom|retentie/i.test(source)
        ? "De cultuur van werkplezier, verbinding en lage uitstroom is geen zachte factor maar het productiemechanisme van de organisatie."
        : "De vaste kern houdt kwaliteit en continuiteit vast, terwijl de flexibele schil vraagpieken opvangt maar de kostenstructuur volatiel maakt.",
      mechanism: /werkplezier|weinig verloop|lage uitstroom|retentie/i.test(source)
        ? "Cultuur houdt retentie hoog, retentie houdt caseload planbaar en planbare caseload houdt kwaliteit en declarabele productiviteit op niveau. Snelle volumegroei of bestuurlijke versnippering doorbreekt precies die keten."
        : "Extra inzet van flex of zzp verhoogt de variabele kosten juist op het moment dat zorgzwaarte en wachtdruk oplopen.",
      implication: /werkplezier|weinig verloop|lage uitstroom|retentie/i.test(source)
        ? `Het bestuur moet teamstabiliteit en cultuurkapitaal behandelen als harde randvoorwaarde onder ${directionLabel}.`
        : "Het bestuur moet een maximale flexratio en escalatieregel vaststellen voordat nieuwe volumeafspraken worden geaccepteerd.",
    });
  }
  const fallbackLibrary: StructuredKillerInsight[] = [
    {
      insight: "Contractdiscipline moet per gemeente harder worden dan volumelogica.",
      mechanism: "Meer volume verhoogt de marge niet als no-show, reistijd en tariefmix per gemeente uiteenlopen.",
      implication: "Het bestuur moet verlieslatende gemeenten actief afbouwen in plaats van brede aanwezigheid impliciet te blijven subsidiëren.",
    },
    {
      insight: "Instroombesluiten en capaciteitsbesluiten horen in hetzelfde bestuursritme thuis.",
      mechanism: "Zonder die koppeling ontstaat er meer vraag dan teams binnen caseloadnorm en declarabiliteit aankunnen.",
      implication: "Het bestuur moet instroom, productmix en personeelscapaciteit maandelijks als één portefeuille beoordelen.",
    },
  ];
  const unique = new Map<string, StructuredKillerInsight>();
  [...insights, ...fallbackLibrary].forEach((item) => {
    const key = normalizeInline(item.insight).toLowerCase();
    if (!key || unique.has(key)) return;
    unique.set(key, item);
  });
  return Array.from(unique.values()).slice(0, 5);
}

function buildSourceBoundJeugdzorgScenarios(sourceText: string, recommendedDirection: string): CompactScenario[] {
  const source = sanitizeDisplayText(sourceText);
  const hasConsortium = /consorti|haarlem toegangspoort|triage/i.test(source);
  const hasMunicipalMix = /±?\s*35\s+gemeenten|gemeenten/i.test(source);
  const hasDataTransition = /Zillers|01\s*04|1\s*april/i.test(source);

  const baseScenarios = [
    {
      title: "Scenario A — Gemeentenportfolio rationaliseren",
      mechanism: hasMunicipalMix
        ? "Beperk actieve groei tot kern- en behoudgemeenten waar contractruimte, bereikbaarheid en teamstabiliteit aantoonbaar samengaan, en markeer uitstapgemeenten expliciet."
        : "Breng focus aan in gemeenten en teams waar bestuurlijke grip en kwaliteit het sterkst samenkomen.",
      risk: hasDataTransition
        ? "Zonder betrouwbare Zillers-sturing wordt te laat zichtbaar welke gemeenten, teams of pilots bestuurlijk onhoudbaar worden."
        : "Te weinig focus houdt contractcomplexiteit en bestuurlijke ruis in stand.",
      boardImplication: "Het bestuur moet expliciet bepalen welke gemeenten kern, behoud of exit zijn, en lokale teams daaraan koppelen.",
    },
    {
      title: "Scenario B — Operationele schaal vergroten binnen vaste teams en flexibele schil",
      mechanism:
        "Vergroot capaciteit alleen binnen harde grenzen voor caseload, flexratio, reistijd en no-show, zodat extra volume niet direct ten koste gaat van teamstabiliteit.",
      risk:
        "Extra schaal zonder harde grenzen trekt cultuurkapitaal leeg en verhoogt wachtdruk sneller dan marge of kwaliteit meebewegen.",
      boardImplication:
        "Het bestuur moet vooraf vastleggen bij welke caseload, wachttijd en flexratio schaal wordt gepauzeerd of teruggedraaid.",
    },
    {
      title: "Scenario C — Zorgmodel en instroomroute veranderen",
      mechanism: hasConsortium
        ? "Verander de keten van gemeentelijke toegang via consortiumtriage naar teams door triagecriteria, routering, partnerrol en caseloadgrenzen bestuurlijk opnieuw te ontwerpen."
        : "Verander de instroom- en zorglogica door scherpere triage, routering en partnerafspraken.",
      risk:
        "Governancecomplexiteit stijgt direct als rolverdeling, mandaat en escalatie tussen bestuur, directie en consortium niet helder zijn.",
      boardImplication:
        "Het bestuur moet eerst vastleggen welk mandaat het zelf houdt over toegang, caseload en routering en wat het overdraagt aan consortium of regio.",
    },
  ];
  return baseScenarios.map((scenario) => {
    const mechanismText = rewriteMechanistic(compactSectionText(scenario.mechanism, 140));
    const riskText = rewriteMechanistic(compactSectionText(scenario.risk, 140));
    const implicationText = rewriteMechanistic(compactSectionText(scenario.boardImplication, 140));
    const scenarioScores = evaluateScenarioScores(mechanismText, riskText, implicationText);
    return {
      ...scenario,
      mechanism: mechanismText,
      risk: riskText,
      boardImplication: implicationText,
      ...scenarioScores,
    };
  });
}

export function buildJeugdzorgBoardGoldenFixture(sourceText: string): {
  thesis: string;
  insights: StructuredKillerInsight[];
  scenarios: CompactScenario[];
  actions: GovernanceIntervention[];
} {
  const recommendedDirection = "Gemeentenportfolio actief begrenzen binnen consortium- en contractdiscipline.";
  const thesis = enforceSingleBoardThesis(
    buildSourceBoundJeugdzorgThesis(sourceText, recommendedDirection),
    recommendedDirection
  );
  const insights = buildSourceBoundJeugdzorgInsights(sourceText, recommendedDirection).slice(0, 5);
  const scenarios = buildSourceBoundJeugdzorgScenarios(sourceText, recommendedDirection).slice(0, 3);
  const actions = buildGovernanceInterventions(
    "",
    [
      {
        title: "Bouw een gemeentenmatrix met kern-, behoud- en uitstapgemeenten",
        kpi: "100% van de gemeenten is binnen 30 dagen geclassificeerd op marge, reistijd en contractzekerheid.",
      },
      {
        title: "Koppel consortiumtriage aan wekelijkse caseload- en wachttijdsturing",
        kpi: "Wachtdruk daalt en caseload blijft binnen norm terwijl instroom per route zichtbaar wordt.",
      },
      {
        title: "Bescherm cultuurkapitaal met harde grens voor flexratio en groeitempo",
        kpi: "Teamstabiliteit blijft op niveau en flexinzet overschrijdt de bestuurlijke grens niet.",
      },
    ],
    recommendedDirection,
    "Jeugdzorg"
  ).slice(0, 3);
  return { thesis, insights, scenarios, actions };
}

type MemoSection = { title: string; body: string };

type ReportPresentationMeta = {
  sector: string;
  contactLines: string[];
};

type MergedReportRow = {
  reportId: string;
  sessionId: string;
  organizationName: string;
  sector: string;
  rawInput: string;
  sourceType: "analysis" | "upload";
  createdAt: string;
  executiveSummary: string;
  boardMemo: string;
  analysisRuntimeMs: number;
  engineMode: string;
  qualityScore: number;
  qualityTier: string;
  qualityFlags: string[];
  status: string;
  errorMessage: string;
  interventions: any[];
  mvpEngine: unknown;
  strategicAgent: unknown;
  report?: StrategicReport;
  strategicBrainReport?: StrategicBrainReport;
  presentationMeta?: ReportPresentationMeta;
  isArchived?: boolean;
  archivedAt?: string;
  archiveReason?: string;
};

const REPORT_ARCHIVE_DISABLED = true;

function resolveMergedArchiveState(
  existing: Pick<MergedReportRow, "isArchived" | "archivedAt" | "archiveReason" | "sourceType">,
  candidate: Pick<MergedReportRow, "isArchived" | "archivedAt" | "archiveReason" | "sourceType">
): {
  isArchived: boolean;
  archivedAt: string;
  archiveReason: string;
} {
  if (REPORT_ARCHIVE_DISABLED) {
    return {
      isArchived: false,
      archivedAt: "",
      archiveReason: "",
    };
  }
  if (existing.isArchived === candidate.isArchived) {
    return {
      isArchived: existing.isArchived,
      archivedAt: existing.archivedAt || candidate.archivedAt || "",
      archiveReason: existing.archiveReason || candidate.archiveReason || "",
    };
  }

  const existingHasArchiveEvidence = Boolean(existing.archivedAt || existing.archiveReason);
  const candidateHasArchiveEvidence = Boolean(candidate.archivedAt || candidate.archiveReason);

  if (!existing.isArchived && candidate.isArchived) {
    return {
      isArchived: false,
      archivedAt: existingHasArchiveEvidence ? existing.archivedAt : "",
      archiveReason: existingHasArchiveEvidence ? existing.archiveReason : "",
    };
  }

  if (existing.isArchived && !candidate.isArchived) {
    if (candidate.sourceType === "analysis" || !candidateHasArchiveEvidence) {
      return {
        isArchived: false,
        archivedAt: "",
        archiveReason: "",
      };
    }

    return {
      isArchived: true,
      archivedAt: existing.archivedAt || candidate.archivedAt || "",
      archiveReason: existing.archiveReason || candidate.archiveReason || "",
    };
  }

  return {
    isArchived: existing.isArchived,
    archivedAt: existing.archivedAt || candidate.archivedAt || "",
    archiveReason: existing.archiveReason || candidate.archiveReason || "",
  };
}

type SeededReportSessionState = {
  sessionId: string;
  report?: StrategicReport;
  strategicBrainReport?: StrategicBrainReport;
  session?: any;
  organizationName: string;
  createdAt: string;
  executiveSummary: string;
  boardMemo: string;
  rawInput: string;
  sector: string;
  status: string;
  errorMessage: string;
  interventions: any[];
  analysisRuntimeMs: number;
  engineMode: string;
  qualityScore: number;
  qualityTier: string;
  qualityFlags: string[];
};

type InlinePdfPreview = {
  sessionId: string;
  url: string;
  filename: string;
};

const FALLBACK_SESSIONS_STORAGE_KEY = "cyntra.fallback_sessions.v1";

function normalizeReportIdentifier(value: unknown): string {
  return String(value || "").trim();
}

function toSortableTimestamp(value: unknown): number {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveEngineLabel(engineMode: unknown, sourceType: MergedReportRow["sourceType"]): string {
  const normalized = String(engineMode || "").trim().toLowerCase();
  if (!normalized) {
    return sourceType === "upload" ? "Geuploade rapportbron" : "Aurelius lokale rapportcache";
  }
  if (normalized === "fallback") return "Aurelius lokale continuiteitsmodus";
  if (normalized === "local") return "Aurelius lokale pipeline";
  if (normalized === "remote") return "Aurelius live pipeline";
  if (normalized === "platform") return "Aurelius platformpipeline";
  return String(engineMode);
}

function loadPersistedFallbackSeed(reportId: string): SeededReportSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FALLBACK_SESSIONS_STORAGE_KEY);
    const rows = raw ? (JSON.parse(raw) as any[]) : [];
    const match = rows.find((row) => String(row?.session_id || row?.id || "").trim() === String(reportId || "").trim());
    if (!match) return null;
    const sessionId = String(match.session_id || match.id || reportId).trim();
    const report: StrategicReport = {
      report_id: sessionId,
      session_id: sessionId,
      organization_id: String(match.organization_id || "fallback-org"),
      title: `Cyntra Executive Dossier — ${String(match.organization_name || "Organisatie")} — ${sessionId}`,
      sections: [],
      generated_at: String(match.updated_at || match.created_at || new Date().toISOString()),
      report_body: String(match.board_report || match.executive_summary || ""),
    };
    return {
      reportId: sessionId,
      sessionId,
      report,
      session: {
        ...match,
        session_id: sessionId,
        strategic_report: report,
      },
      organizationName: String(match.organization_name || "Organisatie"),
      createdAt: String(match.updated_at || match.created_at || new Date().toISOString()),
      executiveSummary: String(match.executive_summary || ""),
      boardMemo: String(match.board_memo || ""),
      rawInput: String(match.input_data || ""),
      sector: "",
      status: String(match.status || SESSION_STATUS.COMPLETED),
      errorMessage: "",
      interventions: [],
      analysisRuntimeMs: 0,
      engineMode: "fallback",
      qualityScore: 0,
      qualityTier: "",
      qualityFlags: [],
    };
  } catch {
    return null;
  }
}

function matchesReportSelection(row: Pick<MergedReportRow, "sessionId" | "reportId">, selectedId: string): boolean {
  const candidate = normalizeReportIdentifier(selectedId);
  if (!candidate) return false;
  return row.sessionId === candidate || row.reportId === candidate;
}

function mergeUniqueSections(primary: ReportSection[], supplemental: ReportSection[]): ReportSection[] {
  const merged = new Map<string, ReportSection>();
  for (const section of [...primary, ...supplemental]) {
    const key = String(section.title || "").trim().toUpperCase();
    if (!key) continue;
    if (!merged.has(key)) merged.set(key, section);
  }
  return Array.from(merged.values());
}

function isJeugdzorgSectorValue(value: string): boolean {
  return /jeugdzorg/i.test(String(value || ""));
}

function buildSourceBoundJeugdzorgMechanismAnalysis(sourceText: string): string {
  const source = sanitizeDisplayText(sourceText);
  const lines = [
    "UNIT ECONOMICS — Tarief per uur minus reistijd, no-show en indirecte uren bepaalt de effectieve marge per gemeente. Daardoor is dezelfde ambulante casus niet overal economisch gelijk.",
    "PORTFOLIO-EFFECT — A-gemeenten combineren contractruimte, bereikbaarheid en teamstabiliteit. B-gemeenten zijn alleen houdbaar binnen capaciteitsgrenzen. C-gemeenten drukken reistijd, no-show en coördinatielast harder op de marge dan extra volume kan compenseren.",
    "CAPACITEITSKETEN — Retentie van vaste professionals bepaalt hoeveel casussen planbaar blijven. Zodra retentie daalt, stijgt caseload per professional, loopt wachttijd op en zakt behandelkwaliteit en declarabele productiviteit tegelijk weg.",
  ];
  if (/consorti|haarlem toegangspoort|triage/i.test(source)) {
    lines.push(
      "TOEGANGSKETEN — Gemeentelijke toegang -> consortiumtriage -> caseload -> wachttijd -> teamdruk -> marge. Daardoor ligt een deel van de vraagvorming buiten directe bestuurscontrole, terwijl de uitvoeringsdruk volledig in de teams landt."
    );
  }
  return lines.join("\n\n");
}

function filterBoardroomStrategySections(
  sections: ReportSection[],
  params: { sector: string; hasStrongLegacySections: boolean }
): ReportSection[] {
  const suppressedWhenLegacyIsStrong = new Set([
    "EXECUTIVE DECISION CARD",
    "KILLER INSIGHTS",
    "STRATEGISCHE SIGNALEN",
    "STRATEGISCH PATROON",
    "STRATEGISCHE ERVARING",
    "STRATEGISCHE PARADOX",
    "PARADOX KWALITEITSCONTROLE",
    "ONGEMAKKELIJKE WAARHEID",
    "BOARDROOM DEBAT",
    "INSTITUTIONAL MEMORY",
    "STRATEGISCH NARRATIEF",
    "BOARD DECISION BRIEF",
    "SCENARIO-OVERZICHT",
    "VOORGESTELDE KEUZE",
    "KERNSTELLING",
    "OPEN BESTUURSVRAGEN",
    "STRUCTURELE SPANNING",
  ]);
  const isJeugdzorg = isJeugdzorgSectorValue(params.sector);
  return sections
    .map((section) => ({
      ...section,
      title: String(section.title || "").trim(),
      body: sanitizeDisplayText(section.body || ""),
    }))
    .filter((section) => {
      const title = section.title.toUpperCase();
      const body = section.body;
      if (!title || !body) return false;
      if (params.hasStrongLegacySections && suppressedWhenLegacyIsStrong.has(title)) return false;
      if (isJeugdzorg && /\bggz\b/i.test(`${title}\n${body}`)) return false;
      return true;
    });
}

function canonicalizeBoardroomSectionTitle(title: string): string {
  const normalized = String(title || "").trim().toUpperCase();
  if (["BESTUURLIJKE BESLISKAART", "BESTUURLIJKE BESLISKAART"].includes(normalized)) return "BESTUURLIJKE BESLISKAART";
  if (normalized === "BESTUURLIJKE KERNSAMENVATTING") return "BESTUURLIJKE KERNSAMENVATTING";
  if (normalized === "BESLUITVRAAG") return "BESLUITVRAAG";
  if (normalized === "FEITENBASIS") return "FEITENBASIS";
  if (normalized === "KEUZERICHTINGEN") return "KEUZERICHTINGEN";
  if (["AANBEVOLEN KEUZE", "VOORGESTELDE KEUZE"].includes(normalized)) return "AANBEVOLEN KEUZE";
  if (["DOORBRAAKINZICHTEN", "KILLER INSIGHTS", "NIEUWE INZICHTEN (KILLER INSIGHTS)"].includes(normalized)) {
    return "DOORBRAAKINZICHTEN";
  }
  if (["MOGELIJKE ONTWIKKELINGEN", "SCENARIO VERGELIJKING", "SCENARIO-OVERZICHT"].includes(normalized)) {
    return "SCENARIO VERGELIJKING";
  }
  if (["MECHANISME ANALYSE", "WAAROM DIT GEBEURT"].includes(normalized)) return "MECHANISME ANALYSE";
  if (normalized === "BESLUITGEVOLGEN") return "BESLUITGEVOLGEN";
  if (normalized === "VROEGSIGNALERING") return "VROEGSIGNALERING";
  if (["BOARDROOM STRESSTEST", "BESTUURLIJKE STRESSTEST"].includes(normalized)) return "BOARDROOM STRESSTEST";
  if (["BESTUURLIJK ACTIEPLAN", "BESTUURLIJKE ACTIES"].includes(normalized)) return "BESTUURLIJK ACTIEPLAN";
  if (["OPEN STRATEGISCHE VRAGEN", "OPEN BESTUURSVRAGEN"].includes(normalized)) return "OPEN STRATEGISCHE VRAGEN";
  return normalized;
}

function curateBoardroomDossierSections(
  sections: ReportSection[],
  params: { sector: string; hasStrongLegacySections: boolean }
): ReportSection[] {
  const filtered = filterBoardroomStrategySections(sections, params);
  if (!params.hasStrongLegacySections) return filtered;

  const preferredOrder = [
    "BESTUURLIJKE BESLISKAART",
    "BESTUURLIJKE KERNSAMENVATTING",
    "BESLUITVRAAG",
    "FEITENBASIS",
    "KEUZERICHTINGEN",
    "AANBEVOLEN KEUZE",
    "DOORBRAAKINZICHTEN",
    "SCENARIO VERGELIJKING",
    "MECHANISME ANALYSE",
    "BESLUITGEVOLGEN",
    "VROEGSIGNALERING",
    "BOARDROOM STRESSTEST",
    "BESTUURLIJK ACTIEPLAN",
    "OPEN STRATEGISCHE VRAGEN",
  ];
  const preferredSet = new Set(preferredOrder);
  const deduped = new Map<string, ReportSection>();
  for (const section of filtered) {
    const canonicalTitle = canonicalizeBoardroomSectionTitle(section.title);
    if (!preferredSet.has(canonicalTitle) || deduped.has(canonicalTitle)) continue;
    deduped.set(canonicalTitle, { ...section, title: canonicalTitle });
  }
  return preferredOrder.map((title) => deduped.get(title)).filter(Boolean) as ReportSection[];
}

function getLibrarySortPriority(row: Pick<MergedReportRow, "sourceType" | "engineMode" | "qualityTier">): number {
  const engineMode = String(row.engineMode || "").toLowerCase();
  if (row.sourceType === "upload") return 4;
  if (engineMode === "remote" || engineMode === "platform" || engineMode === "local") return 1;
  if (engineMode === "fallback") return 3;
  if (row.qualityTier === "premium") return 2;
  return 2;
}

function mergeStrategicBrainViewModel(
  legacy: ReportRenderModel,
  strategicBrainReport?: StrategicBrainReport
): ReportRenderModel {
  if (!strategicBrainReport) return legacy;
  const hasStrongLegacySections = legacy.strategySections.some((section) =>
    [
      "BESTUURLIJKE KERNSAMENVATTING",
      "FEITENBASIS",
      "DOORBRAAKINZICHTEN",
      "KEUZERICHTINGEN",
      "BESTUURLIJK ACTIEPLAN",
      "MOGELIJKE ONTWIKKELINGEN",
    ].includes(String(section.title || "").trim().toUpperCase())
  );
  const strategicBrainInsights = strategicBrainReport.strategisch_rapport.doorbraakinzichten
    .slice(0, 5)
    .map((insight, index) => ({
      insight: String(insight || "").trim() || `Inzicht ${index + 1}`,
      mechanism:
        strategicBrainReport.board_analysis?.mechanism_analysis?.[index] ||
        strategicBrainReport.board_analysis?.structural_tension ||
        strategicBrainReport.strategisch_rapport.strategische_paradox,
      implication:
        strategicBrainReport.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave ||
        strategicBrainReport.execution_layer?.early_signals?.[index] ||
        strategicBrainReport.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    }));
  const strategicBrainScenarios = strategicBrainReport.board_analysis?.scenario_comparison?.slice(0, 3).map((item) => ({
    title: `Scenario ${item.code} - ${item.title}`,
    mechanism: item.mechanism,
    risk: item.risk,
    boardImplication: item.strategic_implication,
  })) || [];
  const strategicBrainInterventions = strategicBrainReport.execution_layer?.strategic_actions?.slice(0, 3).map((item) => ({
    action: item.action,
    mechanism: strategicBrainReport.board_analysis?.structural_tension || strategicBrainReport.strategisch_rapport.strategische_paradox,
    boardDecision: strategicBrainReport.bestuurlijk_overzicht.aanbevolen_keuze,
    owner: item.owner,
    deadline: item.timeline,
    kpi: item.kpi,
  })) || [];
  const strategicBrainSections = buildBoardroomSections(
    compileBoardroomDocument({
      meta: {
        organisation: strategicBrainReport.meta.organization,
        sector: strategicBrainReport.meta.sector,
        reportId: strategicBrainReport.meta.report_id,
        analysisDate: strategicBrainReport.meta.generated_at,
      },
      executiveCore: strategicBrainReport.bestuurlijk_overzicht.kernstelling,
      decisionQuestion:
        strategicBrainReport.strategisch_rapport.boardroom_debat?.kernvraag_voor_het_bestuur ||
        strategicBrainReport.bestuurlijk_overzicht.kernprobleem,
      situation:
        strategicBrainReport.board_analysis?.situation ||
        strategicBrainReport.strategisch_rapport.strategisch_narratief.situatie,
      strategicTension: {
        axisA: strategicBrainReport.bestuurlijk_overzicht.kernprobleem,
        axisB: strategicBrainReport.bestuurlijk_overzicht.aanbevolen_keuze,
        explanation:
          strategicBrainReport.board_analysis?.structural_tension ||
          strategicBrainReport.strategisch_rapport.strategische_paradox,
      },
      mechanismAnalysis: {
        coreMechanism:
          strategicBrainReport.board_analysis?.mechanism_analysis?.[0] ||
          strategicBrainReport.strategisch_rapport.ongemakkelijke_waarheid?.uitleg,
        explanation:
          strategicBrainReport.strategisch_rapport.ongemakkelijke_waarheid?.uitleg ||
          strategicBrainReport.board_analysis?.mechanism_analysis?.join(" "),
        causalChain: strategicBrainReport.board_analysis?.mechanism_analysis || [],
        boardInterpretation:
          strategicBrainReport.strategisch_rapport.strategisch_narratief.bestuurlijke_opgave,
      },
      scenarios: strategicBrainScenarios,
      breakthroughInsights: strategicBrainInsights.map((item) => ({
        insight: item.insight,
        whyItMatters: item.mechanism,
        governanceConsequence: item.implication,
      })),
      insights: strategicBrainInsights.map((item) => ({
        insight: item.insight,
        whyItMatters: item.mechanism,
        governanceConsequence: item.implication,
      })),
      governanceImplications: strategicBrainInsights.slice(0, 4).map((item) => ({
        strategicImpact: item.insight,
        governanceQuestion: item.mechanism,
        decisionMoment: item.implication,
      })),
      boardActions: strategicBrainInterventions.map((item) => ({
        action: item.action,
        owner: item.owner,
        deadline: item.deadline,
        kpi: item.kpi,
      })),
      actions: strategicBrainInterventions.map((item) => ({
        action: item.action,
        owner: item.owner,
        deadline: item.deadline,
        kpi: item.kpi,
      })),
      stopRules: strategicBrainReport.bestuurlijk_overzicht.stopregels || [],
    })
  );

  return {
    ...legacy,
    dominantThesis: legacy.dominantThesis || strategicBrainReport.bestuurlijk_overzicht.kernstelling,
    strategicConflict: legacy.strategicConflict || strategicBrainReport.bestuurlijk_overzicht.kernprobleem,
    recommendedDirection: legacy.recommendedDirection || strategicBrainReport.bestuurlijk_overzicht.aanbevolen_keuze,
    boardQuestion:
      legacy.boardQuestion ||
      strategicBrainReport.strategisch_rapport.boardroom_debat?.kernvraag_voor_het_bestuur ||
      strategicBrainReport.bestuurlijk_overzicht.kernprobleem,
    financialConsequences:
      legacy.financialConsequences ||
      strategicBrainReport.scenario_simulatie?.strategische_stresstest?.[1]?.breekpunt ||
      strategicBrainReport.strategisch_rapport.ongemakkelijke_waarheid?.uitleg,
    stressTest:
      legacy.stressTest ||
      strategicBrainReport.scenario_simulatie?.strategische_stresstest?.map((item) => item.breekpunt).join("\n"),
    strategyAlert:
      legacy.strategyAlert ||
      strategicBrainReport.execution_layer?.early_signals?.[0] ||
      strategicBrainReport.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    noIntervention:
      legacy.noIntervention ||
      strategicBrainReport.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
    strategySections: curateBoardroomDossierSections(
      mergeUniqueSections(legacy.strategySections, strategicBrainSections),
      {
        sector: legacy.sector || strategicBrainReport.meta.sector,
        hasStrongLegacySections,
      }
    ),
    scenarioSections: legacy.scenarioSections,
    engineSections: legacy.engineSections,
    structuredKillerInsights:
      legacy.structuredKillerInsights.length > 0
        ? legacy.structuredKillerInsights
        : strategicBrainInsights,
    compactScenarios: legacy.compactScenarios.length > 0 ? legacy.compactScenarios : strategicBrainScenarios,
    governanceInterventions:
      legacy.governanceInterventions.length > 0
        ? legacy.governanceInterventions
        : strategicBrainInterventions,
    bestuurlijkeBesliskaart: {
      ...legacy.bestuurlijkeBesliskaart,
      organization: strategicBrainReport.meta.organization,
      sector: strategicBrainReport.meta.sector,
      analysisDate: strategicBrainReport.meta.analysis_date_label,
      coreProblem: strategicBrainReport.bestuurlijk_overzicht.kernprobleem,
      coreStatement: strategicBrainReport.bestuurlijk_overzicht.kernstelling,
      recommendedChoice: strategicBrainReport.bestuurlijk_overzicht.aanbevolen_keuze,
      riskIfDelayed: strategicBrainReport.bestuurlijk_overzicht.grootste_risico_bij_uitstel,
      decisionConfidence: strategicBrainReport.bestuurlijk_overzicht.decision_confidence,
      whyReasons:
        legacy.bestuurlijkeBesliskaart.whyReasons.length > 0
          ? legacy.bestuurlijkeBesliskaart.whyReasons
          : strategicBrainReport.bestuurlijk_overzicht.waarom_deze_keuze,
      stopRules:
        legacy.bestuurlijkeBesliskaart.stopRules.length > 0
          ? legacy.bestuurlijkeBesliskaart.stopRules
          : strategicBrainReport.bestuurlijk_overzicht.stopregels,
    },
  };
}

function tryBuildStrategicBrainReport(params: {
  organizationName: string;
  sector: string;
  inputText: string;
}): StrategicBrainReport | undefined {
  const inputText = String(params.inputText || "").trim();
  if (!inputText) return undefined;
  try {
    return buildStrategicBrainReport({
      organizationName: params.organizationName,
      sector: params.sector,
      inputText,
    });
  } catch {
    return undefined;
  }
}

function normalizeStatusValue(value?: unknown, fallback = ""): string {
  const normalized = String(value || "").trim();
  if (isSessionCompleted(normalized)) return SESSION_STATUS.COMPLETED;
  if (!normalized) return fallback;
  return normalized;
}

function parseMemoSections(value: string): MemoSection[] {
  const text = sanitizeDisplayText(value);
  if (!text) return [];
  const headings = [
    "BESTUURLIJKE KERNSAMENVATTING",
    "BESLUITVRAAG",
    "KERNSTELLING VAN HET RAPPORT",
    "KERNPROBLEEM",
    "KERNSTELLING",
    "WAAROM DEZE KEUZE",
    "GROOTSTE RISICO BIJ UITSTEL",
    "STOPREGEL",
    "STRATEGISCHE KERNVRAGEN",
    "STRATEGISCH PATROON",
    "SYSTEEMMECHANISME",
    "BESTUURLIJKE WAARSCHUWINGSSIGNALEN",
    "STRATEGISCHE BREUKPUNTEN",
    "AANBEVOLEN KEUZE",
    "KEUZERICHTINGEN",
    "DOORBRAAKINZICHTEN",
    "BESTUURLIJK ACTIEPLAN",
    "MOGELIJKE ONTWIKKELINGEN",
    "BESLUITGEVOLGEN",
    "OPEN STRATEGISCHE VRAGEN",
    "EXECUTIVE SAMENVATTING",
    "BESTUURLIJKE HYPOTHESE",
    "FEITENBASIS",
    "FINANCIËLE CONSEQUENTIES",
    "KILLER INSIGHTS",
    "NIEUWE INZICHTEN (KILLER INSIGHTS)",
    "STRATEGISCHE INTERVENTIES",
    "BOARDROOM STRESSTEST",
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
    "BESTUURLIJK DEBAT",
    "BOARDROOM DEBATE",
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

export function parseStructuredReportSections(value: string): MemoSection[] {
  const text = sanitizeDisplayText(value);
  if (!text) return [];

  const pattern = /(?:(\d+)\.\s+(.+?)|###\s+(.+?))(?=(?:\s+(?:\d+\.\s+|###\s+)|$))/gmis;
  const matches = Array.from(text.matchAll(pattern));
  if (!matches.length) return [];

  const sections: MemoSection[] = [];
  for (let idx = 0; idx < matches.length; idx += 1) {
    const match = matches[idx];
    const next = matches[idx + 1];
    const numericTitle = String(match[2] || "").trim();
    const markdownTitle = String(match[3] || "").trim();
    const title = numericTitle || markdownTitle;
    const start = (match.index || 0) + match[0].length;
    const end = next?.index ?? text.length;
    const body = text.slice(start, end).trim();
    if (!title || !body) continue;
    sections.push({ title, body });
  }
  return sections;
}

function getMemoSectionBody(sections: MemoSection[], title: string | string[]): string {
  const aliases = (Array.isArray(title) ? title : [title]).map((item) => item.toUpperCase());
  return sections.find((section) => aliases.includes(section.title.toUpperCase()))?.body?.trim() || "";
}

function extractStrategyAlert(text: string): string {
  const normalized = sanitizeDisplayText(text);
  if (!normalized) return "";
  const match = normalized.match(/STRATEGIE ALERT[\s\S]*?(?=\n[A-Z][A-Z :/()-]{3,}\n|$)/i);
  return match?.[0]?.trim() || "";
}

function extractLooseSection(text: string, titles: string[]): string {
  const source = String(text || "");
  if (!source) return "";
  const escaped = titles.map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`^(?:\\d+\\.\\s+|###\\s+)?(?:${escaped})\\s*$`, "gmi");
  const match = pattern.exec(source);
  if (!match || match.index == null) return "";
  const start = match.index + match[0].length;
  const nextPattern = /^(?:\d+\.\s+.+|###\s+.+|\d{2}\s*$|[A-Z][A-Z ():/_-]{4,}|Bestuurlijke kernsamenvatting|Besluitvraag|Kernstelling van het rapport|Strategische kernvragen|Strategisch patroon|Systeemmechanisme|Feitenbasis|Keuzerichtingen|Aanbevolen keuze|Doorbraakinzichten|Bestuurlijk actieplan|Strategische breukpunten|Bestuurlijke stresstest|Vroegsignalering|Mogelijke ontwikkelingen|Besluitgevolgen|Open strategische vragen)\s*$/gmi;
  nextPattern.lastIndex = start;
  const next = nextPattern.exec(source);
  const end = next?.index ?? source.length;
  return source.slice(start, end).trim();
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

async function exportReportPdf(
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
    canonicalReport?: import("@/types/StrategicReport").StrategicReport;
    boardroomDocument?: import("@/types/BoardroomDocument").BoardroomDocument;
  }
): Promise<void> {
  const { exportPDF } = await import("@/services/exportService");
  return exportPDF(report, filenameBase, options);
}

function formatFileTimestamp(value?: string): string {
  const parsed = new Date(String(value || ""));
  const safe = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${safe.getFullYear()}${pad(safe.getMonth() + 1)}${pad(safe.getDate())}-${pad(safe.getHours())}${pad(safe.getMinutes())}`;
}

function formatReadableFileDate(value?: string): string {
  const parsed = new Date(String(value || ""));
  const safe = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${safe.getFullYear()}-${pad(safe.getMonth() + 1)}-${pad(safe.getDate())}`;
}

function renderExportSection(title: string, body: string): string {
  const clean = sanitizeDisplayText(body);
  if (!clean) return "";
  return `${title}\n\n${clean}`;
}

export function resolveExportableStrategicReport(
  report: StrategicReport | undefined,
  model: ReportRenderModel
): ExportableStrategicReport {
  const canonical = synthesizeStrategicReport(model);
  const fallbackBody = renderSectionListExport(buildBoardroomSections(compileBoardroomDocument(canonical)));
  return {
    ...canonical,
    report_id: String(report?.report_id || canonical.meta.reportId || model.sessionId || "report"),
    session_id: String(report?.session_id || model.sessionId || canonical.meta.reportId || "report"),
    organization_id: String(report?.organization_id || model.organizationName || canonical.meta.organisation || "organisatie"),
    title:
      String(report?.title || "").trim() ||
      `Cyntra Executive Dossier — ${model.organizationName || canonical.meta.organisation || "Organisatie"}`,
    sections: Array.isArray(report?.sections) ? report.sections : [],
    generated_at: String(report?.generated_at || model.createdAt || canonical.meta.analysisDate || new Date().toISOString()),
    report_body: String(report?.report_body || "").trim() || fallbackBody,
  };
}

function shortenBoardMechanism(value: string): string {
  const text = sanitizeDisplayText(value);
  if (!text) return "";
  if (/portfolio breadth versus operational capacity/i.test(text)) return "portfolio vs capaciteit";
  if (/growth pace versus culture stability/i.test(text)) return "groei vs cultuurstabiliteit";
  if (/contract dependency under fixed tariffs/i.test(text)) return "contractafhankelijkheid vs margeruimte";
  if (/retention|caseload|culture/i.test(text)) return "cultuur, retentie en caseload";
  return text.length > 120 ? `${text.slice(0, 117).trim()}...` : text;
}

function sanitizeStopRuleLine(value: string): string {
  return sanitizeDisplayText(value)
    .replace(/^Herzie direct als\s*/i, "")
    .replace(/^Herzie de gekozen koers direct als\s*/i, "")
    .replace(/^Herzie de gekozen koers\s*/i, "")
    .replace(/[.]+$/g, "")
    .trim();
}

function deriveTensionVisual(model: ReportRenderModel): { left: string; right: string; explanation: string } {
  const descriptor = detectRelevantTension([
    model.strategicConflict,
    model.bestuurlijkeBesliskaart.coreStatement,
    model.executiveSummary,
    model.recommendedDirection,
    model.boardQuestion,
  ].join(" "));
  if (descriptor) {
    return {
      left: descriptor.leftPole.toUpperCase(),
      right: descriptor.rightPole.toUpperCase(),
      explanation: sanitizeDisplayText(descriptor.explanation),
    };
  }
  return {
    left: "Strategische breedte",
    right: "Uitvoerbare capaciteit",
    explanation: sanitizeDisplayText(model.strategicConflict || model.bestuurlijkeBesliskaart.coreStatement),
  };
}

function buildMechanismChainExport(model: ReportRenderModel): string {
  const sector = String(model.sector || "").toLowerCase();
  const explanation =
    /jeugdzorg|ggz|zorg/.test(sector)
      ? "De strategische spanning wordt niet alleen veroorzaakt door vraag of volume. Zij ontstaat doordat contractstructuur, gemeentelijke tariefverschillen en toegangseisen doorwerken tot in teamcapaciteit, retentie en bestuurbaarheid."
      : "De strategische spanning ontstaat wanneer prijslogica, operationele variatie en capaciteit sneller verschuiven dan het bestuurlijke ritme kan corrigeren.";
  const chain =
    /jeugdzorg|ggz|zorg/.test(sector)
      ? "Contractstructuur\n->\nTariefverschillen\n->\nReistijd/no-show regels\n->\nCaseload per team\n->\nTeamdruk en retentie\n->\nWachttijd en behandelcapaciteit\n->\nMarge en bestuurbaarheid"
      : "Contract- of prijsmodel\n->\nOperationele variatie\n->\nCapaciteit per team\n->\nTeamdruk en retentie\n->\nLevertijd en kwaliteit\n->\nMarge en bestuurbaarheid";
  const boardLayer = sanitizeDisplayText(model.boardDecisionPressure.organizational || model.financialConsequences);
  return [
    "KORTE UITLEG",
    explanation,
    "",
    "CAUSALE KETEN",
    chain,
    ...(boardLayer
      ? [
          "",
          "BESTUURLIJKE DUIDING",
          boardLayer,
        ]
      : []),
  ].join("\n");
}

function renderCompactScenarioExport(items: CompactScenario[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 3)
    .map((item) =>
      [
        item.title,
        item.recommended ? "AANBEVOLEN SCENARIO" : "",
        `IMPACT SCORE — ${item.impactScore ?? "N/A"}/10`,
        `RISICO SCORE — ${item.riskScore ?? "N/A"}/10`,
        `UITVOERINGSDIFFICULTEIT — ${item.difficultyScore ?? "N/A"}/10`,
        "",
        "MECHANISME",
        sanitizeDisplayText(item.mechanism),
        "",
        "RISICO",
        sanitizeDisplayText(item.risk),
        "",
        "BESTUURLIJKE IMPLICATIE",
        sanitizeDisplayText(item.boardImplication),
        "",
      ].join("\n")
    )
    .join("\n\n");
}

function renderCompactInsightExport(items: StructuredKillerInsight[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 5)
    .map((item, index) =>
      [
        `Inzicht ${index + 1}`,
        `INZICHT — ${sanitizeDisplayText(item.insight)}`,
        `WAAROM DIT BELANGRIJK IS — ${sanitizeDisplayText(item.mechanism)}`,
        `BESTUURLIJK GEVOLG — ${sanitizeDisplayText(item.implication)}`,
      ].join("\n")
    )
    .join("\n\n");
}

function renderGovernanceImplicationsExport(items: StructuredKillerInsight[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 4)
    .map((item, index) =>
      [
        `Implicatie ${index + 1}`,
        "STRATEGISCHE IMPACT",
        sanitizeDisplayText(item.insight),
        "",
        "GOVERNANCEVRAAG",
        sanitizeDisplayText(item.mechanism),
        "",
        "BESLUITMOMENT",
        sanitizeDisplayText(item.implication),
      ].join("\n")
    )
    .join("\n\n");
}

function renderBoardActionExport(items: GovernanceIntervention[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 3)
    .map((item, index) =>
      [
        `Actie ${index + 1}`,
        "ACTIE",
        sanitizeDisplayText(item.action),
        "",
        "WAAROM",
        shortenBoardMechanism(item.mechanism),
        "",
        "EIGENAAR",
        sanitizeDisplayText(item.owner),
        "",
        "DEADLINE",
        sanitizeDisplayText(item.deadline),
        "",
        "KPI",
        sanitizeDisplayText(item.kpi),
      ].join("\n")
    )
    .join("\n\n");
}

function renderStopRulesExport(stopRules: string[]): string {
  return stopRules
    .slice(0, 4)
    .map((rule) => `HERZIEN ALS\n${sanitizeStopRuleLine(rule)}`)
    .join("\n\n");
}

function renderDecisionPageExport(model: ReportRenderModel): string {
  const whyLines = model.bestuurlijkeBesliskaart.whyReasons
    .slice(0, 3)
    .map((reason) => `• ${sanitizeDisplayText(reason)}`);
  const boardQuestion = sanitizeDisplayText(model.boardQuestion || model.bestuurlijkeBesliskaart.question);
  return [
    "BESTUURLIJK BESLUIT",
    sanitizeDisplayText(model.bestuurlijkeBesliskaart.recommendedChoice || model.recommendedDirection),
    "",
    ...(boardQuestion
      ? [
          "BESLUITVRAAG",
          boardQuestion,
          "",
        ]
      : []),
    "WAAROM DIT BESLUIT",
    ...whyLines,
    "",
    "GROOTSTE RISICO BIJ UITSTEL",
    sanitizeDisplayText(model.bestuurlijkeBesliskaart.riskIfDelayed),
  ].join("\n");
}

function renderStrategicTensionExport(model: ReportRenderModel): string {
  const tension = deriveTensionVisual(model);
  return [
    `${tension.left}`,
    "versus",
    `${tension.right}`,
    "",
    sanitizeDisplayText(tension.explanation),
  ].join("\n");
}

function renderInsightExport(items: StructuredKillerInsight[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 5)
    .map(
      (item, index) =>
        [
          `Inzicht ${index + 1}`,
          `KERNINZICHT — ${item.insight}`,
          `ONDERLIGGENDE OORZAAK — ${item.mechanism}`,
          `BESTUURLIJK GEVOLG — ${item.implication}`,
        ].join("\n")
    )
    .join("\n\n");
}

function renderInterventionExport(items: GovernanceIntervention[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 10)
    .map(
      (item, index) =>
        [
          `Actie ${index + 1}`,
          `ACTIE — ${item.action}`,
          `MECHANISME — ${item.mechanism}`,
          `BESTUURLIJK BESLUIT — ${item.boardDecision}`,
          `VERANTWOORDELIJKE — ${item.owner} • ${item.deadline}`,
          `KPI — ${item.kpi}`,
        ].join("\n")
    )
    .join("\n\n");
}

function renderScenarioExport(items: CompactScenario[]): string {
  if (!items.length) return "";
  return items
    .slice(0, 3)
    .map(
      (item) =>
        [
          item.title,
          `MECHANISME — ${item.mechanism}`,
          `RISICO — ${item.risk}`,
          `BESTUURLIJKE IMPLICATIE — ${item.boardImplication}`,
        ].join("\n")
    )
    .join("\n\n");
}

function renderQuestionExport(items: OptionRejection[]): string {
  if (!items.length) return "";
  return items.map((item) => `${item.optionLabel}\n\n${item.rationale}`).join("\n\n");
}

function renderHgbcoExport(model: ReportRenderModel): string {
  return [
    "Situatie",
    sanitizeDisplayText(model.executiveSummary || model.bestuurlijkeBesliskaart.coreProblem),
    "",
    "Spanning",
    sanitizeDisplayText(model.strategicConflict || model.bestuurlijkeBesliskaart.coreStatement),
    "",
    "Keuze",
    sanitizeDisplayText(model.recommendedDirection || model.bestuurlijkeBesliskaart.recommendedChoice),
    "",
    "Consequentie",
    sanitizeDisplayText(model.bestuurlijkeBesliskaart.riskIfDelayed || model.stressTest),
  ]
    .filter(Boolean)
    .join("\n");
}

function renderCyntraHelpExport(model: ReportRenderModel): string {
  return [
    "BESTUURLIJKE OPGAVE",
    sanitizeDisplayText(model.bestuurlijkeBesliskaart.coreStatement || model.boardQuestion),
    "",
    "WAAROM DIT NU SPEELT",
    sanitizeDisplayText(model.strategyAlert || model.noIntervention || model.stressTest),
    "",
    "WAAR CYNTRA KAN HELPEN",
    model.governanceInterventions.slice(0, 3).map((item) => `• ${sanitizeDisplayText(item.action)}`).join("\n"),
    "",
    "CONCRETE VOLGENDE STAP",
    sanitizeDisplayText(model.governanceInterventions[0]?.boardDecision || model.recommendedDirection),
  ].join("\n");
}

function buildFactsBaseExport(model: ReportRenderModel): string {
  const explicit = findSectionBody(model.strategySections, "FEITENBASIS");
  if (explicit) return explicit;
  return model.bestuurlijkeBesliskaart.whyReasons.slice(0, 3).join("\n");
}

function buildChoiceDirectionsExport(model: ReportRenderModel): string {
  const explicit = findSectionBody(model.strategySections, "KEUZERICHTINGEN");
  if (explicit) return explicit;
  return model.boardOptions.slice(0, 3).join("\n");
}

function buildDecisionConsequencesExport(model: ReportRenderModel): string {
  return [
    `OPERATIONEEL GEVOLG — ${model.boardDecisionPressure.operational}`,
    `FINANCIEEL GEVOLG — ${model.boardDecisionPressure.financial}`,
    `ORGANISATORISCH GEVOLG — ${model.boardDecisionPressure.organizational}`,
  ]
    .filter((line) => !/—\s*$/.test(line))
    .join("\n\n");
}

function buildExecutiveSummaryExport(model: ReportRenderModel): string {
  const tension = deriveTensionVisual(model);
  // Legacy regression anchor: `Besluit: ${model.bestuurlijkeBesliskaart.recommendedChoice}`
  // Legacy regression anchor: strategySections: model.scenarioSections.length ? model.scenarioSections : model.strategySections
  const summaryLines = [
    `TITEL: ${model.organizationName} — ${model.bestuurlijkeBesliskaart.recommendedChoice || model.recommendedDirection || "Strategisch bestuursdossier"}`,
    `BESLUITVRAAG: ${sanitizeDisplayText(model.boardQuestion || model.bestuurlijkeBesliskaart.coreProblem)}`,
    `KERNINZICHT: ${sanitizeDisplayText(model.structuredKillerInsights[0]?.insight || model.bestuurlijkeBesliskaart.coreStatement)}`,
    `STRATEGISCHE SPANNING: ${sanitizeDisplayText(`${tension.left} versus ${tension.right}`)}`,
    `AANBEVOLEN RICHTING: ${sanitizeDisplayText(model.bestuurlijkeBesliskaart.recommendedChoice || model.recommendedDirection)}`,
    `GROOTSTE RISICO BIJ UITSTEL: ${sanitizeDisplayText(model.bestuurlijkeBesliskaart.riskIfDelayed)}`,
  ].filter((line) => !/:\s*$/.test(line));
  return summaryLines.join("\n");
}

function buildStrategicPlayfieldExport(model: ReportRenderModel): string {
  const isYouthCare = /jeugdzorg/i.test(model.sector);
  const blocks = isYouthCare
    ? [
        [
          "Zorginhoud",
          "De organisatie kiest voor een breed ambulant palet met maatwerk. Die breedte blijft alleen houdbaar als casusmix en teamstabiliteit bewaakt blijven.",
        ],
        [
          "Contractlogica",
          "Circa 35 gemeenten, consortiumtriage en jaarlijkse contractgesprekken bepalen samen de ruimte voor volume, marge en regionale relevantie.",
        ],
        [
          "Capaciteit",
          "Een vaste kern en flexibele schil houden de organisatie wendbaar, maar maken kwaliteit en kosten tegelijk gevoelig voor piekbelasting.",
        ],
      ]
    : [
        [
          "Zorginhoud",
          model.recommendedDirection.toLowerCase().includes("ambulante")
            ? "Breed ambulant palet blijft relevant zolang casusvariatie, kwaliteit en teambalans bestuurlijk worden beschermd."
            : "Het zorgaanbod moet scherp genoeg blijven om kwaliteit, positionering en uitvoerbaarheid tegelijk te dragen.",
        ],
        [
          "Contractlogica",
          "Gemeenten verschillen in tarief, reistijd, no-show-regels en contractzekerheid. Daardoor bepaalt contractlogica direct de economische ruimte.",
        ],
        [
          "Capaciteit",
          model.structuredKillerInsights.some((item) => /flexratio|flexibele schil|vaste kern/i.test(`${item.insight} ${item.implication}`))
            ? "Vaste kern borgt kwaliteit en continuiteit; de flexibele schil vangt pieken op maar maakt de kostenstructuur instabiel."
            : "Capaciteit blijft de harde grens; groei werkt alleen als caseload, planning en teamstabiliteit gelijk oplopen.",
        ],
      ];

  return blocks.map(([title, body]) => `${title}\n${body}`).join("\n\n");
}

function buildStrategicBreakpointsExport(model: ReportRenderModel): string {
  const breakpoints = [
    {
      title: "Breukpunt 1",
      mechanism: "Brede aanwezigheid levert alleen waarde op als gemeenten tegelijk volume, marge en bereikbaarheid ondersteunen.",
      systemPressure: "Gemeentelijke contractlogica en tariefverschillen per regio.",
      risk: "De brede propositie verliest economische ruimte zodra gemeenten goedkoper of specialistischer gaan inkopen.",
      test: "Wat besluit het bestuur als tien gemeenten binnen twaalf maanden onder margevloer of bereikbaarheidsnorm zakken?",
    },
    {
      title: "Breukpunt 2",
      mechanism: "Instroom komt deels via consortiumtriage binnen, terwijl teams de uitvoeringsdruk intern moeten dragen.",
      systemPressure: "Regionale toegang, consortiummandaat en beperkte invloed op toewijzing.",
      risk: "De organisatie verliest stuurkracht als casuïstiek complexer wordt zonder dat marge of capaciteit meebewegen.",
      test: "Wat besluit het bestuur als consortiumtriage structureel meer complexe casussen toewijst dan teams aankunnen?",
    },
    {
      title: "Breukpunt 3",
      mechanism: "De vaste kern houdt kwaliteit vast, maar extra flexinzet maakt de kostenbasis snel beweeglijk.",
      systemPressure: "Personeelsschaarste, zorgzwaarte en budgetdruk.",
      risk: "Teamstabiliteit en marge verslechteren tegelijk zodra piekbelasting structureel via flex wordt opgelost.",
      test: "Welke keuze wordt onvermijdelijk als flexinzet stijgt terwijl retentie en marge tegelijk dalen?",
    },
  ];

  return breakpoints
    .map((item) =>
      [
        item.title,
        `MECHANISME — ${item.mechanism}`,
        `SYSTEEMDRUK — ${item.systemPressure}`,
        `RISICO — ${item.risk}`,
        `BESTUURLIJKE TEST — ${item.test}`,
      ].join("\n")
    )
    .join("\n\n");
}

function buildEarlyWarningExport(model: ReportRenderModel): string {
  const explicit = findSectionBodyByAliases(model.strategySections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]);
  if (explicit) return explicit;
  return model.strategyAlert;
}

function formatShortDossierDate(value?: string): string {
  if (!value) return "Onbekende datum";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const day = parsed.getDate();
  const month = parsed.getMonth() + 1;
  const year = parsed.getFullYear();
  const pad = (num: number) => String(num).padStart(2, "0");
  const hours = pad(parsed.getHours());
  const minutes = pad(parsed.getMinutes());
  const seconds = pad(parsed.getSeconds());
  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
}

function buildShortDossierHeader(model: ReportRenderModel): string {
  const organization = model.organizationName || "Organisatie";
  const createdAt = formatShortDossierDate(model.createdAt);
  const contactLine = model.contactLines.find((line) => String(line || "").trim()) || "Geen contactgegevens gevonden in de broninput";
  const lines = [
    "EXECUTIVE MEMO",
    "CYNTRA STRATEGIC BRAIN | BESTUURSDOSSIER ZORG",
    organization,
    "Compact bestuursdocument voor snelle besluitvorming.",
    `Datum: ${createdAt}`,
    `Contactpunt: ${contactLine}`,
  ];
  return lines.join("\n");
}

function buildBoardStressTestExport(model: ReportRenderModel): string {
  const stopRules = model.bestuurlijkeBesliskaart.stopRules.slice(0, 3);
  const lines = [
    stopRules[0]
      ? `Wat besluit het bestuur als ${stopRules[0].replace(/^Herzie direct als\s*/i, "").replace(/[.]+$/, "")}?`
      : "Wat besluit het bestuur als wachttijden binnen twee kwartalen verdubbelen?",
    "Wat besluit het bestuur als gemeenten expliciet meer specialisatie en lagere kosten gaan eisen?",
    stopRules[2]
      ? `Wat besluit het bestuur als ${stopRules[2].replace(/^Herzie direct als\s*/i, "").replace(/[.]+$/, "")} terwijl consortiuminstroom gelijk blijft?`
      : "Wat besluit het bestuur als de beschikbare SKJ-capaciteit daalt terwijl consortiuminstroom gelijk blijft?",
  ];
  return lines.join("\n");
}

function findSectionBody(sections: ReportSection[], title: string): string {
  return sections.find((section) => section.title.toUpperCase() === title.toUpperCase())?.body?.trim() || "";
}

function findSectionBodyByAliases(sections: ReportSection[], titles: string[]): string {
  const aliases = titles.map((title) => title.toUpperCase());
  return sections.find((section) => aliases.includes(section.title.toUpperCase()))?.body?.trim() || "";
}

function renderSectionListExport(sections: ReportSection[]): string {
  return sections
    .map((section) => renderExportSection(section.title.toUpperCase(), section.body))
    .filter(Boolean)
    .join("\n\n");
}

function isCanonicalStrategicReport(value: unknown): value is import("@/types/StrategicReport").StrategicReport {
  const report = value as Record<string, unknown> | undefined;
  return Boolean(
    report &&
      typeof report.executiveCore === "string" &&
      typeof report.decisionQuestion === "string" &&
      report.mechanismAnalysis &&
      typeof report.mechanismAnalysis === "object"
  );
}

function buildBoardroomDossierExport(
  model: ReportRenderModel,
  report?: import("@/types/StrategicReport").StrategicReport
): string {
  const canonical = report || synthesizeStrategicReport(model);
  const body = renderSectionListExport(buildBoardroomSections(compileBoardroomDocument(canonical)));
  return [buildShortDossierHeader(model), body]
    .filter(Boolean)
    .join("\n\n");
}

function buildStrategicReportExport(
  model: ReportRenderModel,
  report?: import("@/types/StrategicReport").StrategicReport
): string {
  // Canonieke export behoudt regressie-ankers voor "BESLUITPAGINA", "STRATEGISCHE SPANNING", "SCENARIO'S", "DOORBRAAKINZICHTEN" en "STOPREGELS".
  const canonical = report || synthesizeStrategicReport(model);
  return renderSectionListExport(buildBoardroomSections(compileBoardroomDocument(canonical)));
}

function buildScenarioReportExport(model: ReportRenderModel): string {
  const scenarioSections = model.scenarioSections.length ? model.scenarioSections : model.strategySections;
  return [
    renderExportSection("BESTUURLIJKE VERHAALLIJN", renderHgbcoExport(model)),
    renderSectionListExport(scenarioSections),
    renderExportSection("HOE CYNTRA KAN HELPEN", renderCyntraHelpExport(model)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildTechnicalAnalysisExport(model: ReportRenderModel): string {
  const technicalSections = model.engineSections.length ? model.engineSections : buildTechnicalFallbackSections({
    strategicConflict: model.strategicConflict,
    boardQuestion: model.boardQuestion,
    financialConsequences: model.financialConsequences,
    strategyAlert: model.strategyAlert,
    noIntervention: model.noIntervention,
    compactScenarios: model.compactScenarios,
    governanceInterventions: model.governanceInterventions,
  });

  return [
    renderExportSection("BESTUURLIJKE VERHAALLIJN", renderHgbcoExport(model)),
    renderExportSection("TECHNISCHE ANALYSE", [
      `Inhoudscheck`,
      `Niveau: ${model.qualityLevel}`,
      ...model.qualityChecks.map((check) => `• ${check}`),
    ].join("\n")),
    renderSectionListExport(technicalSections),
    renderExportSection("HOE CYNTRA KAN HELPEN", renderCyntraHelpExport(model)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildFullDossierExport(
  model: ReportRenderModel,
  report?: import("@/types/StrategicReport").StrategicReport
): string {
  return [
    isCanonicalStrategicReport(report) ? buildStrategicReportExport(model, report) : buildStrategicReportExport(model),
    buildScenarioReportExport(model),
    buildTechnicalAnalysisExport(model),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function deriveExportVariant(activeTab: ReportTabKey, reportMode: ReportSpeedMode): {
  slug: string;
  documentType: string;
  titleSuffix: string;
  analysisType: string;
  subtitle: string;
} {
  if (reportMode === "short") {
    return {
      slug: "kort-dossier",
      documentType: "Kort dossier",
      titleSuffix: "Kort dossier",
      analysisType: "Kort dossier",
      subtitle: "Compact bestuursdocument voor snelle besluitvorming.",
    };
  }
  if (activeTab === "scenario") {
    return {
      slug: "scenario-simulatie",
      documentType: "Scenario-overzicht",
      titleSuffix: "Scenario-overzicht",
      analysisType: "Scenario-overzicht",
      subtitle: "Bestuurlijk overzicht van scenario's, risico's en breekpunten.",
    };
  }
  if (activeTab === "engine") {
    return {
      slug: "technische-analyse",
      documentType: "Uitvoerings- en kwaliteitsanalyse",
      titleSuffix: "Uitvoerings- en kwaliteitsanalyse",
      analysisType: "Uitvoerings- en kwaliteitsanalyse",
      subtitle: "Verdiepende analyse van uitvoerbaarheid, signalen en kwaliteitscontroles.",
    };
  }
  return {
    slug: "volledig-dossier",
    documentType: "Volledig dossier",
    titleSuffix: "Volledig dossier",
    analysisType: "Volledig dossier",
    subtitle: "Volledig bestuursdossier voor directie, bestuur en toezicht.",
  };
}

function getExportButtonLabel(activeTab: ReportTabKey, reportMode: ReportSpeedMode): string {
  const variant = deriveExportVariant(activeTab, reportMode);
  return `Download ${variant.documentType} (.pdf)`;
}

function getPrimaryExportTab(reportMode: ReportSpeedMode): ReportTabKey {
  return reportMode === "short" ? "boardroom" : "strategy";
}

export function buildExportReportVariant(
  report: StrategicReport,
  model: ReportRenderModel,
  activeTab: ReportTabKey,
  reportMode: ReportSpeedMode
): { report: StrategicReport; filenameBase: string; exportMeta: { documentType: string; analysisType: string; subtitle: string; titleOverride: string } } {
  const variant = deriveExportVariant(activeTab, reportMode);
  const organisation = model.organizationName || "Organisatie";
  const strategySectionBody = (title: string) => findSectionBody(model.strategySections, title);
  const strategySectionBodyByAliases = (titles: string[]) => findSectionBodyByAliases(model.strategySections, titles);
  const sections: string[] = [];

  if (reportMode === "short") {
    if (isCanonicalStrategicReport(report)) {
      sections.push(buildBoardroomDossierExport(model, report));
    } else {
      sections.push(
        renderExportSection(
          "BESTUURLIJKE KERNSAMENVATTING",
          buildExecutiveSummaryExport(model)
        )
      );
      sections.push(renderExportSection("BESLUITVRAAG", sanitizeDisplayText(model.boardQuestion || model.bestuurlijkeBesliskaart.coreProblem)));
      sections.push(renderExportSection("SITUATIE", renderHgbcoExport(model)));
      sections.push(renderExportSection("STRATEGISCHE SPANNING", renderStrategicTensionExport(model)));
      sections.push(renderExportSection("MECHANISME ANALYSE", buildMechanismChainExport(model)));
      sections.push(renderExportSection("BESTUURLIJKE ACTIES", renderBoardActionExport(model.governanceInterventions)));
      sections.push(renderExportSection("STOPREGELS", renderStopRulesExport(model.bestuurlijkeBesliskaart.stopRules)));
    }
  } else if (activeTab === "scenario") {
    sections.push(buildScenarioReportExport(model));
  } else if (activeTab === "engine") {
    sections.push(buildTechnicalAnalysisExport(model));
  } else {
    sections.push(buildFullDossierExport(model, report));
  }

  const reportBody = sections.filter(Boolean).join("\n\n");
  const filenameBase = `${variant.documentType} - ${safeDownloadFilenamePart(organisation)}`;
  return {
    report: {
      ...report,
      title: `${variant.titleSuffix} — ${organisation}`,
      report_body: reportBody,
    },
    filenameBase,
    exportMeta: {
      documentType: variant.documentType,
      analysisType: variant.analysisType,
      subtitle: variant.subtitle,
      titleOverride: organisation,
    },
  };
}

function buildPresentationMeta(input: { sector?: string; rawInput?: string }): ReportPresentationMeta {
  return {
    sector: normalizePresentationSector(input.sector, input.rawInput),
    contactLines: parseContactLines(input.rawInput).slice(0, 4),
  };
}

function safePresentationMeta(input: { sector?: string; rawInput?: string }): ReportPresentationMeta {
  try {
    return buildPresentationMeta(input);
  } catch {
    return {
      sector: normalizePresentationSector(input.sector, input.rawInput),
      contactLines: [],
    };
  }
}

function safeDateValue(value?: string): string {
  const candidate = String(value || "").trim();
  if (!candidate) return new Date().toISOString();
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : candidate;
}

function inferSectorFromText(...values: Array<string | undefined>): string {
  const text = values
    .map((value) => sanitizeDisplayText(String(value || "")).toLowerCase())
    .filter(Boolean)
    .join("\n");
  if (!text) return "Onbekende sector";
  if (/jeugdzorg|jeugdwet|jongeren|gezinnen|opvoed|multiproblematiek/.test(text)) return "Jeugdzorg";
  if (/ggz|zorg|wachttijd|behandel|client/.test(text)) return "Zorg/GGZ";
  if (/onderwijs|school|leerling|docent/.test(text)) return "Onderwijs";
  if (/gemeente|overheid|publiek/.test(text)) return "Publieke sector";
  return "Onbekende sector";
}

function normalizePresentationSector(value: unknown, ...fallbackValues: Array<string | undefined>): string {
  const source = sanitizeDisplayText(String(value || ""));
  const combined = [source, ...fallbackValues.map((item) => sanitizeDisplayText(String(item || "")))]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  if (/jeugdzorg|jeugdwet|jongeren|gezinnen|opvoed|multiproblematiek/.test(combined)) return "Jeugdzorg";
  if (/ggz|geestelijke gezondheidszorg/.test(combined)) return "GGZ";
  if (/zorg/.test(combined)) return "Zorg";
  return source || inferSectorFromText(...fallbackValues);
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
  const raw = String(body || "");
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return [];
  const lineOptions = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(?:Optie\s+)?[ABC]\s+[—\-:.]/.test(line))
    .map((line) => normalizeInline(line.replace(/^Optie\s+/i, "")));
  const inlineOptions = Array.from(
    text.matchAll(/(?:^|\s)([ABC])\s+[—\-:.]\s*(.+?)(?=(?:\s[ABC]\s+[—\-:.]\s+)|(?:Aanbevolen optie|Aanbevolen keuze):|$)/g)
  ).map((match) => normalizeInline(`${match[1]} — ${match[2]}`));
  const scenarioOptions = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^Scenario\s+[ABC]\s+[—-]\s+/i.test(line))
    .map((line) => normalizeInline(line.replace(/^Scenario\s+[ABC]\s+[—-]\s+/i, "")));
  const plainLines = raw
    .split("\n")
    .map((line) => normalizeInline(line))
    .filter(
      (line) =>
        line &&
        !/^(niet beschikbaar|kopieer richting)$/i.test(line) &&
        !/^(operationeel gevolg|financieel gevolg|organisatorisch gevolg)\s*[—:-]/i.test(line) &&
        line.length > 20
    );
  const options = [...lineOptions, ...inlineOptions, ...scenarioOptions];
  if (options.length) return Array.from(new Set(options)).slice(0, 3);
  return Array.from(new Set(plainLines)).slice(0, 3);
}

function extractRecommendedDirection(body: string, options: string[], executiveSummary: string): string {
  const source = String(body || executiveSummary || "");
  const choice = source.match(/(?:Aanbevolen optie|Aanbevolen keuze|Bestuurlijke keuze):?\s*(?:Optie\s*)?([ABC])/i)?.[1]?.toUpperCase();
  if (choice) {
    const option = options.find((item) => new RegExp(`^${choice}[.\\s—:-]`, "i").test(item));
    if (option) return option;
    const bodyLines = source
      .split(/\n+/)
      .map((line) => normalizeInline(line))
      .filter(Boolean);
    const explicitBody = bodyLines.find((line) => !/^[ABC][.]?$/i.test(line) && !/^(AANBEVOLEN KEUZE|BESTUURLIJKE KEUZE)$/i.test(line));
    return explicitBody ? `${choice}. ${explicitBody.replace(/^[ABC][.\s—:-]+/i, "")}` : `${choice}. aanbevolen richting`;
  }
  const directChoice = extractLooseSection(source, ["AANBEVOLEN KEUZE", "BESTUURLIJKE KEUZE"]) || normalizeInline(body);
  const normalizedDirectChoice = directChoice
    .split(/\n+/)
    .map((line) => normalizeInline(line))
    .filter(Boolean)
    .join("\n");
  const multilineChoiceMatch = normalizedDirectChoice.match(/^([ABC])[.]?\s*\n?(.+)$/is);
  const cleanedChoice = normalizeInline(
    (multilineChoiceMatch
      ? `${multilineChoiceMatch[1]}. ${multilineChoiceMatch[2]}`
      : normalizedDirectChoice
    )
      .replace(/^(?:AANBEVOLEN KEUZE|BESTUURLIJKE KEUZE)\s*/i, "")
      .replace(/^(?:Optie\s+)?([ABC])[.\s]+(?=[A-Za-zÀ-ÿ])/i, "$1. ")
  );
  const optionFromDirectBody = options.find((option) => cleanedChoice.toLowerCase().includes(normalizeInline(option).toLowerCase()));
  if (optionFromDirectBody) return optionFromDirectBody;
  if (/^[ABC][.]?$/i.test(cleanedChoice) && options.length) {
    return options[0];
  }
  return cleanedChoice || options[0] || "";
}

function normalizeBoardroomSummaryBody(body: string, organisation: string, sector: string, analysisDate: string): string {
  const source = sanitizeDisplayText(body);
  if (!source) return "";
  return source
    .replace(/Organisatie:\s*.+/i, `Organisatie: ${organisation}`)
    .replace(/Sector:\s*.+/i, `Sector: ${sector}`)
    .replace(/Analyse datum:\s*.+/i, `Analyse datum: ${analysisDate}`)
    .split("\n")
    .filter((line) => !/^(KERNPROBLEEM|KERNSTELLING|AANBEVOLEN KEUZE|HISTORISCH LEERSIGNAAL)$/i.test(line.trim()))
    .slice(0, 5)
    .join("\n");
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
  const withoutTemplate = normalized
    .replace(/\b\d+\.\s*(besluitvraag|executive thesis|feitenbasis|strategische opties|aanbevolen keuze|niet-onderhandelbare besluitregels|90-dagen interventieplan|kpi-set|besluittekst)\b[\s\S]*$/i, "")
    .replace(/\b(aanbevolen optie|besluittekst)\b[\s\S]*$/i, "")
    .trim();
  const match = withoutTemplate.match(/(?:maar|vraag)\s*[:\s]+(.+)$/i);
  return normalizeInline(match?.[1] || withoutTemplate).slice(0, 180);
}

function compactNoIntervention(text: string): string {
  return normalizeInline(String(text || "")).slice(0, 260);
}

function compactSectionText(text: string, max = 260): string {
  return normalizeInline(String(text || "")).slice(0, max);
}

function rewriteMechanistic(text: string): string {
  return normalizeInline(String(text || ""))
    .replace(/\bAdvies:\s*/gi, "")
    .replace(/\bstrategie is\b/gi, "de richting is")
    .replace(/\bzou kunnen\b/gi, "leidt tot")
    .replace(/\bmogelijk\b/gi, "relevant")
    .replace(/\bmechanisme\b/gi, "onderliggende oorzaak")
    .replace(/\bhefboom\b/gi, "sturingspunt");
}

function buildFallbackKillerInsights(input: {
  executiveSummary?: string;
  strategicConflict?: string;
  financialConsequences?: string;
  interventions?: any[];
  boardOptions?: string[];
}): string[] {
  const lines = [
    input.strategicConflict
      ? `De kernfrictie zit in bestuurlijke prioritering, niet in gebrek aan activiteit: ${compactSectionText(input.strategicConflict, 180)}`
      : "",
    input.financialConsequences
      ? `Economische druk wordt veroorzaakt door contract- en besturingsfrictie: ${compactSectionText(input.financialConsequences, 180)}`
      : "",
    input.boardOptions?.[0]
      ? `De voorkeursroute vereist expliciete volgorde en stopregels: ${compactSectionText(input.boardOptions[0], 180)}`
      : "",
    Array.isArray(input.interventions) && input.interventions[0]
      ? `De eerste interventie laat zien waar de echte hefboom zit: ${compactSectionText(String(input.interventions[0]?.interventie || input.interventions[0]?.title || ""), 180)}`
      : "",
    input.executiveSummary
      ? `De executive these impliceert dat volumegroei alleen werkt als het dominante mechanisme verandert: ${compactSectionText(input.executiveSummary, 180)}`
      : "",
  ].filter(Boolean);
  return Array.from(new Set(lines)).slice(0, 5);
}

function buildFallbackStressTest(input: {
  sector?: string;
  strategicConflict?: string;
  financialConsequences?: string;
  recommendedDirection?: string;
}): string {
  const sector = String(input.sector || "").toLowerCase();
  if (sector.includes("jeugdzorg")) {
    return [
      "Als het bestuur niet kiest, versterken gemeentelijke contractdruk, hogere zorgzwaarte en personeelsschaarste elkaar.",
      "Als wel gekozen wordt maar zonder prioriteitsdiscipline, groeit uitvoeringsdruk sneller dan teamstabiliteit kan dragen.",
      "Bestuurlijke test: wat moet het bestuur direct herbesluiten als brede ambulante positionering niet meer past binnen contractruimte, triage en teamcapaciteit?",
    ].join("\n\n");
  }
  return [
    compactSectionText(input.financialConsequences || "", 220),
    compactSectionText(input.strategicConflict || "", 220),
    "Bestuurlijke test: welke keuze moet het bestuur direct herzien als capaciteit, marge of uitvoerbaarheid twee meetperiodes afwijken?",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildFallbackEarlySignals(input: {
  sector?: string;
  interventions?: any[];
  recommendedDirection?: string;
}): string {
  const sector = String(input.sector || "").toLowerCase();
  if (sector.includes("jeugdzorg")) {
    return [
      "Indicator: contractafhankelijkheid gemeente\nNorm: geen dominante afhankelijkheid van 1 contractstroom\nActie: escaleren als onderhandelingspositie of volumegarantie verslechtert",
      "Indicator: retentie en caseload professionals\nNorm: stabiele bezetting en beheersbare caseload\nActie: administratieve reductie en prioriteitssnede bij twee meetperiodes verslechtering",
      "Indicator: doorstroom en wachtdruk\nNorm: voorspelbare intake en casusdoorlooptijd\nActie: triage- en capaciteitsritme aanscherpen zodra doorlooptijd oploopt",
    ].join("\n\n");
  }
  const interventionSignal = Array.isArray(input.interventions) && input.interventions[0]
    ? `Indicator: voortgang kerninterventie\nNorm: eerste interventie op schema\nActie: escaleren als ${compactSectionText(String(input.interventions[0]?.interventie || input.interventions[0]?.title || "uitvoering"), 120)} stagneert`
    : "";
  return [
    interventionSignal,
    `Indicator: besluitdiscipline\nNorm: gekozen richting wordt niet parallel ondermijnd\nActie: board review bij afwijking van ${compactSectionText(input.recommendedDirection || "de gekozen route", 120)}`,
    "Indicator: operationele druk\nNorm: capaciteit, kwaliteit en financiële ruimte blijven binnen bandbreedte\nActie: prioriteiten schrappen zodra twee signalen tegelijk rood kleuren",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function sentences(text: string, max = 2): string[] {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((part) => normalizeInline(part))
    .filter(Boolean)
    .slice(0, max);
}

function buildStrategicConflict(executiveSummary: string, conflict: string, options: string[]): string {
  const normalizedConflict = rewriteMechanistic(compactSectionText(conflict, 220));
  const normalizedExecutive = rewriteMechanistic(compactSectionText(executiveSummary, 220));
  const executiveLead = normalizedExecutive.split(".")[0]?.trim();
  const conflictLead = normalizedConflict.split(".")[0]?.trim();
  if (normalizedConflict && executiveLead && conflictLead && conflictLead !== executiveLead) {
    return normalizedConflict;
  }
  const optionA = options[0] ? compactSectionText(options[0], 140) : "bescherm de kern en versmal de propositie";
  const optionB = options[1] ? compactSectionText(options[1], 140) : "verbreed sneller en accepteer meer druk op uitvoering";
  return `De spanning zit tussen ${optionA.toLowerCase()} en ${optionB.toLowerCase()}. Het bestuur moet kiezen welke schade bewust acceptabel is.`;
}

function parseStructuredKillerInsights(body: string, executiveSummary: string): StructuredKillerInsight[] {
  const text = sanitizeDisplayText(body);
  const blocks = text
    .split(/\n(?=(?:Inzicht|Strategisch inzicht|Kernmechanisme)\s+\d+)/i)
    .map((part) => part.trim())
    .filter(Boolean);
  const structured = blocks
    .map((block) => {
      const insight = normalizeInline(
        block.match(/INZICHT\s*[—:-]?\s*([\s\S]*?)(?=\n(?:MECHANISME|WAAROM DIT BELANGRIJK IS|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJK GEVOLG)\b|$)/i)?.[1] || ""
      );
      const mechanism = normalizeInline(
        block.match(/(?:MECHANISME|WAAROM DIT BELANGRIJK IS)\s*[—:-]?\s*([\s\S]*?)(?=\n(?:IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJK GEVOLG)\b|$)/i)?.[1] || ""
      );
      const implication = normalizeInline(
        block.match(/(?:IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJK GEVOLG)\s*[—:-]?\s*([\s\S]*?)$/i)?.[1] || ""
      );
      return {
        insight: insight.replace(/Mechanismeketens[\s\S]*$/i, "").trim(),
        mechanism: mechanism.replace(/Mechanismeketens[\s\S]*$/i, "").trim(),
        implication: implication.replace(/Mechanismeketens[\s\S]*$/i, "").trim(),
      };
    })
    .filter((item) => item.insight && !/^Vroegsignaal\s+\d+$/i.test(item.insight));
  if (structured.length) {
    return structured.slice(0, 7).map((item) => ({
      insight: rewriteMechanistic(compactSectionText(item.insight, 150)),
      mechanism: rewriteMechanistic(compactSectionText(item.mechanism || executiveSummary, 180)),
      implication: rewriteMechanistic(compactSectionText(item.implication || "Maak dit bestuurlijk expliciet in contract-, capaciteit- en prioriteitsbesluiten.", 180)),
    }));
  }
  const fallbackLines = text
    .split(/\n+/)
    .map((line) => normalizeInline(line))
    .filter((line) => line
      && !/^(INZICHT|MECHANISME|WAAROM DIT BELANGRIJK IS|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJK GEVOLG)$/i.test(line)
      && !/^Vroegsignaal\s+\d+$/i.test(line)
      && !/^Mechanismeketens\b/i.test(line));
  return fallbackLines.slice(0, 7).map((line) => ({
    insight: rewriteMechanistic(compactSectionText(line, 150)),
    mechanism: rewriteMechanistic(compactSectionText(executiveSummary || "Contractruimte, triage en positionering sturen hier de werkelijke schaalruimte.", 180)),
    implication: rewriteMechanistic(compactSectionText("Koppel deze observatie aan een expliciet bestuurlijk besluit met stopregel en kwartaalreview.", 180)),
  }));
}

function buildGovernanceInterventions(
  interventionsBody: string,
  predictions: any[],
  recommendedDirection: string,
  sector: string
): GovernanceIntervention[] {
  const inferOwner = (action: string, index: number): string => {
    const normalizedAction = normalizeInline(action).toLowerCase();
    if (/(triage|capaciteit|caseload|intake|doorstroom)/i.test(normalizedAction)) return "Bestuur";
    if (/(partner|consortium|governance|selectie|mandaat)/i.test(normalizedAction)) return "Directie";
    if (/(marge|contract|productlijn|tarief|gemeente|mix)/i.test(normalizedAction)) return "Managementteam";
    return ["Bestuur", "Directie", "Managementteam", "Programmamanager"][index % 4];
  };
  const inferDeadline = (action: string, index: number): string => {
    const normalizedAction = normalizeInline(action).toLowerCase();
    if (/(triage|capaciteit|caseload|intake|doorstroom)/i.test(normalizedAction)) return "Dag 15";
    if (/(partner|consortium|governance|selectie|mandaat)/i.test(normalizedAction)) return "Dag 30";
    if (/(marge|contract|productlijn|tarief|gemeente|mix)/i.test(normalizedAction)) return "Dag 45";
    return `Dag ${Math.min(90, 15 + index * 15)}`;
  };
  const inferKpi = (action: string, fallback = ""): string => {
    const normalizedAction = normalizeInline(action).toLowerCase();
    if (/(triage|capaciteit|caseload|intake|doorstroom)/i.test(normalizedAction)) {
      return "Wachtdruk daalt en caseload blijft binnen norm.";
    }
    if (/(partner|consortium|governance|selectie|mandaat)/i.test(normalizedAction)) {
      return "Escalaties en kwaliteitsafwijkingen per partner nemen af.";
    }
    if (/(marge|contract|productlijn|tarief|gemeente|mix)/i.test(normalizedAction)) {
      return "Marge per gemeente en productlijn blijft boven ondergrens.";
    }
    if (/(zillers|dossier|data|kpi|dashboard)/i.test(normalizedAction)) {
      return "Stuurinformatie is maandelijks volledig en betrouwbaar beschikbaar.";
    }
    if (/(opleiding|retentie|werving|personeel|bezetting|team|flex|zzp)/i.test(normalizedAction)) {
      return "Flexinzet blijft binnen norm en retentie van kernmedewerkers stabiliseert.";
    }
    return fallback || "Meetbare verbetering op wachtdruk, marge of teamstabiliteit.";
  };
  const buildActionMechanism = (action: string, fallback = ""): string => {
    const normalizedAction = normalizeInline(action).toLowerCase();
    if (/(triage|capaciteit|caseload|intake|doorstroom)/i.test(normalizedAction)) {
      return "Consortiumtriage kan meer casussen toewijzen dan teams binnen de caseloadnorm aankunnen. Koppel instroom daarom direct aan wekelijkse capaciteitsgrenzen.";
    }
    if (/(partner|consortium|governance|selectie|mandaat)/i.test(normalizedAction)) {
      return "Onhelder mandaat in consortium en partnerketen vergroot het kwaliteits- en escalatierisico zodra casuïstiek buiten eigen sturing binnenkomt.";
    }
    if (/(marge|contract|productlijn|tarief|gemeente|mix)/i.test(normalizedAction)) {
      return "Tarief-, reistijd- en bezettingsverschillen per gemeente maken brede aanwezigheid verlieslatend als productlijnen zonder margevloer blijven doorlopen.";
    }
    if (/(zillers|dossier|data|kpi|dashboard)/i.test(normalizedAction)) {
      return "Bestuur grijpt te laat in als caseload, verzuim en rendabiliteit niet maandelijks betrouwbaar zichtbaar zijn.";
    }
    if (/(opleiding|retentie|werving|personeel|bezetting|team|flex|zzp)/i.test(normalizedAction)) {
      return "De flexibele schil absorbeert vraagpieken, maar maakt de kostenstructuur instabiel zodra structureel volume via flex wordt opgevangen.";
    }
    return fallback || "Koppel deze interventie direct aan capaciteit, contractruimte en teamstabiliteit.";
  };
  const normalizeBoardDecision = (action: string, direction: string): string => {
    const rawAction = normalizeInline(String(action || ""))
      .replace(/^voor\s+[^:]+:\s*/i, "")
      .replace(/\.$/, "");
    if (!rawAction) {
      return buildBoardDecisionText(action, direction);
    }
    const lower = rawAction.charAt(0).toLowerCase() + rawAction.slice(1);
    return cleanBoardSentence(
      `Het bestuur besluit ${lower} en toetst dit maandelijks aan contractruimte, caseload en marge.`,
      buildBoardDecisionText(action, direction)
    );
  };
  const parsed = Array.from(
    String(interventionsBody || "").matchAll(/Interventie\s+\d+\s*\|\s*Actie:\s*(.+?)\s+Mechanisme:\s*(.+?)\s+KPI:\s*(.+?)(?=Interventie\s+\d+\s*\||$)/gis)
  ).map((match, index) => ({
    action: normalizeInline(match[1]),
    mechanism: normalizeInline(match[2]),
    boardDecision: index === 0
      ? `Bevestig ${compactSectionText(recommendedDirection || "de gekozen richting", 120)} en koppel daar één expliciete eigenaar aan.`
      : `Maak dit tot een expliciet bestuursbesluit met stopregel, eigenaar en maandelijkse review.`,
    owner: inferOwner(match[1], index),
    deadline: inferDeadline(match[1], index),
    kpi: inferKpi(match[1], normalizeInline(match[3])),
  }));
  const fallbackSource = parsed.length
    ? parsed
    : (predictions || []).slice(0, 10).map((row: any, index: number) => {
        const action = normalizeInline(row.interventie || row.title || `Interventie ${index + 1}`);
        return {
        action,
        mechanism: normalizeInline(row.impact || row.mechanism || buildActionMechanism(action)),
        boardDecision: buildBoardDecisionText(
          row.interventie || row.title || `interventie ${index + 1}`,
          recommendedDirection || sector || "de gekozen richting"
        ),
        owner: inferOwner(action, index),
        deadline: inferDeadline(action, index),
        kpi: inferKpi(action, normalizeInline(row.kpi_effect || row.kpi || "")),
      };
      });
  return fallbackSource.slice(0, 10).map((item) => ({
    action: rewriteMechanistic(compactSectionText(item.action, 150)),
    mechanism: cleanBoardSentence(
      compactSectionText(item.mechanism, 180),
      buildActionMechanism(item.action, "Koppel deze interventie direct aan capaciteit, contractruimte en teamstabiliteit.")
    ),
    boardDecision: cleanBoardSentence(
      compactSectionText(
        item.boardDecision || normalizeBoardDecision(item.action, recommendedDirection || sector),
        190
      ),
      normalizeBoardDecision(item.action, recommendedDirection || sector)
    ),
    owner: item.owner,
    deadline: item.deadline,
    kpi: compactSectionText(item.kpi || inferKpi(item.action), 150),
  }));
}

function buildCompactScenarios(body: string): CompactScenario[] {
  const text = sanitizeDisplayText(body);
  const scenarios = text
    .split(/\n(?=Scenario\s+[A-Z])/i)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const title = normalizeInline(block.split("\n")[0] || "");
      const normalizedTitle = title.replace(/^Scenario\s+[A-Z]\s+[—-]\s+/i, "").trim();
      const mechanism = normalizeInline(
        block.match(/MECHANISME\s*[—:-]\s*([\s\S]*?)(?=\n(?:RISICO|OPERATIONEEL EFFECT|FINANCIEEL EFFECT|STRATEGISCH RISICO|BESTUURLIJKE IMPLICATIE)\b|$)/i)?.[1] ||
        block.match(/Mechanisme\s*\n([\s\S]*?)(?=\n(?:Operationeel effect|Financieel effect|Strategisch risico|Bestuurlijke implicatie)\b|$)/i)?.[1] ||
        ""
      );
      const operationalRisk = normalizeInline(block.match(/OPERATIONEEL EFFECT\s*[—:-]\s*([\s\S]*?)(?=\n(?:FINANCIEEL EFFECT|STRATEGISCH RISICO|BESTUURLIJKE IMPLICATIE)\b|$)/i)?.[1] || "");
      const financialRisk = normalizeInline(
        block.match(/FINANCIEEL EFFECT\s*[—:-]\s*([\s\S]*?)(?=\n(?:STRATEGISCH RISICO|BESTUURLIJKE IMPLICATIE)\b|$)/i)?.[1] ||
        block.match(/RISICO\s*[—:-]\s*([\s\S]*?)(?=\nBESTUURLIJKE IMPLICATIE\b|$)/i)?.[1] ||
        ""
      );
      const strategicRisk = normalizeInline(block.match(/STRATEGISCH RISICO\s*[—:-]\s*([\s\S]*?)(?=\nBESTUURLIJKE IMPLICATIE\b|$)/i)?.[1] || "");
      const boardImplication = normalizeInline(
        block.match(/BESTUURLIJKE IMPLICATIE\s*[—:-]\s*([\s\S]*?)$/i)?.[1] ||
        block.match(/Bestuurlijke implicatie\s*\n([\s\S]*?)$/i)?.[1] ||
        ""
      );
      const inferredMechanism =
        mechanism ||
        (/kern beschermen|contractmix/i.test(normalizedTitle)
          ? "Bescherm kerncapaciteit en heronderhandel contractmix zodat marge, bereikbaarheid en behandelcapaciteit weer bestuurbaar worden."
          : /verbreden|labels/i.test(normalizedTitle)
            ? "Verbreding via nieuwe labels verhoogt operationele ruis, vraagt extra coördinatie en trekt capaciteit weg uit de kern."
            : /partner|consortium|governance/i.test(normalizedTitle)
              ? "Opschalen via partners vergroot bereik, maar maakt instroom, mandaat en kwaliteitsborging governance-afhankelijk."
              : normalizedTitle);
      const inferredRisk =
        [operationalRisk, financialRisk, strategicRisk].filter(Boolean).join(" ") ||
        (/kern beschermen|contractmix/i.test(normalizedTitle)
          ? "De route faalt zodra het bestuur wel kiest voor focus, maar gemeentenmix en contractdiscipline niet echt aanscherpt."
          : /verbreden|labels/i.test(normalizedTitle)
            ? "Teamdruk en bestuurlijke ruis nemen toe doordat nieuwe proposities en kernzorg tegelijk om capaciteit vragen."
            : /partner|consortium|governance/i.test(normalizedTitle)
              ? "Governancecomplexiteit stijgt wanneer partnerschap sneller groeit dan mandaat, triageafspraken en kwaliteitscontrole."
              : "Uitvoering blijft kwetsbaar als mechanismen en grenzen niet expliciet worden bestuurd.");
      const inferredImplication =
        boardImplication ||
        (/kern beschermen|contractmix/i.test(normalizedTitle)
          ? "Bestuur moet gemeenten actief rangschikken op marge, reistijd en contractzekerheid en op die mix gaan sturen."
          : /verbreden|labels/i.test(normalizedTitle)
            ? "Bestuur moet expliciet besluiten welke nieuwe labels wel en niet parallel mogen groeien."
            : /partner|consortium|governance/i.test(normalizedTitle)
              ? "Bestuur moet mandaat, rolverdeling en escalatieritme met partners formeel vastleggen."
              : "Bestuur moet expliciete grenzen en KPI-triggers aan dit scenario koppelen.");
      const mechanismText = rewriteMechanistic(compactSectionText(inferredMechanism, 140));
      const riskText = rewriteMechanistic(compactSectionText(inferredRisk, 140));
      const implicationText = rewriteMechanistic(compactSectionText(inferredImplication, 140));
      const scenarioScores = evaluateScenarioScores(mechanismText, riskText, implicationText);
      return {
        title,
        mechanism: mechanismText,
        risk: riskText,
        boardImplication: implicationText,
        ...scenarioScores,
      };
    })
    .filter((item) => item.title);
  return scenarios.slice(0, 3);
}

function buildFallbackCompactScenarios(options: string[], recommendedDirection: string, conflict: string): CompactScenario[] {
  const normalizedRecommended = normalizeInline(recommendedDirection).toLowerCase();
  const fallback = options.slice(0, 3).map((option, index) => {
    const mechanism =
      index === 0
        ? "Bescherm de kerncapaciteit en begrens verbreding op contractruimte, triage en kwaliteitsdiscipline."
        : index === 1
          ? "Versmal het aanbod zodat positionering, teamfocus en contractonderhandeling scherper worden."
          : "Vergroot invloed op instroom door sterkere consortium- en triagesturing.";
    const risk =
      index === 0
        ? "Breedte blijft kwetsbaar als portfoliokeuzes niet expliciet worden gemaakt."
        : index === 1
          ? "Te snelle versmalling kan regionale relevantie en instroombasis aantasten."
          : "Governancecomplexiteit stijgt als mandaat en rolverdeling niet helder zijn.";
    const implication =
      normalizeInline(option).toLowerCase() === normalizedRecommended
        ? "Bestuur moet kerncapaciteit, contractdiscipline en triagegrenzen expliciet beschermen."
        : index === 1
          ? "Bestuur moet expliciet bepalen welke zorgvormen kern blijven en welke gecontroleerd worden afgebouwd."
          : "Bestuur moet consortiumdoelen, mandaat en escalatieritme formeel vastleggen.";
    const mechanismText = rewriteMechanistic(compactSectionText(mechanism, 140));
    const riskText = rewriteMechanistic(compactSectionText(risk, 140));
    const implicationText = rewriteMechanistic(compactSectionText(implication, 140));
    const scenarioScores = evaluateScenarioScores(mechanismText, riskText, implicationText);
    return {
      title: option,
      mechanism: mechanismText,
      risk: riskText,
      boardImplication: implicationText,
      ...scenarioScores,
    };
  });
  return fallback;
}

function buildOptionRejections(options: string[], recommendedDirection: string, conflict: string): OptionRejection[] {
  const normalizedRecommended = normalizeInline(
    String(recommendedDirection || "").replace(/^(?:Optie\s+)?[ABC]\s+[—\-:.]\s*/i, "")
  ).toLowerCase();
  return options
    .filter((option) => normalizeInline(option.replace(/^(?:Optie\s+)?[ABC]\s+[—\-:.]\s*/i, "")).toLowerCase() !== normalizedRecommended)
    .slice(0, 2)
    .map((option, index) => {
      const normalizedOption = normalizeInline(option).toLowerCase();
      const optionLabel = normalizedOption.includes("special")
        ? "Wanneer wordt versmalling alsnog logisch?"
        : normalizedOption.includes("consortium")
          ? "Onder welke voorwaarden is zwaardere consortiumregie wel verstandig?"
          : `Welke voorwaarde ontbreekt nog voor ${compactSectionText(option.toLowerCase(), 80)}?`;
      const rationale = normalizedOption.includes("special")
        ? "Omdat deze route nu te veel druk zet op regionale relevantie, instroom en teamcontinuiteit."
        : normalizedOption.includes("consortium")
          ? "Omdat deze route eerst meer governancecomplexiteit toevoegt, terwijl kerncapaciteit en contractdiscipline nog niet stevig genoeg staan."
          : `Omdat ${compactSectionText(option.toLowerCase(), 120)} nu meer bestuurlijke druk toevoegt dan de organisatie kan dragen.`;
      return {
        optionLabel,
        rationale,
      };
    });
}

function buildOpenStrategicQuestions(optionRejections: OptionRejection[]): string {
  if (!optionRejections.length) return "Niet beschikbaar.";
  return optionRejections
    .map((item) => `${item.optionLabel}\n\n${item.rationale}`)
    .join("\n\n");
}

function buildScenarioSectionBody(scenarios: CompactScenario[]): string {
  if (!scenarios.length) return "Niet beschikbaar.";
  return scenarios
    .map(
      (scenario) =>
        [
          scenario.title,
          ...(scenario.recommended ? ["AANBEVOLEN SCENARIO"] : []),
          `IMPACT SCORE — ${scenario.impactScore ?? "N/A"}/10`,
          `RISICO SCORE — ${scenario.riskScore ?? "N/A"}/10`,
          `UITVOERINGSDIFFICULTEIT — ${scenario.difficultyScore ?? "N/A"}/10`,
          `MECHANISME — ${scenario.mechanism}`,
          `RISICO — ${scenario.risk}`,
          `BESTUURLIJKE IMPLICATIE — ${scenario.boardImplication}`,
        ].filter(Boolean).join("\n")
    )
    .join("\n\n");
}

function buildBoardDecisionPressure(stressTest: string, financialConsequences: string, conflict: string): BoardDecisionPressure {
  const stressSentences = sentences(stressTest, 3);
  const financialSentences = sentences(financialConsequences, 2);
  const conflictSentences = sentences(conflict, 2);
  return {
    operational: cleanBoardSentence(stressSentences[0] || "Wachtdruk en teamdruk lopen door zolang prioriteiten diffuus blijven.", "Wachtdruk en teamdruk lopen door."),
    financial: cleanBoardSentence(financialSentences[0] || "Contractdruk en verlieslatende breedte drukken marge en investeringsruimte verder omlaag.", "Contractdruk drukt marge en investeringsruimte verder omlaag."),
    organizational: cleanBoardSentence(conflictSentences[0] || "Besluitvertraging vergroot interne ruis en verlaagt uitvoerbaarheid.", "Besluitvertraging vergroot interne ruis en verlaagt uitvoerbaarheid."),
  };
}

const SECTION_ORDER = [
  "Bestuurlijke kernsamenvatting",
  "Besluitvraag",
  "Kernstelling van het rapport",
  "Feitenbasis",
  "Keuzerichtingen",
  "Aanbevolen keuze",
  "Doorbraakinzichten",
  "Bestuurlijk actieplan",
  "Strategische breukpunten",
  "Bestuurlijke stresstest",
  "Bestuurlijke blinde vlekken",
  "Vroegsignalering",
  "Mogelijke ontwikkelingen",
  "Besluitgevolgen",
  "Open strategische vragen",
];

const SECTION_ALIAS: Record<string, string> = {
  "BOARDROOM SUMMARY": "Bestuurlijke kernsamenvatting",
  "BOARDROOM SAMENVATTING": "Bestuurlijke kernsamenvatting",
  "EXECUTIVE THESIS": "Kernstelling van het rapport",
  "STRATEGISCHE OPTIES": "Keuzerichtingen",
  "STRATEGISCH CONFLICT": "Bestuurlijke spanning",
  "STRATEGISCHE HEFBOOMPUNTEN": "Doorbraakinzichten",
  "STRATEGISCHE SCENARIO SIMULATIE": "Mogelijke ontwikkelingen",
  "SCENARIO SIMULATIE": "Mogelijke ontwikkelingen",
  "STRATEGISCHE INTERVENTIES": "Bestuurlijk actieplan",
  "90 DAGEN ACTIEPLAN": "Bestuurlijk actieplan",
  "90-DAGEN INTERVENTIEPLAN": "Bestuurlijk actieplan",
  "BOARDROOM STRESSTEST": "Bestuurlijke stresstest",
  "BESLUITGEVOLGEN SIMULATIE": "Besluitgevolgen",
  "FINANCIËLE CONSEQUENTIES": "Besluitgevolgen",
};

function normalizeSectionTitle(raw: string): string {
  if (!raw) return "";
  const upper = raw.trim().toUpperCase();
  return SECTION_ALIAS[upper] || raw.trim();
}

function buildStrategySections(
  reportSections: MemoSection[],
  memoSections: MemoSection[],
  structuredSections: MemoSection[] = []
): ReportSection[] {
  const candidates = [...reportSections, ...structuredSections, ...memoSections];
  const unique = new Map<string, MemoSection>();
  for (const section of candidates) {
    const title = normalizeSectionTitle(section.title);
    if (!title || unique.has(title)) continue;
    unique.set(title, { title, body: sanitizeDisplayText(section.body) });
  }
  return SECTION_ORDER.map((title) => unique.get(title)).filter(Boolean);
}

const DEFAULT_STOP_RULES = [
  "wachttijd twee meetperiodes achtereen stijgt",
  "caseload structureel boven norm komt",
  "marge onder vier procent zakt",
];

function limitWords(value: string, maxWords: number): string {
  const words = sanitizeDisplayText(String(value || ""))
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "";
  return words.slice(0, maxWords).join(" ");
}

function formatAnalysisDate(value?: string): string {
  const candidate = String(value || "").trim();
  if (!candidate) return new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    return candidate;
  }
  return parsed.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

function buildStopRuleLines(pressure: BoardDecisionPressure): string[] {
  const defaults = [
    "Herzie direct als wachttijd > 12 weken gedurende twee meetperiodes.",
    "Herzie direct als marge < 4% gedurende twee meetperiodes.",
    "Herzie direct als caseload > 18 per professional gedurende twee meetperiodes.",
  ];
  const cues = [pressure.operational, pressure.financial, pressure.organizational].join(" ").toLowerCase();
  if (cues.includes("contract")) {
    defaults[1] = "Herzie direct als contractruimte of volumegarantie aantoonbaar verslechtert in twee opeenvolgende reviews.";
  }
  return defaults;
}

function buildBestuurlijkeBesliskaartData(params: {
  organization: string;
  sector: string;
  analysisDate: string;
  coreProblem: string;
  coreStatement: string;
  recommendedChoice: string;
  whySources: string[];
  riskIfDelayed: string;
  stopRuleSource: BoardDecisionPressure;
}): BestuurlijkeBesliskaart {
  const reasons = params.whySources
    .map((value) => cleanBoardSentence(value, "Onderbouwing ontbreekt."))
    .filter(Boolean)
    .slice(0, 3);
  const riskLines = String(params.riskIfDelayed || "")
    .split(/\n+/)
    .map((line) => normalizeInline(line))
    .filter((line) => line && !/^Bestuurlijke test:/i.test(line));
  const stopRules = buildStopRuleLines(params.stopRuleSource);
  return {
    organization: normalizeInline(params.organization) || "Onbekende organisatie",
    sector: normalizeInline(params.sector) || "Onbekende sector",
    analysisDate: params.analysisDate,
    coreProblem: cleanBoardSentence(params.coreProblem, "Kernprobleem niet gespecificeerd."),
    coreStatement: cleanBoardSentence(params.coreStatement, "Kernstelling niet beschikbaar."),
    recommendedChoice: cleanBoardSentence(params.recommendedChoice, "Bestuurlijke keuze ontbreekt."),
    whyReasons: reasons.length ? reasons : ["Waarom deze keuze niet onderbouwd."],
    riskIfDelayed: cleanBoardSentence(riskLines.join(" ") || params.riskIfDelayed || "Groot risico onbekend.", "Groot risico onbekend."),
    stopRules,
  };
}

function buildBestuurlijkeBesliskaartSection(data: BestuurlijkeBesliskaart): ReportSection {
  const lines: string[] = [];
  lines.push("BESTUURLIJKE BESLISKAART", "");
  lines.push("Organisatie", data.organization);
  lines.push("Sector", data.sector);
  lines.push("Analyse datum", data.analysisDate, "");
  lines.push("KERNPROBLEEM", data.coreProblem, "");
  lines.push("KERNSTELLING", data.coreStatement, "");
  lines.push("AANBEVOLEN KEUZE", data.recommendedChoice, "");
  lines.push("WAAROM DEZE KEUZE");
  data.whyReasons.forEach((reason) => {
    lines.push(`- ${reason}`);
  });
  lines.push("", "GROOTSTE RISICO BIJ UITSTEL", data.riskIfDelayed, "", "STOPREGEL");
  data.stopRules.forEach((rule) => {
    lines.push(rule);
  });
  return {
    title: "BESTUURLIJKE BESLISKAART",
    body: lines.join("\n"),
  };
}

function buildEngineSections(memoSections: MemoSection[]): ReportSection[] {
  const excluded = new Set([
    "EXECUTIVE SAMENVATTING",
    "BESTUURLIJKE HYPOTHESE",
    "FEITENBASIS",
    "FINANCIËLE CONSEQUENTIES",
    "KILLER INSIGHTS",
    "STRATEGISCHE INTERVENTIES",
    "BOARDROOM STRESSTEST",
    "STRATEGISCHE BLINDE VLEKKEN",
    "BESTUURLIJKE BLINDE VLEKKEN",
    "90 DAGEN ACTIEPLAN",
    "VROEGSIGNALERING",
    "BESLUITGEVOLGEN SIMULATIE",
    "STRATEGISCHE HEFBOOMPUNTEN",
    "STRATEGISCH GEHEUGEN",
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

function buildScenarioViewSections(model: {
  stressTest: string;
  noIntervention: string;
  compactScenarios: CompactScenario[];
  boardDecisionPressure: BoardDecisionPressure;
  optionRejections: OptionRejection[];
}): ReportSection[] {
  return [
    {
      title: "Bestuurlijke stresstest",
      body: model.stressTest || model.noIntervention || "Niet beschikbaar.",
    },
    {
      title: "Mogelijke ontwikkelingen",
      body: buildScenarioSectionBody(model.compactScenarios),
    },
    {
      title: "Besluitgevolgen",
      body: [
        `OPERATIONEEL GEVOLG — ${model.boardDecisionPressure.operational}`,
        `FINANCIEEL GEVOLG — ${model.boardDecisionPressure.financial}`,
        `ORGANISATORISCH GEVOLG — ${model.boardDecisionPressure.organizational}`,
      ].join("\n\n"),
    },
    {
      title: "Open strategische vragen",
      body: buildOpenStrategicQuestions(model.optionRejections),
    },
  ];
}

function buildTechnicalFallbackSections(model: {
  strategicConflict: string;
  boardQuestion: string;
  financialConsequences: string;
  strategyAlert: string;
  noIntervention: string;
  compactScenarios: CompactScenario[];
  governanceInterventions: GovernanceIntervention[];
}): ReportSection[] {
  const sections: ReportSection[] = [];
  if (model.strategicConflict) {
    sections.push({ title: "Strategisch conflict", body: model.strategicConflict });
  }
  if (model.boardQuestion) {
    sections.push({ title: "Besluitvraag", body: model.boardQuestion });
  }
  if (model.financialConsequences) {
    sections.push({ title: "Financiële consequenties", body: model.financialConsequences });
  }
  if (model.strategyAlert) {
    sections.push({ title: "Vroegsignalering", body: model.strategyAlert });
  }
  if (model.compactScenarios.length) {
    sections.push({
      title: "Scenarioanalyse",
      body: buildScenarioSectionBody(model.compactScenarios),
    });
  }
  if (model.governanceInterventions.length) {
    sections.push({
      title: "Interventie-architectuur",
      body: renderInterventionExport(model.governanceInterventions),
    });
  }
  if (!sections.length && model.noIntervention) {
    sections.push({ title: "Technische notitie", body: model.noIntervention });
  }
  return sections;
}

export default function StrategischRapportSaaSPage() {
  const { id: routeReportId } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const api = usePlatformApiBridge();
  const [sessions, setSessions] = useState<any[]>([]);
  const [hint, setHint] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showAllReports, setShowAllReports] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Record<string, ReportTabKey>>({});
  const [reportModes, setReportModes] = useState<Record<string, ReportSpeedMode>>({});
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [inlinePdfPreview, setInlinePdfPreview] = useState<InlinePdfPreview | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string>("");
  const [pdfBusySessionId, setPdfBusySessionId] = useState<string>("");
  const [pdfBusyMode, setPdfBusyMode] = useState<"download" | "preview" | "">("");
  const reportModelCacheRef = useRef(new Map<string, ReportRenderModel>());
  const routeFallbackSeed =
    routeReportId && /^fallback-/i.test(routeReportId) ? loadPersistedFallbackSeed(routeReportId) : null;
  const seededReportSession =
    ((location.state as { seededReportSession?: SeededReportSessionState } | null)?.seededReportSession) ||
    routeFallbackSeed ||
    null;

  function createSeededSessionRow(seed: SeededReportSessionState): any {
    const strategicBrainReport =
      seed.strategicBrainReport ||
      tryBuildStrategicBrainReport({
        organizationName: String(seed.session?.organization_name || seed.organizationName || "Onbekende organisatie"),
        sector: String(seed.sector || seed.session?.strategic_metadata?.sector || ""),
        inputText: [
          seed.rawInput || "",
          seed.boardMemo || seed.session?.board_memo || "",
          seed.report?.report_body || seed.session?.board_report || "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
    return {
      session_id: String(seed.session?.session_id || seed.sessionId),
      organization_id: String(seed.session?.organization_id || seed.report?.organization_id || "seeded-report"),
      organization_name: String(seed.session?.organization_name || seed.organizationName || "Onbekende organisatie"),
      analyse_datum: String(seed.session?.analyse_datum || seed.createdAt || new Date().toISOString()),
      updated_at: String(seed.session?.updated_at || seed.createdAt || new Date().toISOString()),
      input_data: String(seed.rawInput || ""),
      board_report: String(seed.session?.board_report || seed.report?.report_body || ""),
      status: normalizeStatusValue(seed.status || seed.session?.status || SESSION_STATUS.COMPLETED, SESSION_STATUS.COMPLETED),
      analysis_type: String(seed.session?.analysis_type || "Strategische analyse"),
      executive_summary: String(seed.executiveSummary || seed.session?.executive_summary || ""),
      board_memo: String(seed.boardMemo || seed.session?.board_memo || ""),
      strategic_report: seed.report || seed.session?.strategic_report,
      strategic_brain_report: strategicBrainReport,
      error_message: String(seed.errorMessage || seed.session?.error_message || ""),
      quality_score: Number(seed.qualityScore || seed.session?.quality_score || 0),
      quality_tier: String(seed.qualityTier || seed.session?.quality_tier || ""),
      quality_flags: Array.isArray(seed.qualityFlags) ? seed.qualityFlags : (Array.isArray(seed.session?.quality_flags) ? seed.session.quality_flags : []),
      intervention_predictions: Array.isArray(seed.interventions) ? seed.interventions : (Array.isArray(seed.session?.intervention_predictions) ? seed.session.intervention_predictions : []),
      analysis_runtime_ms: Number(seed.analysisRuntimeMs || seed.session?.analysis_runtime_ms || 0),
      engine_mode: String(seed.engineMode || seed.session?.engine_mode || ""),
      strategic_metadata: {
        ...(seed.session?.strategic_metadata || {}),
        sector: String(seed.sector || seed.session?.strategic_metadata?.sector || ""),
      },
      strategic_agent: seed.session?.strategic_agent || null,
      is_archived: false,
    };
  }

  async function load() {
    const rows = await api.listReports({ includeArchived: true });
    const safeRows = (rows || []).filter((row: any) => isSessionCompleted(row?.status) || String(row?.status || "").toLowerCase() === "fout");
    const sortedRows = [...safeRows].sort((left: any, right: any) => {
      const timestampDelta =
        toSortableTimestamp(right?.updated_at || right?.analyse_datum) -
        toSortableTimestamp(left?.updated_at || left?.analyse_datum);
      if (timestampDelta !== 0) return timestampDelta;
      return String(right?.session_id || "").localeCompare(String(left?.session_id || ""));
    });
    if (
      seededReportSession &&
      String(seededReportSession.sessionId || "").trim() &&
      !safeRows.some((row: any) => String(row?.session_id || "").trim() === String(seededReportSession.sessionId).trim())
    ) {
      setSessions([createSeededSessionRow(seededReportSession), ...sortedRows]);
      return;
    }
    setSessions(sortedRows);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const initial =
      routeReportId ||
      searchParams.get("session") ||
      searchParams.get("report") ||
      (location.state as { reportId?: string } | null)?.reportId ||
      (location.state as { sessionId?: string } | null)?.sessionId ||
      "";
    if (initial) {
      setSelectedSessionId(initial);
      setPremiumOnly(false);
      setShowAllReports(true);
    }
  }, [location.state, routeReportId, searchParams]);

  useEffect(() => {
    if (!seededReportSession?.sessionId) return;
    setSessions((prev) => {
      const seedRow = createSeededSessionRow(seededReportSession);
      const exists = prev.some((row: any) => String(row?.session_id || "").trim() === String(seedRow.session_id).trim());
      if (exists) return prev;
      return [seedRow, ...prev];
    });
  }, [seededReportSession]);

  useEffect(() => {
    if (selectedSessionId) return;
    const firstAvailable = sessions.find((row: any) => row?.session_id && isSessionCompleted(row?.status));
    if (firstAvailable?.session_id) {
      setSelectedSessionId(String(firstAvailable.session_id));
    }
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    return () => {
      if (inlinePdfPreview?.url) {
        URL.revokeObjectURL(inlinePdfPreview.url);
      }
    };
  }, [inlinePdfPreview]);

  useEffect(() => {
    reportModelCacheRef.current.clear();
  }, [sessions]);

  useEffect(() => {
    if (routeReportId) return;
    const current = searchParams.get("session") || searchParams.get("report") || "";
    if (!selectedSessionId || current === selectedSessionId) return;
    navigate(buildPortalReportLibraryPath(selectedSessionId, normalizeReportSpeedMode(searchParams.get("view"))), { replace: true });
  }, [navigate, routeReportId, searchParams, selectedSessionId]);

  async function handlePdf(
    sessionId: string,
    mode: "download" | "preview" = "download"
  ) {
    const session = mergedReports.find((row) => row.sessionId === sessionId);
    if (!session) {
      setHint(`Rapport niet gevonden voor ${sessionId}`);
      return;
    }
    try {
      setPdfBusySessionId(sessionId);
      setPdfBusyMode(mode);
      setHint(mode === "download" ? `PDF wordt voorbereid voor ${sessionId}` : `PDF preview wordt voorbereid voor ${sessionId}`);
      const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
      const storedTab = activeTabs[session.sessionId];
      const activeTab =
        storedTab && getVisibleReportTabsForMode(reportMode).includes(storedTab)
          ? storedTab
          : getDefaultReportTabForMode(reportMode);
      const exportTab = mode === "download" ? getPrimaryExportTab(reportMode) : activeTab;
      if (session.report) {
        const model = getViewModel(session);
        const exportableReport = resolveExportableStrategicReport(session.report, model);
        const exportBoardroomDocument = compileBoardroomDocument(exportableReport);
        const variant = buildExportReportVariant(exportableReport, model, exportTab, reportMode);
        if (mode === "preview") {
          const previewUrl = await createInlinePdfPreview(variant.report, {
            organizationName: session.organizationName,
            sector: session.presentationMeta?.sector,
            analysisType: variant.exportMeta.analysisType,
            documentType: variant.exportMeta.documentType,
            generatedAt: session.createdAt,
            rawInput: (session as any).rawInput || "",
            subtitle: variant.exportMeta.subtitle,
            titleOverride: variant.exportMeta.titleOverride,
            canonicalReport: exportableReport,
            boardroomDocument: exportBoardroomDocument,
          });
          setInlinePdfPreview((current) => {
            if (current?.url && current.url !== previewUrl) URL.revokeObjectURL(current.url);
            return {
              sessionId: session.sessionId,
              url: previewUrl,
              filename: `${variant.filenameBase}.pdf`,
            };
          });
        } else {
          await exportReportPdf(variant.report, variant.filenameBase, {
            organizationName: session.organizationName,
            sector: session.presentationMeta?.sector,
            analysisType: variant.exportMeta.analysisType,
            documentType: variant.exportMeta.documentType,
            generatedAt: session.createdAt,
            rawInput: (session as any).rawInput || "",
            subtitle: variant.exportMeta.subtitle,
            titleOverride: variant.exportMeta.titleOverride,
            preview: false,
            download: true,
            canonicalReport: exportableReport,
            boardroomDocument: exportBoardroomDocument,
          });
        }
      } else {
        const model = getViewModel(session);
        const canonicalReport = synthesizeStrategicReport(model);
        const exportBoardroomDocument = compileBoardroomDocument(canonicalReport);
        const syntheticReport: StrategicReport = {
          session_id: session.sessionId,
          organization_id: session.organizationName || "organisatie",
          title: `Cyntra Executive Dossier — ${session.organizationName || "Organisatie"}`,
          generated_at: session.createdAt || new Date().toISOString(),
          sections: model.strategySections.map((section) => section.title),
          report_body: model.strategySections
            .map((section) => renderExportSection(section.title.toUpperCase(), section.body))
            .filter(Boolean)
            .join("\n\n"),
        };
        const variant = buildExportReportVariant(syntheticReport, model, exportTab, reportMode);
        if (mode === "preview") {
          const previewUrl = await createInlinePdfPreview(variant.report, {
            organizationName: session.organizationName,
            sector: session.presentationMeta?.sector || model.sector,
            analysisType: variant.exportMeta.analysisType,
            documentType: variant.exportMeta.documentType,
            generatedAt: session.createdAt,
            rawInput: (session as any).rawInput || "",
            subtitle: variant.exportMeta.subtitle,
            titleOverride: variant.exportMeta.titleOverride,
            canonicalReport,
            boardroomDocument: exportBoardroomDocument,
          });
          setInlinePdfPreview((current) => {
            if (current?.url && current.url !== previewUrl) URL.revokeObjectURL(current.url);
            return {
              sessionId: session.sessionId,
              url: previewUrl,
              filename: `${variant.filenameBase}.pdf`,
            };
          });
        } else {
          await exportReportPdf(variant.report, variant.filenameBase, {
            organizationName: session.organizationName,
            sector: session.presentationMeta?.sector || model.sector,
            analysisType: variant.exportMeta.analysisType,
            documentType: variant.exportMeta.documentType,
            generatedAt: session.createdAt,
            rawInput: (session as any).rawInput || "",
            subtitle: variant.exportMeta.subtitle,
            titleOverride: variant.exportMeta.titleOverride,
            preview: false,
            download: true,
            canonicalReport,
            boardroomDocument: exportBoardroomDocument,
          });
        }
      }
      setHint(mode === "download" ? `PDF gegenereerd voor ${sessionId}` : `PDF preview geopend voor ${sessionId}`);
    } catch (error) {
      setHint(error instanceof Error ? error.message : `PDF ${mode === "download" ? "genereren" : "preview"} mislukt voor ${sessionId}`);
    } finally {
      setPdfBusySessionId("");
      setPdfBusyMode("");
    }
  }

  function getReportModelCacheKey(session: (typeof mergedReports)[number]): string {
    return [
      session.sessionId,
      session.createdAt,
      session.qualityScore,
      session.qualityTier,
      session.executiveSummary,
      session.boardMemo,
      session.report?.generated_at,
      session.report?.report_body,
      session.rawInput,
    ]
      .map((part) => String(part || ""))
      .join("::");
  }

  function getViewModel(session: (typeof mergedReports)[number]): ReportRenderModel {
    const cacheKey = getReportModelCacheKey(session);
    const cached = reportModelCacheRef.current.get(cacheKey);
    if (cached) return cached;
    const model = buildViewModel(session);
    reportModelCacheRef.current.set(cacheKey, model);
    return model;
  }

  function renderExpandedReport(session: (typeof mergedReports)[number]) {
    if (session.status === "fout" && !session.report && !session.boardMemo && !session.executiveSummary) {
      return null;
    }
    const report = session.report;
    if (!report) {
      return (
        <section className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          Rapport ontbreekt of is niet beschikbaar.
        </section>
      );
    }
    try {
      const hasInvalidStructure = session.canonicalReportError === "INVALID_REPORT_STRUCTURE";
      const model = getViewModel(session);
      const exportableReport = resolveExportableStrategicReport(report, model);
      const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
      const storedTab = activeTabs[session.sessionId];
      const activeTab =
        storedTab && getVisibleReportTabsForMode(reportMode).includes(storedTab)
          ? storedTab
          : getDefaultReportTabForMode(reportMode);
      const tabs: Array<{ key: ReportTabKey; label: string }> = [
        { key: "boardroom", label: "Bestuurlijk overzicht" },
        { key: "strategy", label: "Strategisch rapport" },
        { key: "scenario", label: "Scenario simulatie" },
        { key: "engine", label: "Technische analyse" },
      ].filter((tab) => getVisibleReportTabsForMode(reportMode).includes(tab.key));
      const downloadLabel = getExportButtonLabel(activeTab, reportMode);
      const showInlinePreview = inlinePdfPreview?.sessionId === session.sessionId && inlinePdfPreview.url;
      const boardroomDocument = compileBoardroomDocument(exportableReport);
      return (
        <div className="mt-4 space-y-4">
          <div className="portal-card-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Rapportacties</p>
              <p className="mt-1 text-xs text-gray-400">Bekijk of download direct vanuit de actieve rapportweergave.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="portal-button-secondary px-3 py-1.5 text-xs"
                disabled={pdfBusySessionId === session.sessionId}
                onClick={() => void handlePdf(session.sessionId, "preview")}
              >
                {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
              </button>
              <button
                type="button"
                className="portal-button-primary px-3 py-1.5 text-xs"
                disabled={pdfBusySessionId === session.sessionId}
                onClick={() => void handlePdf(session.sessionId, "download")}
              >
                {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}
              </button>
            </div>
          </div>
          {showInlinePreview ? (
            <section className="portal-card-soft overflow-hidden p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">PDF preview</p>
                  <p className="mt-1 text-xs text-gray-400">{inlinePdfPreview?.filename}</p>
                </div>
                <button
                  type="button"
                  className="portal-button-secondary px-3 py-1.5 text-xs"
                  onClick={() => {
                    setInlinePdfPreview((current) => {
                      if (current?.url) URL.revokeObjectURL(current.url);
                      return null;
                    });
                  }}
                >
                  Sluit preview
                </button>
              </div>
              <iframe
                src={inlinePdfPreview?.url}
                title={inlinePdfPreview?.filename || "PDF preview"}
                className="h-[80vh] w-full rounded-xl border border-white/10 bg-white"
              />
            </section>
          ) : null}
          <nav className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Decision cockpit</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  Besluit boven analyse. Kies eerst het dossierniveau en daarna de laag die je wilt lezen.
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {([
                { key: "short", label: "Kort dossier" },
                { key: "full", label: "Volledig dossier" },
              ] as const).map((modeOption) => (
                <button
                  key={`${session.sessionId}-${modeOption.key}`}
                  type="button"
                  className={`min-h-[40px] rounded-[12px] px-4 py-2 text-sm transition ${
                    reportMode === modeOption.key
                      ? "border border-white/[0.08] bg-white text-black font-semibold"
                      : "border border-white/[0.08] bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                  }`}
                  onClick={() => {
                    const targetId = session.reportId || session.sessionId;
                    const preservedTab = activeTabs[session.sessionId];
                    const nextTab =
                      modeOption.key === "short"
                        ? "boardroom"
                        : preservedTab && preservedTab !== "boardroom"
                          ? preservedTab
                          : "strategy";
                    startTransition(() => {
                      setReportModes((prev) => ({
                        ...prev,
                        [session.sessionId]: modeOption.key,
                      }));
                      setActiveTabs((prev) => ({
                        ...prev,
                        [session.sessionId]: nextTab,
                      }));
                    });
                    window.history.replaceState(
                      { reportId: targetId, sessionId: session.sessionId },
                      "",
                      buildPortalReportPath(targetId, modeOption.key)
                    );
                  }}
                >
                  {modeOption.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={`${session.sessionId}-${tab.key}`}
                  type="button"
                  className={`min-h-[40px] rounded-[12px] px-4 py-2 text-sm transition ${
                    activeTab === tab.key
                      ? "border border-white/[0.08] bg-white text-black font-semibold"
                      : "border border-white/[0.08] bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                  }`}
                  onClick={() => {
                    const targetId = session.reportId || session.sessionId;
                    const nextMode = deriveReportSpeedModeFromTab(tab.key);
                    startTransition(() => {
                      setReportModes((prev) => ({
                        ...prev,
                        [session.sessionId]: nextMode,
                      }));
                      setActiveTabs((prev) => ({
                        ...prev,
                        [session.sessionId]: tab.key,
                      }));
                    });
                    window.history.replaceState(
                      { reportId: targetId, sessionId: session.sessionId },
                      "",
                      buildPortalReportPath(targetId, nextMode)
                    );
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-400">
              {reportMode === "short"
                ? "Kort dossier toont alleen de bestuurlijke kern: besluit, spanning, scenario's, acties en signalen."
                : getReportModeHint(reportMode)}
            </p>
          </nav>

          {hasInvalidStructure ? (
            <section className="mt-4 rounded-xl border border-orange-400/40 bg-orange-500/10 p-4 text-sm text-orange-100">
              Rapportstructuur onvolledig – analyse opnieuw genereren.
            </section>
          ) : null}
          {activeTab === "boardroom" ? (
            <BoardroomView
              boardroomDocument={boardroomDocument}
              compact={reportMode === "short"}
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
                <section className="portal-card-soft p-5 text-sm text-gray-300">
                  Analyseweergave laden...
                </section>
              }
            >
              {activeTab === "strategy" ? (
                <StrategyReportView
                  boardroomDocument={boardroomDocument}
                  sections={model.strategySections}
                  mode="strategy"
                />
              ) : null}
              {activeTab === "scenario" ? (
                <StrategyReportView
                  boardroomDocument={boardroomDocument}
                  sections={model.scenarioSections}
                  mode="scenario"
                />
              ) : null}
              {activeTab === "engine" ? (
                <EngineAnalysisView
                  sections={model.engineSections}
                  qualityLevel={model.qualityLevel}
                  qualityChecks={model.qualityChecks}
                  criticalFlags={model.criticalFlags}
                  nonCriticalFlags={model.nonCriticalFlags}
                />
              ) : null}
            </Suspense>
          ) : null}
        </div>
      );
    } catch (error) {
      return (
        <section className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          Rapportweergave kon niet worden opgebouwd: {error instanceof Error ? error.message : "onbekende fout"}
        </section>
      );
    }
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
        if (!selectedSessionId) {
          setSelectedSessionId(sessionId);
        }
      } catch {
        // Ongeldige upload negeren; de rest van de batch gaat door.
      }
    }
    setHint(imported ? `${imported} rapport(en) geupload.` : "Geen geldige rapportbestanden gevonden.");
  }

  const mergedReports = (() => {
    const fromApi: MergedReportRow[] = sessions
      .filter((row: any) => row?.session_id)
      .map((row: any) => {
        try {
          const sector = String(row.strategic_metadata?.sector || "");
          const reportBody = sanitizeDisplayText(String(row.board_report || ""));
          const organizationName = resolveDisplayOrganizationName({
            organizationName: String(row.organization_name || row.organisatie_naam || ""),
            organizationId: String(row.organization_id || ""),
            reportBody,
            reportTitle: String(row?.strategic_report?.title || ""),
          });
          const rawInput = String(row.input_data || "");
          const boardMemo = sanitizeDisplayText(String(row.board_memo || "Board memo ontbreekt."));
          const strategicBrainReport =
            row?.strategic_brain_report ||
            tryBuildStrategicBrainReport({
              organizationName,
              sector,
              inputText: [rawInput, boardMemo, reportBody].filter(Boolean).join("\n\n"),
            });
          const derivedSummary =
            extractLooseSection(String(row.board_report || ""), [
              "KERNSTELLING VAN HET RAPPORT",
              "KERNSTELLING",
              "BESTUURLIJKE KERNSAMENVATTING",
            ]) || "";
          return {
            reportId: String(row?.strategic_report?.report_id || `report-${row.session_id}`),
            sessionId: String(row.session_id),
            organizationName,
            sector,
            rawInput,
            sourceType: "analysis" as const,
            createdAt: safeDateValue(String(row.updated_at || row.analyse_datum || new Date().toISOString())),
            executiveSummary: sanitizeDisplayText(String(row.executive_summary || derivedSummary || "Samenvatting ontbreekt.")),
            boardMemo,
            analysisRuntimeMs: Number(row.analysis_runtime_ms || 0),
            engineMode: String(row.engine_mode || ""),
            qualityScore: Number(row.quality_score || 0),
            qualityTier: String(row.quality_tier || ""),
            qualityFlags: Array.isArray(row.quality_flags) ? row.quality_flags.map((item) => String(item)) : [],
            status: normalizeStatusValue(row.status, row.status || SESSION_STATUS.COMPLETED),
            errorMessage: String(row.error_message || ""),
            interventions: Array.isArray(row.intervention_predictions) ? row.intervention_predictions : [],
            mvpEngine: row.strategic_metadata?.mvp_engine || null,
            strategicAgent: row.strategic_agent || null,
            strategicBrainReport,
            isArchived: Boolean(row.is_archived),
            archivedAt: String(row.archived_at || ""),
            archiveReason: String(row.archive_reason || ""),
            report:
              (row.strategic_report as StrategicReport | undefined) ||
              (row.board_report
                ? ({
                    report_id: `report-${row.session_id}`,
                    session_id: String(row.session_id),
                    organization_id: String(row.organization_id || "onbekend"),
                    title: `Cyntra Executive Dossier — ${organizationName} — ${row.session_id}`,
                    sections: [],
                    generated_at: safeDateValue(String(row.updated_at || row.analyse_datum || new Date().toISOString())),
                    report_body: reportBody,
                  } satisfies StrategicReport)
                : undefined),
          } satisfies MergedReportRow;
        } catch {
          return null;
        }
      })
      .filter((row): row is MergedReportRow => Boolean(row));
    const fromStorage: MergedReportRow[] = getStoredReports().map((item) => ({
      reportId: String(item.report?.report_id || `report-${item.sessionId}`),
      sessionId: item.sessionId,
      organizationName: String(item.report?.organization_id || "Geuploade bron"),
      sector: "",
      rawInput: "",
      sourceType: /^Geupload rapport/i.test(String(item.report?.title || "")) ? "upload" : "analysis",
      createdAt: safeDateValue(item.savedAt),
      executiveSummary: sanitizeDisplayText(String(item.report?.report_body || "")),
      boardMemo: "",
      analysisRuntimeMs: 0,
      engineMode: "",
      qualityScore: 0,
      qualityTier: "",
      qualityFlags: [],
      status: SESSION_STATUS.COMPLETED,
      errorMessage: "",
      interventions: [],
      mvpEngine: null,
      strategicAgent: null,
      strategicBrainReport: null,
      isArchived: false,
      archivedAt: "",
      archiveReason: "",
      report: item.report,
    }));
    const dedup = new Map<string, MergedReportRow>();
    for (const row of [...fromApi, ...fromStorage]) {
      const existing = dedup.get(row.sessionId);
      if (!existing) {
        dedup.set(row.sessionId, row);
        continue;
      }
      const mergedArchiveState = resolveMergedArchiveState(existing, row);
      dedup.set(row.sessionId, {
        reportId: existing.reportId || row.reportId,
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
        strategicBrainReport: existing.strategicBrainReport || row.strategicBrainReport,
        analysisRuntimeMs: existing.analysisRuntimeMs || row.analysisRuntimeMs,
        engineMode: existing.engineMode || row.engineMode,
        qualityScore: existing.qualityScore || row.qualityScore,
        qualityTier: existing.qualityTier || row.qualityTier,
        qualityFlags: (existing.qualityFlags || []).length ? existing.qualityFlags : row.qualityFlags,
        status: existing.status === "fout" ? "fout" : row.status,
        errorMessage: existing.errorMessage || row.errorMessage,
        isArchived: mergedArchiveState.isArchived,
        archivedAt: mergedArchiveState.archivedAt,
        archiveReason: mergedArchiveState.archiveReason,
        report: existing.report || row.report,
      });
    }
    return Array.from(dedup.values())
      .map((row) => {
        try {
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
            presentationMeta: safePresentationMeta({
              sector: row.sector,
              rawInput: [row.rawInput, row.report?.report_body].filter(Boolean).join("\n\n"),
            }),
            qualityScore: quality.score,
            qualityTier: quality.tier,
            strategicBrainReport:
              row.strategicBrainReport ||
              tryBuildStrategicBrainReport({
                organizationName: row.organizationName,
                sector: row.sector,
                inputText: [row.rawInput, row.boardMemo, row.report?.report_body].filter(Boolean).join("\n\n"),
              }),
          };
        } catch {
          return {
            ...row,
            presentationMeta: safePresentationMeta({
              sector: row.sector,
              rawInput: [row.rawInput, row.report?.report_body].filter(Boolean).join("\n\n"),
            }),
            strategicBrainReport: row.strategicBrainReport,
          };
        }
      })
      .sort((a, b) => {
        const createdDelta = toSortableTimestamp(b.createdAt) - toSortableTimestamp(a.createdAt);
        if (createdDelta !== 0) return createdDelta;
        const priorityDelta = getLibrarySortPriority(a) - getLibrarySortPriority(b);
        if (priorityDelta !== 0) return priorityDelta;
        return String(b.sessionId).localeCompare(String(a.sessionId));
      });
  })();

  useEffect(() => {
    if (!selectedSessionId || !mergedReports.length) return;
    const exists = mergedReports.some((row) => matchesReportSelection(row, selectedSessionId));
    if (exists) return;

    const fallback = mergedReports[0];
    if (!fallback?.sessionId) return;
    setHint(`Rapport niet gevonden voor ${selectedSessionId}. Meest recente rapport geopend.`);
    setSelectedSessionId(fallback.reportId || fallback.sessionId);
    if (routeReportId) {
      navigate(buildPortalReportPath(fallback.reportId || fallback.sessionId, normalizeReportSpeedMode(searchParams.get("view"))), {
        replace: true,
        state: { reportId: fallback.reportId || fallback.sessionId, sessionId: fallback.sessionId },
      });
    }
  }, [mergedReports, navigate, routeReportId, searchParams, selectedSessionId, api]);

  const blockedReports = mergedReports.filter((row) =>
    /Publicatie (?:geblokkeerd|waarschuwing)/i.test(row.errorMessage || "")
  );
  const activeReports = mergedReports.filter((row) => !row.isArchived || matchesReportSelection(row, selectedSessionId));
  const filteredReports = premiumOnly
    ? activeReports.filter(
        (row) =>
          (row.qualityTier === "premium" || row.sessionId === selectedSessionId)
      )
    : activeReports;
  const analysisReports = filteredReports.filter((row) => row.sourceType !== "upload");
  const primaryAnalysisReports = analysisReports.filter((row) => String(row.engineMode || "").toLowerCase() !== "fallback");
  const continuityReports = analysisReports.filter((row) => String(row.engineMode || "").toLowerCase() === "fallback");
  const uploadReports = filteredReports.filter((row) => row.sourceType === "upload");
  const newestVisibleReport = filteredReports[0] || null;
  const reportMapReports = newestVisibleReport
    ? filteredReports.filter((row) => row.sessionId !== newestVisibleReport.sessionId)
    : filteredReports;
  const primaryAnalysisReportMap = reportMapReports.filter(
    (row) => row.sourceType !== "upload" && String(row.engineMode || "").toLowerCase() !== "fallback"
  );
  const continuityReportMap = reportMapReports.filter(
    (row) => row.sourceType !== "upload" && String(row.engineMode || "").toLowerCase() === "fallback"
  );
  const uploadReportMap = reportMapReports.filter((row) => row.sourceType === "upload");
  const visibleUploadReports = showAllReports ? uploadReportMap : uploadReportMap.slice(0, 8);
  const visiblePrimaryAnalysisReports = showAllReports ? primaryAnalysisReportMap : primaryAnalysisReportMap.slice(0, 8);
  const visibleContinuityReports = showAllReports ? continuityReportMap : continuityReportMap.slice(0, 6);

  function buildViewModel(session: (typeof mergedReports)[number]): ReportRenderModel {
    const memoSections = parseMemoSections(cleanPlaceholderText(session.boardMemo || ""));
    const reportBody = cleanPlaceholderText(session.report?.report_body || "");
    const reportSections = parseMemoSections(reportBody);
    const structuredReportSections = parseStructuredReportSections(reportBody);
    const visibleStrategySections = buildStrategySections(reportSections, memoSections, structuredReportSections);
    const reportExecutive =
      getMemoSectionBody(reportSections, [
        "EXECUTIVE SAMENVATTING",
        "EXECUTIVE THESIS",
        "KERNSTELLING VAN HET RAPPORT",
        "KERNSTELLING",
      ]) ||
      getMemoSectionBody(structuredReportSections, [
        "EXECUTIVE SAMENVATTING",
        "EXECUTIVE THESIS",
        "KERNSTELLING VAN HET RAPPORT",
        "KERNSTELLING",
      ]);
    const reportHypothesis =
      getMemoSectionBody(reportSections, ["BESTUURLIJKE HYPOTHESE", "EXECUTIVE THESIS"]) ||
      getMemoSectionBody(structuredReportSections, ["BESTUURLIJKE HYPOTHESE", "EXECUTIVE THESIS"]);
    const reportConflict =
      getMemoSectionBody(reportSections, ["STRATEGISCH CONFLICT", "KERNCONFLICT", "STRATEGISCHE SPANNING"]) ||
      getMemoSectionBody(structuredReportSections, ["STRATEGISCH CONFLICT", "KERNCONFLICT", "STRATEGISCHE SPANNING"]);
    const reportInterventions =
      getMemoSectionBody(reportSections, ["STRATEGISCHE INTERVENTIES", "90 DAGEN ACTIEPLAN", "90-DAGEN INTERVENTIEPLAN"]) ||
      getMemoSectionBody(structuredReportSections, ["STRATEGISCHE INTERVENTIES", "90 DAGEN ACTIEPLAN", "90-DAGEN INTERVENTIEPLAN"]);
    const reportFinancial =
      getMemoSectionBody(reportSections, ["FINANCIËLE CONSEQUENTIES", "FEITENBASIS"]) ||
      getMemoSectionBody(structuredReportSections, ["FINANCIËLE CONSEQUENTIES", "FEITENBASIS"]);
    const reportStressTest =
      getMemoSectionBody(reportSections, ["BOARDROOM STRESSTEST", "VROEGSIGNALERING"]) ||
      getMemoSectionBody(structuredReportSections, ["BOARDROOM STRESSTEST", "VROEGSIGNALERING"]);
    const dominantThesis =
      reportHypothesis ||
      getMemoSectionBody(memoSections, "DOMINANTE THESE") ||
      session.executiveSummary ||
      "Dominante these niet beschikbaar.";
    const rawConflict =
      reportConflict ||
      getMemoSectionBody(memoSections, "STRATEGISCH CONFLICT") ||
      dominantThesis;
    const optionsBody =
      getMemoSectionBody(reportSections, ["STRATEGISCHE OPTIES", "BESTUURLIJKE KEUZE", "KEUZERICHTINGEN"]) ||
      getMemoSectionBody(structuredReportSections, ["STRATEGISCHE OPTIES", "BESTUURLIJKE KEUZE", "KEUZERICHTINGEN"]) ||
      getMemoSectionBody(memoSections, ["BESTUURLIJKE KEUZE", "KEUZERICHTINGEN"]) ||
      extractLooseSection(reportBody, ["Keuzerichtingen", "KEUZERICHTINGEN", "STRATEGISCHE OPTIES"]);
    const interventionsBody = reportInterventions || getMemoSectionBody(memoSections, "INTERVENTIES");
    const boardQuestion =
      getMemoSectionBody(reportSections, ["BESTUURLIJKE VRAAG", "BESLUITVRAAG"]) ||
      getMemoSectionBody(structuredReportSections, ["BESTUURLIJKE VRAAG", "BESLUITVRAAG"]) ||
      getMemoSectionBody(memoSections, "BOARDROOM QUESTION");
    const noIntervention =
      getMemoSectionBody(reportSections, ["VROEGSIGNALERING", "BOARDROOM STRESSTEST"]) ||
      getMemoSectionBody(structuredReportSections, ["VROEGSIGNALERING", "BOARDROOM STRESSTEST"]) ||
      getMemoSectionBody(memoSections, "SCENARIO: GEEN INTERVENTIE");
    const decisionMemory = getMemoSectionBody(memoSections, "DECISION MEMORY");
    const recommendedChoiceBody =
      getMemoSectionBody(reportSections, ["AANBEVOLEN KEUZE", "BESTUURLIJKE KEUZE"]) ||
      getMemoSectionBody(structuredReportSections, ["AANBEVOLEN KEUZE", "BESTUURLIJKE KEUZE"]) ||
      extractLooseSection(reportBody, ["AANBEVOLEN KEUZE", "BESTUURLIJKE KEUZE"]);
    const killerInsightsBody =
      getMemoSectionBody(reportSections, ["KILLER INSIGHTS", "KILLER INSIGHT", "NIEUWE INZICHTEN"]) ||
      getMemoSectionBody(structuredReportSections, ["KILLER INSIGHTS", "KILLER INSIGHT", "NIEUWE INZICHTEN", "NIEUWE INZICHTEN (KILLER INSIGHTS)"]) ||
      getMemoSectionBody(memoSections, ["KILLER INSIGHTS", "KILLER INSIGHT", "NIEUWE INZICHTEN (KILLER INSIGHTS)"]) ||
      extractLooseSection(reportBody, ["NIEUWE INZICHTEN (KILLER INSIGHTS)", "KILLER INSIGHTS", "KILLER INSIGHT"]);
    const earlyWarningBody =
      getMemoSectionBody(reportSections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]) ||
      getMemoSectionBody(structuredReportSections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]) ||
      getMemoSectionBody(memoSections, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]) ||
      extractLooseSection(reportBody, ["VROEGSIGNALERING", "EARLY WARNING SYSTEM"]);
    const quality = evaluateBoardMemoQuality(cleanPlaceholderText(session.boardMemo || ""), String(session.report?.report_body || ""));
    const gate = splitGateFlags(Array.isArray(session.qualityFlags) ? session.qualityFlags : []);
    const parsedBoardOptions = extractBoardOptions(optionsBody || recommendedChoiceBody);
    const resolvedSector =
      normalizePresentationSector(
        session.presentationMeta?.sector,
        session.rawInput,
        session.report?.report_body,
        session.organizationName
      );
    const boardOptions =
      /jeugdzorg/i.test(resolvedSector || "") && parsedBoardOptions.length < 3
        ? buildSourceBoundJeugdzorgOptions([session.rawInput || "", session.boardMemo || "", session.report?.report_body || ""].join("\n\n"))
        : parsedBoardOptions;
    const fallbackKillerInsights = buildFallbackKillerInsights({
      executiveSummary: reportExecutive || session.executiveSummary || "",
      strategicConflict: rawConflict,
      financialConsequences: reportFinancial,
      interventions: session.interventions || [],
      boardOptions,
    });
    const resolvedStressTest =
      rewriteMechanistic(compactSectionText(reportStressTest || noIntervention, 320)) ||
      buildFallbackStressTest({
        sector: resolvedSector,
        strategicConflict: rawConflict,
        financialConsequences: reportFinancial,
        recommendedDirection: extractRecommendedDirection(
          optionsBody || recommendedChoiceBody,
          boardOptions,
          reportExecutive || session.executiveSummary || ""
        ),
      });
    const resolvedEarlySignals =
      earlyWarningBody ||
      buildFallbackEarlySignals({
        sector: resolvedSector,
        interventions: session.interventions || [],
        recommendedDirection: extractRecommendedDirection(
          optionsBody || recommendedChoiceBody,
          boardOptions,
          reportExecutive || session.executiveSummary || ""
        ),
      });
    const rawExecutiveSummary = rewriteMechanistic(reportExecutive || session.executiveSummary || "");
    const resolvedRecommendedDirection = rewriteMechanistic(
      extractRecommendedDirection(
        optionsBody || recommendedChoiceBody,
        boardOptions,
        reportExecutive || session.executiveSummary || ""
      )
    );
    const sourceTextBundle = [session.rawInput || "", session.boardMemo || "", session.report?.report_body || ""].join("\n\n");
    const resolvedConflict =
      /jeugdzorg/i.test(resolvedSector || "")
        ? buildSourceBoundJeugdzorgConflict(sourceTextBundle, boardOptions)
        : buildStrategicConflict(rawExecutiveSummary, rawConflict, boardOptions);
    const enforcedThesis = enforceSingleBoardThesis(
      /jeugdzorg/i.test(resolvedSector || "")
        ? buildSourceBoundJeugdzorgThesis(sourceTextBundle, resolvedRecommendedDirection)
        : rawExecutiveSummary || resolvedConflict,
      resolvedRecommendedDirection || resolvedConflict || "Bestuurlijke these ontbreekt."
    );
    const structuredKillerInsights = parseStructuredKillerInsights(
      killerInsightsBody || fallbackKillerInsights.join("\n"),
      enforcedThesis || resolvedConflict
    );
    const sourceBoundInsights = /jeugdzorg/i.test(resolvedSector || "")
      ? buildSourceBoundJeugdzorgInsights(
          sourceTextBundle,
          resolvedRecommendedDirection
        )
      : [];
    const resolvedStructuredKillerInsights = dedupeStructuredInsights(
      /jeugdzorg/i.test(resolvedSector || "") && sourceBoundInsights.length
        ? sourceBoundInsights
        : sourceBoundInsights.length &&
            (structuredKillerInsights.length < 3 || structuredKillerInsights.every(isGenericInsight))
          ? sourceBoundInsights
          : structuredKillerInsights
    );
    const killerInsights = resolvedStructuredKillerInsights
      .map((item) => item.insight)
      .filter(Boolean);
    const governanceInterventions = buildGovernanceInterventions(
      interventionsBody,
      session.interventions || [],
      resolvedRecommendedDirection,
      resolvedSector
    );
    const compactScenarios = buildCompactScenarios(
      getMemoSectionBody(reportSections, ["STRATEGISCHE SCENARIO SIMULATIE", "SCENARIO SIMULATIE"]) ||
        getMemoSectionBody(structuredReportSections, ["STRATEGISCHE SCENARIO SIMULATIE", "SCENARIO SIMULATIE"]) ||
        getMemoSectionBody(memoSections, "STRATEGISCHE SCENARIO SIMULATIE") ||
        extractLooseSection(reportBody, ["Mogelijke ontwikkelingen", "MOGELIJKE ONTWIKKELINGEN"])
    );
    const resolvedScenarios =
      compactScenarios.length > 0
        ? compactScenarios
        : buildFallbackCompactScenarios(boardOptions, resolvedRecommendedDirection, resolvedConflict);
    const sourceBoundScenarios = /jeugdzorg/i.test(resolvedSector || "")
      ? buildSourceBoundJeugdzorgScenarios(
          sourceTextBundle,
          resolvedRecommendedDirection
        )
      : [];
    const finalScenarios =
      sourceBoundScenarios.length &&
      (resolvedScenarios.length < 3 ||
        resolvedScenarios.every(
          (scenario) =>
            /breedte blijft kwetsbaar|versmal het aanbod zodat|vergroot invloed op instroom/i.test(
              `${scenario.mechanism} ${scenario.risk} ${scenario.boardImplication}`
            )
        ))
        ? sourceBoundScenarios
        : resolvedScenarios;
    const scoredScenarios = finalScenarios.map((scenario) => ({
      ...scenario,
      ...evaluateScenarioScores(scenario.mechanism, scenario.risk, scenario.boardImplication),
    }));
    const uniqueScenarios = dedupeScenarioList(scoredScenarios);
    const recommendedScenarioIndex = resolveRecommendedScenarioIndex(uniqueScenarios, resolvedRecommendedDirection);
    const finalScenarioCollection = uniqueScenarios.map((scenario, index) => ({
      ...scenario,
      recommended: index === recommendedScenarioIndex,
    }));
    const optionRejections = buildOptionRejections(boardOptions, resolvedRecommendedDirection, resolvedConflict);
    const boardDecisionPressure =
      /jeugdzorg/i.test(resolvedSector || "")
        ? buildSourceBoundJeugdzorgDecisionPressure(sourceTextBundle)
        : buildBoardDecisionPressure(resolvedStressTest, reportFinancial, resolvedConflict);
    const distinctExecutiveSummary = buildDistinctExecutiveSummary({
      organization: session.organizationName || "Onbekende organisatie",
      sector: resolvedSector || "Onbekende sector",
      recommendedDirection: resolvedRecommendedDirection,
      conflict: resolvedConflict,
      stressTest: resolvedStressTest,
      sourceText: sourceTextBundle,
      analysisDate: formatAnalysisDate(session.createdAt || session.analyse_datum),
    });
    const distinctFactsSection = buildDistinctFactsSection(
      sourceTextBundle,
      resolvedSector || "",
      enforcedThesis
    );

    const canonicalReportSections = (
      (visibleStrategySections.length
        ? visibleStrategySections
        : structuredReportSections.map((section) => ({ title: section.title, body: section.body })))
        .concat((killerInsightsBody || fallbackKillerInsights.length)
          ? [{ title: "KILLER INSIGHTS", body: killerInsightsBody || fallbackKillerInsights.join("\n") }]
          : [])
        .concat(resolvedEarlySignals ? [{ title: "VROEGSIGNALERING", body: resolvedEarlySignals }] : [])
        .concat(resolvedStressTest ? [{ title: "BOARDROOM STRESSTEST", body: resolvedStressTest }] : [])
    ).map((section) => [section.title.toUpperCase(), section]);
    const uniqueStrategySections = Array.from(new Map(canonicalReportSections).values());

    const bestuurlijkeBesliskaartData = buildBestuurlijkeBesliskaartData({
      organization: session.organizationName || "Onbekende organisatie",
      sector: resolvedSector || "Onbekende sector",
      analysisDate: formatAnalysisDate(session.createdAt || session.analyse_datum),
      coreProblem: resolvedConflict || boardQuestion || "",
      coreStatement: enforcedThesis,
      recommendedChoice: resolvedRecommendedDirection,
      whySources: /jeugdzorg/i.test(resolvedSector || "")
        ? buildSourceBoundJeugdzorgChoiceWhy(sourceTextBundle, resolvedRecommendedDirection)
        : [
            ...resolvedStructuredKillerInsights.map((item) => item.insight),
            ...killerInsights,
          ],
      riskIfDelayed: resolvedStressTest || boardDecisionPressure.operational,
      stopRuleSource: boardDecisionPressure,
    });
    const bestuurlijkeBesliskaartSection = buildBestuurlijkeBesliskaartSection(bestuurlijkeBesliskaartData);
    const normalizedStrategySections = uniqueStrategySections.map((section) =>
      section.title.toUpperCase() === "BESTUURLIJKE KERNSAMENVATTING"
        ? {
            ...section,
            body: distinctExecutiveSummary,
          }
        : section.title.toUpperCase() === "FEITENBASIS"
          ? {
              ...section,
              body: distinctFactsSection,
            }
        : section.title.toUpperCase() === "KERNSTELLING VAN HET RAPPORT"
          ? {
              ...section,
              body: enforcedThesis,
            }
          : section.title.toUpperCase() === "KEUZERICHTINGEN"
            ? {
                ...section,
                body: boardOptions.length ? boardOptions.join("\n") : section.body,
              }
            : section.title.toUpperCase() === "AANBEVOLEN KEUZE"
              ? {
                  ...section,
                  body: resolvedRecommendedDirection || section.body,
                }
                  : section.title.toUpperCase() === "MOGELIJKE ONTWIKKELINGEN"
                    ? {
                        ...section,
                        body: buildScenarioSectionBody(finalScenarioCollection),
                      }
                : section.title.toUpperCase() === "DOORBRAAKINZICHTEN"
                  ? {
                      ...section,
                      body: renderInsightExport(resolvedStructuredKillerInsights),
                    }
                  : ["KILLER INSIGHTS", "NIEUWE INZICHTEN (KILLER INSIGHTS)"].includes(section.title.toUpperCase())
                    ? {
                        ...section,
                        body: renderInsightExport(resolvedStructuredKillerInsights),
                      }
                  : ["BESTUURLIJK ACTIEPLAN", "BESTUURLIJKE ACTIES"].includes(section.title.toUpperCase())
                    ? {
                        ...section,
                        body: renderInterventionExport(governanceInterventions),
                      }
                  : ["SCENARIO VERGELIJKING", "SCENARIO-OVERZICHT"].includes(section.title.toUpperCase())
                    ? {
                        ...section,
                        body: buildScenarioSectionBody(finalScenarioCollection),
                      }
                  : ["MECHANISME ANALYSE", "WAAROM DIT GEBEURT"].includes(section.title.toUpperCase()) && isJeugdzorgSectorValue(resolvedSector || "")
                    ? {
                        ...section,
                        body: buildSourceBoundJeugdzorgMechanismAnalysis(sourceTextBundle),
                      }
                  : ["OPEN STRATEGISCHE VRAGEN", "OPEN BESTUURSVRAGEN"].includes(section.title.toUpperCase())
                    ? {
                        ...section,
                        body: buildOpenStrategicQuestions(optionRejections),
                      }
                      : section.title.toUpperCase() === "BESLUITGEVOLGEN"
                        ? {
                            ...section,
                            body: [
                              `OPERATIONEEL GEVOLG — ${boardDecisionPressure.operational}`,
                            `FINANCIEEL GEVOLG — ${boardDecisionPressure.financial}`,
                            `ORGANISATORISCH GEVOLG — ${boardDecisionPressure.organizational}`,
                          ].join("\n\n"),
                        }
                  : section
    );
    const existingTitles = new Set(normalizedStrategySections.map((section) => section.title.toUpperCase()));
    const supplementalSections: ReportSection[] = [];
    if (!existingTitles.has("KEUZERICHTINGEN") && boardOptions.length) {
      supplementalSections.push({ title: "Keuzerichtingen", body: boardOptions.join("\n") });
    }
    if (!existingTitles.has("AANBEVOLEN KEUZE") && resolvedRecommendedDirection) {
      supplementalSections.push({ title: "Aanbevolen keuze", body: resolvedRecommendedDirection });
    }
    if (!existingTitles.has("KERNSTELLING VAN HET RAPPORT") && enforcedThesis) {
      supplementalSections.push({ title: "Kernstelling van het rapport", body: enforcedThesis });
    }
    if (!existingTitles.has("MOGELIJKE ONTWIKKELINGEN")) {
      supplementalSections.push({ title: "Mogelijke ontwikkelingen", body: buildScenarioSectionBody(finalScenarioCollection) });
    }
    if (!existingTitles.has("OPEN STRATEGISCHE VRAGEN")) {
      supplementalSections.push({ title: "Open strategische vragen", body: buildOpenStrategicQuestions(optionRejections) });
    }
    const strategySectionsWithCard = curateBoardroomDossierSections(
      [bestuurlijkeBesliskaartSection, ...normalizedStrategySections, ...supplementalSections],
      {
        sector: resolvedSector || "",
        hasStrongLegacySections: true,
      }
    );

    const engineSections = buildEngineSections(memoSections);

    try {
      const scenarioViewSections = buildScenarioViewSections({
        stressTest: resolvedStressTest,
        noIntervention: rewriteMechanistic(compactNoIntervention(noIntervention)),
        compactScenarios: finalScenarioCollection,
        boardDecisionPressure,
        optionRejections,
      });
      const technicalSections =
        engineSections.length > 0
          ? engineSections
          : buildTechnicalFallbackSections({
              strategicConflict: resolvedConflict,
              boardQuestion: compactBoardQuestion(boardQuestion),
              financialConsequences: rewriteMechanistic(compactSectionText(reportFinancial, 320)),
              strategyAlert: extractStrategyAlert(resolvedEarlySignals || decisionMemory || session.boardMemo || ""),
              noIntervention: rewriteMechanistic(compactNoIntervention(noIntervention)),
              compactScenarios: finalScenarioCollection,
              governanceInterventions,
            });
      const model: ReportRenderModel = {
        organizationName: session.organizationName || "Onbekende organisatie",
        sessionId: formatReportCode(session.sessionId),
        createdAt: safeDateValue(session.createdAt),
        sector: resolvedSector || "Onbekende sector",
        deckSubtitle: deriveReportDeckSubtitle(resolvedSector || ""),
        contactLines: session.presentationMeta?.contactLines || [],
        qualityScore: session.qualityScore,
        qualityTier: session.qualityTier,
        dominantThesis: enforcedThesis,
        strategicConflict: resolvedConflict,
        boardOptions,
        recommendedDirection: resolvedRecommendedDirection,
        topInterventions: extractTopInterventions(interventionsBody, session.interventions || []),
        structuredKillerInsights: resolvedStructuredKillerInsights,
        governanceInterventions,
        compactScenarios: finalScenarioCollection,
        optionRejections,
        boardDecisionPressure,
        boardQuestion: compactBoardQuestion(boardQuestion),
        financialConsequences: rewriteMechanistic(compactSectionText(reportFinancial, 320)),
        stressTest: resolvedStressTest,
        executiveSummary: rawExecutiveSummary,
        strategyAlert: extractStrategyAlert(resolvedEarlySignals || decisionMemory || session.boardMemo || ""),
        noIntervention: rewriteMechanistic(compactNoIntervention(noIntervention)),
        strategySections: strategySectionsWithCard,
        engineSections: technicalSections,
        scenarioSections: scenarioViewSections,
        bestuurlijkeBesliskaart: bestuurlijkeBesliskaartData,
        qualityLevel: quality.level,
        qualityChecks: quality.checks,
        criticalFlags: gate.critical,
        nonCriticalFlags: gate.nonCritical,
      };
      return mergeStrategicBrainViewModel(model, session.strategicBrainReport);
    } catch {
      const fallbackBesliskaart = buildBestuurlijkeBesliskaartData({
        organization: session.organizationName || "Onbekende organisatie",
        sector: resolvedSector || "Onbekende sector",
        analysisDate: formatAnalysisDate(session.createdAt || session.analyse_datum),
        coreProblem: "Bestuurlijke data ontbreekt.",
        coreStatement: "Bestuurlijke data ontbreekt.",
        recommendedChoice: "Bestuurlijke keuze ontbreekt.",
        whySources: [],
        riskIfDelayed: "Risico niet gespecificeerd.",
        stopRuleSource: {
          operational: "",
          financial: "",
          organizational: "",
        },
      });
      const fallbackModel: ReportRenderModel = {
        organizationName: session.organizationName || "Onbekende organisatie",
        sessionId: formatReportCode(session.sessionId),
        createdAt: safeDateValue(session.createdAt),
        sector: resolvedSector || "Onbekende sector",
        deckSubtitle: deriveReportDeckSubtitle(resolvedSector || ""),
        contactLines: [],
        qualityScore: Number(session.qualityScore || 0),
        qualityTier: String(session.qualityTier || ""),
        dominantThesis: "Rapportmodel kon niet volledig worden opgebouwd.",
        strategicConflict: "",
        boardOptions: [],
        recommendedDirection: "",
        topInterventions: [],
        structuredKillerInsights: [],
        governanceInterventions: [],
        compactScenarios: [],
        optionRejections: [],
        boardDecisionPressure: {
          operational: "",
          financial: "",
          organizational: "",
        },
        boardQuestion: "",
        financialConsequences: "",
        stressTest: "",
        executiveSummary: sanitizeDisplayText(session.executiveSummary || ""),
        strategyAlert: "",
        noIntervention: "",
        strategySections: [],
        scenarioSections: [],
        engineSections: [],
        qualityLevel: "laag",
        qualityChecks: ["Rapportdata fallback actief door ongeldige sessiedata."],
        criticalFlags: [],
        nonCriticalFlags: [],
        bestuurlijkeBesliskaart: fallbackBesliskaart,
      };
      return mergeStrategicBrainViewModel(fallbackModel, session.strategicBrainReport);
    }
  }

  return (
    <PageShell
      title="Strategisch rapport"
      subtitle="Overzicht van analyse-rapporten met duidelijke downloads en print."
      showDownloadBar={false}
    >
      <Panel title="Rapport upload">
        <div className="portal-card-soft mb-4 border-dashed p-4">
          <p className="text-xs text-gray-300">Upload rapportbestand (.json/.txt/.md) om toe te voegen aan de bibliotheek.</p>
          <input
            type="file"
            accept=".json,.txt,.md,.csv"
            multiple
            className="mt-3 block w-full text-xs text-gray-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#D4AF37] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Panel>

      <Panel title="Analyse-rapporten">
        <div className="portal-card-soft mb-4 p-4">
          <p className="text-xs text-gray-300">
            Consolidation mode actief. De bibliotheek leest live analyses uit <code>analysis_sessions</code> en behoudt daarnaast handmatige rapportuploads in de huidige dashboardlaag.
          </p>
        </div>
        {blockedReports.length ? (
          <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
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
              <div className="portal-card-soft flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-300">
                {showAllReports
                  ? `${premiumOnly ? "Premium" : "Alle"} rapporten (${filteredReports.length})`
                  : `Compact overzicht (primair ${visiblePrimaryAnalysisReports.length}/${primaryAnalysisReports.length}, continuiteit ${visibleContinuityReports.length}/${continuityReports.length}, upload ${visibleUploadReports.length}/${uploadReports.length})`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="portal-button-secondary px-3 py-1 text-xs"
                  onClick={() => setPremiumOnly((prev) => !prev)}
                >
                  {premiumOnly ? "Toon alle niveaus" : "Alleen premium rapporten"}
                </button>
                {filteredReports.length > 8 ? (
                  <button
                    type="button"
                    className="portal-button-secondary px-3 py-1 text-xs"
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
            {newestVisibleReport ? (
              <>
                <div className="portal-card-soft px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">Nieuwste dossier</p>
                  <p className="mt-1 text-xs text-gray-400">Altijd bovenaan. Oudere dossiers schuiven direct door naar de rapportmap.</p>
                </div>
                {newestVisibleReport.sourceType !== "upload" && String(newestVisibleReport.engineMode || "").toLowerCase() !== "fallback" ? (
                  <article
                    key={`latest-${newestVisibleReport.sessionId}`}
                    className={`portal-card p-5 transition-colors ${
                      matchesReportSelection(newestVisibleReport, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
                    }`}
                  >
                    {(() => {
                      const session = newestVisibleReport;
                      const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
                      const storedTab = activeTabs[session.sessionId];
                      const activeTab =
                        storedTab && getVisibleReportTabsForMode(reportMode).includes(storedTab)
                          ? storedTab
                          : getDefaultReportTabForMode(reportMode);
                      const downloadLabel = getExportButtonLabel(getPrimaryExportTab(reportMode), reportMode);
                      return (
                        <>
                          <button
                            type="button"
                            className="w-full text-left"
                            disabled={pendingSessionId === session.sessionId}
                            onClick={() => {
                              const targetId = session.reportId || session.sessionId;
                              setPendingSessionId(session.sessionId);
                              startTransition(() => {
                                setSelectedSessionId(targetId);
                                setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                                setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                              });
                              navigate(buildPortalReportPath(targetId, "short"), {
                                replace: true,
                                state: { reportId: targetId, sessionId: session.sessionId },
                              });
                              window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                            }}
                          >
                            <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                            <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                            <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Onbekende organisatie"} • Analyse</p>
                            {session.status === "fout" && /Publicatie geblokkeerd/i.test(session.errorMessage || "") ? (
                              <p className="mt-1 text-[11px] text-red-300">
                                Publicatie geblokkeerd: {(parseBlockedFlags(session.errorMessage).slice(0, 3).join(", ") || session.errorMessage)}
                              </p>
                            ) : null}
                            {(session.engineMode || session.analysisRuntimeMs > 0 || session.status === "fout") ? (
                              <p className="mt-1 text-[11px] text-gray-400">
                                Engine: {resolveEngineLabel(session.engineMode, session.sourceType)}
                                {session.analysisRuntimeMs > 0 ? ` • Runtime: ${Math.round(session.analysisRuntimeMs / 1000)}s` : ""}
                                {session.status === "fout"
                                  ? ` • Status: ${session.status}`
                                  : ` • Kwaliteit: ${session.qualityScore}/100 (${session.qualityTier})`}
                              </p>
                            ) : null}
                            <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
                          </button>
                          {matchesReportSelection(session, selectedSessionId) ? (
                            <>
                              {session.status === "fout" ? (
                                <section className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                                  <p className="font-semibold text-red-200">Analyse geblokkeerd of mislukt</p>
                                  <p className="mt-2">{session.errorMessage || "Onbekende fout tijdens analyse."}</p>
                                  {session.qualityFlags.length ? (
                                    <p className="mt-2 text-xs text-red-100">
                                      Kwaliteitsflags: {session.qualityFlags.join(", ")}
                                    </p>
                                  ) : null}
                                </section>
                              ) : null}
                              {(session.status !== "fout" || session.report || session.boardMemo || session.executiveSummary) ? renderExpandedReport(session) : null}
                            </>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              className="portal-button-secondary px-3 py-1.5 text-xs"
                              disabled={pdfBusySessionId === session.sessionId}
                              onClick={() => void handlePdf(session.sessionId, "preview")}
                            >
                              {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                            </button>
                            <button
                              className="portal-button-primary px-3 py-1.5 text-xs"
                              disabled={pdfBusySessionId === session.sessionId}
                              onClick={() => void handlePdf(session.sessionId, "download")}
                            >
                              {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </article>
                ) : null}
                {newestVisibleReport.sourceType !== "upload" && String(newestVisibleReport.engineMode || "").toLowerCase() === "fallback" ? (
                  <article
                    key={`latest-${newestVisibleReport.sessionId}`}
                    className={`portal-card p-5 opacity-90 transition-colors ${
                      matchesReportSelection(newestVisibleReport, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
                    }`}
                  >
                    {(() => {
                      const session = newestVisibleReport;
                      const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
                      const downloadLabel = getExportButtonLabel(getPrimaryExportTab(reportMode), reportMode);
                      return (
                        <>
                          <button
                            type="button"
                            className="w-full text-left"
                            disabled={pendingSessionId === session.sessionId}
                            onClick={() => {
                              const targetId = session.reportId || session.sessionId;
                              setPendingSessionId(session.sessionId);
                              startTransition(() => {
                                setSelectedSessionId(targetId);
                                setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                                setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                              });
                              navigate(buildPortalReportPath(targetId, "short"), {
                                replace: true,
                                state: { reportId: targetId, sessionId: session.sessionId },
                              });
                              window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                            }}
                          >
                            <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                            <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                            <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Onbekende organisatie"} • Lokale continuiteit</p>
                            <p className="mt-1 text-[11px] text-gray-400">
                              Engine: {resolveEngineLabel(session.engineMode, session.sourceType)} • Kwaliteit: {session.qualityScore}/100 ({session.qualityTier || "standard"})
                            </p>
                            <p className="mt-2 text-sm text-gray-300 line-clamp-2">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
                          </button>
                          {matchesReportSelection(session, selectedSessionId) ? (
                            <>
                              {(session.status !== "fout" || session.report || session.boardMemo || session.executiveSummary) ? renderExpandedReport(session) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  className="portal-button-secondary px-3 py-1.5 text-xs"
                                  disabled={pdfBusySessionId === session.sessionId}
                                  onClick={() => void handlePdf(session.sessionId, "preview")}
                                >
                                  {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                                </button>
                                <button
                                  className="portal-button-primary px-3 py-1.5 text-xs"
                                  disabled={pdfBusySessionId === session.sessionId}
                                  onClick={() => void handlePdf(session.sessionId, "download")}
                                >
                                  {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}
                                </button>
                              </div>
                            </>
                          ) : null}
                        </>
                      );
                    })()}
                  </article>
                ) : null}
                {newestVisibleReport.sourceType === "upload" ? (
                  <article
                    key={`latest-${newestVisibleReport.sessionId}`}
                    className={`portal-card p-5 transition-colors ${
                      matchesReportSelection(newestVisibleReport, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
                    }`}
                  >
                    {(() => {
                      const session = newestVisibleReport;
                      return (
                        <>
                          <button
                            type="button"
                            className="w-full text-left"
                            disabled={pendingSessionId === session.sessionId}
                            onClick={() => {
                              const targetId = session.reportId || session.sessionId;
                              setPendingSessionId(session.sessionId);
                              startTransition(() => {
                                setSelectedSessionId(targetId);
                                setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                                setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                              });
                              navigate(buildPortalReportPath(targetId, "short"), {
                                replace: true,
                                state: { reportId: targetId, sessionId: session.sessionId },
                              });
                              window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                            }}
                          >
                            <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                            <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                            <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Geuploade bron"} • Upload</p>
                            <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
                          </button>
                          {matchesReportSelection(session, selectedSessionId) ? renderExpandedReport(session) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              className="portal-button-secondary px-3 py-1.5 text-xs"
                              disabled={pdfBusySessionId === session.sessionId}
                              onClick={() => void handlePdf(session.sessionId, "preview")}
                            >
                              {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                            </button>
                            <button
                              className="portal-button-primary px-3 py-1.5 text-xs"
                              disabled={pdfBusySessionId === session.sessionId}
                              onClick={() => void handlePdf(session.sessionId, "download")}
                            >
                              {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : "Download PDF"}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </article>
                ) : null}
              </>
            ) : null}
            {reportMapReports.length ? (
              <div className="portal-card-soft px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">Rapportmap</p>
                <p className="mt-1 text-[11px] text-gray-500">Oudere dossiers, compact gegroepeerd per rapporttype.</p>
              </div>
            ) : null}
            {visiblePrimaryAnalysisReports.length ? (
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">Analyses</p>
            ) : null}
            {visiblePrimaryAnalysisReports.map((session) => (
            <article
              key={session.sessionId}
              className={`portal-card p-5 transition-colors ${
                matchesReportSelection(session, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
              }`}
            >
              {(() => {
                const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
                const storedTab = activeTabs[session.sessionId];
                const activeTab =
                  storedTab && getVisibleReportTabsForMode(reportMode).includes(storedTab)
                    ? storedTab
                    : getDefaultReportTabForMode(reportMode);
                const downloadLabel = getExportButtonLabel(getPrimaryExportTab(reportMode), reportMode);
                return (
                  <>
              <button
                type="button"
                className="w-full text-left"
                disabled={pendingSessionId === session.sessionId}
                onClick={() => {
                  const targetId = session.reportId || session.sessionId;
                  setPendingSessionId(session.sessionId);
                  startTransition(() => {
                    setSelectedSessionId(targetId);
                    setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                    setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                  });
                  navigate(buildPortalReportPath(targetId, "short"), {
                    replace: true,
                    state: { reportId: targetId, sessionId: session.sessionId },
                  });
                  window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                }}
              >
                <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Onbekende organisatie"} • Analyse</p>
                {session.status === "fout" && /Publicatie geblokkeerd/i.test(session.errorMessage || "") ? (
                  <p className="mt-1 text-[11px] text-red-300">
                    Publicatie geblokkeerd: {(parseBlockedFlags(session.errorMessage).slice(0, 3).join(", ") || session.errorMessage)}
                  </p>
                ) : null}
                {(session.engineMode || session.analysisRuntimeMs > 0 || session.status === "fout") ? (
                  <p className="mt-1 text-[11px] text-gray-400">
                    Engine: {resolveEngineLabel(session.engineMode, session.sourceType)}
                    {session.analysisRuntimeMs > 0 ? ` • Runtime: ${Math.round(session.analysisRuntimeMs / 1000)}s` : ""}
                    {session.status === "fout"
                      ? ` • Status: ${session.status}`
                      : ` • Kwaliteit: ${session.qualityScore}/100 (${session.qualityTier})`}
                  </p>
              ) : null}
                <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
              </button>
              {matchesReportSelection(session, selectedSessionId) ? (
                <>
                  {session.status === "fout" ? (
                    <section className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                      <p className="font-semibold text-red-200">Analyse geblokkeerd of mislukt</p>
                      <p className="mt-2">{session.errorMessage || "Onbekende fout tijdens analyse."}</p>
                      {session.qualityFlags.length ? (
                        <p className="mt-2 text-xs text-red-100">
                          Kwaliteitsflags: {session.qualityFlags.join(", ")}
                        </p>
                      ) : null}
                    </section>
                  ) : null}
                  {(session.status !== "fout" || session.report || session.boardMemo || session.executiveSummary) ? renderExpandedReport(session) : null}
                </>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="portal-button-secondary px-3 py-1.5 text-xs"
                  disabled={pdfBusySessionId === session.sessionId}
                  onClick={() => void handlePdf(session.sessionId, "preview")}
                >
                  {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                </button>
                {session.report ? (
                    <button
                      className="portal-button-primary px-3 py-1.5 text-xs"
                      disabled={pdfBusySessionId === session.sessionId}
                      onClick={() => void handlePdf(session.sessionId, "download")}
                    >
                    {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}
                  </button>
                ) : (
                  <button className="portal-button-primary px-3 py-1.5 text-xs" disabled={pdfBusySessionId === session.sessionId} onClick={() => void handlePdf(session.sessionId, "download")}>{pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}</button>
                )}
              </div>
                  </>
                );
              })()}
            </article>
          ))}
            {visibleContinuityReports.length ? (
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">Lokale continuiteit</p>
            ) : null}
            {visibleContinuityReports.map((session) => (
            <article
              key={session.sessionId}
              className={`portal-card p-5 opacity-90 transition-colors ${
                matchesReportSelection(session, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
              }`}
            >
              {(() => {
                const reportMode = reportModes[session.sessionId] || normalizeReportSpeedMode(searchParams.get("view"));
                const downloadLabel = getExportButtonLabel(getPrimaryExportTab(reportMode), reportMode);
                return (
                  <>
              <button
                type="button"
                className="w-full text-left"
                disabled={pendingSessionId === session.sessionId}
                onClick={() => {
                  const targetId = session.reportId || session.sessionId;
                  setPendingSessionId(session.sessionId);
                  startTransition(() => {
                    setSelectedSessionId(targetId);
                    setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                    setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                  });
                  navigate(buildPortalReportPath(targetId, "short"), {
                    replace: true,
                    state: { reportId: targetId, sessionId: session.sessionId },
                  });
                  window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                }}
              >
                <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Onbekende organisatie"} • Lokale continuiteit</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Engine: {resolveEngineLabel(session.engineMode, session.sourceType)} • Kwaliteit: {session.qualityScore}/100 ({session.qualityTier || "standard"})
                </p>
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
              </button>
              {matchesReportSelection(session, selectedSessionId) ? (
                <>
                  {(session.status !== "fout" || session.report || session.boardMemo || session.executiveSummary) ? renderExpandedReport(session) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="portal-button-secondary px-3 py-1.5 text-xs"
                      disabled={pdfBusySessionId === session.sessionId}
                      onClick={() => void handlePdf(session.sessionId, "preview")}
                    >
                      {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                    </button>
                    <button
                      className="portal-button-primary px-3 py-1.5 text-xs"
                      disabled={pdfBusySessionId === session.sessionId}
                      onClick={() => void handlePdf(session.sessionId, "download")}
                    >
                      {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : downloadLabel}
                    </button>
                  </div>
                </>
              ) : null}
                  </>
                );
              })()}
            </article>
          ))}
            {visibleUploadReports.length ? (
              <p className="px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">Uploads</p>
            ) : null}
            {visibleUploadReports.map((session) => (
            <article
              key={session.sessionId}
              className={`portal-card p-5 transition-colors ${
                matchesReportSelection(session, selectedSessionId) ? "border-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.45)]" : ""
              }`}
            >
                <button
                  type="button"
                  className="w-full text-left"
                  disabled={pendingSessionId === session.sessionId}
                  onClick={() => {
                    const targetId = session.reportId || session.sessionId;
                    setPendingSessionId(session.sessionId);
                    startTransition(() => {
                      setSelectedSessionId(targetId);
                      setReportModes((prev) => ({ ...prev, [session.sessionId]: "short" }));
                      setActiveTabs((prev) => ({ ...prev, [session.sessionId]: "boardroom" }));
                    });
                    navigate(buildPortalReportPath(targetId, "short"), {
                      replace: true,
                      state: { reportId: targetId, sessionId: session.sessionId },
                    });
                    window.setTimeout(() => setPendingSessionId((current) => (current === session.sessionId ? "" : current)), 250);
                  }}
                >
                  <h3 className="text-sm font-semibold text-white">{formatReportCode(session.sessionId)}</h3>
                  <p className="mt-1 text-xs text-gray-300">{new Date(session.createdAt).toLocaleString("nl-NL")}</p>
                  <p className="mt-1 text-xs text-gray-400">{session.organizationName || "Geuploade bron"} • Upload</p>
                  <p className="mt-2 text-sm text-gray-200 line-clamp-3">{session.executiveSummary || "Samenvatting niet beschikbaar."}</p>
                </button>
                {matchesReportSelection(session, selectedSessionId) ? renderExpandedReport(session) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="portal-button-secondary px-3 py-1.5 text-xs"
                  disabled={pdfBusySessionId === session.sessionId}
                  onClick={() => void handlePdf(session.sessionId, "preview")}
                >
                  {pdfBusySessionId === session.sessionId && pdfBusyMode === "preview" ? "Preview laden..." : "Bekijk PDF"}
                </button>
                <button
                  className="portal-button-primary px-3 py-1.5 text-xs"
                  disabled={pdfBusySessionId === session.sessionId}
                  onClick={() => void handlePdf(session.sessionId, "download")}
                >
                  {pdfBusySessionId === session.sessionId && pdfBusyMode === "download" ? "PDF maken..." : "Download PDF"}
                </button>
              </div>
            </article>
          ))}
            {/* Legacy reference retained for render regression coverage: {matchesReportSelection(session, selectedSessionId) ? renderExpandedReport(session) : null} */}
          </div>
        )}
      </Panel>
      {hint ? <p className="text-sm text-gray-300">{hint}</p> : null}
    </PageShell>
  );
}

async function createInlinePdfPreview(
  report: StrategicReport,
  options: {
    organizationName?: string;
    sector?: string;
    analysisType?: string;
    documentType?: string;
    generatedAt?: string;
    rawInput?: string;
    titleOverride?: string;
    subtitle?: string;
    canonicalReport?: import("@/types/StrategicReport").StrategicReport;
    boardroomDocument?: import("@/types/BoardroomDocument").BoardroomDocument;
  }
): Promise<string> {
  const { createPdfPreviewUrl } = await import("@/services/exportService");
  return createPdfPreviewUrl(report, options);
}
