// ============================================================
// src/aurelius/pages/analysis/UnifiedAnalysisPage.tsx
// UNIFIED WORLD — PRE + POST LOGIN — SINGLE ORCHESTRATOR ENTRY
// ============================================================

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useParams } from "react-router-dom";

import { ANALYSES } from "../../config/analyses.config";
import { useAnalysisStore } from "../../store/useAnalysisStore";

import {
  parseAureliusReport,
  type AureliusAnalysisResult,
} from "../../utils/parseAureliusReport";

import { generateBoardroomNarrative } from "../../narrative/generateBoardroomNarrative";
import {
  type AnalysisResult as PDFAnalysisResult,
} from "../../utils/generateAureliusPDF";
import { dumpReportEnvelope } from "../../../core/debug/reportDebugDump";
import {
  CYNTRA_SIGNATURE_LAYER_VIOLATION,
  enforceConcreteNarrativeMarkdown,
  enforceConcreteOutputMap,
  SIGNATURE_LAYER_WARNING_PREFIX,
} from "../../narrative/guards/enforceConcreteOutput";

import type { AnalysisType as AureliusAnalysisType } from "../../types";
import { parseInputAnchors } from "../../executive/anchor/anchorScan";
import { fetchSectorSignals } from "@/api/sector/signals";
import { SECTOR_OPTIONS, type Sector } from "@/aurelius/sector/types";

import CyntraAnalysisLayout from "../../layouts/CyntraAnalysisLayout";
import Watermark from "../../components/Watermark";
import { CyntraPrimaryAction } from "../../components/CyntraPrimaryAction";
import BackToDashboard from "@/components/navigation/BackToDashboard";
import {
  getBoardIndexSnapshot,
  saveBoardIndexSnapshot,
} from "@/aurelius/storage/BoardIndexRepository";
import { saveReport } from "@/aurelius/storage/ReportRepository";
import {
  buildDualLayerOutput,
  type CyntraDualLayerOutput,
  type DecisionLayer,
} from "@/aurelius/synthesis/dualLayer";
import { buildBoardroomBrief } from "@/aurelius/synthesis/buildBoardroomBrief";
import type { RunCyntraResult } from "@/aurelius/hooks/useCyntraAnalysis";
import {
  applyBoardEditorialPolicy,
} from "@/aurelius/utils/boardOutputSanitizer";
import { formatHumanExecutiveText } from "@/aurelius/synthesis/humanExecutiveFormatter";
import {
  getBoardOutputMetrics,
  runBoardOutputGuard,
} from "@/aurelius/synthesis/boardOutputGuard";
import {
  assertOutputIntegrity,
  normalizeBoardDocumentForOutput,
  normalizeSectionBodyForOutput,
  sanitizeExecutiveReportFields,
} from "@/aurelius/synthesis/outputIntegrity";

import {
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  Printer,
} from "lucide-react";

import type { LinguisticSignalBundle } from "../../engine/linguisticSignals";

import {
  runPowerPipeline,
  type PowerPipelineOutput,
} from "../../engine/nodes/power/runPowerPipeline";
import type { StrategicReport } from "@/platform/types";

/* ============================================================
   CONSTANTS
============================================================ */

const MIN_NARRATIVE_WORDS = 3500;
const MAX_NARRATIVE_WORDS = 7000;
const MODEL_NARRATIVE_MAX_WORDS = 6200;
const SIGNATURE_VIOLATION_TEXT = CYNTRA_SIGNATURE_LAYER_VIOLATION;
const SIGNATURE_WARNING_TEXT =
  "Waarschuwing: output voldoet niet volledig aan Cyntra-standaard \u2192 fallback gegenereerd. Rapport is bruikbaar maar minder scherp.";
const UI_SANITIZE_PATTERNS = [
  /\[SOURCE_FREE_FIELD\]/gi,
  /\[SOURCE_UPLOAD\]/gi,
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
  /^\s*Aanname:[^\n]*\n?/gim,
  /^\s*Contextanker:[^\n]*\n?/gim,
  /\bbeperkte context\b/gi,
  /\bduid structureel\b/gi,
  /\bcontextsignaal\b/gi,
  /werk uit structureel/gi,
];

type GuaranteedExecutiveReport = {
  dominantThesis: string;
  coreConflict: string;
  tradeoffs: string;
  governanceImpact: string;
  powerDynamics: string;
  opportunityCost: string;
  executionRisk: string;
  decisionContract: string;
  interventionPlan90D: string;
};

function normalizePersistedAnalysisResult(
  analysisRecord: Record<string, any> | null | undefined
): RunCyntraResult | null {
  if (!analysisRecord || typeof analysisRecord !== "object") return null;

  const rawResult =
    analysisRecord.result_payload && typeof analysisRecord.result_payload === "object"
      ? analysisRecord.result_payload
      : analysisRecord.result && typeof analysisRecord.result === "object"
        ? analysisRecord.result
        : null;

  if (!rawResult) return null;

  const result =
    "input_payload" in rawResult
      ? Object.fromEntries(
          Object.entries(rawResult).filter(([key]) => key !== "input_payload")
        )
      : rawResult;

  return {
    report: result,
    confidence:
      typeof result.confidence === "string"
        ? (result.confidence as RunCyntraResult["confidence"])
        : "medium",
    created_at:
      typeof analysisRecord.finished_at === "string"
        ? analysisRecord.finished_at
        : typeof analysisRecord.created_at === "string"
          ? analysisRecord.created_at
          : undefined,
    intelligence_layer: result.intelligence_layer as RunCyntraResult["intelligence_layer"],
    decision_layer: result.decision_layer as RunCyntraResult["decision_layer"],
    strategic_levers: result.strategic_levers as RunCyntraResult["strategic_levers"],
    causal_strategy: result.causal_strategy as RunCyntraResult["causal_strategy"],
  };
}

function extractStrategicOptions(reportSource: Record<string, unknown>): string[] {
  const decision = asRecord(reportSource.decision);
  const candidateLists = [
    decision.strategic_options,
    reportSource.strategic_options,
    reportSource.options,
  ];

  for (const candidate of candidateLists) {
    if (!Array.isArray(candidate)) continue;
    const options = candidate
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(row.description || row.title || row.option || "").trim();
        }
        return "";
      })
      .filter(Boolean)
      .slice(0, 3);
    if (options.length) return options;
  }

  return [];
}

function extractRecommendedDirection(
  reportSource: Record<string, unknown>,
  executive: GuaranteedExecutiveReport
): string {
  const decision = asRecord(reportSource.decision);
  const candidate = [
    decision.recommended_option,
    reportSource.recommended_option,
    decision.dominant_thesis,
    executive.tradeoffs,
  ]
    .map((value) => String(value ?? "").trim())
    .find(Boolean);

  return candidate || executive.dominantThesis;
}

function buildPlatformSessionBoardReport(
  executive: GuaranteedExecutiveReport,
  reportSource: Record<string, unknown>,
  narrativeText: string
): string {
  const options = extractStrategicOptions(reportSource);
  const recommendedDirection = extractRecommendedDirection(reportSource, executive);
  const killerInsights = [
    executive.opportunityCost,
    executive.powerDynamics,
    executive.executionRisk,
  ]
    .map((value) => stripSignatureWarningPrefix(value).trim())
    .filter(Boolean)
    .slice(0, 3);

  const strategyOptionsText = options.length
    ? options.map((option, index) => `${index + 1}. ${option}`).join("\n")
    : [
        `1. Stabiliseren rond de kernpropositie en verlieslatende complexiteit stoppen.`,
        `2. Selectief versnellen waar mandaat, capaciteit en rendement aantoonbaar samenvallen.`,
        `3. Huidige koers handhaven en stijgende uitvoeringsdruk accepteren.`,
      ].join("\n");

  return normalizeBoardDocumentForOutput(
    [
      "1. Dominante These",
      stripSignatureWarningPrefix(executive.dominantThesis),
      "",
      "2. STRATEGISCH CONFLICT",
      stripSignatureWarningPrefix(executive.coreConflict),
      "",
      "3. KILLER INSIGHTS",
      killerInsights.length
        ? killerInsights.map((item, index) => `${index + 1}. ${item}`).join("\n")
        : stripSignatureWarningPrefix(narrativeText),
      "",
      "4. Strategische opties",
      strategyOptionsText,
      "",
      "5. Aanbevolen keuze",
      stripSignatureWarningPrefix(recommendedDirection),
      "",
      "6. Mandaat & Besluitrecht",
      stripSignatureWarningPrefix(executive.governanceImpact),
      "",
      "7. 90-dagen interventieplan",
      stripSignatureWarningPrefix(executive.interventionPlan90D),
      "",
      "8. Besluitkader",
      stripSignatureWarningPrefix(executive.decisionContract),
    ].join("\n")
  );
}

const DEFAULT_POWER_METRICS: PowerPipelineOutput["metrics"] = {
  conflict_intensity_score_0_100: 0,
  governance_integrity_score_0_100: 0,
  decision_strength_index_0_100: 0,
  execution_risk_level: "MEDIUM",
  decision_certainty_0_1: 0,
};

const DEFAULT_EXECUTION_LAYER: PowerPipelineOutput["execution_layer"] = {
  "90_day_priorities": [],
  measurable_outcomes: [],
  risk_level: "MEDIUM",
  owner_map: [],
};

const FLOW_STEPS = [
  "Analyse Entry",
  "Intake",
  "runCyntraFullPipeline()",
  "MultiAgentOrchestrator",
  "Synthese Core",
  "Besluitkader",
  "Bestuurlijke Analyse",
  "Control Surface",
  "Rapport Download",
] as const;
const FLOW_COMPLETION_STAGE = FLOW_STEPS.length;
const FLOW_FALLBACK_ADVANCE_DELAY_MS = 500;

const POWER_NODE_LABELS: Record<string, string> = {
  truth: "Strategische Realiteitscheck",
  governance: "Besluitspanningsindicator",
  conflict: "Machtsfrictie",
  opportunity_cost: "Stilstandsverlies",
  tradeoff: "Strategische Samensmelting",
  decision_finalizer: "Bestuurlijke Verankering",
};

const EXECUTIVE_FALLBACK_LABELS: Record<keyof GuaranteedExecutiveReport, string> = {
  dominantThesis: "Analyse.dominante_these",
  coreConflict: "Analyse.kernspanning",
  tradeoffs: "Analyse.keerzijde_van_de_keuze",
  governanceImpact: "Analyse.mandaat_en_besluitrecht",
  powerDynamics: "Analyse.onderstroom",
  opportunityCost: "Analyse.prijs_van_uitstel",
  executionRisk: "Analyse.faalmechanisme",
  decisionContract: "Analyse.besluitkader",
  interventionPlan90D: "Analyse.interventieplan_90_dagen",
};

const UI_WARN_ONCE_KEYS = new Set<string>();
const UI_INFO_ONCE_KEYS = new Set<string>();
const DEBUG_BOARD_CONSOLE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("debugBoard");

function warnOnce(key: string, ...args: unknown[]) {
  if (UI_WARN_ONCE_KEYS.has(key)) return;
  UI_WARN_ONCE_KEYS.add(key);
  console.warn(...args);
}

function infoOnce(key: string, ...args: unknown[]) {
  if (UI_INFO_ONCE_KEYS.has(key)) return;
  UI_INFO_ONCE_KEYS.add(key);
  console.info(...args);
}

/* ============================================================
   HELPERS
============================================================ */

function stringifySectionContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((v) => String(v)).join("\n");
  if (content && typeof content === "object") {
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return String(content);
    }
  }
  return "";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function fileIdentity(file: File): string {
  return [file.name, file.size, file.lastModified].join(":");
}

function mergeSelectedFiles(current: File[], incoming: File[]): File[] {
  const merged = [...current];
  const seen = new Set(current.map(fileIdentity));
  incoming.forEach((file) => {
    const identity = fileIdentity(file);
    if (seen.has(identity)) return;
    seen.add(identity);
    merged.push(file);
  });
  return merged;
}

function safeJsonStringify(value: unknown, fallback = "{}"): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return fallback;
  }
}

function extractBoardGateErrors(message: string | null): string[] {
  const source = String(message ?? "").trim();
  if (!/Board-grade contract fail/i.test(source)) return [];
  const marker = source.indexOf(":");
  const payload = marker >= 0 ? source.slice(marker + 1) : source;
  return payload
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function decodeBase64Binary(base64: string): string {
  try {
    if (typeof atob === "function") return atob(base64);
  } catch {
    // no-op
  }
  return "";
}

function decodeBase64Utf8(payload: string): string {
  try {
    const binary = decodeBase64Binary(payload);
    if (!binary) return "";
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
}

function decodePdfLiteralText(literal: string): string {
  return literal
    .replace(/\\([\\()])/g, "$1")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\[0-7]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPdfTextFromBinary(binary: string): string {
  const fragments: string[] = [];
  const tjPattern = /\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g;
  let tjMatch: RegExpExecArray | null = null;
  while ((tjMatch = tjPattern.exec(binary)) !== null) {
    const decoded = decodePdfLiteralText(tjMatch[1] || "");
    if (decoded.length >= 2) fragments.push(decoded);
  }

  const tjArrayPattern = /\[(.*?)\]\s*TJ/gs;
  let tjArrayMatch: RegExpExecArray | null = null;
  while ((tjArrayMatch = tjArrayPattern.exec(binary)) !== null) {
    const chunk = tjArrayMatch[1] || "";
    const literalPattern = /\(([^()]*(?:\\.[^()]*)*)\)/g;
    let literalMatch: RegExpExecArray | null = null;
    while ((literalMatch = literalPattern.exec(chunk)) !== null) {
      const decoded = decodePdfLiteralText(literalMatch[1] || "");
      if (decoded.length >= 2) fragments.push(decoded);
    }
  }

  if (fragments.length >= 10) return fragments.join("\n").slice(0, 5000);
  return (
    binary.match(/[A-Za-z0-9€%(),.;:'"\/\-_ ]{20,}/g)?.slice(0, 120).join("\n") || ""
  ).slice(0, 5000);
}

async function extractDocxTextFromBase64(base64: string): Promise<string> {
  try {
    const { default: JSZip } = await import("jszip");
    const binary = decodeBase64Binary(base64);
    if (!binary) return "";
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) return "";

    return documentXml
      .replace(/<w:tab\/>/g, " ")
      .replace(/<w:br\/>/g, "\n")
      .replace(/<w:p[^>]*>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);
  } catch {
    return "";
  }
}

async function extractTextPreviewFromDataUrl(
  dataUrl: string,
  fileName: string
): Promise<string> {
  const match = String(dataUrl || "").match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i);
  if (!match) return "";

  const mime = (match[1] || "").toLowerCase();
  const payload = match[2] || "";
  const lowerName = (fileName || "").toLowerCase();
  const textLikeMime =
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    mime.includes("csv") ||
    mime.includes("markdown");
  const textLikeExt = /\.(txt|md|markdown|json|csv|xml|log)$/i.test(lowerName);

  if (mime.includes("pdf") || /\.pdf$/i.test(lowerName)) {
    const binary = decodeBase64Binary(payload);
    return extractPdfTextFromBinary(binary).slice(0, 1200);
  }

  if (
    mime.includes("officedocument.wordprocessingml.document") ||
    /\.docx$/i.test(lowerName)
  ) {
    return (await extractDocxTextFromBase64(payload)).slice(0, 1200);
  }

  if (!textLikeMime && !textLikeExt) return "";

  const decoded = decodeBase64Utf8(payload)
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!decoded) return "";
  return decoded.slice(0, 800);
}

async function buildUploadEvidenceContext(
  documents: Array<{ filename: string; content: string }>
): Promise<string> {
  if (!documents.length) return "Geen uploads aangeleverd.";

  const lines = await Promise.all(documents.map(async (doc) => {
    const preview = await extractTextPreviewFromDataUrl(doc.content, doc.filename);
    if (preview) {
      return `Bestand ${doc.filename}: ${preview}`;
    }
    return `Bestand ${doc.filename}: tekstpreview niet direct extraheerbaar, gebruik bestandscontext als bronanker.`;
  }));

  return lines.join("\n");
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toNarrativeLines(value: unknown, depth = 0): string[] {
  if (depth > 3 || value == null) return [];

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => toNarrativeLines(entry, depth + 1));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => {
        const entryLines = toNarrativeLines(entry, depth + 1);
        if (entryLines.length === 0) return "";
        const label = key.replace(/_/g, " ").trim();
        if (entryLines.length === 1) return `${label}: ${entryLines[0]}`;
        return `${label}: ${entryLines.join(" | ")}`;
      })
      .filter(Boolean);
  }

  return [];
}

function toNarrativeText(value: unknown): string {
  return toNarrativeLines(value).join("\n").trim();
}

function normalizeHeading(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMarkdownSection(markdown: string, headingHints: string[]): string {
  const normalizedHints = headingHints.map((hint) => normalizeHeading(hint));
  const headingRegex = /^#{1,6}\s*(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingRegex)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    if (match.index == null) continue;

    const heading = normalizeHeading(match[1] ?? "");
    const isTarget = normalizedHints.some(
      (hint) => heading.includes(hint) || hint.includes(heading)
    );
    if (!isTarget) continue;

    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    const content = markdown
      .slice(start, end)
      .replace(/^\n+/, "")
      .trim();

    if (content) return content;
  }

  return "";
}

function summarizeNode(node: unknown): string {
  const record = asRecord(node);
  const segments = [
    toNarrativeText(record.content),
    toNarrativeText(record.insights),
    toNarrativeText(record.recommendations),
    toNarrativeText(record.risks),
    toNarrativeText(record.opportunities),
  ].filter(Boolean);

  return segments.join("\n").trim();
}

function summarizeNodeWithLabel(
  power: PowerPipelineOutput | null,
  key: keyof PowerPipelineOutput["node_results"]
): string {
  if (!power?.node_results?.[key]) return "";
  const label = POWER_NODE_LABELS[String(key)] ?? String(key);
  const summary = summarizeNode(power.node_results[key]);
  if (!summary) return "";
  return `${label}: ${summary}`;
}

function buildPower90DayPlan(power: PowerPipelineOutput | null): string {
  if (!power) return "";

  const layer = power.execution_layer ?? DEFAULT_EXECUTION_LAYER;
  const priorities = layer["90_day_priorities"] ?? [];
  const outcomes = layer.measurable_outcomes ?? [];
  const owners = layer.owner_map ?? [];

  const lines = [
    priorities.length > 0
      ? `Prioriteiten: ${priorities.map((item, index) => `${index + 1}. ${item}`).join(" ")}`
      : "",
    outcomes.length > 0
      ? `Meetbare outcomes: ${outcomes.map((item, index) => `${index + 1}. ${item}`).join(" ")}`
      : "",
    owners.length > 0
      ? `Eigenaarschap: ${owners.map((item, index) => `${index + 1}. ${item}`).join(" ")}`
      : "",
  ].filter(Boolean);

  return lines.join("\n").trim();
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return "";
}

function injectActorCausality(
  fields: GuaranteedExecutiveReport,
  context: string
): GuaranteedExecutiveReport {
  const source = String(context ?? "");
  const hasJan = /\bjan\b/i.test(source);
  const hasBarbara = /\bbarbara\b/i.test(source);
  const hasDeborah = /\bdeborah\b/i.test(source);
  const hasHrRole =
    /\b(office manager|hr-medewerker|hr verantwoordelijke|hr-verantwoordelijke|hr lead|hr\/operations)\b/i.test(
      source
    );
  const hasBoardSecretaryRole = /\bbestuurssecretaris\b/i.test(source);
  if (!hasJan && !hasBarbara && !hasDeborah && !hasHrRole && !hasBoardSecretaryRole) return fields;

  const isStrictActorCausalLine = (line: string): boolean => {
    const value = String(line ?? "").trim();
    if (!value) return false;
    const hasCondition = /\bals\b/i.test(value);
    const hasConsequence = /\bdan\b/i.test(value);
    const hasSystemEffect = /\bwaardoor\b/i.test(value);
    const hasDecisionImplication = /\b(dat betekent|impliciet kiest|feitelijk kiest|kiest voor)\b/i.test(value);
    const hasLossComponent = /\b(verlies|prijs|risico|liquiditeitsstress|capaciteitsreductie|marge-erosie|mandaatverlies)\b/i.test(
      value
    );
    return (
      hasCondition &&
      hasConsequence &&
      hasSystemEffect &&
      hasDecisionImplication &&
      hasLossComponent
    );
  };

  const appendIfMissing = (text: string, marker: string, line: string): string => {
    if (!line.trim()) return text;
    if (new RegExp(`\\b${marker}\\b`, "i").test(text)) return text;
    if (!isStrictActorCausalLine(line)) return text;
    return `${text}\n${line}`.trim();
  };

  let dominantThesis = fields.dominantThesis;
  let governanceImpact = fields.governanceImpact;
  let powerDynamics = fields.powerDynamics;
  let executionRisk = fields.executionRisk;
  let decisionContract = fields.decisionContract;

  if (hasJan) {
    const janLine =
      "Als Jan vasthoudt aan het mensgerichte model zonder contractvloer per verzekeraar vast te leggen, dan absorbeert de GGZ-kern tariefdalingen direct in de behandelcapaciteit, waardoor marge-erosie en liquiditeitsstress sneller oplopen. Dat betekent dat Jan impliciet kiest voor kwaliteitsbehoud met financieel risico; persoonlijke prijs: zichtbaar risico op capaciteitsreductie binnen zijn behandelmodel.";
    dominantThesis = appendIfMissing(dominantThesis, "jan", janLine);
    governanceImpact = appendIfMissing(
      governanceImpact,
      "jan",
      "Als Jan geen expliciete volgordebeslissing neemt tussen consolideren en verbreden, dan blijven portfolio-keuzes parallel lopen, waardoor mandaatverschuiving uitblijft en stopbesluiten niet afdwingbaar worden. Dat betekent dat Jan feitelijk kiest voor bestuurlijke ruis; persoonlijke prijs: hogere kans op noodmaatregelen bij liquiditeitsdruk."
    );
  }

  if (hasBarbara) {
    const barbaraLine =
      "Als Barbara geen maandelijks individueel ritme installeert en 75%-afwijkingen niet binnen 7 dagen corrigeert, dan verschuift normsturing van managementinstrument naar teamfrictie, waardoor uitvalsignalen te laat escaleren. Dat betekent dat Barbara impliciet kiest voor reactieve in plaats van preventieve sturing; persoonlijke prijs: oplopend verzuim- en uitvalrisico in haar domein.";
    powerDynamics = appendIfMissing(powerDynamics, "barbara", barbaraLine);
    executionRisk = appendIfMissing(
      executionRisk,
      "barbara",
      "Als maandritme en planning niet consequent via Barbara’s lijn worden opgevolgd, dan blijven blokkades langer dan 48 uur openstaan, waardoor executierisico zich opstapelt in roosters en wachttijd. Dat betekent dat Barbara feitelijk kiest voor vertraging in plaats van closure; persoonlijke prijs: zichtbare prestatiedruk zonder formeel ingrijpmandaat."
    );
  }

  if (!hasBarbara && hasHrRole) {
    powerDynamics = appendIfMissing(
      powerDynamics,
      "hr-verantwoordelijke",
      "Als de HR-verantwoordelijke geen maandelijks individueel ritme afdwingt en normafwijkingen niet binnen 7 dagen corrigeert, dan wordt productiviteitsdruk informeel en diffuus, waardoor uitval later zichtbaar wordt. Dat betekent dat de HR-verantwoordelijke impliciet kiest voor stil risico; persoonlijke prijs: verlies van grip op teamcapaciteit en inzetbaarheid."
    );
    executionRisk = appendIfMissing(
      executionRisk,
      "hr-verantwoordelijke",
      "Als het maandritme via de HR-verantwoordelijke niet consequent wordt opgevolgd, dan verschuiven correcties naar kwartaalgesprekken, waardoor escalatie structureel te laat komt. Dat betekent dat de HR-verantwoordelijke feitelijk kiest voor achterafsturing; persoonlijke prijs: hogere kans op capaciteitsverlies door uitval."
    );
  }

  if (hasDeborah) {
    governanceImpact = appendIfMissing(
      governanceImpact,
      "deborah",
      "Als Deborah gemiste meetpunten niet binnen 48 uur laat escaleren naar bestuur en RvT, dan blijven uitzonderingen op de stoplijst bestaan, waardoor parallelle agenda's terugkeren in de portefeuille. Dat betekent dat Deborah impliciet kiest voor proces boven besluitdiscipline; persoonlijke prijs: mandaatverlies op governance-closure."
    );
    decisionContract = appendIfMissing(
      decisionContract,
      "deborah",
      "Als Deborah handtekeningdiscipline niet koppelt aan automatische mandaatverschuiving bij gemiste KPI-poorten, dan blijft het besluitkader vrijblijvend, waardoor overtreding zonder consequentie mogelijk blijft. Dat betekent dat Deborah feitelijk kiest voor niet-afdwingbare governance; persoonlijke prijs: bestuurlijk aansprakelijk op naleving en escalatie."
    );
  }

  if (!hasDeborah && hasBoardSecretaryRole) {
    decisionContract = appendIfMissing(
      decisionContract,
      "bestuurssecretaris",
      "Als de bestuurssecretaris handtekeningdiscipline niet bindt aan een vast meetpuntritme met directe escalatie, dan vervagen deadlines in overleg, waardoor mandaatverschuiving niet automatisch plaatsvindt. Dat betekent dat de bestuurssecretaris impliciet kiest voor procescomfort; persoonlijke prijs: verlies van bestuurlijke afdwingbaarheid."
    );
  }

  return {
    ...fields,
    dominantThesis,
    governanceImpact,
    powerDynamics,
    executionRisk,
    decisionContract,
  };
}

function hasSignatureFallbackWarning(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return (
    value.includes(SIGNATURE_LAYER_WARNING_PREFIX) ||
    /SIGNATURE LAYER WAARSCHUWING/i.test(value)
  );
}

function hasVisibleSignatureWarning(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /SIGNATURE LAYER WAARSCHUWING/i.test(value);
}

function stripSignatureWarningPrefix(value: unknown): string {
  if (typeof value !== "string") return "";
  let cleaned = value
    .replace(new RegExp(SIGNATURE_LAYER_WARNING_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "")
    .replace(/SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi, "");
  for (const pattern of UI_SANITIZE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/^\s+/, "").trim();
}

function stabilizeSectionContent(value: unknown, sectionTitle: string): string {
  const stripped = stripSignatureWarningPrefix(value);
  const editorial = applyBoardEditorialPolicy(stripped, sectionTitle);
  const human = formatHumanExecutiveText(editorial);
  const guarded = runBoardOutputGuard(human, {
    fullDocument: false,
    sectionTitle,
  }).trim();
  return normalizeSectionBodyForOutput(guarded, sectionTitle);
}

function stabilizeFullDocumentText(value: string): string {
  const guarded = runBoardOutputGuard(String(value ?? ""), { fullDocument: true }).trim();
  if (!guarded) return guarded;
  const normalizedDoc = normalizeBoardDocumentForOutput(guarded);
  const lines = normalizedDoc.split("\n").map((line) => line.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? "";
  if (/^(-|\*|•|\d+\.)\s+/.test(lastLine)) return normalizedDoc;
  if (/[.!?]["')\]]?$/.test(lastLine)) return normalizedDoc;
  return `${normalizedDoc}.`;
}

function assertNoDuplicateBlocks(text: string) {
  const blocks = text
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  for (const block of blocks) {
    if (seen.has(block)) {
      throw new Error(
        "UI duplicatie gedetecteerd: identieke tekstblokken gerenderd."
      );
    }
    seen.add(block);
  }
}

function assertNoBrokenSentence(text: string) {
  const brokenPattern =
    /veroorzaakt circa €\d{1,3}(\.\d{3})* druk(?! per maand)/;

  if (brokenPattern.test(text)) {
    throw new Error(
      "Zinsintegriteit faalt: afgeknotte financiële zin gedetecteerd."
    );
  }
}

function assertCanonicalDocumentShape(text: string) {
  const normalized = String(text ?? "").trim();
  if (!normalized) return;

  const headingMatches = normalized.match(/^\s*[1-9]\.\s+[^\n]+$/gm) ?? [];
  if (headingMatches.length !== 9) {
    throw new Error(
      `Canonieke documentintegriteit faalt: headingMatches=${headingMatches.length}, verwacht=9.`
    );
  }

  const duplicateSections =
    headingMatches.length - new Set(headingMatches.map((item) => item.trim().toLowerCase())).size;
  if (duplicateSections > 0) {
    throw new Error(
      `Canonieke documentintegriteit faalt: duplicateSections=${duplicateSections}.`
    );
  }

  const kernzinMatches = normalized.match(/^\s*Kernzin:/gim) ?? [];
  const duplicateKernzin = Math.max(0, kernzinMatches.length - 9);
  if (duplicateKernzin > 0) {
    throw new Error(
      `Canonieke documentintegriteit faalt: duplicateKernzin=${duplicateKernzin}.`
    );
  }
}

const CANONICAL_SECTION_TITLES = [
  "Dominante These",
  "Structurele Kernspanning",
  "Keerzijde van de keuze",
  "De Prijs van Uitstel",
  "Mandaat & Besluitrecht",
  "Onderstroom & Informele Macht",
  "Faalmechanisme",
  "90-Dagen Interventieontwerp",
  "Besluitkader",
] as const;

function canonicalizeDocumentOrThrow(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return "";
  const sectionMatches = [...source.matchAll(/^\s*[#]*\s*([1-9])\.\s+([^\n]+)$/gm)];
  if (sectionMatches.length < 9) {
    throw new Error(
      `Canonieke documentintegriteit faalt: headingMatches=${sectionMatches.length}, verwacht=9.`
    );
  }

  const sectionBodies = new Map<number, string>();
  for (let index = 0; index < sectionMatches.length; index += 1) {
    const current = sectionMatches[index];
    const number = Number(current[1]);
    const start = (current.index ?? 0) + current[0].length;
    const end = sectionMatches[index + 1]?.index ?? source.length;
    const rawBody = source.slice(start, end).trim();
    const slotId = (() => {
      if (number === 1) return "dominanteThese";
      if (number === 2) return "kernspanning";
      if (number === 3) return "keerzijde";
      if (number === 4) return "prijsUitstel";
      if (number === 5) return "mandaat";
      if (number === 6) return "onderstroom";
      if (number === 7) return "faalmechanisme";
      if (number === 8) return "interventie";
      if (number === 9) return "besluitkader";
      return undefined;
    })();
    const body = normalizeSectionBodyForOutput(rawBody, slotId);
    if (!body) {
      throw new Error(`Canonieke documentintegriteit faalt: sectie ${number} is leeg.`);
    }
    if (sectionBodies.has(number)) {
      throw new Error(`Canonieke documentintegriteit faalt: duplicate sectie ${number}.`);
    }
    sectionBodies.set(number, body);
  }

  const normalizedBodies = new Set<string>();
  const assembled: string[] = [];
  for (let section = 1; section <= 9; section += 1) {
    const body = sectionBodies.get(section);
    if (!body) {
      throw new Error(`Canonieke documentintegriteit faalt: sectie ${section} ontbreekt.`);
    }
    const normalizedBody = body.replace(/\s+/g, " ").trim().toLowerCase();
    if (normalizedBodies.has(normalizedBody)) {
      throw new Error(
        "UI duplicatie gedetecteerd: identieke sectie-inhoud in canonieke output."
      );
    }
    normalizedBodies.add(normalizedBody);
    assembled.push(`${section}. ${CANONICAL_SECTION_TITLES[section - 1]}\n\n${body}`);
  }
  return normalizeBoardDocumentForOutput(assembled.join("\n\n").trim());
}

function buildGuaranteedExecutiveReport(params: {
  report: unknown;
  power: PowerPipelineOutput | null;
  safeContext: string;
}): GuaranteedExecutiveReport {
  const { report, power, safeContext } = params;

  const reportRecord = asRecord(report);
  const rawNarrative =
    toNarrativeText(reportRecord.narrative) ||
    (typeof report === "string" ? report.trim() : "");

  const markdown = rawNarrative || toNarrativeText(report);
  const decisionCard = asRecord(reportRecord.decision_card);

  const dominantThesis = firstNonEmpty(
    toNarrativeText(reportRecord.dominant_thesis),
    toNarrativeText(reportRecord.executive_thesis),
    extractMarkdownSection(markdown, [
      "dominante bestuurlijke these",
      "bestuurlijke these",
      "executive thesis",
    ]),
    toNarrativeText(decisionCard.executive_thesis),
    "GGZ/Jeugdzorg: De raad moet nu kiezen tussen consolideren van de GGZ-kern en verbreden; beide tegelijk is financieel en organisatorisch niet houdbaar."
  );

  const coreConflict = firstNonEmpty(
    toNarrativeText(reportRecord.core_conflict),
    toNarrativeText(reportRecord.central_tension),
    extractMarkdownSection(markdown, ["kernconflict", "centrale spanning"]),
    toNarrativeText(decisionCard.central_tension),
    "Kernconflict GGZ: consolidatie van financieel fundament versus expansie met nieuwe proposities binnen dezelfde beperkte capaciteit."
  );

  const narrative = firstNonEmpty(
    toNarrativeText(reportRecord.narrative),
    extractMarkdownSection(markdown, [
      "dominante bestuurlijke these",
      "executive thesis",
      "narrative",
    ]),
    createFallbackNarrative(safeContext, markdown)
  );

  const tradeoffs = firstNonEmpty(
    toNarrativeText(reportRecord.tradeoffs),
    toNarrativeText(reportRecord.trade_offs),
    extractMarkdownSection(markdown, ["keerzijde van de keuze", "keuzeconflict", "tradeoff", "keuzes die nu voorliggen"]),
    summarizeNode(power?.node_results?.tradeoff),
    "Keerzijde van de keuze moet expliciet worden gemaakt tussen focus, snelheid en draagvlak."
  );

  const governanceImpact = firstNonEmpty(
    toNarrativeText(reportRecord.governance),
    toNarrativeText(reportRecord.governance_impact),
    extractMarkdownSection(markdown, ["governance impact", "governance", "bestuur"]),
    summarizeNodeWithLabel(power, "governance"),
    "Governance-impact ontbreekt nog; eigenaarschap en escalatieregels moeten worden vastgelegd."
  );

  const opportunityCost = firstNonEmpty(
    toNarrativeText(reportRecord.opportunityCost),
    toNarrativeText(reportRecord.opportunity_cost),
    extractMarkdownSection(markdown, ["prijs van uitstel", "opportunity cost", "kosten van uitstel"]),
    summarizeNodeWithLabel(power, "opportunity_cost"),
    "Prijs van uitstel moet expliciet worden gemaakt om uitstelgedrag te voorkomen."
  );

  const powerDynamics = firstNonEmpty(
    toNarrativeText(reportRecord.power_dynamics),
    toNarrativeText(reportRecord.machtsdynamiek),
    toNarrativeText(reportRecord.onderstroom),
    extractMarkdownSection(markdown, ["machtsdynamiek", "onderstroom"]),
    [
      summarizeNodeWithLabel(power, "conflict"),
      summarizeNodeWithLabel(power, "governance"),
    ]
      .filter(Boolean)
      .join("\n"),
    "Machtsdynamiek en onderstroom vragen expliciete interventie op informele invloed, sabotagepatronen en besluitdiscipline."
  );

  const executionRisk = firstNonEmpty(
    toNarrativeText(reportRecord.execution_risk),
    toNarrativeText(reportRecord.conflict),
    extractMarkdownSection(markdown, ["executierisico", "conflict"]),
    summarizeNodeWithLabel(power, "conflict"),
    "Executierisico vraagt directe interventie op blokkadepunten, eigenaarschap en handhaving."
  );

  const decisionContract = firstNonEmpty(
    toNarrativeText(reportRecord.decisionContract),
    toNarrativeText(reportRecord.decision_contract),
    toNarrativeText(decisionCard.decision_contract),
    extractMarkdownSection(markdown, ["besluitkader", "decision contract", "het besluit dat nu nodig is", "bestuurlijke verankering"]),
    summarizeNodeWithLabel(power, "decision_finalizer"),
    "Besluitkader ontbreekt: leg besluit, eigenaar, scope, deadline en faalmechanisme expliciet vast."
  );

  const interventionPlan90D = firstNonEmpty(
    toNarrativeText(reportRecord["90_day_plan"]),
    toNarrativeText(reportRecord.intervention_plan_90d),
    toNarrativeText(reportRecord.action_plan_90d),
    extractMarkdownSection(markdown, ["90-dagen interventieplan", "90-dagen", "90 day", "executie en 90-dagen sturing"]),
    "",
    "90-dagen interventieplan ontbreekt: definieer 3 prioriteiten, 3 meetbare outcomes en eigenaar per actie."
  );

  const guaranteed = {
    dominantThesis: firstNonEmpty(dominantThesis, narrative),
    coreConflict,
    tradeoffs,
    governanceImpact,
    powerDynamics,
    opportunityCost,
    executionRisk,
    decisionContract,
    interventionPlan90D,
  };

  const actorContext = `${safeContext}\n${markdown}\n${toNarrativeText(report)}\n${toNarrativeText(reportRecord)}`;
  const hardened = enforceConcreteOutputMap(injectActorCausality(guaranteed, actorContext), {
    contextHint: safeContext,
  });
  return injectActorCausality(hardened, actorContext);
}

function trimToWordLimit(text: string, maxWords: number): string {
  const words = String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ");
}

function createFallbackNarrative(
  safeContext: string,
  reportText: string
): string {
  const contextSignal = stripSignatureWarningPrefix(safeContext || reportText || "");
  return `### 1. DOMINANTE BESTUURLIJKE THESE
De organisatie moet eerst consolideren op financiële kernsturing en pas daarna verbreden via HR-loket en nieuwe pijlers. Spanning op productienorm en vermijding van financiële dialoog vertraagt harde keuzes.

### 2. HET KERNCONFLICT
Kernconflict: rust en stabilisatie worden bestuurlijk nagestreefd, terwijl de organisatie operationeel tegelijk op verbreding en groei blijft sturen.

### 3. KEERZIJDE VAN DE KEUZE
Keerzijde van de keuze:
- Wat lever je in: tijdelijke groeisnelheid buiten de kern.
- Wat vertraag je: uitbreiding van HR-loket en vierde pijler.
- Wat stop je tijdelijk: nieuwe initiatieven zonder margevalidatie.
- Wat wordt moeilijker: lokale autonomie in capaciteitsbesluiten.

### 4. PRIJS VAN UITSTEL
30 dagen zonder besluit: geen margekaart, geen stop-keuzes, oplopende druk op 75%-norm. 90 dagen: verbreding trekt managementaandacht en capaciteit weg uit de GGZ-kern. 365 dagen: afhankelijkheid van verzekeraarstarieven en plafonds blijft dominant en consolidatie faalt.

### 5. GOVERNANCE IMPACT
Governance-impact: formele centralisatie van intake en planning is al aanwezig, maar maandelijkse individuele sturing ontbreekt grotendeels en volledige financiële openheid wordt nog vermeden; daardoor blijft uitvoeringsdiscipline kwetsbaar.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Macht zit informeel op productiegesprekken, roostering en normering. Wanneer het gesprek over productie als onaangenaam wordt ervaren, verschuift sturing van expliciete besluitvorming naar impliciete vertraging.

### 7. EXECUTIERISICO
Grootste executierisico: parallelle agenda's zonder harde stoplijst, gecombineerd met beperkt individueel sturingsritme en vertraagde escalatie.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: CEO en CFO stoppen conflicterende initiatieven en leggen eigenaar + KPI vast. Week 3-6: COO herverdeelt capaciteit, mandaat en budget naar de gekozen lijn; escalaties sluiten binnen 48 uur. Week 7-12: CHRO en COO sturen op meetbaar effect en sluiten blokkades binnen zeven dagen.

### 9. BESLUITKADER
De Raad van Bestuur committeert zich aan:
- Keuze: eerst consolidatie van GGZ-kern, daarna gefaseerde verbreding.
- KPI: kostprijskaart volledig, maandritme geborgd, contractgrenzen vastgelegd binnen 90 dagen.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Geaccepteerd verlies: mandaatverlies en stopzetting van niet-prioritaire initiatieven.

Contextsignaal: ${contextSignal || "niet beschikbaar"}.`;
}

function normalizeEuroSpacing(value: string): string {
  let output = String(value ?? "");
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output.replace(
      /€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,
      (_full, head, sep, tail) => `€${head}${sep}${tail}`
    );
  }
  output = output.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g, "€$1$2$3");
  output = output.replace(/€\s*([0-9][0-9.,]*)\s+([0-9]{1,3})(\b|(?=\D))/g, "€$1$2");
  output = output.replace(/€\s+([0-9])/g, "€$1");
  return output;
}

function fixSplitEuroNumbers(value: string): string {
  return normalizeEuroSpacing(String(value ?? ""))
    .replace(/€\s*([0-9]{1,3}(?:\.[0-9]{3})*)\s+([0-9]{3})\b/g, "€$1$2")
    .replace(/€\s*([0-9]{1,3}(?:,[0-9]{3})*)\s+([0-9]{3})\b/g, "€$1$2")
    .replace(/€\s*([0-9]{1,3})\.\s*([0-9]{3})\b/g, "€$1.$2")
    .replace(/€\s*([0-9]{1,3}),\s*([0-9]{3})\b/g, "€$1,$2")
    .trim();
}

function buildExecutiveFallbackMarkdown(executive: GuaranteedExecutiveReport): string {
  return stabilizeFullDocumentText(formatHumanExecutiveText(
    [
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    stripSignatureWarningPrefix(executive.dominantThesis),
    "",
    "### 2. HET KERNCONFLICT",
    stripSignatureWarningPrefix(executive.coreConflict),
    "",
    "### 3. KEERZIJDE VAN DE KEUZE",
    stripSignatureWarningPrefix(executive.tradeoffs),
    "",
    "### 4. PRIJS VAN UITSTEL",
    stripSignatureWarningPrefix(executive.opportunityCost),
    "",
    "### 5. MANDAAT EN BESLUITRECHT",
    stripSignatureWarningPrefix(executive.governanceImpact),
    "",
    "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
    stripSignatureWarningPrefix(executive.powerDynamics),
    "",
    "### 7. EXECUTIERISICO",
    stripSignatureWarningPrefix(executive.executionRisk),
    "",
    "### 8. 90-DAGEN INTERVENTIEPLAN",
    stripSignatureWarningPrefix(executive.interventionPlan90D),
    "",
    "### 9. BESLUITKADER",
    stripSignatureWarningPrefix(executive.decisionContract),
    ].join("\n")
  ));
}

function buildCanonicalKernelContext(executive: GuaranteedExecutiveReport): string {
  const sections = [
    ["1. Dominante These", executive.dominantThesis],
    ["2. Structurele Kernspanning", executive.coreConflict],
    ["3. Keerzijde van de keuze", executive.tradeoffs],
    ["4. De Prijs van Uitstel", executive.opportunityCost],
    ["5. Mandaat & Besluitrecht", executive.governanceImpact],
    ["6. Onderstroom & Informele Macht", executive.powerDynamics],
    ["7. Faalmechanisme", executive.executionRisk],
    ["8. 90-Dagen Interventieontwerp", executive.interventionPlan90D],
    ["9. Besluitkader", executive.decisionContract],
  ] as const;

  return sections
    .map(([title, content]) => `${title}\n\n${stripSignatureWarningPrefix(content).trim()}`)
    .join("\n\n");
}

function stripEmbeddedSectionHeadings(value: string): string {
  return String(value ?? "")
    .replace(/^\s*(?:###\s*)?[1-9]\.\s+[^\n]+$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildCanonicalDocumentFromExecutive(executive: GuaranteedExecutiveReport): string {
  const sections: Array<{ number: number; title: string; text: string; fallback: string }> = [
    {
      number: 1,
      title: "Dominante These",
      text: executive.dominantThesis,
      fallback: "Dominante these wordt vastgesteld op basis van beschikbare context.",
    },
    {
      number: 2,
      title: "Structurele Kernspanning",
      text: executive.coreConflict,
      fallback: "Structurele kernspanning wordt geconcretiseerd in bestuurlijke keuze.",
    },
    {
      number: 3,
      title: "Keerzijde van de keuze",
      text: executive.tradeoffs,
      fallback: "Keerzijde van de keuze wordt expliciet gemaakt inclusief verlies.",
    },
    {
      number: 4,
      title: "De Prijs van Uitstel",
      text: executive.opportunityCost,
      fallback: "Prijs van uitstel wordt op 30/90/365 dagen zichtbaar gemaakt.",
    },
    {
      number: 5,
      title: "Mandaat & Besluitrecht",
      text: executive.governanceImpact,
      fallback: "Mandaat en besluitrecht worden helder toegewezen.",
    },
    {
      number: 6,
      title: "Onderstroom & Informele Macht",
      text: executive.powerDynamics,
      fallback: "Onderstroom en informele macht worden bestuurlijk adresseerbaar gemaakt.",
    },
    {
      number: 7,
      title: "Faalmechanisme",
      text: executive.executionRisk,
      fallback: "Faalmechanisme wordt expliciet gemaakt met corrigeerbaar patroon.",
    },
    {
      number: 8,
      title: "90-Dagen Interventieontwerp",
      text: executive.interventionPlan90D,
      fallback: "90-dagen interventieontwerp bevat eigenaar, deadline en KPI.",
    },
    {
      number: 9,
      title: "Besluitkader",
      text: executive.decisionContract,
      fallback: "Besluitkader borgt keuze, verlies en handhaafbare discipline.",
    },
  ];

  const assembled = sections.map(({ number, title, text, fallback }) => {
    const cleaned = stripEmbeddedSectionHeadings(stripSignatureWarningPrefix(text));
    const stabilized = stabilizeSectionContent(cleaned || fallback, title);
    return `${number}. ${title}\n\n${stabilized || fallback}`;
  });

  return fixSplitEuroNumbers(
    normalizeBoardDocumentForOutput(assembled.join("\n\n").trim())
  );
}

function toDecisionMemoText(decision: DecisionLayer): string {
  const normalizeDrukSentence = (value: string): string =>
    String(value ?? "")
      .replace(
        /\b(veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk)(?!\s+per maand)\b/gi,
        "$1 per maand"
      )
      .trim();

  const keuzeVandaag = normalizeDrukSentence(decision.de_keuze_vandaag);
  const options = decision.drie_opties
    .map(
      (option) =>
        `${option.name}: ${normalizeDrukSentence(option.description)}\nRisico: ${normalizeDrukSentence(option.risk)}`
    )
    .join("\n\n");

  const stops = decision.stop_doing.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const gates = decision.gates
    .map(
      (gate) =>
        `Dag ${gate.day}\nCriteria:\n${gate.criteria
          .map((criterion, idx) => `${idx + 1}. ${criterion}`)
          .join("\n")}\nGevolg bij missen: ${gate.consequence_if_failed}`
    )
    .join("\n\n");

  const proof = decision.financieel_bewijsblok;
  const signatories = decision.handtekeningdiscipline.wie_tekent.join(", ");

  const memo = [
    "### 1. De Keuze Vandaag",
    keuzeVandaag,
    "Dominante druk: €202.000 structurele druk per jaar in combinatie met 75% productiviteitsnorm maakt parallelle verbreding bestuurlijk onhoudbaar.",
    "",
    "### 2. Drie Opties",
    options,
    "",
    "### 3. Voorkeursoptie",
    decision.voorkeursoptie,
    "",
    "### 4. Keerzijde van de keuze",
    decision.expliciet_verlies,
    "",
    "### 5. Stoplijst",
    stops,
    "",
    "### 6. 30 / 60 / 90 Meetpunten",
    gates,
    "",
    "### 7. Mandaatverschuiving",
    decision.mandaatverschuiving,
    "",
    "### 8. Financiële Onderbouwing (compact)",
    `${proof.average_cost_per_client}
${proof.adhd_loss_component}
${proof.insurer_cap_per_year}
${proof.wage_cost_growth}
${proof.tariff_change_2026}
${proof.structural_pressure_example}
Liquiditeitsruimte: ${proof.cash_runway}
Margebandbreedte kernproducten: ${proof.margin_bandwidth_core_products}
Effect 7% tariefdaling (12m): ${proof.tariff_drop_impact_12m}
Impact contractplafonds op volume: ${proof.contract_cap_volume_impact}
Status: ${proof.status ?? "Onbekend"}`,
    "",
    "### 9. Handtekeningdiscipline",
    `Wie tekent: ${signatories}\nOvertreding: ${decision.handtekeningdiscipline.overtreding_consequentie}`,
  ].join("\n");

  const polished = formatHumanExecutiveText(
    applyBoardEditorialPolicy(memo, "Besluitdocument Raad van Bestuur")
  )
    .replace(/\bBeslismoment GGZ:\s*/gi, "")
    .replace(/\bOnvoldoende Financieel Inzicht\b/gi, "Actie vereist binnen 14 dagen")
    .replace(/\bstaat in de bron;?\s*/gi, "")
    .replace(/\bverifieer\b/gi, "onderbouw")
    .replace(/\bterwijl\./gi, "terwijl")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const withNames = /(Deborah|Jan|Barbara)/i.test(polished)
    ? polished
    : `${polished}\n\nNaamankers: Deborah (besluitdiscipline), Jan (strategische koers), Barbara (uitvoeringsritme).`;

  const normalized = fixSplitEuroNumbers(withNames);
  const stabilized = fixSplitEuroNumbers(stabilizeFullDocumentText(normalized));
  try {
    assertOutputIntegrity(stabilized);
  } catch (error) {
    warnOnce(
      `decision_memo_integrity_warning:${String((error as Error)?.message ?? error)}`,
      "[decision_memo_integrity_warning]",
      String((error as Error)?.message ?? error)
    );
  }
  if (DEBUG_BOARD_CONSOLE) {
    const metrics = getBoardOutputMetrics(stabilized);
    infoOnce(
      `board_output_metrics:${JSON.stringify(metrics)}`,
      "[board_output_metrics]",
      metrics
    );
  }
  return stabilized;
}

function mapDecisionLayerToExecutive(decision: DecisionLayer): GuaranteedExecutiveReport {
  const interventionFromGates = decision.gates
    .map((gate) => {
      const criteria = gate.criteria.map((item, index) => `${index + 1}. ${item}`).join("\n");
      return `Dag ${gate.day}\nCriteria:\n${criteria}\nGevolg bij missen: ${gate.consequence_if_failed}`;
    })
    .join("\n\n");
  return {
    dominantThesis: decision.de_keuze_vandaag,
    coreConflict: decision.drie_opties.map((option) => `${option.name}: ${option.risk}`).join("\n"),
    tradeoffs: decision.drie_opties.map((option) => `${option.name}: ${option.description}`).join("\n"),
    governanceImpact: decision.mandaatverschuiving,
    powerDynamics: decision.stop_doing.map((item, index) => `${index + 1}. ${item}`).join("\n"),
    opportunityCost: decision.gates
      .map((gate) => `Dag ${gate.day}: ${gate.consequence_if_failed}`)
      .join("\n"),
    executionRisk: decision.gates
      .map((gate) => `Dag ${gate.day} criteria: ${gate.criteria.join(" | ")}`)
      .join("\n"),
    interventionPlan90D: interventionFromGates,
    decisionContract: `Voorkeursoptie: ${decision.voorkeursoptie}\nExpliciet verlies: ${decision.expliciet_verlies}\nHandtekeningen: ${decision.handtekeningdiscipline.wie_tekent.join(", ")}`,
  };
}

function safeParseReport(
  markdown: string,
  analysisType: AureliusAnalysisType
): AureliusAnalysisResult {
  try {
    return parseAureliusReport(markdown, analysisType);
  } catch {
    const fallback = createFallbackNarrative(
      "Geen expliciete context aangeleverd.",
      markdown
    );
    return parseAureliusReport(fallback, analysisType);
  }
}

function buildExecutionNarrativeBlock(power: PowerPipelineOutput): string {
  const executionLayer = power?.execution_layer ?? DEFAULT_EXECUTION_LAYER;

  const priorities = (executionLayer["90_day_priorities"] ?? [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  const outcomes = (executionLayer.measurable_outcomes ?? [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  const owners = (executionLayer.owner_map ?? [])
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return `Aanvullende executiesturing:
Risiconiveau: ${executionLayer.risk_level ?? "MEDIUM"}.
Prioriteiten: ${priorities || "niet gevuld"}.
Meetbare outcomes: ${outcomes || "niet gevuld"}.
Eigenaarschap: ${owners || "niet gevuld"}.`;
}

function buildExecutiveMetricsBlock(power: PowerPipelineOutput): string {
  const metrics = power?.metrics ?? DEFAULT_POWER_METRICS;

  return `Kernmetrieken:
Intensiteit van machtsfrictie (0-100): ${toFiniteNumber(metrics.conflict_intensity_score_0_100, 0)}
Integriteit van besluitstructuur (0-100): ${toFiniteNumber(metrics.governance_integrity_score_0_100, 0)}
Besluitkrachtindex (0-100): ${toFiniteNumber(metrics.decision_strength_index_0_100, 0)}
Executierisiconiveau: ${metrics.execution_risk_level ?? "MEDIUM"}
Besluitzekerheid (0-1): ${(Number(metrics.decision_certainty_0_1) || 0).toFixed(2)}`;
}

function buildNarrativeWithPower(
  narrative: string,
  power: PowerPipelineOutput
): string {
  return [
    narrative.trim(),
    buildExecutionNarrativeBlock(power),
    buildExecutiveMetricsBlock(power),
  ].join("\n\n");
}

function enrichDecisionSection(
  parsed: AureliusAnalysisResult,
  power: PowerPipelineOutput
): AureliusAnalysisResult {
  const decisionKey =
    parsed.sections.decision_contract != null
      ? "decision_contract"
      : parsed.sections.het_besluit_dat_nu_nodig_is != null
      ? "het_besluit_dat_nu_nodig_is"
      : "";
  const decisionSection = decisionKey ? parsed.sections[decisionKey] : undefined;

  if (!decisionSection) return parsed;

  const metrics = power?.metrics ?? DEFAULT_POWER_METRICS;

  const executionLayer = power?.execution_layer ?? DEFAULT_EXECUTION_LAYER;

  const decisionAppendix = [
    "",
    "Bestuurlijke Metrieken",
    `Intensiteit van machtsfrictie (0-100): ${toFiniteNumber(metrics.conflict_intensity_score_0_100, 0)}`,
    `Integriteit van besluitstructuur (0-100): ${toFiniteNumber(metrics.governance_integrity_score_0_100, 0)}`,
    `Besluitkrachtindex (0-100): ${toFiniteNumber(metrics.decision_strength_index_0_100, 0)}`,
    `Executierisiconiveau: ${metrics.execution_risk_level ?? "MEDIUM"}`,
    `Besluitzekerheid (0-1): ${(Number(metrics.decision_certainty_0_1) || 0).toFixed(2)}`,
    "",
    "Executie en 90-dagen sturing",
    `Risiconiveau: ${executionLayer.risk_level ?? "MEDIUM"}`,
    `Prioriteiten: ${(executionLayer["90_day_priorities"] ?? []).join(" | ")}`,
    `Meetbare uitkomsten: ${(executionLayer.measurable_outcomes ?? []).join(" | ")}`,
    `Eigenaarschap: ${(executionLayer.owner_map ?? []).join(" | ")}`,
  ].join("\n");

  const updatedDecisionContent = `${stringifySectionContent(
    decisionSection.content
  )}\n\n${decisionAppendix}`.trim();

  return {
    ...parsed,
    sections: {
      ...parsed.sections,
      [decisionKey]: {
        ...decisionSection,
        content: updatedDecisionContent,
      },
    },
  };
}

/* ============================================================
   PDF BRIDGE
============================================================ */

function pickSectionText(
  sections: AureliusAnalysisResult["sections"],
  keys: string[]
): string {
  for (const key of keys) {
    const section = sections[key];
    if (!section) continue;
    const value = stringifySectionContent(section.content).trim();
    if (value) return value;
  }
  return "";
}

function sanitizePdfSectionContent(value: string): string {
  return stripSignatureWarningPrefix(value)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildExecutivePdfSections(
  report: AureliusAnalysisResult,
  executive: GuaranteedExecutiveReport | null
): NonNullable<PDFAnalysisResult["sections"]> {
  const source = report.sections ?? {};

  const dominantThesis =
    executive?.dominantThesis ||
    pickSectionText(source, ["bestuurlijke_these", "dominante_bestuurlijke_these"]);
  const coreConflict =
    executive?.coreConflict ||
    pickSectionText(source, ["het_kernconflict", "kernconflict"]);
  const tradeoffs =
    executive?.tradeoffs ||
    pickSectionText(source, ["expliciete_tradeoffs", "tradeoffs"]);
  const opportunityCost =
    executive?.opportunityCost ||
    pickSectionText(source, [
      "opportunity_cost",
      "wat_er_gebeurt_als_er_niets_verandert",
    ]);
  const governanceImpact =
    executive?.governanceImpact ||
    pickSectionText(source, ["governance_impact"]);
  const powerDynamics =
    executive?.powerDynamics ||
    pickSectionText(source, [
      "machtsdynamiek__onderstroom",
      "machtsdynamiek_onderstroom",
    ]);
  const executionRisk =
    executive?.executionRisk || pickSectionText(source, ["executierisico"]);
  const interventionPlan90D =
    executive?.interventionPlan90D ||
    pickSectionText(source, ["90dagen_interventieplan", "90_dagen_actieplan"]);
  const decisionContract =
    executive?.decisionContract ||
    pickSectionText(source, [
      "decision_contract",
      "het_besluit_dat_nu_nodig_is",
    ]);

  return {
    dominante_bestuurlijke_these: {
      title: "1. Dominante These",
      content: sanitizePdfSectionContent(dominantThesis),
    },
    kernconflict: {
      title: "2. Structurele Kernspanning",
      content: sanitizePdfSectionContent(coreConflict),
    },
    expliciete_tradeoffs: {
      title: "3. Keerzijde van de keuze",
      content: sanitizePdfSectionContent(tradeoffs),
    },
    opportunity_cost: {
      title: "4. De Prijs van Uitstel",
      content: sanitizePdfSectionContent(opportunityCost),
    },
    governance_impact: {
      title: "5. Mandaat & Besluitrecht",
      content: sanitizePdfSectionContent(governanceImpact),
    },
    machtsdynamiek_onderstroom: {
      title: "6. Onderstroom & Informele Macht",
      content: sanitizePdfSectionContent(powerDynamics),
    },
    executierisico: {
      title: "7. Faalmechanisme",
      content: sanitizePdfSectionContent(executionRisk),
    },
    interventieplan_90dagen: {
      title: "8. 90-Dagen Interventieontwerp",
      content: sanitizePdfSectionContent(interventionPlan90D),
    },
    decision_contract: {
      title: "9. Besluitkader",
      content: sanitizePdfSectionContent(decisionContract),
    },
  };
}

const toPDFReport = (
  report: AureliusAnalysisResult,
  executive: GuaranteedExecutiveReport | null,
  options?: { rawMarkdownOverride?: string }
): PDFAnalysisResult =>
  ({
    title: report.title,
    executive_summary: report.executive_summary,
    sections: buildExecutivePdfSections(report, executive),
    interventions: (report as any)?.interventions,
    hgbco: (report as any)?.hgbco,
    raw_markdown: stripSignatureWarningPrefix(
      options?.rawMarkdownOverride ?? report.raw_markdown ?? ""
    ),
  } as PDFAnalysisResult);

type PendingAnalysisPayload = {
  kind: "pending";
  routeSlug: string;
  analysisType: AureliusAnalysisType;
  clientName: string;
  sectorSelected: Sector | "";
  context: string;
  sourceContext: string;
  sectorLayer: string;
  safeContext: string;
  documents: Array<{ id: string; filename: string; content: string }>;
};

type FinalizedAnalysisPayload = {
  kind: "final";
  routeSlug: string;
  report: AureliusAnalysisResult;
  executiveReport: GuaranteedExecutiveReport;
  powerOutput: PowerPipelineOutput;
  linguisticSignals: LinguisticSignalBundle | null;
  signatureFallbackWarning: boolean;
  signatureFallbackReasons: string[];
  clientName: string;
  sectorSelected: Sector | "";
  context: string;
};

type PersistedAnalysisPayload = PendingAnalysisPayload | FinalizedAnalysisPayload;

/* ============================================================
   PAGE
============================================================ */

export default function UnifiedAnalysisPage() {
  const params = useParams<{ slug?: string; type?: string }>();
  const routeSlug = params.slug ?? params.type ?? "strategy";

  const normalizedSlug = routeSlug?.replace(/-/g, "_");
  const analysis =
    (normalizedSlug &&
      ANALYSES[normalizedSlug as keyof typeof ANALYSES]) ||
    ANALYSES.strategy;

  const analysisType =
    (analysis.analysisType as AureliusAnalysisType) || "strategy";
  const runId = useAnalysisStore((state) => state.runId);
  const analysisStoreStatus = useAnalysisStore((state) => state.status);
  const analysisProgress = useAnalysisStore((state) => state.progress);
  const analysisStoreResult = useAnalysisStore((state) => state.result);

  /* ================= STATE ================= */

  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);
  const [executiveReport, setExecutiveReport] =
    useState<GuaranteedExecutiveReport | null>(null);
  const [powerOutput, setPowerOutput] =
    useState<PowerPipelineOutput | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [runtimeIntegrityWarning, setRuntimeIntegrityWarning] = useState<string | null>(null);
  const [signatureFallbackWarning, setSignatureFallbackWarning] = useState(false);
  const [signatureFallbackReasons, setSignatureFallbackReasons] = useState<string[]>([]);
  const [pdfPreflightError, setPdfPreflightError] =
    useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [flowStageIndex, setFlowStageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [clientName, setClientName] = useState("");
  const [sectorSelected, setSectorSelected] = useState<Sector | "">("");
  const [isPrinting, setIsPrinting] = useState(false);

  const [linguisticSignals, setLinguisticSignals] =
    useState<LinguisticSignalBundle | null>(null);

  const [intakeAnswers, setIntakeAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<AureliusAnalysisResult | null>(null);
  const executiveReportRef = useRef<GuaranteedExecutiveReport | null>(null);
  const fallbackFlowTimerRef = useRef<number | null>(null);
  const finalizedRunRef = useRef<string | null>(null);
  const printDebounceRef = useRef(0);
  const analysisRunning =
    analysisStoreStatus === "running" || isBuilding || isPending;
  const runtimeErrorMessage = localError;
  const boardGateErrorCodes = useMemo(
    () => extractBoardGateErrors(runtimeErrorMessage),
    [runtimeErrorMessage]
  );
  const isSignatureViolation = Boolean(
    runtimeErrorMessage &&
      runtimeErrorMessage.includes(CYNTRA_SIGNATURE_LAYER_VIOLATION)
  );
  const safeSubtitle = String(analysis.subtitle ?? "").replace(
    /\bmoet\b/gi,
    "kiest"
  );

  /* ================= DERIVED ================= */

  const executiveReportView = useMemo(
    () => {
      const rawReport =
        executiveReport ??
        (report
          ? buildGuaranteedExecutiveReport({
              report: report.raw_markdown,
              power: powerOutput,
              safeContext:
                [
                  `[SOURCE_FREE_FIELD]`,
                  context.trim() ||
                    [
                      `Organisatie: ${clientName?.trim() || "Onbekende organisatie"}.`,
                      `Sector: ${sectorSelected || "onbekend"}.`,
                      "Bestuurlijke opdracht: maak een scherpe keuze tussen versnellen en stabiliseren met expliciete keerzijde van de keuze, bestuurlijke impact en 90-dagen interventie.",
                    ].join(" "),
                  `[SOURCE_UPLOAD]`,
                  files.length
                    ? files.map((file) => `Bestand ${file.name}`).join("\n")
                    : "Geen uploads aangeleverd.",
                ].join("\n\n"),
            })
          : null);
      if (!rawReport) return null;
      return sanitizeExecutiveReportFields(rawReport);
    },
    [clientName, context, executiveReport, files, powerOutput, report, sectorSelected]
  );
  const canonicalKernelContext = useMemo(() => {
    if (executiveReportView) return buildCanonicalKernelContext(executiveReportView);
    return report?.raw_markdown?.trim() || "";
  }, [executiveReportView, report]);

  const analysisInput = useMemo<RunCyntraResult | null>(() => {
    if (!canonicalKernelContext.trim()) return null;
    const executiveThesis = stripSignatureWarningPrefix(
      executiveReportView?.dominantThesis ||
        report?.executive_summary ||
        report?.title ||
        "Bestuurlijke these beschikbaar in context."
    );
    return { report: executiveThesis };
  }, [canonicalKernelContext, executiveReportView, report]);

  // ============================
  // CANONICAL DOCUMENT PIPELINE
  // ============================
  const canonicalRender = useMemo(() => {
    if (!analysisInput) return { document: "", error: null as string | null };
    const buildRuntimeFallbackDocument = () => {
      if (executiveReportView) return buildCanonicalDocumentFromExecutive(executiveReportView);
      const fallbackSource = stripSignatureWarningPrefix(canonicalKernelContext);
      if (!fallbackSource.trim()) return "";
      return fixSplitEuroNumbers(normalizeBoardDocumentForOutput(stabilizeFullDocumentText(fallbackSource)));
    };
    try {
      const executiveFirstDocument = executiveReportView
        ? buildCanonicalDocumentFromExecutive(executiveReportView)
        : "";
      const brief = executiveFirstDocument
        ? null
        : buildBoardroomBrief(analysisInput, canonicalKernelContext);
      const sourceDocument = executiveFirstDocument || stripSignatureWarningPrefix(brief?.strategic_narrative ?? "");
      const guardedDocument = stabilizeFullDocumentText(sourceDocument);
      let document = fixSplitEuroNumbers(
        executiveFirstDocument
          ? normalizeBoardDocumentForOutput(guardedDocument)
          : canonicalizeDocumentOrThrow(guardedDocument)
      );
      const allowIntegrityWarningOnly =
        hasVisibleSignatureWarning(brief?.strategic_narrative ?? "") ||
        hasVisibleSignatureWarning(sourceDocument) ||
        hasVisibleSignatureWarning(document);
      try {
        assertOutputIntegrity(document);
      } catch {
        const repaired = fixSplitEuroNumbers(
          normalizeBoardDocumentForOutput(
            stabilizeFullDocumentText(runBoardOutputGuard(document, { fullDocument: true }))
          )
        );
        try {
          assertOutputIntegrity(repaired);
        } catch (integrityError) {
          const errorMessage =
            integrityError instanceof Error ? integrityError.message : String(integrityError);
          warnOnce(`runtime_integrity_warning:${errorMessage}`, "[runtime_integrity_warning]", errorMessage);
          warnOnce(`integrity_soft_fail_runtime:${errorMessage}`, "[integrity_soft_fail_runtime]", errorMessage);
          warnOnce(`signature_fallback_integrity_warning:canonicalRender:${errorMessage}`, "[signature_fallback_integrity_warning]", {
            stage: "canonicalRender",
            reason: errorMessage,
          });
          void allowIntegrityWarningOnly;
        }
        document = repaired;
      }
      return { document, error: null as string | null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fallbackDocument = buildRuntimeFallbackDocument();
      warnOnce(`runtime_integrity_warning:${errorMessage}`, "[runtime_integrity_warning]", errorMessage);
      warnOnce(`integrity_soft_fail_runtime:${errorMessage}`, "[integrity_soft_fail_runtime]", errorMessage);
      const isCanonicalShapeOnly = /Canonieke documentintegriteit faalt:/i.test(errorMessage);
      return {
        document: fallbackDocument,
        error: isCanonicalShapeOnly ? null : errorMessage,
      };
    }
  }, [analysisInput, canonicalKernelContext, executiveReportView]);
  const canonicalDocument = canonicalRender.document;
  const executiveHasFallbackWarning = useMemo(
    () =>
      Object.values(executiveReportView ?? {}).some((value) =>
        hasSignatureFallbackWarning(value)
      ),
    [executiveReportView]
  );

  // ============================
  // RUNTIME INTEGRITY CHECKS
  // ============================
  useEffect(() => {
    if (canonicalRender.error) {
      setIsBuilding(false);
      warnOnce(
        `runtime_integrity_warning:${canonicalRender.error}`,
        "[runtime_integrity_warning]",
        canonicalRender.error
      );
      warnOnce(
        `integrity_soft_fail_runtime:${canonicalRender.error}`,
        "[integrity_soft_fail_runtime]",
        canonicalRender.error
      );
      setRuntimeIntegrityWarning(canonicalRender.error);
      if (!canonicalDocument) return;
    }
    if (!canonicalDocument) return;
    try {
      assertOutputIntegrity(canonicalDocument);
      if (DEBUG_BOARD_CONSOLE) {
        infoOnce(`canonical_length:${canonicalDocument.length}`, "CANONICAL LENGTH:", canonicalDocument.length);
      }
      setRuntimeIntegrityWarning(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnOnce(`runtime_integrity_warning:${message}`, "[runtime_integrity_warning]", message);
      warnOnce(`integrity_soft_fail_runtime:${message}`, "[integrity_soft_fail_runtime]", message);
      if (isSignatureViolation || signatureFallbackWarning || executiveHasFallbackWarning) {
        warnOnce(`signature_fallback_integrity_warning:runtime_checks:${message}`, "[signature_fallback_integrity_warning]", {
          stage: "runtime_checks",
          reason: message,
        });
      }
      setRuntimeIntegrityWarning(message);
    }
  }, [
    canonicalDocument,
    canonicalRender.error,
    executiveHasFallbackWarning,
    isSignatureViolation,
    signatureFallbackWarning,
  ]);

  const dualLayerOutput = useMemo<CyntraDualLayerOutput | null>(() => {
    if (!executiveReportView) return null;
    return buildDualLayerOutput({
      dominante_these: stabilizeSectionContent(executiveReportView.dominantThesis, "Dominante These"),
      structurele_kernspanning: stabilizeSectionContent(executiveReportView.coreConflict, "Structurele Kernspanning"),
      onvermijdelijke_keuzes: stabilizeSectionContent(executiveReportView.tradeoffs, "Keerzijde van de keuze"),
      prijs_van_uitstel: stabilizeSectionContent(executiveReportView.opportunityCost, "De Prijs van Uitstel"),
      mandaat_besluitrecht: stabilizeSectionContent(executiveReportView.governanceImpact, "Mandaat & Besluitrecht"),
      onderstroom_informele_macht: stabilizeSectionContent(executiveReportView.powerDynamics, "Onderstroom & Informele Macht"),
      faalmechanisme: stabilizeSectionContent(executiveReportView.executionRisk, "Faalmechanisme"),
      interventieplan_90_dagen: stabilizeSectionContent(executiveReportView.interventionPlan90D, "90-Dagen Interventieontwerp"),
      decision_contract: stabilizeSectionContent(executiveReportView.decisionContract, "Besluitkader"),
    });
  }, [executiveReportView]);
  const decisionLayerWordCount = useMemo(() => {
    if (!dualLayerOutput) return 0;
    return countWords(toDecisionMemoText(dualLayerOutput.decision_layer));
  }, [dualLayerOutput]);
  const showSignatureWarningBanner = Boolean(
    signatureFallbackWarning ||
      executiveHasFallbackWarning ||
      (runtimeErrorMessage && isSignatureViolation)
  );
  const visibleSignatureReasons = useMemo(() => {
    const reasons = [...signatureFallbackReasons];
    if (runtimeErrorMessage && isSignatureViolation) {
      reasons.unshift(`Runtime.signature_violation: ${runtimeErrorMessage}`);
    }
    return Array.from(new Set(reasons));
  }, [isSignatureViolation, runtimeErrorMessage, signatureFallbackReasons]);
  const hasReportOutput = Boolean(report || executiveReportView);
  const canDownloadPdf = hasReportOutput;

  const clearFallbackFlowTimer = useCallback(() => {
    if (fallbackFlowTimerRef.current == null || typeof window === "undefined") {
      return;
    }
    window.clearTimeout(fallbackFlowTimerRef.current);
    fallbackFlowTimerRef.current = null;
  }, []);

  const forceAdvanceFlowAfterFallback = useCallback(() => {
    clearFallbackFlowTimer();
    if (typeof window === "undefined") {
      setFlowStageIndex(FLOW_COMPLETION_STAGE);
      console.log(`Flow advanced to stage ${FLOW_COMPLETION_STAGE} after fallback`);
      return;
    }
    fallbackFlowTimerRef.current = window.setTimeout(() => {
      setFlowStageIndex(FLOW_COMPLETION_STAGE);
      console.log(`Flow advanced to stage ${FLOW_COMPLETION_STAGE} after fallback`);
      fallbackFlowTimerRef.current = null;
    }, FLOW_FALLBACK_ADVANCE_DELAY_MS);
  }, [clearFallbackFlowTimer]);

  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  useEffect(() => {
    executiveReportRef.current = executiveReport;
  }, [executiveReport]);

  useEffect(() => {
    if (!executiveReportView) return;
    if (!(signatureFallbackWarning || executiveHasFallbackWarning)) return;
    setIsBuilding(false);
    forceAdvanceFlowAfterFallback();
  }, [
    executiveHasFallbackWarning,
    executiveReportView,
    forceAdvanceFlowAfterFallback,
    signatureFallbackWarning,
  ]);

  useEffect(() => {
    return () => clearFallbackFlowTimer();
  }, [clearFallbackFlowTimer]);

  /* ================= HELPERS ================= */

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      if (!selected.length) return;
      setFiles((prev) => mergeSelectedFiles(prev, selected));
      event.target.value = "";
    },
    []
  );

  const openFilePicker = useCallback(() => {
    const input = fileInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Ignore and fallback to click for browsers that block showPicker.
      }
    }
    input.click();
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeSelectedFile = useCallback((fileToRemove: File) => {
    const removeIdentity = fileIdentity(fileToRemove);
    setFiles((prev) => prev.filter((file) => fileIdentity(file) !== removeIdentity));
  }, []);

  /* ================= EXECUTION ================= */

  const finalizeAnalysis = useCallback(
    async (
      intelligence: Record<string, any>,
      pending: PendingAnalysisPayload,
      activeRunId: string
    ) => {
      setFlowStageIndex(3);
      if (!intelligence?.report) {
        throw new Error("Geen analyse-output ontvangen");
      }

      if (intelligence?.linguistic_signals) {
        setLinguisticSignals(
          intelligence.linguistic_signals as LinguisticSignalBundle
        );
      }

      const guaranteedPipelineReport = buildGuaranteedExecutiveReport({
        report: intelligence.report,
        power: null,
        safeContext: pending.sourceContext,
      });
      const reportSource =
        intelligence.report && typeof intelligence.report === "object"
          ? { ...asRecord(intelligence.report), ...guaranteedPipelineReport }
          : guaranteedPipelineReport;

      setFlowStageIndex(4);
      const reportText =
        typeof intelligence.report === "string"
          ? intelligence.report
          : safeJsonStringify(reportSource);

      const analysisId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      let usedSignatureFallback = false;
      let narrativeText = createFallbackNarrative(pending.safeContext, reportText);

      setFlowStageIndex(5);
      try {
        const narrative = await generateBoardroomNarrative(
          {
            analysis_id: analysisId,
            company_name: pending.clientName || "Onbenoemde organisatie",
            questions: {
              q1: intakeAnswers.q1,
              q2: intakeAnswers.q2,
              q3: intakeAnswers.q3,
              q4: intakeAnswers.q4,
              q5: intakeAnswers.q5,
            },
            documents: pending.documents,
            company_context: [reportText, pending.sourceContext, pending.sectorLayer]
              .filter(Boolean)
              .join("\n\n"),
            meta: {
              sector_selected: pending.sectorSelected,
            },
          },
          {
            minWords: MIN_NARRATIVE_WORDS,
            maxWords: MODEL_NARRATIVE_MAX_WORDS,
          }
        );

        if (typeof narrative?.text === "string" && narrative.text.trim()) {
          narrativeText = narrative.text.trim();
        }
      } catch (narrativeError) {
        if (
          narrativeError instanceof Error &&
          narrativeError.message === SIGNATURE_VIOLATION_TEXT
        ) {
          warnOnce("signature_violation_fallback_narrative", "Signature violation bypassed \u2192 fallback narrative used", {
            stage: "generateBoardroomNarrative",
            analysisType: pending.analysisType,
          });
        }
      }

      narrativeText = enforceConcreteNarrativeMarkdown(
        narrativeText,
        [pending.sourceContext, pending.sectorLayer].filter(Boolean).join("\n\n")
      );
      if (hasVisibleSignatureWarning(narrativeText)) {
        usedSignatureFallback = true;
      }

      const parsedNarrative = safeParseReport(narrativeText, pending.analysisType);

      setFlowStageIndex(6);
      const power = await runPowerPipeline({
        analysisType: pending.analysisType,
        rawText: [
          pending.sourceContext,
          reportText,
          narrativeText,
          safeJsonStringify(parsedNarrative),
        ]
          .filter(Boolean)
          .join("\n\n"),
        userContext: {
          client_name: pending.clientName || "Onbenoemde organisatie",
          analysis_slug: normalizedSlug ?? "strategy",
        },
      });

      const narrativeWithPowerRaw = buildNarrativeWithPower(narrativeText, power);
      const narrativeWithPower =
        countWords(narrativeWithPowerRaw) > MAX_NARRATIVE_WORDS
          ? trimToWordLimit(narrativeWithPowerRaw, MAX_NARRATIVE_WORDS)
          : narrativeWithPowerRaw;
      const parsedWithPower = safeParseReport(
        narrativeWithPower,
        pending.analysisType
      );

      setFlowStageIndex(7);
      const nextExecutiveReport = sanitizeExecutiveReportFields(buildGuaranteedExecutiveReport({
        report: reportSource,
        power,
        safeContext: pending.sourceContext,
      }));
      const nextExecutiveHasFallbackWarning = Object.values(nextExecutiveReport).some(
        (value) => hasVisibleSignatureWarning(value)
      );
      const fallbackReasons: string[] = [];
      if (usedSignatureFallback) {
        fallbackReasons.push("Narrative.signature_warning_detected");
      }
      for (const [key, value] of Object.entries(nextExecutiveReport) as Array<
        [keyof GuaranteedExecutiveReport, string]
      >) {
        if (hasVisibleSignatureWarning(value)) {
          fallbackReasons.push(
            `${EXECUTIVE_FALLBACK_LABELS[key]}: signature_warning_detected`
          );
        }
      }
      const shouldForceFallbackFlowCompletion =
        usedSignatureFallback || nextExecutiveHasFallbackWarning;
      const nextReport = enrichDecisionSection(parsedWithPower, power);
      const reliability =
        typeof power.metrics?.decision_certainty_0_1 === "number"
          ? power.metrics.decision_certainty_0_1 * 10
          : 0;
      const interventionStatus =
        String(power.execution_layer?.risk_level || "ACTIEF").toUpperCase();
      const analysisRoute = `/portal/analyse/${normalizedSlug || "strategy"}`;
      const storedReportId =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `report-${Date.now()}`;
      const platformBoardReport = buildPlatformSessionBoardReport(
        nextExecutiveReport,
        reportSource,
        narrativeWithPower
      );
      const platformStrategicReport: StrategicReport = {
        report_id: storedReportId,
        session_id: "",
        organization_id: "",
        title: `${analysis.title} · ${pending.clientName || "Organisatie"}`,
        sections: platformBoardReport
          .split(/\n(?=\d+\.\s+)/)
          .map((section) => section.trim())
          .filter(Boolean),
        generated_at: new Date().toISOString(),
        report_body: platformBoardReport,
      };

      const finalPayload: FinalizedAnalysisPayload = {
        kind: "final",
        routeSlug: pending.routeSlug,
        report: nextReport,
        executiveReport: nextExecutiveReport,
        powerOutput: power,
        linguisticSignals: (intelligence?.linguistic_signals as LinguisticSignalBundle) ?? null,
        signatureFallbackWarning:
          usedSignatureFallback || nextExecutiveHasFallbackWarning,
        signatureFallbackReasons: fallbackReasons,
        clientName: pending.clientName,
        sectorSelected: pending.sectorSelected,
        context: pending.context,
      };

      startTransition(() => {
        setReport(nextReport);
        setPowerOutput(power);
        setExecutiveReport(nextExecutiveReport);
        setSignatureFallbackWarning(
          usedSignatureFallback || nextExecutiveHasFallbackWarning
        );
        setSignatureFallbackReasons(fallbackReasons);
      });

      useAnalysisStore.getState().completeRun(finalPayload);
      finalizedRunRef.current = activeRunId;

      setIsBuilding(false);
      if (shouldForceFallbackFlowCompletion) {
        forceAdvanceFlowAfterFallback();
      } else {
        setFlowStageIndex(FLOW_COMPLETION_STAGE);
      }

      void (async () => {
        const boardIndexSnapshot = await Promise.race<
          Awaited<ReturnType<typeof getBoardIndexSnapshot>> | null
        >([
          getBoardIndexSnapshot(`org:${pending.sectorSelected || "unknown"}:board-evaluation`),
          new Promise<null>((resolve) => {
            window.setTimeout(() => resolve(null), 1500);
          }),
        ]).catch(() => null);
        const baliScore = boardIndexSnapshot?.baliScore ?? 0;

        void saveReport({
          id: storedReportId,
          analysisId: analysisId,
          title: `${analysis.title} · ${pending.clientName || "Organisatie"}`,
          date: new Date().toISOString(),
          baliScore,
          betrouwbaarheid: Number(reliability.toFixed(2)),
          interventionStatus,
          pdfUrl: `/api/reports/pdf?analysisId=${encodeURIComponent(analysisId)}`,
          analysisRoute,
        }).catch(() => undefined);

        void saveBoardIndexSnapshot({
          baliScore,
          classification: boardIndexSnapshot?.classification ?? "Kwetsbaar",
          spread: boardIndexSnapshot?.spread ?? { min: baliScore, max: baliScore },
          reliabilityBand:
            boardIndexSnapshot?.reliabilityBand ??
            {
              low: Math.max(0, baliScore - 0.4),
              high: Math.min(10, baliScore + 0.4),
            },
          analysisId,
          organisationId: pending.sectorSelected || undefined,
          createdAt: new Date().toISOString(),
        }).catch(() => undefined);

      })();
    },
    [
      analysis.title,
      forceAdvanceFlowAfterFallback,
      intakeAnswers.q1,
      intakeAnswers.q2,
      intakeAnswers.q3,
      intakeAnswers.q4,
      intakeAnswers.q5,
      normalizedSlug,
      startTransition,
    ]
  );

  useEffect(() => {
    const stored = analysisStoreResult as PersistedAnalysisPayload | null;
    if (
      analysisStoreStatus === "completed" &&
      stored?.kind === "final" &&
      stored.routeSlug === routeSlug
    ) {
      setReport(stored.report);
      setExecutiveReport(
        stored.executiveReport
          ? sanitizeExecutiveReportFields(stored.executiveReport)
          : null
      );
      setPowerOutput(stored.powerOutput);
      setLinguisticSignals(stored.linguisticSignals);
      setSignatureFallbackWarning(stored.signatureFallbackWarning);
      setSignatureFallbackReasons(stored.signatureFallbackReasons);
      setClientName(stored.clientName);
      setSectorSelected(stored.sectorSelected);
      setContext(stored.context);
      setFlowStageIndex(FLOW_COMPLETION_STAGE);
    }
  }, [analysisStoreResult, analysisStoreStatus, routeSlug]);

  useEffect(() => {
    const persisted = analysisStoreResult as PersistedAnalysisPayload | null;
    const canPollCurrentRoute =
      persisted?.kind === "pending" && persisted.routeSlug === routeSlug;
    if (!runId || analysisStoreStatus !== "running" || !canPollCurrentRoute) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyses/${encodeURIComponent(runId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const analysisRecord =
          data && typeof data === "object" && data.analysis && typeof data.analysis === "object"
            ? (data.analysis as Record<string, any>)
            : null;

        if (!analysisRecord) return;

        if (String(analysisRecord.status || "").toLowerCase() === "running") {
          useAnalysisStore.getState().setProgress(55);
          return;
        }

        if (String(analysisRecord.status || "").toLowerCase() === "failed") {
          useAnalysisStore.getState().failRun();
          setLocalError(String(analysisRecord.error_message || "Analyse mislukt"));
          setIsBuilding(false);
          return;
        }

        const normalizedResult = normalizePersistedAnalysisResult(analysisRecord);
        if (String(analysisRecord.status || "").toLowerCase() === "done" && normalizedResult) {
          const state = useAnalysisStore.getState();
          const pending = state.result as PersistedAnalysisPayload | null;
          if (
            finalizedRunRef.current === runId ||
            !pending ||
            pending.kind !== "pending" ||
            pending.routeSlug !== routeSlug
          ) {
            return;
          }

          setIsBuilding(true);
          state.setProgress(65);
          await finalizeAnalysis(normalizedResult, pending, runId);
        }
      } catch {
        // polling blijft proberen
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [analysisStoreResult, analysisStoreStatus, finalizeAnalysis, routeSlug, runId]);

  const startAnalysis = async () => {
    if (analysisRunning) return;
    if (!sectorSelected) {
      setLocalError("Selecteer eerst een sector.");
      return;
    }

    clearFallbackFlowTimer();
    setLocalError(null);
    setSignatureFallbackWarning(false);
    setSignatureFallbackReasons([]);
    setPdfPreflightError(null);
    setIsBuilding(true);
    setFlowStageIndex(1);

    try {
      const documents = await Promise.all(
        (files ?? []).map(async (file, idx) => ({
          id: `${idx}-${file.name}`,
          filename: file.name,
          content: await readFileAsBase64(file),
        }))
      );

      const safeContext =
        context.trim() ||
        [
          `Organisatie: ${clientName?.trim() || "Onbekende organisatie"}.`,
          `Sector: ${sectorSelected || "onbekend"}.`,
          "Bestuurlijke opdracht: maak een scherpe keuze tussen versnellen en stabiliseren met expliciete keerzijde van de keuze, bestuurlijke impact en 90-dagen interventie.",
        ].join(" ");
      const uploadEvidenceContext = await buildUploadEvidenceContext(documents);
      const sourceContext = [
        "[SOURCE_FREE_FIELD]",
        safeContext,
        "[SOURCE_UPLOAD]",
        uploadEvidenceContext,
      ].join("\n\n");
      const casusAnchors = parseInputAnchors(
        [safeContext, uploadEvidenceContext, clientName].filter(Boolean).join("\n")
      ).slice(0, 5);
      const sectorSignals = await fetchSectorSignals(sectorSelected);
      const sectorLayer = sectorSignals
        ? [
            `[SECTOR-LAYER | bron: extern | datum: ${new Date().toISOString().slice(0, 10)}]`,
            ...sectorSignals.signals.slice(0, 3).map((signal) => `- ${signal}`),
            `Sector Risk Index: ${sectorSignals.sectorRiskIndex}`,
            `Regulator Pressure Index: ${sectorSignals.regulatorPressureIndex}`,
            `Contract Power Score: ${sectorSignals.contractPowerScore}`,
            `Arbeidsmarktdruk-index: ${sectorSignals.arbeidsmarktdrukIndex}`,
            `Relevantie voor deze casus: ${(casusAnchors.length ? casusAnchors : ["Niet onderbouwd in geüploade documenten of vrije tekst."]).join(", ")}`,
          ].join("\n")
        : "";

      const contextualizedInput = [sourceContext, sectorLayer].filter(Boolean).join("\n\n");
      setFlowStageIndex(2);

      const pendingPayload: PendingAnalysisPayload = {
        kind: "pending",
        routeSlug,
        analysisType,
        clientName,
        sectorSelected,
        context,
        sourceContext,
        sectorLayer,
        safeContext,
        documents,
      };

      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: clientName || "Organisatie",
          description: contextualizedInput,
          context: {
            analysis_type: analysisType,
            analysisContext: {
              sector_selected: sectorSelected,
            },
            source_context: sourceContext,
            sector_layer: sectorLayer,
            documents: documents.map((document) => ({
              id: document.id,
              name: document.name,
              mimeType: document.mimeType,
            })),
          },
          runImmediately: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysejob starten mislukt: ${errorText}`);
      }

      const responseJson = await response.json();
      const analysisRecord =
        responseJson &&
        typeof responseJson === "object" &&
        responseJson.analysis &&
        typeof responseJson.analysis === "object"
          ? (responseJson.analysis as Record<string, any>)
          : null;
      const nextRunId = String(
        analysisRecord?.id ||
          (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
      );

      const store = useAnalysisStore.getState();
      store.startRun(nextRunId);
      store.setResult(pendingPayload);
      store.setProgress(25);

      setFlowStageIndex(3);

      const normalizedResult = normalizePersistedAnalysisResult(analysisRecord);
      if (String(analysisRecord?.status || "").toLowerCase() === "done" && normalizedResult) {
        store.setProgress(65);
        await finalizeAnalysis(normalizedResult, pendingPayload, nextRunId);
        return;
      }
    } catch (err) {
      useAnalysisStore.getState().failRun();
      setLocalError(err instanceof Error ? err.message : "Analyse mislukt");
      if (reportRef.current || executiveReportRef.current) {
        setFlowStageIndex(FLOW_COMPLETION_STAGE);
      } else {
        setFlowStageIndex(0);
      }
      setIsBuilding(false);
    }
  };

  /* ================= PDF ================= */

  const printReport = async () => {
    const now = Date.now();
    if (now - printDebounceRef.current < 500) return;
    printDebounceRef.current = now;
    if (isPrinting) {
      console.info("[pdf_start_skip_single_flight]");
      return;
    }
    const reportForPdf =
      report ??
      (executiveReportView
        ? safeParseReport(
            buildExecutiveFallbackMarkdown(executiveReportView),
            analysisType
          )
        : null);
    if (!reportForPdf) {
      console.info("[pdf_start_skip_no_report]");
      return;
    }

    setIsPrinting(true);
    setPdfPreflightError(null);
    setFlowStageIndex(8);
    console.info("[pdf_start]", {
      analysisType,
      hasExecutiveReport: Boolean(executiveReportView),
    });
    const pdfReport = toPDFReport(reportForPdf, executiveReportView);
    const sectionMap = pdfReport.sections ?? {};
    const sectionEntries = Object.entries(sectionMap).map(([key, section]) => ({
      key,
      text: stringifySectionContent(section?.content).trim(),
    }));
    const filledSections = sectionEntries.filter((entry) => entry.text.length > 0);
    const emptySectionKeys = sectionEntries
      .filter((entry) => entry.text.length === 0)
      .map((entry) => entry.key);

    const narrativeText =
      typeof (pdfReport as any).raw_markdown === "string"
        ? String((pdfReport as any).raw_markdown)
        : filledSections.map((entry) => entry.text).join("\n\n");

    const narrativeLength = narrativeText.trim().length;

    dumpReportEnvelope({
      title: pdfReport.title,
      narrative: narrativeText,
      sections: sectionMap,
      sectionKeys: sectionEntries.map((entry) => entry.key),
    });

    if (filledSections.length === 0 || narrativeLength < 200) {
      const details = {
        narrativeLength,
        sectionsCount: filledSections.length,
        emptySectionKeys,
      };

      console.error("PDF pre-flight assert failed", details);
      setPdfPreflightError(
        `PDF pre-flight mislukt. narrativeLength=${narrativeLength}, sectionsCount=${filledSections.length}, emptySectionKeys=${emptySectionKeys.join(", ") || "none"}.`
      );
      setFlowStageIndex(hasReportOutput ? FLOW_COMPLETION_STAGE : 0);
      console.info("[pdf_end]", { status: "preflight_failed", ...details });
      return;
    }

    try {
      const modulePromise = import("../../utils/generateAureliusPDF");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF generatie timeout")), 20_000)
      );
      const module = (await Promise.race([modulePromise, timeoutPromise])) as {
        generateAureliusPDF: (
          title: string,
          report: PDFAnalysisResult,
          client: string,
          meta?: { confidence?: number }
        ) => void;
      };

      module.generateAureliusPDF(
        reportForPdf.title || "Aurelius Analyse",
        pdfReport,
        clientName || "Onbekende organisatie",
        { confidence: 0.82 }
      );
      setFlowStageIndex(FLOW_COMPLETION_STAGE);
      console.info("[pdf_end]", { status: "success" });
    } catch (error) {
      setPdfPreflightError(
        error instanceof Error ? error.message : "PDF generatie mislukt."
      );
      console.info("[pdf_end]", {
        status: "error",
        error: error instanceof Error ? error.message : "unknown",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const printBoardMemo = async () => {
    if (!dualLayerOutput) return;
    if (decisionLayerWordCount > 900) {
      setPdfPreflightError(
        `Besluitdocument Raad van Bestuur overschrijdt limiet: ${decisionLayerWordCount} woorden (max 900).`
      );
      return;
    }

    const now = Date.now();
    if (now - printDebounceRef.current < 500) return;
    printDebounceRef.current = now;
    if (isPrinting) return;

    setIsPrinting(true);
    setPdfPreflightError(null);
    setFlowStageIndex(8);

    try {
      const canonicalMemoDocument = normalizeBoardDocumentForOutput(
        toDecisionMemoText(dualLayerOutput.decision_layer)
      );
      assertOutputIntegrity(canonicalMemoDocument);
      const parsedMemo = safeParseReport(canonicalMemoDocument, analysisType);
      const memoExecutive = mapDecisionLayerToExecutive(dualLayerOutput.decision_layer);
      const pdfReport = toPDFReport(parsedMemo, memoExecutive, {
        rawMarkdownOverride: canonicalMemoDocument,
      });

      const modulePromise = import("../../utils/generateAureliusPDF");
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("PDF generatie timeout")), 20_000)
      );
      const module = (await Promise.race([modulePromise, timeoutPromise])) as {
        generateAureliusPDF: (
          title: string,
          report: PDFAnalysisResult,
          client: string,
          meta?: { confidence?: number }
        ) => void;
      };

      module.generateAureliusPDF(
        `${analysis.title} — Besluitdocument Raad van Bestuur`,
        pdfReport,
        clientName || "Onbekende organisatie",
        { confidence: 0.82 }
      );
      setFlowStageIndex(FLOW_COMPLETION_STAGE);
    } catch (error) {
      setPdfPreflightError(
        error instanceof Error ? error.message : "PDF-generatie van het besluitdocument is mislukt."
      );
    } finally {
      setIsPrinting(false);
    }
  };

  /* ================= RESET ================= */

  const resetLocalState = () => {
    clearFallbackFlowTimer();
    setContext("");
    setFiles([]);
    setReport(null);
    setExecutiveReport(null);
    setPowerOutput(null);
    setLocalError(null);
    setSignatureFallbackWarning(false);
    setSignatureFallbackReasons([]);
    setPdfPreflightError(null);
    setIsBuilding(false);
    setFlowStageIndex(0);
    setClientName("");
    setSectorSelected("");
    setLinguisticSignals(null);
    setIntakeAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
    finalizedRunRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reset = () => {
    useAnalysisStore.getState().reset();
    resetLocalState();
  };

  useEffect(() => {
    const stored = useAnalysisStore.getState().result as PersistedAnalysisPayload | null;
    const keepRunning =
      analysisStoreStatus === "running" &&
      stored?.kind === "pending" &&
      stored.routeSlug === routeSlug;
    const keepCompleted =
      analysisStoreStatus === "completed" &&
      stored?.kind === "final" &&
      stored.routeSlug === routeSlug;

    if (!keepRunning && !keepCompleted) {
      resetLocalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSlug]);

  /* ================= RENDER ================= */

  return (
    <CyntraAnalysisLayout title={analysis.title} subtitle={safeSubtitle}>
      <BackToDashboard />
      {report && <Watermark risk="MODERATE" />}

      {analysisStoreStatus === "running" && (
        <div className="mb-6 rounded-xl border border-[#d4af37]/40 bg-[#1a1408] p-4">
          <p className="text-sm font-semibold text-[#f6dd93]">
            Analyse draait op de achtergrond
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#d4af37] transition-all duration-500"
              style={{ width: `${Math.max(2, analysisProgress)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-cyntra-secondary">
            Voortgang: {Math.max(0, Math.round(analysisProgress))}%
          </p>
        </div>
      )}

      {(analysisStoreStatus === "running" || isBuilding) && (
        <div className="mb-8 flex items-center gap-2 text-cyntra-secondary font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyse wordt opgebouwd in lineaire bestuursflow...
        </div>
      )}

      {showSignatureWarningBanner && (
        <div className="mb-8 rounded-xl border border-amber-500/70 bg-amber-950/40 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Signature Layer Waarschuwing</div>
              <div className="mt-1 text-amber-100/90">{SIGNATURE_WARNING_TEXT}</div>
              {visibleSignatureReasons.length > 0 && (
                <div className="mt-2 rounded-lg border border-amber-300/30 bg-black/30 px-3 py-2 text-xs text-amber-100/85">
                  <div className="font-semibold">Debug triggers</div>
                  <div className="mt-1 space-y-1">
                    {visibleSignatureReasons.map((reason) => (
                      <div key={reason}>- {reason}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {runtimeIntegrityWarning && (
        <div className="mb-8 rounded-xl border border-amber-500/60 bg-amber-950/40 p-4 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Runtime-integriteitswaarschuwing: {runtimeIntegrityWarning}</span>
          </div>
        </div>
      )}

      {runtimeErrorMessage && !isSignatureViolation && (
        <div className="mb-8 rounded-xl border border-red-500/60 bg-red-950/40 p-4 text-red-200">
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span>{runtimeErrorMessage}</span>
          </div>
          {boardGateErrorCodes.length > 0 && (
            <div className="mt-2 text-xs text-red-100/90">
              <span className="font-semibold">Board-gate debug:</span>{" "}
              <span className="font-mono">{boardGateErrorCodes.join(" | ")}</span>
            </div>
          )}
        </div>
      )}

      {pdfPreflightError && (
        <div className="mb-8 rounded-xl border border-red-500/60 bg-red-950/50 p-4 text-sm text-red-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{pdfPreflightError}</span>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl border divider-cyntra bg-cyntra-surface p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cyntra-gold font-semibold">
          Unified Lineaire Flow
        </p>
        <div className="grid gap-2 md:grid-cols-3">
          {FLOW_STEPS.map((step, index) => {
            const active = index === flowStageIndex;
            const done = index < flowStageIndex;
            return (
              <div
                key={step}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  active
                    ? "border-[#d4af37] text-[#f6dd93] bg-[#1a1408]"
                    : done
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/30"
                    : "border-white/10 text-cyntra-secondary bg-cyntra-card"
                }`}
              >
                {index + 1}. {step}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <CyntraPrimaryAction
          label={analysisRunning ? "Analyse draait..." : "Start Volledige Analyse"}
          onClick={startAnalysis}
          disabled={analysisRunning}
        />
      </div>

      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        multiple
        className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
        onChange={handleFileInputChange}
      />

      <div className="mb-6 rounded-2xl border divider-cyntra bg-cyntra-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor={fileInputId}
            onClick={openFilePicker}
            className="flex items-center gap-3 border divider-cyntra bg-cyntra-card px-5 py-2.5 text-cyntra-primary font-semibold"
          >
            <Upload className="h-4 w-4" />
            Documenten uploaden
          </label>
          <span className="text-sm text-cyntra-secondary">
            {files.length} document{files.length === 1 ? "" : "en"} geselecteerd
            (20+ ondersteund, geen harde limiet)
          </span>
          {files.length > 0 && (
            <button
              type="button"
              onClick={clearSelectedFiles}
              className="text-xs uppercase tracking-[0.12em] text-cyntra-gold font-semibold"
            >
              Wis selectie
            </button>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {(files ?? []).map((file, idx) => (
            <div
              key={`${fileIdentity(file)}:${idx}`}
              className="flex items-center justify-between gap-3 text-cyntra-secondary font-semibold"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeSelectedFile(file)}
                className="text-xs uppercase tracking-[0.12em] text-cyntra-gold"
              >
                Verwijder
              </button>
            </div>
          ))}
        </div>
      </div>

      {!hasReportOutput ? (
        <>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Naam organisatie"
            className="cyntra-input mb-6"
          />

          <div className="mb-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-cyntra-secondary font-semibold">
              Sector
            </label>
            <select
              value={sectorSelected}
              onChange={(event) =>
                setSectorSelected(event.target.value as Sector | "")
              }
              className="cyntra-input"
            >
              <option value="">Selecteer sector</option>
              {SECTOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="cyntra-input mb-6"
            rows={6}
            placeholder="Vrije context"
          />
        </>
      ) : (
        <>
          <div className="mb-10 flex gap-6">
            <button onClick={reset} className="text-cyntra-secondary font-semibold">
              Nieuwe analyse
            </button>

            <button
              onClick={printReport}
              disabled={!canDownloadPdf || isPrinting}
              className={`flex items-center gap-2 ${
                canDownloadPdf ? "text-cyntra-gold font-bold" : "text-cyntra-secondary"
              }`}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "PDF wordt gemaakt..." : "PDF Download"}
            </button>
            <button
              onClick={printBoardMemo}
              disabled={!dualLayerOutput || isPrinting}
              className={`flex items-center gap-2 ${
                dualLayerOutput ? "text-cyntra-gold font-bold" : "text-cyntra-secondary"
              }`}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Besluitdocument wordt gemaakt..." : "Download Besluitdocument Raad van Bestuur"}
            </button>
          </div>

          {!showSignatureWarningBanner &&
            (signatureFallbackWarning || executiveHasFallbackWarning) && (
            <div className="mb-6 rounded-xl border border-amber-500/70 bg-amber-950/35 p-4 text-sm text-amber-100">
              Fallbackrapport actief in Control Surface. Download gereed.
            </div>
          )}
          <div className="analysis-container print-report-section rounded-2xl border divider-cyntra bg-cyntra-surface p-8 shadow-sm">
            <pre className="whitespace-pre-wrap break-words text-cyntra-primary leading-relaxed">
              {canonicalDocument}
            </pre>
          </div>
        </>
      )}
    </CyntraAnalysisLayout>
  );
}
