// src/aurelius/engine/nodes/GrowthNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA TYPES
// ✅ STRICT TS / exactOptionalPropertyTypes SAFE
// ✅ McKinsey+ inhoud
// ✅ ADD-ONLY / NO DOWNGRADE

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
  readonly domain?: "growth";
  readonly weight?: 1 | 2 | 3 | 4 | 5;
  readonly decision_relevant?: boolean;
  readonly policy?: {
    no_downgrade?: boolean;
    version?: string;
    upgrade_policy?: "add_only" | "locked";
  };
}

/* ============================================================
   CONTEXT EXTRACTION (SAFE)
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context?.rawText,
    context?.documents?.join(" "),
    (context?.userContext as any)?.growth,
    (context?.userContext as any)?.scaling,
    (context?.userContext as any)?.expansion,
    (context?.userContext as any)?.revenue,
    (context?.userContext as any)?.customers,
    (context?.userContext as any)?.strategy,
    (context?.userContext as any)?.pricing,
    (context?.userContext as any)?.distribution,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   GROWTH SIGNAL ENGINE (2026+)
============================================================ */

interface GrowthRule {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
}

const GROWTH_SIGNALS_2026: GrowthRule[] = [
  {
    keywords: ["groei", "growth", "opschalen", "scale", "expansie"],
    insight:
      "📈 GROEIAMBITIE: Expliciete intentie om waardecreatie te versnellen.",
    risk:
      "Ongefocuste groei verhoogt complexiteit sneller dan economische waarde.",
    opportunity:
      "Bewuste groeikeuzes creëren disproportionele waarde en snelheid.",
    recommendation:
      "Definieer expliciet waar groei wél en waar bewust níet plaatsvindt.",
  },
  {
    keywords: ["product-market fit", "pmf", "traction", "retentie"],
    insight:
      "🎯 PRODUCT–MARKET FIT: Herhaalbare klantwaarde is zichtbaar.",
    risk:
      "Te vroeg schalen vóór stabiele PMF leidt tot kapitaalverlies.",
    opportunity:
      "Na PMF ligt de hefboom in distributie en pricing.",
    recommendation:
      "Bescherm PMF en schaal pas bij bewezen reproduceerbaarheid.",
  },
  {
    keywords: ["pricing", "prijs", "marge", "ltv", "cac"],
    insight:
      "💰 UNIT ECONOMICS: Focus op waarde per klant en margestructuur.",
    risk:
      "Negatieve LTV/CAC ondermijnt schaalbaarheid.",
    opportunity:
      "Value-based pricing is vaak de snelste groeiversneller.",
    recommendation:
      "Optimaliseer pricing vóór volumegroei.",
  },
  {
    keywords: ["kanaal", "marketing", "sales", "distributie", "partners"],
    insight:
      "🚀 GROEIKANALEN: Distributie is expliciet onderdeel van het groeimodel.",
    risk:
      "Te veel kanalen verlaagt focus en verhoogt CAC.",
    opportunity:
      "Eén dominant schaalbaar kanaal versnelt leren en groei.",
    recommendation:
      "Prioriteer één schaalbaar kanaal en bouw daar diepte.",
  },
];

/* ============================================================
   GROWTH FRAMEWORKS (2026)
============================================================ */

const GROWTH_FRAMEWORKS_2026 = [
  "Product–Market Fit → Distribution Fit → Scale Fit",
  "North Star Metric & Growth Loops",
  "Unit Economics–Led Scaling",
  "Focus-before-Scale Doctrine",
  "Growth as System (Product × Distribution × Pricing × Ops)",
] as const;

/* ============================================================
   GROWTH NODE — MAXIMAL / ENGINE-SAFE
============================================================ */

export class GrowthNode implements ExpertNode {
  public readonly name = "Growth & Scalable Value Creation";
  public readonly confidence = 0.93;

  /* ---- engine metadata ---- */
  public readonly id = "growth_scalable_value";
  public readonly domain: "growth" = "growth";
  public readonly weight: 1 | 2 | 3 | 4 | 5 = 5;
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
        model: "Growth",
        insights: [
          "📈 GROEIPOTENTIEEL: Geen expliciete groeistrategie → maximale ontwerpruimte.",
        ],
        risks: [
          "Impliciete groei leidt vaak tot versnippering en inefficiënte schaal.",
        ],
        opportunities: [
          "Een expliciet groeisysteem kan waardecreatie drastisch versnellen.",
        ],
        recommendations: [
          "Ontwerp groei als systeem: segment → waarde → economics → kanaal → schaal.",
        ],
        confidence: this.confidence,
        metadata: {
          growth_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- signal detection ---------- */
    for (const rule of GROWTH_SIGNALS_2026) {
      if (rule.keywords.some((k) => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);
      }
    }

    insights.push(
      "\n📐 GROEI-KADERS (2026+):",
      ...GROWTH_FRAMEWORKS_2026.map((f) => `  • ${f}`)
    );

    if (risks.length === 0) {
      risks.push(
        "Gebrek aan expliciete focus kan leiden tot inefficiënte schaal."
      );
    }

    return {
      model: "Growth",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        growth_readiness: insights.length > 4 ? "high" : "emerging",
        dominant_logic: "focus → economics → distribution → scale",
        downgrade_policy: "disabled",
      },
    };
  }
}
