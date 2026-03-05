// src/aurelius/engine/nodes/MarketingNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA TYPES (ModelResult-compatible)
// ✅ STRICT TS / exactOptionalPropertyTypes SAFE
// ✅ McKinsey+
// ✅ ADD-ONLY / NO DOWNGRADES

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   EXPERT CONTRACT (ENGINE-COMPATIBLE)
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;

  analyze(context: AnalysisContext): Promise<ModelResult>;

  /* ---- optional engine extensions (add-only) ---- */
  readonly id?: string;
  readonly domain?: "marketing";
  readonly weight?: 1 | 2 | 3 | 4 | 5;
  readonly decision_relevant?: boolean;
  readonly policy?: {
    no_downgrade?: boolean;
    version?: string;
    upgrade_policy?: "add_only" | "locked";
  };
}

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context?.rawText,
    context?.documents?.join(" "),
    (context?.userContext as any)?.marketing,
    (context?.userContext as any)?.brand,
    (context?.userContext as any)?.growth,
    (context?.userContext as any)?.customer,
    (context?.userContext as any)?.funnel,
    (context?.userContext as any)?.goToMarket,
    (context?.userContext as any)?.pricing,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   MARKETING SIGNAL ENGINE (2026+)
============================================================ */

interface MarketingRule {
  keywords: string[];
  insight?: string;
  opportunity?: string;
  recommendation?: string;
}

const MARKETING_SIGNALS_2026: MarketingRule[] = [
  {
    keywords: ["positionering", "positioning", "merk", "brand", "propositie"],
    insight:
      "🎯 POSITIONERING: Merk en waardepropositie krijgen expliciete aandacht.",
    opportunity:
      "Scherpe positionering verlaagt CAC structureel en verhoogt conversie over de hele funnel.",
    recommendation:
      "Formuleer één scherp Positioning Statement inclusief Category Entry Points.",
  },
  {
    keywords: ["doelgroep", "persona", "segment", "segmentatie"],
    insight:
      "👥 DOELGROEPFOCUS: Marketing richt zich op duidelijke klantsegmenten.",
    opportunity:
      "Betere segmentatie verhoogt personalisatie, pricing power en LTV.",
    recommendation:
      "Herdefinieer ICP’s op basis van winstgevendheid en strategische fit.",
  },
  {
    keywords: ["funnel", "conversie", "lead", "pipeline", "mql", "sql"],
    insight:
      "🔁 FUNNELDENKEN: Aandacht voor conversie en doorstroom.",
    opportunity:
      "Optimalisatie per funnelstap levert vaak 2–5× ROI.",
    recommendation:
      "Meet full-funnel (awareness → revenue) in plaats van losse kanaalmetrics.",
  },
  {
    keywords: ["cac", "ltv", "roas", "aov", "retentie"],
    insight:
      "📊 UNIT ECONOMICS: Marketing gekoppeld aan business metrics.",
    opportunity:
      "Strikte LTV/CAC-discipline maakt schaalbaar groeien mogelijk.",
    recommendation:
      "Stuur marketing primair op LTV/CAC, payback en cohortretentie.",
  },
  {
    keywords: ["ai", "automatisering", "personalization", "testing"],
    insight:
      "🤖 AI-GEDREVEN MARKETING: Technologie versnelt learning loops.",
    opportunity:
      "AI-gedreven testing en personalisatie versnellen optimalisatie 5–10×.",
    recommendation:
      "Bouw AI-supported create → test → learn loops met duidelijke stopcriteria.",
  },
];

const MARKETING_FRAMEWORKS_2026: string[] = [
  "Category Design & Positioning",
  "ICP 2.0 (Profit-led)",
  "Full-Funnel Growth",
  "LTV/CAC Discipline",
  "Authority-led Demand",
  "AI Experimentation Loops",
];

/* ============================================================
   MARKETING NODE — MAXIMAL / ENGINE-SAFE
============================================================ */

export class MarketingNode implements ExpertNode {
  public readonly name = "Marketing & Demand Strategy";
  public readonly confidence = 0.92;

  /* ---- engine metadata ---- */
  public readonly id = "marketing_demand_strategy";
  public readonly domain: "marketing" = "marketing";
  public readonly weight: 1 | 2 | 3 | 4 | 5 = 4;
  public readonly decision_relevant = true;
  public readonly policy = {
    no_downgrade: true,
    version: "2026.1",
    upgrade_policy: "add_only" as const,
  };

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractRelevantText(context);

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    /* ---------- no explicit input = opportunity ---------- */
    if (!text) {
      return {
        model: "Marketing",
        insights: [
          "📣 MARKETINGPOTENTIEEL: Marketingstrategie is impliciet → grote hefboom aanwezig.",
        ],
        risks: [
          "Zonder expliciete positionering ontstaat kanaal- en budgetversnippering.",
        ],
        opportunities: [
          "Heldere marketingstrategie kan snel vraag, focus en schaalbaarheid creëren.",
        ],
        recommendations: [
          "Definieer doelgroep, positionering, funnel en succesmetrics expliciet.",
        ],
        confidence: this.confidence,
        metadata: {
          marketing_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- signal detection ---------- */
    for (const rule of MARKETING_SIGNALS_2026) {
      if (rule.keywords.some((k) => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);
      }
    }

    insights.push(
      "📐 MARKETINGKADERS (2026+):",
      ...MARKETING_FRAMEWORKS_2026.map((f) => `• ${f}`)
    );

    if (risks.length === 0) {
      risks.push(
        "Onvoldoende focus in marketingkeuzes kan leiden tot hoge CAC en lage voorspelbaarheid."
      );
    }

    return {
      model: "Marketing",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        marketing_maturity: insights.length > 4 ? "high" : "emerging",
        growth_logic: "positioning → demand → conversion → retention",
        downgrade_policy: "disabled",
      },
    };
  }
}
