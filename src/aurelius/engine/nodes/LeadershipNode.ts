// src/aurelius/engine/nodes/LeadershipNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA TYPES
// ✅ STRICT TS / exactOptionalPropertyTypes SAFE
// ✅ McKinsey+
// ✅ ADD-ONLY / NO DOWNGRADE

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
  readonly domain?: "leadership";
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
    (context?.userContext as any)?.leadership,
    (context?.userContext as any)?.decisionMaking,
    (context?.userContext as any)?.team,
    (context?.userContext as any)?.culture,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) {
      return p.toLowerCase();
    }
  }
  return "";
}

/* ============================================================
   LEADERSHIP SIGNAL ENGINE (2026+)
============================================================ */

interface LeadershipRule {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
}

const LEADERSHIP_SIGNALS_2026: LeadershipRule[] = [
  {
    keywords: [
      "leiderschap",
      "leadership",
      "eigenaarschap",
      "ownership",
      "accountability",
    ],
    insight:
      "👑 LEADERSHIP FOUNDATION: Eigenaarschap en verantwoordelijkheid zijn expliciet aanwezig.",
    opportunity:
      "Sterk eigenaarschap versnelt executie en verhoogt voorspelbaarheid.",
    recommendation:
      "Hanteer één expliciete eindverantwoordelijke per strategisch initiatief.",
  },
  {
    keywords: [
      "besluitvorming",
      "decision",
      "snel beslissen",
      "decision velocity",
    ],
    insight:
      "⚡ DECISION VELOCITY: Besluitvorming wordt erkend als strategische hefboom.",
    opportunity:
      "Snellere besluitcycli creëren structureel concurrentievoordeel.",
    recommendation:
      "Installeer vaste besluitcadans: wekelijks tactisch, maandelijks strategisch.",
  },
  {
    keywords: [
      "vertrouwen",
      "psychologische veiligheid",
      "open feedback",
      "speak up",
    ],
    insight:
      "🤝 PSYCHOLOGISCHE VEILIGHEID: Openheid en vertrouwen zijn zichtbaar aanwezig.",
    opportunity:
      "Hoge veiligheid leidt tot betere besluiten en snellere correcties.",
    recommendation:
      "Borg speak-up gedrag via voorbeeldgedrag van leiders.",
  },
  {
    keywords: ["micromanagement", "alles zelf", "controle"],
    risk:
      "⚠️ CONTROLEVAL: Oversturing onderdrukt eigenaarschap en snelheid.",
    opportunity:
      "Loslaten vergroot schaalbaarheid en leiderschapskracht.",
    recommendation:
      "Stuur op context, kaders en outcomes — niet op activiteiten.",
  },
  {
    keywords: ["conflict vermijden", "harmonie", "geen discussie"],
    risk:
      "⚠️ CONFLICT-ARMOEDE: Gebrek aan scherp debat verzwakt besluitkwaliteit.",
    opportunity:
      "Productief conflict verhoogt strategische scherpte.",
    recommendation:
      "Normaliseer constructieve tegenspraak in besluitvorming.",
  },
];

/* ============================================================
   LEADERSHIP NODE — MAXIMAL / ENGINE-SAFE
============================================================ */

export class LeadershipNode implements ExpertNode {
  public readonly name = "Leadership & Decision Effectiveness";
  public readonly confidence = 0.91;

  /* ---- engine metadata ---- */
  public readonly id = "leadership_decision_effectiveness";
  public readonly domain: "leadership" = "leadership";
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
        model: "Leadership",
        insights: [
          "👑 LEIDERSCHAPSKANS: Geen expliciete leiderschapsinput → maximale ontwerpruimte.",
        ],
        risks: [
          "Onduidelijk eigenaarschap vertraagt besluitvorming en executie.",
        ],
        opportunities: [
          "Versterking van besluitkracht en accountability heeft directe impact.",
        ],
        recommendations: [
          "Maak eigenaarschap, besluitrechten en besluitcadans expliciet op leiderschapsniveau.",
        ],
        confidence: this.confidence,
        metadata: {
          leadership_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    /* ---------- signal detection ---------- */
    for (const rule of LEADERSHIP_SIGNALS_2026) {
      if (rule.keywords.some((k) => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);
      }
    }

    insights.push(
      "\n📐 LEIDERSCHAPSKADERS (2026+):",
      "  • Decision Velocity & High-Velocity Decision Making",
      "  • Extreme Ownership & Decentralized Command",
      "  • Psychological Safety × Accountability",
      "  • Outcome-based Leadership",
      "  • Adaptive Leadership under Uncertainty"
    );

    if (risks.length === 0) {
      risks.push(
        "Gebrek aan expliciete besluitstructuur kan executiekracht beperken."
      );
    }

    return {
      model: "Leadership",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        leadership_maturity: insights.length > 4 ? "advanced" : "developing",
        dominant_logic: "ownership → decisions → execution",
        downgrade_policy: "disabled",
      },
    };
  }
}
