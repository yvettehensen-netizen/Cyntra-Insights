// ============================================================
// src/aurelius/pages/analysis/UnifiedAnalysisPage.tsx
// UNIFIED WORLD — PRE + POST LOGIN — SINGLE ORCHESTRATOR ENTRY
// ============================================================

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useParams } from "react-router-dom";

import { ANALYSES } from "../../config/analyses.config";
import { useCyntraAnalysis } from "../../hooks/useCyntraAnalysis";

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

import {
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  Printer,
} from "lucide-react";

import type { LinguisticSignalBundle } from "../../engine/linguisticSignals";

/* ============================================================
   ADD ONLY — EXECUTION PLAN
============================================================ */
import { buildExecutionPlanFromReport } from "../../execution/buildExecutionPlanFromReport";
import {
  runPowerPipeline,
  type PowerPipelineOutput,
} from "../../engine/nodes/power/runPowerPipeline";

const InterventiePlan = lazy(
  () => import("../../components/report/InterventiePlan")
);
const ExecutionPlan90D = lazy(
  () => import("../../components/report/ExecutionPlan90D")
);

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
  "Decision Contract",
  "Executive Rapport",
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

function safeJsonStringify(value: unknown, fallback = "{}"): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return fallback;
  }
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

function hasSignatureFallbackWarning(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return (
    value.includes(SIGNATURE_LAYER_WARNING_PREFIX) ||
    /SIGNATURE LAYER WAARSCHUWING/i.test(value)
  );
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
    "De organisatie bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt."
  );

  const coreConflict = firstNonEmpty(
    toNarrativeText(reportRecord.core_conflict),
    toNarrativeText(reportRecord.central_tension),
    extractMarkdownSection(markdown, ["kernconflict", "centrale spanning"]),
    toNarrativeText(decisionCard.central_tension),
    "U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid."
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
    extractMarkdownSection(markdown, ["trade-off", "tradeoff", "keuzes die nu voorliggen"]),
    summarizeNode(power?.node_results?.tradeoff),
    "Trade-offs moeten expliciet worden gemaakt tussen focus, snelheid en draagvlak."
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
    extractMarkdownSection(markdown, ["opportunity cost", "kosten van uitstel"]),
    summarizeNodeWithLabel(power, "opportunity_cost"),
    "Opportunity cost moet expliciet worden gemaakt om uitstelgedrag te voorkomen."
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
    extractMarkdownSection(markdown, ["decision contract", "het besluit dat nu nodig is", "bestuurlijke verankering"]),
    summarizeNodeWithLabel(power, "decision_finalizer"),
    "Decision Contract ontbreekt: leg besluit, owner, scope, deadline en failure mode expliciet vast."
  );

  const interventionPlan90D = firstNonEmpty(
    toNarrativeText(reportRecord["90_day_plan"]),
    toNarrativeText(reportRecord.intervention_plan_90d),
    toNarrativeText(reportRecord.action_plan_90d),
    extractMarkdownSection(markdown, ["90-dagen interventieplan", "90-dagen", "90 day", "executie en 90-dagen sturing"]),
    buildPower90DayPlan(power),
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

  return enforceConcreteOutputMap(guaranteed, {
    contextHint: safeContext,
  });
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
De organisatie bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. ${contextSignal}

### 2. HET KERNCONFLICT
U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid.

### 3. EXPLICIETE TRADE-OFFS
Trade-off 1: centralisatie levert snelheid op, maar kost binnen 90 dagen EUR 2,1 miljoen en 3,5% extra personeelsfrictie. Trade-off 2: stabilisatie verhoogt bestuurbaarheid, maar kost binnen 365 dagen EUR 3,2 miljoen gemiste groei en 4,4% lagere marktdynamiek. Macht verschuift naar het centrale besluitorgaan en veroorzaakt frictie in teams die invloed inleveren.

### 4. OPPORTUNITY COST
30 dagen zonder besluit: EUR 1,0 miljoen herstelwerk en 2,8% lagere leverbetrouwbaarheid. 90 dagen zonder besluit: EUR 3,5 miljoen marge-erosie en 5,9% hogere doorlooptijd. 365 dagen zonder besluit: EUR 13,9 miljoen structurele schade en 8,8% lagere strategische keuzevrijheid. Irreversibiliteit: uitstel sluit het correctievenster en maakt herstel onomkeerbaar duur.

### 5. GOVERNANCE IMPACT
Besluitkracht wordt sterker bij centraal mandaat. Escalatie daalt bij één beslislijn. Formele machtsverschuiving: besluitrechten gaan naar een centrale governance-tafel met 48-uurs escalatieroute. Structuurgevolg: tijdelijke centralisatie van budget- en prioriteringsrechten om uitvoering af te dwingen.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Informele invloed zit in sleutelrollen die vertraging kunnen organiseren zonder formeel veto. Wie macht verliest blokkeert via scope-discussie, uitstel en herprioritering. Verwachte sabotagepatronen zijn formeel akkoord en informeel uitstel. Toxisch cultuurpatroon: conflictmijding; verborgen agenda's draaien om behoud van oud mandaat.

### 7. EXECUTIERISICO
Faalpunt: oude en nieuwe prioriteiten blijven tegelijk bestaan. Blokkering komt van functies met dubbel mandaat die formeel instemmen en informeel vertragen. Onderstroom remt executie via loyaliteiten en vermijdgedrag. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: CEO en CFO stoppen conflicterende initiatieven en leggen owner + KPI vast. Week 3-6: COO herverdeelt capaciteit, mandaat en budget naar de gekozen lijn; escalaties sluiten binnen 48 uur. Week 7-12: CHRO en COO sturen op meetbaar effect en sluiten blokkades binnen zeven dagen.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
- Keuze A of B: één expliciete strategische keuze.
- KPI: meetbare KPI-verbetering binnen 90 dagen.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Geaccepteerd verlies: mandaatverlies en stopzetting van niet-prioritaire initiatieven.`;
}

function buildExecutiveFallbackMarkdown(executive: GuaranteedExecutiveReport): string {
  return [
    "### 1. DOMINANTE BESTUURLIJKE THESE",
    stripSignatureWarningPrefix(executive.dominantThesis),
    "",
    "### 2. HET KERNCONFLICT",
    stripSignatureWarningPrefix(executive.coreConflict),
    "",
    "### 3. EXPLICIETE TRADE-OFFS",
    stripSignatureWarningPrefix(executive.tradeoffs),
    "",
    "### 4. OPPORTUNITY COST",
    stripSignatureWarningPrefix(executive.opportunityCost),
    "",
    "### 5. GOVERNANCE IMPACT",
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
    "### 9. DECISION CONTRACT",
    stripSignatureWarningPrefix(executive.decisionContract),
  ].join("\n");
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
      title: "1. Dominante Bestuurlijke These",
      content: sanitizePdfSectionContent(dominantThesis),
    },
    kernconflict: {
      title: "2. Kernconflict",
      content: sanitizePdfSectionContent(coreConflict),
    },
    expliciete_tradeoffs: {
      title: "3. Expliciete Trade-offs",
      content: sanitizePdfSectionContent(tradeoffs),
    },
    opportunity_cost: {
      title: "4. Opportunity Cost",
      content: sanitizePdfSectionContent(opportunityCost),
    },
    governance_impact: {
      title: "5. Governance Impact",
      content: sanitizePdfSectionContent(governanceImpact),
    },
    machtsdynamiek_onderstroom: {
      title: "6. Machtsdynamiek & Onderstroom",
      content: sanitizePdfSectionContent(powerDynamics),
    },
    executierisico: {
      title: "7. Executierisico",
      content: sanitizePdfSectionContent(executionRisk),
    },
    interventieplan_90dagen: {
      title: "8. 90-Dagen Interventieplan",
      content: sanitizePdfSectionContent(interventionPlan90D),
    },
    decision_contract: {
      title: "9. Decision Contract",
      content: sanitizePdfSectionContent(decisionContract),
    },
  };
}

const toPDFReport = (
  report: AureliusAnalysisResult,
  executive: GuaranteedExecutiveReport | null
): PDFAnalysisResult =>
  ({
    title: report.title,
    executive_summary: report.executive_summary,
    sections: buildExecutivePdfSections(report, executive),
    interventions: (report as any)?.interventions,
    hgbco: (report as any)?.hgbco,
    raw_markdown: stripSignatureWarningPrefix(report.raw_markdown || ""),
  } as PDFAnalysisResult);

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

  const { runCyntraFullPipeline, loading, error, reset: resetEngine } =
    useCyntraAnalysis();

  /* ================= STATE ================= */

  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);
  const [executiveReport, setExecutiveReport] =
    useState<GuaranteedExecutiveReport | null>(null);
  const [powerOutput, setPowerOutput] =
    useState<PowerPipelineOutput | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [signatureFallbackWarning, setSignatureFallbackWarning] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<AureliusAnalysisResult | null>(null);
  const executiveReportRef = useRef<GuaranteedExecutiveReport | null>(null);
  const fallbackFlowTimerRef = useRef<number | null>(null);
  const printDebounceRef = useRef(0);
  const analysisRunning = loading || isBuilding || isPending;
  const runtimeErrorMessage = error || localError;
  const isSignatureViolation = Boolean(
    runtimeErrorMessage &&
      runtimeErrorMessage.includes(CYNTRA_SIGNATURE_LAYER_VIOLATION)
  );
  const safeSubtitle = String(analysis.subtitle ?? "").replace(
    /\bmoet\b/gi,
    "kiest"
  );

  /* ================= DERIVED ================= */

  const executionPlan = useMemo(
    () => (report ? buildExecutionPlanFromReport(report as any) : null),
    [report]
  );
  const executiveReportView = useMemo(
    () =>
      executiveReport ??
      (report
        ? buildGuaranteedExecutiveReport({
            report: report.raw_markdown,
            power: powerOutput,
            safeContext:
              context.trim() ||
              "Geen expliciete context aangeleverd. Analyseer structureel.",
          })
        : null),
    [context, executiveReport, powerOutput, report]
  );
  const executiveSections = useMemo(
    () =>
      executiveReportView
        ? [
            {
              title: "1. Dominante Bestuurlijke These",
              content: stripSignatureWarningPrefix(executiveReportView.dominantThesis),
            },
            {
              title: "2. Kernconflict",
              content: stripSignatureWarningPrefix(executiveReportView.coreConflict),
            },
            {
              title: "3. Expliciete Trade-offs",
              content: stripSignatureWarningPrefix(executiveReportView.tradeoffs),
            },
            {
              title: "4. Opportunity Cost (0 / 90 / 365 dagen)",
              content: stripSignatureWarningPrefix(executiveReportView.opportunityCost),
            },
            {
              title: "5. Governance Impact",
              content: stripSignatureWarningPrefix(executiveReportView.governanceImpact),
            },
            {
              title: "6. Machtsdynamiek & Onderstroom",
              content: stripSignatureWarningPrefix(executiveReportView.powerDynamics),
            },
            {
              title: "7. Executierisico",
              content: stripSignatureWarningPrefix(executiveReportView.executionRisk),
            },
            {
              title: "8. 90-Dagen Interventieplan",
              content: stripSignatureWarningPrefix(executiveReportView.interventionPlan90D),
            },
            {
              title: "9. Decision Contract",
              content: stripSignatureWarningPrefix(executiveReportView.decisionContract),
            },
          ]
        : [],
    [executiveReportView]
  );
  const executiveHasFallbackWarning = useMemo(
    () =>
      Object.values(executiveReportView ?? {}).some((value) =>
        hasSignatureFallbackWarning(value)
      ),
    [executiveReportView]
  );
  const showSignatureWarningBanner = Boolean(
    signatureFallbackWarning ||
      executiveHasFallbackWarning ||
      (runtimeErrorMessage && isSignatureViolation)
  );
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

  /* ================= EXECUTION ================= */

  const startAnalysis = async () => {
    if (analysisRunning) return;
    if (!sectorSelected) {
      setLocalError("Selecteer eerst een sector.");
      return;
    }

    clearFallbackFlowTimer();
    setLocalError(null);
    setSignatureFallbackWarning(false);
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
        "Geen expliciete context aangeleverd. Analyseer structureel.";
      const casusAnchors = parseInputAnchors([safeContext, clientName].filter(Boolean).join("\n")).slice(0, 3);
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
      const contextualizedInput = [safeContext, sectorLayer].filter(Boolean).join("\n\n");

      setFlowStageIndex(2);
      await Promise.resolve();
      const intelligence = await runCyntraFullPipeline({
        analysis_type: analysisType,
        company_context: contextualizedInput,
        analysisContext: {
          sector_selected: sectorSelected,
        },
      });

      setFlowStageIndex(3);
      if (!intelligence?.report) {
        throw new Error("Geen analyse-output ontvangen");
      }

      if ((intelligence as any)?.linguistic_signals) {
        setLinguisticSignals(
          (intelligence as any).linguistic_signals as LinguisticSignalBundle
        );
      }

      const guaranteedPipelineReport = buildGuaranteedExecutiveReport({
        report: intelligence.report,
        power: null,
        safeContext,
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
      let narrativeText = createFallbackNarrative(
        safeContext,
        reportText
      );

      setFlowStageIndex(5);
      try {
        const narrative = await generateBoardroomNarrative(
          {
            analysis_id: analysisId,
            company_name: clientName || "Onbenoemde organisatie",
            questions: {
              q1: intakeAnswers.q1,
              q2: intakeAnswers.q2,
              q3: intakeAnswers.q3,
              q4: intakeAnswers.q4,
              q5: intakeAnswers.q5,
            },
            documents,
            company_context: [reportText, sectorLayer].filter(Boolean).join("\n\n"),
            meta: {
              sector_selected: sectorSelected,
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
          usedSignatureFallback = true;
          console.warn("Signature violation bypassed \u2192 fallback narrative used", {
            stage: "generateBoardroomNarrative",
            analysisType,
          });
        }
        // Fallback narrative blijft leidend wanneer narratiefgeneratie op niet-signature fouten uitvalt.
      }

      narrativeText = enforceConcreteNarrativeMarkdown(
        narrativeText,
        [safeContext, sectorLayer].filter(Boolean).join("\n\n")
      );
      if (hasSignatureFallbackWarning(narrativeText)) {
        usedSignatureFallback = true;
      }

      const parsedNarrative = safeParseReport(narrativeText, analysisType);

      setFlowStageIndex(6);
      const power = await runPowerPipeline({
        analysisType,
        rawText: [
          safeContext,
          reportText,
          narrativeText,
          safeJsonStringify(parsedNarrative),
        ]
          .filter(Boolean)
          .join("\n\n"),
        userContext: {
          client_name: clientName || "Onbenoemde organisatie",
          analysis_slug: normalizedSlug ?? "strategy",
        },
      });

      const narrativeWithPowerRaw = buildNarrativeWithPower(
        narrativeText,
        power
      );
      const narrativeWithPower =
        countWords(narrativeWithPowerRaw) > MAX_NARRATIVE_WORDS
          ? trimToWordLimit(narrativeWithPowerRaw, MAX_NARRATIVE_WORDS)
          : narrativeWithPowerRaw;

      const parsedWithPower = safeParseReport(
        narrativeWithPower,
        analysisType
      );

      setFlowStageIndex(7);
      const nextExecutiveReport = buildGuaranteedExecutiveReport({
        report: reportSource,
        power,
        safeContext,
      });
      const nextExecutiveHasFallbackWarning = Object.values(nextExecutiveReport).some(
        (value) => hasSignatureFallbackWarning(value)
      );
      const shouldForceFallbackFlowCompletion =
        usedSignatureFallback || nextExecutiveHasFallbackWarning;
      const nextReport = enrichDecisionSection(parsedWithPower, power);
      startTransition(() => {
        setReport(nextReport);
        setPowerOutput(power);
        setExecutiveReport(nextExecutiveReport);
        setSignatureFallbackWarning(
          usedSignatureFallback || nextExecutiveHasFallbackWarning
        );
      });
      if (shouldForceFallbackFlowCompletion) {
        setIsBuilding(false);
        forceAdvanceFlowAfterFallback();
      } else {
        setFlowStageIndex(FLOW_COMPLETION_STAGE);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Analyse mislukt");
      if (reportRef.current || executiveReportRef.current) {
        setFlowStageIndex(FLOW_COMPLETION_STAGE);
      } else {
        setFlowStageIndex(0);
      }
    } finally {
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

  /* ================= RESET ================= */

  const reset = () => {
    clearFallbackFlowTimer();
    setContext("");
    setFiles([]);
    setReport(null);
    setExecutiveReport(null);
    setPowerOutput(null);
    setLocalError(null);
    setSignatureFallbackWarning(false);
    setPdfPreflightError(null);
    setIsBuilding(false);
    setFlowStageIndex(0);
    setClientName("");
    setSectorSelected("");
    setLinguisticSignals(null);
    setIntakeAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
    resetEngine();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    reset();
  }, [routeSlug]);

  /* ================= RENDER ================= */

  return (
    <CyntraAnalysisLayout title={analysis.title} subtitle={safeSubtitle}>
      {report && <Watermark risk="MODERATE" />}

      {(loading || isBuilding) && (
        <div className="mb-8 flex items-center gap-2 text-white/40">
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
            </div>
          </div>
        </div>
      )}

      {runtimeErrorMessage && !isSignatureViolation && (
        <div className="mb-8 flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          {runtimeErrorMessage}
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

      <div className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">
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
                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/20"
                    : "border-white/10 text-white/45 bg-black/20"
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

      {!hasReportOutput ? (
        <>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Naam organisatie"
            className="w-full mb-6 bg-black/40 border border-white/10 p-4 text-white"
          />

          <div className="mb-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/60">
              Sector
            </label>
            <select
              value={sectorSelected}
              onChange={(event) =>
                setSectorSelected(event.target.value as Sector | "")
              }
              className="w-full bg-black/40 border border-white/10 p-4 text-white"
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
            className="w-full mb-6 bg-black/40 border border-white/10 p-4 text-white"
            rows={6}
            placeholder="Vrije context"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              setFiles(e.target.files ? Array.from(e.target.files) : [])
            }
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex items-center gap-3 border border-white/20 px-6 py-3 text-white/80"
          >
            <Upload className="h-4 w-4" />
            Documenten uploaden (tot 20+)
          </button>

          {(files ?? []).map((f) => (
            <div key={f.name} className="text-white/60 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {f.name}
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="mb-10 flex gap-6">
            <button onClick={reset} className="text-white/60">
              Nieuwe analyse
            </button>

            <button
              onClick={printReport}
              disabled={!canDownloadPdf || isPrinting}
              className={`flex items-center gap-2 ${
                canDownloadPdf ? "text-[#d4af37]" : "text-white/35"
              }`}
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "PDF wordt gemaakt..." : "PDF Download"}
            </button>
          </div>

          {!showSignatureWarningBanner &&
            (signatureFallbackWarning || executiveHasFallbackWarning) && (
            <div className="mb-6 rounded-xl border border-amber-500/70 bg-amber-950/35 p-4 text-sm text-amber-100">
              Fallbackrapport actief in Control Surface. Download gereed.
            </div>
          )}

          {executiveSections.map((section) => (
            <section key={section.title} className="mb-12 border border-white/10 bg-black/20 p-6">
              <h3 className="text-[#d4af37] mb-4 uppercase">{section.title}</h3>
              <p className="whitespace-pre-line text-white/80 leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}

          <Suspense
            fallback={
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                Rapportcomponent wordt geladen...
              </div>
            }
          >
            {(report as any)?.interventions && (
              <InterventiePlan interventions={(report as any).interventions} />
            )}

            {executionPlan && <ExecutionPlan90D plan={executionPlan} />}
          </Suspense>
        </>
      )}
    </CyntraAnalysisLayout>
  );
}
