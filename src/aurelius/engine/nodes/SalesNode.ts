// src/aurelius/engine/nodes/SalesDecisionNode.ts
// ✅ SALES → BESLUITVORMING
// ✅ BOARDROOM-LEVEL
// ✅ GEEN PIPELINE-OPTIMALISATIE
// ✅ GEEN 90-DAGEN-TAAL
// ✅ UPGRADE-ONLY (NO DOWNGRADES)
// ✅ CYNTRA TYPES CONSISTENT

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractTextFromContext(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.sales,
    context.userContext?.revenue,
    context.userContext?.pricing,
    context.userContext?.customers,
    context.userContext?.positioning,
    context.userContext?.goToMarket,
    context.userContext?.choices,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   SALES → DECISION SIGNALS (2026)
============================================================ */

interface SalesDecisionSignal {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  decision_axis:
    | "focus"
    | "stop"
    | "price_up"
    | "price_down"
    | "reposition"
    | "standardize"
    | "customize";
  category:
    | "customers"
    | "pricing"
    | "positioning"
    | "sales_motion"
    | "scalability";
  weight: number; // 1–5
}

const SALES_DECISION_SIGNALS_2026: SalesDecisionSignal[] = [
  {
    keywords: ["pipeline", "veel leads", "druk", "alles kan"],
    insight:
      "📊 SALES-SPANNING: Breed jagen zonder duidelijke keuzes.",
    risk:
      "Verkoop zonder focus leidt tot lage marge en lange cycli.",
    opportunity:
      "Scherpe focus vergroot winrate en pricing power direct.",
    recommendation:
      "Beslis expliciet welke klanten en deals je **niet** meer nastreeft.",
    decision_axis: "stop",
    category: "customers",
    weight: 4.2,
  },
  {
    keywords: ["pricing", "korting", "discount", "onderhandelen"],
    insight:
      "💸 PRICING-REALITEIT: Prijsdruk wordt geaccepteerd als normaal.",
    risk:
      "Structurele korting wijst op zwakke positionering.",
    opportunity:
      "Prijsverhoging bij juiste focus verhoogt marge disproportioneel.",
    recommendation:
      "Beslis of je op **waarde** of **volume** wilt winnen — niet beide.",
    decision_axis: "price_up",
    category: "pricing",
    weight: 4.6,
  },
  {
    keywords: ["positionering", "propositie", "onderscheid"],
    insight:
      "🧭 POSITIONERING: Sales is gekoppeld aan een expliciete waardepropositie.",
    risk:
      "Onduidelijke positionering dwingt sales tot overtuigen i.p.v. selecteren.",
    opportunity:
      "Scherpe positionering laat klanten zichzelf kwalificeren.",
    recommendation:
      "Beslis welk probleem je oplost — en welke expliciet niet.",
    decision_axis: "reposition",
    category: "positioning",
    weight: 4,
  },
  {
    keywords: ["salesproces", "crm", "cadence", "follow-up"],
    insight:
      "🔁 SALES MOTION: Proces en opvolging zijn onderwerp van aandacht.",
    risk:
      "Proces zonder keuze verbergt structurele zwakte.",
    opportunity:
      "Eén dominante sales motion vergroot herhaalbaarheid.",
    recommendation:
      "Beslis op één primaire sales motion (bijv. founder-led of consultative).",
    decision_axis: "standardize",
    category: "sales_motion",
    weight: 3.8,
  },
  {
    keywords: ["opschalen", "team", "sales reps", "quota"],
    insight:
      "📈 SALES-SCHAALAMBIE: Groei van salesfunctie wordt overwogen.",
    risk:
      "Schalen vóór duidelijke keuzes vernietigt marge en focus.",
    opportunity:
      "Eerst keuzes, dan mensen = schaal met discipline.",
    recommendation:
      "Beslis of schaal nú logisch is, of eerst focus & bewijs nodig is.",
    decision_axis: "focus",
    category: "scalability",
    weight: 4.1,
  },
];

/* ============================================================
   SALES BESLUITKADERS (BOARDROOM)
============================================================ */

const SALES_DECISION_FRAMEWORKS_2026 = [
  "Sales as Choice Architecture",
  "Ideal Customer Profile (Exclusion-first)",
  "Value vs Volume Trade-off",
  "One Primary Sales Motion Doctrine",
  "Pricing as Strategic Signal",
];

/* ============================================================
   SALES DECISION NODE
============================================================ */

export class SalesDecisionNode {
  public readonly name = "Sales Decision & Revenue Focus";
  public readonly confidence = 0.94; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "💰 BOARDROOM-WAARHEID: Salesproblemen zijn zelden vaardigheidsproblemen — het zijn besluitproblemen."
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractTextFromContext(context);

    /* ---------- Geen expliciete input = besluitvacuum ---------- */
    if (!text) {
      risks.push(
        "Saleskeuzes zijn impliciet → team compenseert met korting en extra effort."
      );
      recommendations.push(
        "Maak salesbesluiten expliciet: doelgroep, waarde, prijs en uitsluitingen."
      );

      return {
        model: "SalesDecision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          sales_decision_clarity: "low",
          downgrade_policy: "disabled",
        },
      };
    }

    const decisionMap: Record<string, number> = {};
    const categories = new Set<string>();
    let decisionWeight = 0;

    for (const signal of SALES_DECISION_SIGNALS_2026) {
      if (signal.keywords.some(kw => text.includes(kw))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);

        decisionMap[signal.decision_axis] =
          (decisionMap[signal.decision_axis] ?? 0) + 1;

        categories.add(signal.category);
        decisionWeight += signal.weight;
      }
    }

    insights.push(
      "📐 SALES-BESLUITKADERS (BOARDROOM):",
      ...SALES_DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Maak **expliciete stop-besluiten**: welke klanten, deals en kortingen accepteren we niet meer."
    );
    recommendations.push(
      "Koppel elke saleskeuze aan één eigenaar met mandaat om nee te zeggen."
    );

    return {
      model: "SalesDecision",
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
        dominant_categories: Array.from(categories),
        decision_intensity: decisionWeight,
        sales_posture:
          decisionWeight >= 10
            ? "focused"
            : decisionWeight >= 6
            ? "diffuse"
            : "implicit",
        governance_required: true,
        downgrade_policy: "disabled",
      },
    };
  }
}
