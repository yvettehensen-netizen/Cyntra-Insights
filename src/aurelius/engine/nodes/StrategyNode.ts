// src/aurelius/engine/nodes/StrategyNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA-COMPATIBLE
// ✅ MCKINSEY+ (BOARDROOM)
// ✅ BESLUITVORMING > ANALYSE
// ✅ UPGRADE-ONLY
// ✅ GEEN CASTS
// ✅ GEEN WORKAROUNDS
// ✅ VOLLEDIG COMPATIBEL MET JOUW ENGINE

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */
function extractTextFromContext(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.strategy,
    context.userContext?.vision,
    context.userContext?.ambition,
    context.userContext?.market,
    context.userContext?.choices,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   STRATEGY DECISION SIGNAL MODEL (2026)
============================================================ */
interface StrategySignal {
  keywords: string[];
  insight: string;
  risk: string;
  opportunity: string;
  recommendation: string;
  decision_axis:
    | "where_to_play"
    | "how_to_win"
    | "focus"
    | "stop_doing"
    | "growth_logic"
    | "moat";
  weight: number; // 1–5
}

const STRATEGY_SIGNALS_2026: StrategySignal[] = [
  {
    keywords: ["strategie", "strategy", "positionering", "positioning"],
    insight:
      "🎯 POSITIONERING: Strategie wordt expliciet benoemd als richtinggevend concept.",
    risk:
      "Positionering zonder harde keuzes leidt tot middelmatigheid.",
    opportunity:
      "Scherpe positionering vergroot focus, pricing power en executiesnelheid.",
    recommendation:
      "Beslis expliciet: waar speel je wél en waar bewust niet (Playing to Win).",
    decision_axis: "where_to_play",
    weight: 4.3,
  },
  {
    keywords: ["keuze", "keuzes", "keuzeconflict", "tradeoff", "prioriteit"],
    insight:
      "⚖️ STRATEGISCHE KEUZES: Keuzeconflicten worden expliciet benoemd.",
    risk:
      "Zonder stop-doing lijst blijft strategie lek en ambigu.",
    opportunity:
      "Heldere uitsluitingen versnellen besluitvorming en resource-allocatie.",
    recommendation:
      "Formuleer een expliciete stop-doing lijst naast je strategische focus.",
    decision_axis: "stop_doing",
    weight: 4.8,
  },
  {
    keywords: ["focus", "kern", "simpel", "concentratie"],
    insight:
      "🎯 FOCUSDISCIPLINE: Bewustzijn van focus als strategische hefboom.",
    risk:
      "Te veel strategische initiatieven verdunnen impact structureel.",
    opportunity:
      "Radicale focus verhoogt executiekracht disproportioneel.",
    recommendation:
      "Beperk strategie tot maximaal twee dominante doorbraakkeuzes.",
    decision_axis: "focus",
    weight: 5,
  },
  {
    keywords: ["groei", "growth", "schaal", "scale", "expansie"],
    insight:
      "📈 GROEILOGICA: Ambitie voor groei is aanwezig.",
    risk:
      "Groei zonder bewezen kernmodel vergroot faalrisico exponentieel.",
    opportunity:
      "Gefaseerde groei verhoogt kapitaalefficiëntie en slagingskans.",
    recommendation:
      "Beslis expliciet: valideren, schalen of verdedigen — niet alles tegelijk.",
    decision_axis: "growth_logic",
    weight: 4.2,
  },
  {
    keywords: ["voordeel", "moat", "onderscheid", "unique", "concurrentievoordeel"],
    insight:
      "🛡️ CONCURRENTIEVOORDEEL: Nadenken over verdedigbaar voordeel is zichtbaar.",
    risk:
      "Zonder moat ontstaat structurele prijs- en margedruk.",
    opportunity:
      "Een duidelijke moat versterkt groei, marge en onderhandelingspositie.",
    recommendation:
      "Identificeer één primair voordeel dat moeilijk te kopiëren is.",
    decision_axis: "moat",
    weight: 4.4,
  },
];

/* ============================================================
   STRATEGY DECISION FRAMEWORKS (BOARDROOM)
============================================================ */
const STRATEGY_FRAMEWORKS_2026 = [
  "Playing to Win (Where to play / How to win)",
  "Explicit Keuzeconflicten & Stop-Doing Lists",
  "Strategic Focus as Constraint",
  "Phased Growth Logic (Validate → Scale → Defend)",
  "Moat-Centric Strategy Design",
  "Strategy as Decision System",
];

/* ============================================================
   STRATEGY NODE — DECISION-FIRST
============================================================ */
export class StrategyNode {
  public readonly name = "Strategy & Strategic Decisions";
  public readonly confidence = 0.95; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "🧠 BOARDROOM-REALITEIT: Strategie is geen visie — het is een reeks expliciete keuzes die nee zeggen afdwingen.",
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractTextFromContext(context);

    /* ---------- Geen expliciete strategie = besluitvacuum ---------- */
    if (!text) {
      risks.push(
        "Strategie is impliciet → organisatie compenseert met extra effort en ruis."
      );
      recommendations.push(
        "Maak strategische keuzes expliciet: focus, uitsluitingen en groeilogica."
      );

      return {
        model: "StrategyDecision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          decision_clarity: "low",
          strategy_mode: "implicit",
          upgrade_policy: "only",
        },
      };
    }

    let decisionWeight = 0;
    const decisionAxes: Record<string, number> = {};

    for (const signal of STRATEGY_SIGNALS_2026) {
      if (signal.keywords.some(kw => text.includes(kw))) {
        insights.push(signal.insight);
        risks.push(signal.risk);
        opportunities.push(signal.opportunity);
        recommendations.push(signal.recommendation);

        decisionAxes[signal.decision_axis] =
          (decisionAxes[signal.decision_axis] ?? 0) + 1;

        decisionWeight += signal.weight;
      }
    }

    insights.push(
      "📐 STRATEGISCHE BESLUITKADERS (BOARDROOM):",
      ...STRATEGY_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Leg strategische keuzes vast als **besluitset**, niet als document."
    );
    recommendations.push(
      "Koppel elke strategische keuze aan expliciet mandaat om nee te zeggen."
    );

    return {
      model: "StrategyDecision",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        decision_axes: decisionAxes,
        dominant_axis: Object.entries(decisionAxes).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0],
        strategy_quality:
          decisionWeight >= 14
            ? "sharp"
            : decisionWeight >= 8
            ? "emerging"
            : "diffuse",
        decision_intensity: decisionWeight,
        governance_required: true,
        upgrade_policy: "only",
      },
    };
  }
}
