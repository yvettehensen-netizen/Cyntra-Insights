// src/aurelius/engine/nodes/DecisionMomentumNode.ts
// ✅ BESLUITVORMINGSNODE (GEEN TIJDSFRAME)
// ✅ BOARDROOM-READY
// ✅ EXECUTION & OWNERSHIP HEAVY
// ✅ CYNTRA / AURELIUS CANON
// ✅ ADD-ONLY — NO DOWNGRADES

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

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.priorities,
    context.userContext?.goals,
    context.userContext?.challenges,
    context.userContext?.execution,
    context.userContext?.decisions,
    context.userContext?.ownership,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   DECISION & MOMENTUM SIGNAL ENGINE (2026)
============================================================ */

interface DecisionSignal {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
}

const DECISION_SIGNALS_2026: DecisionSignal[] = [
  {
    keywords: ["te veel", "overload", "alles tegelijk", "prioriteiten"],
    insight:
      "⚠️ BESLUITVERWATERING: Te veel parallelle initiatieven verlagen besluitkwaliteit.",
    risk:
      "Zonder harde keuzes ontstaat structurele stilstand vermomd als activiteit.",
    recommendation:
      "Beperk besluitagenda tot maximaal 1–2 dominante doorbraakbesluiten.",
  },
  {
    keywords: ["strategie", "visie", "lange termijn"],
    insight:
      "🧠 STRATEGIE AANWEZIG: Richting is helder maar vraagt executieve concretisering.",
    opportunity:
      "Heldere strategische intentie versnelt besluitvorming als keuzes expliciet worden.",
    recommendation:
      "Vertaal strategie naar expliciete besluiten met zichtbare consequenties.",
  },
  {
    keywords: ["besluit", "beslissen", "vertraging", "uitstel"],
    insight:
      "⚡ BESLUITDYNAMIEK: Besluitvorming bepaalt executietempo.",
    risk:
      "Uitgestelde besluiten creëren sluimerende blokkades in de organisatie.",
    recommendation:
      "Hanteer het default-forward principe: beslis → leer → corrigeer.",
  },
  {
    keywords: ["eigenaarschap", "verantwoordelijk", "owner", "mandaat"],
    insight:
      "👤 OWNERSHIP: Aandacht voor eigenaarschap is aanwezig.",
    opportunity:
      "Eenduidig eigenaarschap verhoogt uitvoeringskracht met factor 2–4.",
    recommendation:
      "Ken per besluit één eindverantwoordelijke toe met expliciet mandaat.",
  },
];

/* ============================================================
   DECISION FRAMEWORKS (BOARDROOM CANON)
============================================================ */

const DECISION_FRAMEWORKS_2026 = [
  "Decision Clarity > Planning Detail",
  "Single-Owner Accountability",
  "Default-Forward Decision Rule",
  "Outcome over Activity",
  "Cadence: Decide → Execute → Review",
];

/* ============================================================
   DECISION & MOMENTUM NODE
============================================================ */

export class DecisionMomentumNode implements ExpertNode {
  public readonly name = "Decision Momentum & Execution Discipline";
  public readonly confidence = 0.93; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractRelevantText(context);

    const insights: string[] = [
      "🎯 EXECUTIEVE REALITEIT 2026: Resultaat is een functie van besluitkwaliteit × eigenaarschap × tempo.",
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    /* ---------- No explicit input = opportunity ---------- */
    if (!text) {
      opportunities.push(
        "Expliciete besluitstructuur kan onmiddellijk rust, focus en voortgang creëren."
      );
      recommendations.push(
        "Formuleer één dominant besluit dat nu genomen moet worden — met eigenaar en consequenties."
      );

      return {
        model: "Decision Momentum",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          decision_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- Signal detection ---------- */
    for (const signal of DECISION_SIGNALS_2026) {
      if (signal.keywords.some(k => text.includes(k))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);
      }
    }

    insights.push(
      "📐 BESLUITVORMINGSKADERS (BOARDROOM):",
      ...DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Installeer vast executieritme: besluit → eigenaarschap → voortgangsreview → bijsturing."
    );

    if (risks.length === 0) {
      risks.push(
        "Zonder expliciete besluitdiscipline ontstaat schijnbeweging in plaats van voortgang."
      );
    }

    return {
      model: "Decision Momentum",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        execution_focus: "decision-driven",
        ownership_model: "single-owner",
        downgrade_policy: "disabled",
      },
    };
  }
}
