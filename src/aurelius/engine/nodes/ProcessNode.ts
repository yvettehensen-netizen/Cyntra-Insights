// src/aurelius/engine/nodes/ProcessDecisionNode.ts
// ✅ BESLUITVORMING I.P.V. PROCESS IMPROVEMENT
// ✅ BOARDROOM-READY
// ✅ GEEN ROADMAP / GEEN 90-DAGEN
// ✅ UPGRADE-ONLY – NO DOWNGRADES
// ✅ CYNTRA TYPES CONSISTENT

import type { AnalysisContext, ModelResult } from "../../types";

/* ============================================================
   EXPERT CONTRACT
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<ModelResult>;
}

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractTextFromContext(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.process,
    context.userContext?.operations,
    context.userContext?.execution,
    context.userContext?.workflow,
    context.userContext?.automation,
    context.userContext?.scaling,
    context.userContext?.priorities,
    context.userContext?.choices,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   PROCESS → DECISION SIGNALS (2026)
============================================================ */

interface ProcessDecisionSignal {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  decision_axis:
    | "systemize"
    | "simplify"
    | "automate"
    | "accept-friction"
    | "eliminate";
}

const PROCESS_DECISION_SIGNALS_2026: ProcessDecisionSignal[] = [
  {
    keywords: ["proces", "workflow", "flow", "procedure"],
    insight:
      "🔁 PROCES ALS SYSTEEM: Processen worden expliciet benoemd als structurerend element.",
    risk:
      "Zonder expliciete keuze blijft proceskwaliteit afhankelijk van discipline.",
    opportunity:
      "Proces kan worden verheven tot voorspelbaar systeem.",
    recommendation:
      "Beslis welke processen systeemkritisch zijn en welke niet.",
    decision_axis: "systemize",
  },
  {
    keywords: ["handover", "overdracht", "wachttijd", "afstemming"],
    insight:
      "⏳ HANDOVER-DRUK: Overdrachtsmomenten bepalen snelheid en foutkans.",
    risk:
      "Elke extra handover vergroot coördinatielast exponentieel.",
    opportunity:
      "Reduceren of accepteren van frictie vraagt expliciete keuze.",
    recommendation:
      "Beslis: elimineren, vereenvoudigen of bewust accepteren.",
    decision_axis: "simplify",
  },
  {
    keywords: ["automatisering", "ai", "rpa", "low-code", "no-code"],
    insight:
      "🤖 AUTOMATION ALS KEUZE: Technologie wordt genoemd als hefboom.",
    risk:
      "Automatiseren zonder keuze fixeert rommel.",
    opportunity:
      "Gerichte automatisering creëert schaal zonder extra complexiteit.",
    recommendation:
      "Beslis welke processen automatisering verdienen — rest uitsluiten.",
    decision_axis: "automate",
  },
  {
    keywords: ["held", "key person", "afhankelijk", "onmisbaar"],
    insight:
      "🦸 HERO-AFHANKELIJKHEID: Processen leunen op individuen.",
    risk:
      "Hero-dependency is een structureel continuïteitsrisico.",
    opportunity:
      "Keuze voor systematisering verhoogt robuustheid direct.",
    recommendation:
      "Beslis: systematiseren of risico bewust accepteren.",
    decision_axis: "systemize",
  },
  {
    keywords: ["inefficiënt", "verspilling", "rommelig"],
    insight:
      "⚠️ STRUCTURELE ROMMEL: Niet elk proces verdient optimalisatie.",
    risk:
      "Alles willen verbeteren vernietigt focus.",
    opportunity:
      "Selectieve verwaarlozing verhoogt executiekracht elders.",
    recommendation:
      "Beslis welke processen níét geoptimaliseerd worden.",
    decision_axis: "eliminate",
  },
];

/* ============================================================
   PROCESS BESLUITKADERS (BOARDROOM)
============================================================ */

const PROCESS_DECISION_FRAMEWORKS_2026 = [
  "System vs. Discipline Doctrine",
  "Hero → System Decision Rule",
  "Acceptable Friction Threshold",
  "Automation as Strategic Choice",
  "Process Neglect as Focus Strategy",
];

/* ============================================================
   PROCESS DECISION NODE
============================================================ */

export class ProcessDecisionNode implements ExpertNode {
  public readonly name = "Process Decision & Flow Governance";
  public readonly confidence = 0.94; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "🔁 EXECUTIEREALITEIT: Processen leveren geen voordeel door optimalisatie, maar door expliciete keuzes.",
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractTextFromContext(context);

    /* ---------- Geen expliciete input = besluitprobleem ---------- */
    if (!text) {
      risks.push(
        "Processen zijn impliciet → beslissingen worden vervangen door discipline en heldendom."
      );
      recommendations.push(
        "Forceer expliciete keuzes: welke processen zijn systeemkritisch en welke niet."
      );

      return {
        model: "ProcessDecision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          process_decision_clarity: "low",
          downgrade_policy: "disabled",
        },
      };
    }

    const decisionMap: Record<string, number> = {};

    for (const signal of PROCESS_DECISION_SIGNALS_2026) {
      if (signal.keywords.some(k => text.includes(k))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);

        decisionMap[signal.decision_axis] =
          (decisionMap[signal.decision_axis] ?? 0) + 1;
      }
    }

    insights.push(
      "📐 PROCESS-BESLUITKADERS (BOARDROOM):",
      ...PROCESS_DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Maak expliciet onderscheid tussen: **systeemprocessen** en **tolerabele rommel**."
    );
    recommendations.push(
      "Koppel elk systeemproces aan één eigenaar met wijzigingsmandaat."
    );

    return {
      model: "ProcessDecision",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        decision_axes: decisionMap,
        dominant_decision_axis: Object.entries(decisionMap).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0],
        process_governance_mode: "explicit",
        downgrade_policy: "disabled",
      },
    };
  }
}
