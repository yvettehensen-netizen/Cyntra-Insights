// src/aurelius/engine/nodes/SWOTNode.ts
// ✅ FOUTLOOS
// ✅ CYNTRA STANDARD (ModelResult / AnalysisContext)
// ✅ BOARDROOM / McKINSEY+
// ✅ BESLUITVORMINGS-GEDREVEN (GEEN INVENTARIS)
// ✅ UPGRADE-ONLY
// ✅ GEEN CASTS / GEEN WORKAROUNDS

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */
function extractText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.strategy,
    context.userContext?.market,
    context.userContext?.competition,
    context.userContext?.internal,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   SWOT DECISION SIGNAL MODEL (2026)
============================================================ */
type SWOTQuadrant = "strength" | "weakness" | "opportunity" | "threat";

interface SWOTSignal {
  keywords: string[];
  quadrant: SWOTQuadrant;
  insight: string;
  implication: string;
  recommendation: string;
  weight: number; // 1–5
}

const SWOT_SIGNALS_2026: SWOTSignal[] = [
  {
    keywords: ["onderscheid", "moat", "voordeel", "unique", "sterk", "kracht"],
    quadrant: "strength",
    insight: "💪 STERKTE: Onderscheidend vermogen is expliciet aanwezig.",
    implication: "Dit is het domein waar versnelling rationeel én wenselijk is.",
    recommendation:
      "Forceer focus: investeer uitsluitend rond deze kernsterkte.",
    weight: 4.8,
  },
  {
    keywords: ["team", "expertise", "knowhow", "talent", "ervaring"],
    quadrant: "strength",
    insight: "🧠 STERKTE: Menselijk kapitaal fungeert als strategische asset.",
    implication: "Sterk team vergroot executiesnelheid en adaptiviteit.",
    recommendation:
      "Bescherm talentfocus en voorkom strategische versnippering.",
    weight: 4.2,
  },
  {
    keywords: ["afhankelijk", "handmatig", "chaos", "inefficiënt", "onduidelijk"],
    quadrant: "weakness",
    insight: "⚠️ ZWAKTE: Interne frictie of afhankelijkheid belemmert schaal.",
    implication: "Deze zwakte wordt existentieel bij groei.",
    recommendation:
      "Elimineer of isoleer deze zwakte vóór verdere opschaling.",
    weight: 5,
  },
  {
    keywords: ["gebrek", "tekort", "weinig", "geen focus", "versnipperd"],
    quadrant: "weakness",
    insight: "🧱 ZWAKTE: Gebrek aan focus en samenhang.",
    implication: "Versnippering ondermijnt elke strategische keuze.",
    recommendation:
      "Dwing een expliciete stop-doing lijst af op besluitniveau.",
    weight: 4.7,
  },
  {
    keywords: ["groei", "kans", "markt", "trend", "versnellen"],
    quadrant: "opportunity",
    insight: "🚀 KANS: Externe groeimogelijkheden zijn zichtbaar.",
    implication: "Niet elke kans is strategisch relevant.",
    recommendation:
      "Selecteer maximaal twee kansen die direct aansluiten op sterktes.",
    weight: 4.5,
  },
  {
    keywords: ["ai", "automatisering", "digitalisering", "efficiency"],
    quadrant: "opportunity",
    insight: "🤖 KANS: Technologie kan strategische hefboom zijn.",
    implication: "Tech versterkt alleen wanneer het strategie volgt.",
    recommendation:
      "Gebruik technologie uitsluitend om kernstrategie te versnellen.",
    weight: 4.1,
  },
  {
    keywords: ["concurrent", "druk", "prijs", "commoditisering"],
    quadrant: "threat",
    insight: "⚔️ BEDREIGING: Concurrentie- en prijsdruk nemen toe.",
    implication: "Zonder onderscheid volgt structurele marge-erosie.",
    recommendation:
      "Versterk differentiatie of verlaat het speelveld.",
    weight: 4.9,
  },
  {
    keywords: ["risico", "onzeker", "instabiel", "afhankelijkheid"],
    quadrant: "threat",
    insight: "🌪️ BEDREIGING: Structurele onzekerheden aanwezig.",
    implication: "Genegeerde bedreigingen escaleren tot strategische crises.",
    recommendation:
      "Maak bedreigingen expliciet en koppel ze aan besluitverantwoordelijkheid.",
    weight: 4.6,
  },
];

/* ============================================================
   SWOT NODE — STRATEGIC REALITY CHECK
============================================================ */
export class SWOTNode {
  public readonly name = "SWOT & Strategic Decision Filter";
  public readonly confidence = 0.94; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "🧠 BOARDROOM-REALITEIT: SWOT heeft alleen waarde als het keuzes forceert."
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractText(context);

    if (!text) {
      opportunities.push(
        "Een expliciete SWOT kan strategische focus en besluitkracht afdwingen."
      );
      recommendations.push(
        "Gebruik SWOT als beslisfilter: wat versterken we, wat stoppen we?"
      );

      return {
        model: "SWOTDecision",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          swot_detected: false,
          decision_quality: "unknown",
          upgrade_policy: "only",
        },
      };
    }

    let strength = 0;
    let weakness = 0;
    let opportunityScore = 0;
    let threat = 0;

    for (const s of SWOT_SIGNALS_2026) {
      if (s.keywords.some(kw => text.includes(kw))) {
        insights.push(s.insight);
        recommendations.push(s.recommendation);

        if (s.quadrant === "strength") strength += s.weight;
        if (s.quadrant === "weakness") {
          weakness += s.weight;
          risks.push(s.implication);
        }
        if (s.quadrant === "opportunity") {
          opportunityScore += s.weight;
          opportunities.push(s.implication);
        }
        if (s.quadrant === "threat") {
          threat += s.weight;
          risks.push(s.implication);
        }
      }
    }

    recommendations.push(
      "Neem expliciete besluiten: versnel op sterkte, elimineer grootste zwakte, adresseer top-bedreiging."
    );

    return {
      model: "SWOTDecision",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        swot_detected: true,
        balance: {
          strength,
          weakness,
          opportunity: opportunityScore,
          threat,
        },
        dominant_decision_logic:
          weakness + threat > strength
            ? "stabilize_and_focus"
            : "accelerate_on_strength",
        decision_pressure:
          threat + weakness >= 9 ? "high" : "manageable",
        upgrade_policy: "only",
      },
    };
  }
}
