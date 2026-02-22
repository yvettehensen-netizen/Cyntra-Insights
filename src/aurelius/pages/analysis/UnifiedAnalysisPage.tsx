// ============================================================
// src/aurelius/pages/analysis/UnifiedAnalysisPage.tsx
// UNIFIED WORLD — PRE + POST LOGIN — SINGLE ORCHESTRATOR ENTRY
// ============================================================

import {
  Suspense,
  lazy,
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

import type { AnalysisType as AureliusAnalysisType } from "../../types";

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
const SIGNATURE_VIOLATION_TEXT =
  "CYNTRA SIGNATURE VIOLATION — onvoldoende besluitdiagnostiek";

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

  return {
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
  return `### 1. DOMINANTE BESTUURLIJKE THESE
De organisatie bevindt zich op een beslismoment waarbij uitstel directe executieschade veroorzaakt. ${safeContext}

### 2. HET KERNCONFLICT
U moet kiezen tussen schaalvergroting met verlies aan controle, of stabilisatie met verlies aan groeisnelheid.

### 3. EXPLICIETE TRADE-OFFS
Bij keuze voor snelheid wint u marktmomentum en verliest u lokale autonomie. Bij keuze voor stabilisatie wint u bestuurbaarheid en verliest u groeitempo. Macht verschuift naar het centrale besluitorgaan en veroorzaakt frictie in teams die invloed inleveren.

### 4. OPPORTUNITY COST
Op dag 0 zonder besluit ontstaat directe executieschade: eigenaarschap blijft diffuus en frictie neemt onmiddellijk toe. Binnen 90 dagen zonder besluit stapelen verliesposten en vertraging zich op. Binnen 365 dagen zonder besluit wordt de strategische keuzevrijheid aantoonbaar kleiner en herstel structureel duurder.

### 5. GOVERNANCE IMPACT
Besluitkracht wordt sterker bij centraal mandaat. Escalatie neemt af bij één beslislijn. Verantwoordelijkheid blijft diffuus zonder harde keuze. Macht wordt tijdelijk gecentraliseerd om uitvoering af te dwingen.

### 6. MACHTSDYNAMIEK & ONDERSTROOM
Informele invloed zit in sleutelrollen die vertraging kunnen organiseren zonder formeel veto. Wie macht verliest zal blokkeren via scope-discussie, uitstel en herprioritering. Verwachte sabotagepatronen zijn vertraagde escalatie en stille heronderhandeling.

### 7. EXECUTIERISICO
Dit mislukt waar oude en nieuwe prioriteiten tegelijk blijven bestaan. Blokkering komt van functies die formeel instemmen en informeel vertragen. Onderstroom remt executie via loyaliteiten en vermijdgedrag. Dit is geen informatieprobleem maar een moedprobleem; geen capaciteitsprobleem maar een machtsprobleem. Adaptieve hardheid: bij stagnatie confronterend, bij transitie klinisch, bij momentum strategisch beheerst.

### 8. 90-DAGEN INTERVENTIEPLAN
Week 1-2: stop conflicterende initiatieven en leg eigenaarschap vast. Week 3-6: herverdeel capaciteit, mandaat en budget naar de gekozen lijn. Week 7-12: stuur op meetbaar effect en sluit blokkades binnen zeven dagen.

### 9. DECISION CONTRACT
De Raad van Bestuur committeert zich aan:
- Keuze A of B: één expliciete strategische keuze.
- Meetbaar resultaat: KPI-verbetering binnen 90 dagen.
- Tijdshorizon: besluit in 14 dagen, executiebewijs in 30 dagen, structureel effect in 365 dagen.
- Verlies dat wordt geaccepteerd: mandaatverlies en stopzetting van niet-prioritaire initiatieven.

Context:
${reportText || safeContext}`;
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
      content: dominantThesis,
    },
    kernconflict: {
      title: "2. Kernconflict",
      content: coreConflict,
    },
    expliciete_tradeoffs: {
      title: "3. Expliciete Trade-offs",
      content: tradeoffs,
    },
    opportunity_cost: {
      title: "4. Opportunity Cost",
      content: opportunityCost,
    },
    governance_impact: {
      title: "5. Governance Impact",
      content: governanceImpact,
    },
    machtsdynamiek_onderstroom: {
      title: "6. Machtsdynamiek & Onderstroom",
      content: powerDynamics,
    },
    executierisico: {
      title: "7. Executierisico",
      content: executionRisk,
    },
    interventieplan_90dagen: {
      title: "8. 90-Dagen Interventieplan",
      content: interventionPlan90D,
    },
    decision_contract: {
      title: "9. Decision Contract",
      content: decisionContract,
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
    raw_markdown: report.raw_markdown,
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
  const [pdfPreflightError, setPdfPreflightError] =
    useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [flowStageIndex, setFlowStageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [clientName, setClientName] = useState("");

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
  const analysisRunning = loading || isBuilding || isPending;

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
              content: executiveReportView.dominantThesis,
            },
            {
              title: "2. Kernconflict",
              content: executiveReportView.coreConflict,
            },
            {
              title: "3. Expliciete Trade-offs",
              content: executiveReportView.tradeoffs,
            },
            {
              title: "4. Opportunity Cost (0 / 90 / 365 dagen)",
              content: executiveReportView.opportunityCost,
            },
            {
              title: "5. Governance Impact",
              content: executiveReportView.governanceImpact,
            },
            {
              title: "6. Machtsdynamiek & Onderstroom",
              content: executiveReportView.powerDynamics,
            },
            {
              title: "7. Executierisico",
              content: executiveReportView.executionRisk,
            },
            {
              title: "8. 90-Dagen Interventieplan",
              content: executiveReportView.interventionPlan90D,
            },
            {
              title: "9. Decision Contract",
              content: executiveReportView.decisionContract,
            },
          ]
        : [],
    [executiveReportView]
  );

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

    setLocalError(null);
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

      setFlowStageIndex(2);
      await Promise.resolve();
      const intelligence = await runCyntraFullPipeline({
        analysis_type: analysisType,
        company_context: safeContext,
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
            company_context: reportText,
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
          throw narrativeError;
        }
        // Fallback narrative blijft leidend wanneer narratiefgeneratie op niet-signature fouten uitvalt.
      }

      const parsedNarrative = safeParseReport(
        narrativeText,
        analysisType
      );

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
      startTransition(() => {
        setReport(enrichDecisionSection(parsedWithPower, power));
        setPowerOutput(power);
        setExecutiveReport(
          buildGuaranteedExecutiveReport({
            report: reportSource,
            power,
            safeContext,
          })
        );
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Analyse mislukt");
      setFlowStageIndex(0);
    } finally {
      setIsBuilding(false);
    }
  };

  /* ================= PDF ================= */

  const printReport = async () => {
    if (!report) return;

    setPdfPreflightError(null);
    setFlowStageIndex(8);
    const pdfReport = toPDFReport(report, executiveReportView);
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
      setFlowStageIndex(0);
      return;
    }

    const { generateAureliusPDF } = await import(
      "../../utils/generateAureliusPDF"
    );

    generateAureliusPDF(
      report.title || "Aurelius Analyse",
      pdfReport,
      clientName || "Onbekende organisatie",
      { confidence: 0.82 }
    );
  };

  /* ================= RESET ================= */

  const reset = () => {
    setContext("");
    setFiles([]);
    setReport(null);
    setExecutiveReport(null);
    setPowerOutput(null);
    setLocalError(null);
    setPdfPreflightError(null);
    setIsBuilding(false);
    setFlowStageIndex(0);
    setClientName("");
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
    <CyntraAnalysisLayout title={analysis.title} subtitle={analysis.subtitle}>
      {report && <Watermark risk="MODERATE" />}

      {(loading || isBuilding) && (
        <div className="mb-8 flex items-center gap-2 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyse wordt opgebouwd in lineaire bestuursflow...
        </div>
      )}

      {(error || localError) && (
        <div className="mb-8 flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error || localError}
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

      {!report ? (
        <>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Naam organisatie"
            className="w-full mb-6 bg-black/40 border border-white/10 p-4 text-white"
          />

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
              className="flex items-center gap-2 text-[#d4af37]"
            >
              <Printer className="h-4 w-4" />
              PDF Download
            </button>
          </div>

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
