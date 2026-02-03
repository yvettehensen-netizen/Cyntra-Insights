// src/aurelius/engine/nodes/OpportunityDecisionNode.ts
// ✅ BESLUITVORMING I.P.V. IDEEËN
// ✅ BOARDROOM-READY
// ✅ ASYMMETRISCHE HEFBOOM
// ✅ GEEN ROADMAP / GEEN PLANNING
// ✅ ADD-ONLY – NO DOWNGRADES

import type { AnalysisContext } from "../types";

/* ============================================================
   CORE CONTRACTS
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<NodeResult>;
}

export interface NodeResult {
  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.strategy,
    context.userContext?.market,
    context.userContext?.growth,
    context.userContext?.innovation,
    context.userContext?.priorities,
    context.userContext?.choices,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   OPPORTUNITY → DECISION SIGNALS (2026)
============================================================ */

interface OpportunityDecisionSignal {
  keywords: string[];
  insight?: string;
  opportunity?: string;
  risk?: string;
  recommendation?: string;
  leverage: "low" | "medium" | "high" | "asymmetric";
}

const OPPORTUNITY_DECISION_SIGNALS_2026: OpportunityDecisionSignal[] = [
  {
    keywords: ["white space", "marktgat", "onderschat", "onbediend"],
    insight:
      "🧠 ONBENUT DOMEIN: Er is een kans die niet structureel wordt geadresseerd.",
    opportunity:
      "Asymmetrische upside mogelijk door vroege, gerichte keuze.",
    risk:
      "Niet kiezen leidt tot blijvende strategische vaagheid.",
    recommendation:
      "Neem expliciet besluit: exploiteren of bewust laten liggen.",
    leverage: "asymmetric",
  },
  {
    keywords: ["ai", "data", "automatisering", "digitalisering"],
    insight:
      "🤖 TECHNOLOGISCHE HEFBOOM: Technologie wordt genoemd als versneller.",
    opportunity:
      "Exponentiële schaal mogelijk mits scherpe scope-keuze.",
    risk:
      "Zonder focus verzandt AI in experimenten zonder rendement.",
    recommendation:
      "Beslis welk probleem AI oplost — en welke expliciet niet.",
    leverage: "asymmetric",
  },
  {
    keywords: ["klantpijn", "ontevreden", "frictie", "klachten"],
    insight:
      "🎯 KLANTFRICTIE ALS SIGNAAL: Pijn wijst op directe waardehefboom.",
    opportunity:
      "Oplossen top-1 frictie creëert disproportionele loyaliteit.",
    risk:
      "Niet kiezen leidt tot symptoombestrijding i.p.v. structurele winst.",
    recommendation:
      "Maak expliciete keuze: frictie oplossen of accepteren.",
    leverage: "high",
  },
  {
    keywords: ["efficiëntie", "kosten", "inefficiënt", "verspilling"],
    insight:
      "⚙️ INTERNE HEFBOOM: Waarde zit niet in groei maar in vrijspelen.",
    opportunity:
      "Besluit op efficiency levert directe marge-impact.",
    risk:
      "Optimaliseren zonder strategische keuze levert lokale winst, geen systeemwinst.",
    recommendation:
      "Beslis welke inefficiëntie strategisch relevant is — rest negeren.",
    leverage: "high",
  },
  {
    keywords: ["partner", "ecosysteem", "samenwerking"],
    insight:
      "🤝 EXTERNE HEFBOOM: Samenwerking kan snelheid en risico beïnvloeden.",
    opportunity:
      "Besluit tot partnership kan time-to-impact drastisch verkorten.",
    risk:
      "Samenwerkingen zonder heldere keuze creëren afhankelijkheid.",
    recommendation:
      "Beslis: bouwen, kopen, partneren — één dominante route.",
    leverage: "medium",
  },
];

/* ============================================================
   OPPORTUNITY BESLUITKADERS (BOARDROOM)
============================================================ */

const OPPORTUNITY_DECISION_FRAMEWORKS_2026 = [
  "Asymmetric Upside vs. Controlled Downside",
  "Explicit Yes / Explicit No Doctrine",
  "Opportunity Cost over Idea Volume",
  "Strategic Focus through Subtraction",
  "Choice as the Ultimate Strategy Lever",
];

/* ============================================================
   OPPORTUNITY DECISION NODE
============================================================ */

export class OpportunityDecisionNode implements ExpertNode {
  public readonly name = "Opportunity Decision & Strategic Leverage";
  public readonly confidence = 0.94; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<NodeResult> {
    const insights: string[] = [
      "🚀 STRATEGISCHE REALITEIT: Kansen creëren geen waarde — keuzes doen dat.",
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractRelevantText(context);

    /* ---------- Geen expliciete input = keuzeprobleem ---------- */
    if (!text) {
      risks.push(
        "Zonder expliciete keuzes worden kansen impliciet verdeeld over te veel richtingen."
      );
      recommendations.push(
        "Forceer expliciete selectie: welke 2 kansen verdienen besluitkracht — welke niet."
      );

      return {
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          decision_clarity: "low",
          opportunity_mode: "implicit",
          downgrade_policy: "disabled",
        },
      };
    }

    let asymmetricCount = 0;

    for (const signal of OPPORTUNITY_DECISION_SIGNALS_2026) {
      if (signal.keywords.some(k => text.includes(k))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.risk) risks.push(signal.risk);
        if (signal.recommendation) recommendations.push(signal.recommendation);
        if (signal.leverage === "asymmetric") asymmetricCount++;
      }
    }

    insights.push(
      "📐 OPPORTUNITY-BESLUITKADERS (BOARDROOM):",
      ...OPPORTUNITY_DECISION_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Maak één expliciete **NO-lijst**: kansen die bewust niet worden opgepakt."
    );
    recommendations.push(
      "Koppel elke gekozen kans aan één eigenaar met beslissingsmandaat."
    );

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        opportunity_decision_mode: "explicit",
        asymmetric_opportunities_detected: asymmetricCount > 0,
        decision_quality: asymmetricCount > 0 ? "high" : "medium",
        downgrade_policy: "disabled",
      },
    };
  }
}
