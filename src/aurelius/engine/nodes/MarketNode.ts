// src/aurelius/engine/nodes/MarketNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA TYPES (ModelResult-compatible)
// ✅ STRICT TS / exactOptionalPropertyTypes SAFE
// ✅ McKinsey+
// ✅ ADD-ONLY / NO DOWNGRADES

import type { AnalysisContext, ModelResult } from "../../types";

/* ============================================================
   EXPERT CONTRACT (ENGINE-COMPATIBLE)
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;

  analyze(context: AnalysisContext): Promise<ModelResult>;

  /* ---- optional engine extensions (add-only) ---- */
  readonly id?: string;
  readonly domain?: "market";
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
    (context?.userContext as any)?.market,
    (context?.userContext as any)?.competition,
    (context?.userContext as any)?.industry,
    (context?.userContext as any)?.ecosystem,
    (context?.userContext as any)?.regulation,
    (context?.userContext as any)?.technology,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   MARKET SIGNAL ENGINE (2026+)
============================================================ */

interface MarketRule {
  keywords: string[];
  insight?: string;
  opportunity?: string;
  recommendation?: string;
}

const MARKET_SIGNALS_2026: MarketRule[] = [
  {
    keywords: ["markt", "market", "industrie", "sector"],
    insight:
      "🌍 MARKTSTRUCTUUR: Markt- en industriestructuur is expliciet benoemd.",
    opportunity:
      "Diep marktinzicht maakt asymmetrische positionering en timing mogelijk.",
    recommendation:
      "Ontwikkel een Market Map: spelers, waardecreatie en machtsverhoudingen.",
  },
  {
    keywords: ["concurrent", "competition", "rivaal", "speler", "substituut"],
    insight:
      "⚔️ CONCURRENTIEDYNAMIEK: Concurrenten en alternatieven worden actief overwogen.",
    opportunity:
      "Inzicht in substituten en indirecte concurrentie opent onverwachte groeipaden.",
    recommendation:
      "Analyseer concurrenten op businessmodel, economics en strategische intentie.",
  },
  {
    keywords: ["toetreders", "nieuwe spelers", "startup", "disruptie", "ai"],
    insight:
      "🚪 NIEUWE TOETREDERS: Impact van nieuwe spelers en disruptie wordt herkend.",
    opportunity:
      "Vroege reactie op disruptors creëert duurzaam first-mover voordeel.",
    recommendation:
      "Monitor entry barriers en AI-/low-code versnellers structureel.",
  },
  {
    keywords: ["prijsdruk", "commoditisering", "marge", "race to the bottom"],
    insight:
      "💸 PRIJS- EN MARGEDRUK: Verdienmodel staat onder structurele druk.",
    opportunity:
      "Herpositionering kan ontsnappen aan prijsconcurrentie.",
    recommendation:
      "Verschuif concurrentie van prijs → waarde, context of outcome.",
  },
  {
    keywords: ["platform", "ecosysteem", "partner", "integratie"],
    insight:
      "🧩 ECOSYSTEEMDENKEN: Markt wordt gezien als netwerk i.p.v. lineaire keten.",
    opportunity:
      "Ecosysteemstrategie vergroot schaal, lock-in en defensibility.",
    recommendation:
      "Bepaal expliciet je rol: orchestrator, specialist of infrastructuur.",
  },
  {
    keywords: ["regulering", "wetgeving", "compliance", "policy"],
    insight:
      "⚖️ REGULERING: Wet- en regelgeving beïnvloedt marktstructuur en timing.",
    opportunity:
      "Regelgeving kan toetredingsdrempels verhogen en incumbents beschermen.",
    recommendation:
      "Gebruik regulation-as-advantage in positionering en roadmap.",
  },
];

/* ============================================================
   MARKET FRAMEWORKS (2026+)
============================================================ */

const MARKET_FRAMEWORKS_2026: string[] = [
  "Market Mapping & Power Analysis",
  "Porter Five Forces (contextualized 2026)",
  "Substitution & Category Convergence",
  "Ecosystem & Platform Strategy",
  "Regulation-as-Advantage",
  "AI-Accelerated Market Disruption Lens",
];

/* ============================================================
   MARKET NODE — MAXIMAL / ENGINE-SAFE
============================================================ */

export class MarketNode implements ExpertNode {
  public readonly name = "Market & Competitive Landscape";
  public readonly confidence = 0.91;

  /* ---- engine metadata ---- */
  public readonly id = "market_competitive_landscape";
  public readonly domain: "market" = "market";
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
        model: "Market",
        insights: [
          "🌍 MARKTPOTENTIEEL: Marktcontext is impliciet → grote strategische scherpte mogelijk.",
        ],
        risks: [
          "Zonder expliciete marktdefinitie ontstaat diffuse positionering.",
        ],
        opportunities: [
          "Heldere marktanalyse kan pricing power, focus en timing sterk verbeteren.",
        ],
        recommendations: [
          "Maak markt expliciet: structuur, spelers, substituten en machtsverhoudingen.",
        ],
        confidence: this.confidence,
        metadata: {
          market_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- signal detection ---------- */
    for (const rule of MARKET_SIGNALS_2026) {
      if (rule.keywords.some((k) => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);
      }
    }

    insights.push(
      "📐 MARKTKADERS (2026+):",
      ...MARKET_FRAMEWORKS_2026.map((f) => `• ${f}`)
    );

    if (risks.length === 0) {
      risks.push(
        "Onvoldoende expliciete marktfocus kan leiden tot zwakke positionering en strategische ruis."
      );
    }

    return {
      model: "Market",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        market_maturity: insights.length > 4 ? "high" : "emerging",
        competitive_logic: "structure → power → positioning",
        downgrade_policy: "disabled",
      },
    };
  }
}
