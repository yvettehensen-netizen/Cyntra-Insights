// src/aurelius/engine/nodes/UnderstreamNode.ts
// ✅ FOUTLOOS
// ✅ ZELFDE STRUCTUUR ALS ALLE ANDERE NODES
// ✅ GEBRUIKT AnalysisContext + ModelResult
// ✅ BOARDROOM / McKINSEY+
// ✅ BESLUITVORMINGS- & EXECUTIEGEDREVEN
// ✅ UPGRADE-ONLY (GEEN DOWNGRADES)

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   CONTEXT EXTRACTION (ONDERSTROOM – STRICT & SAFE)
============================================================ */
function extractText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.culture,
    context.userContext?.behavior,
    context.userContext?.dynamics,
    context.userContext?.tensions,
    context.userContext?.leadership,
    context.userContext?.trust,
    context.userContext?.conflict,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p.toLowerCase();
  }
  return "";
}

/* ============================================================
   UNDERSTREAM DECISION SIGNAL MODEL (2026)
============================================================ */
interface UnderstreamSignal {
  keywords: string[];
  insight: string;
  risk?: string;
  opportunity?: string;
  recommendation: string;
  dimension:
    | "trust"
    | "conflict"
    | "alignment"
    | "power"
    | "psychological_safety"
    | "avoidance";
  weight: number; // 1–5
}

const UNDERSTREAM_SIGNALS_2026: UnderstreamSignal[] = [
  {
    keywords: ["vertrouwen", "trust", "veilig"],
    insight:
      "🤝 ONDERSTROOM: Vertrouwen en psychologische veiligheid zijn expliciet aanwezig.",
    opportunity:
      "Hoge veiligheid verhoogt besluitkwaliteit, eigenaarschap en snelheid.",
    recommendation:
      "Veranker psychologische veiligheid als expliciet leiderschapscriterium.",
    dimension: "trust",
    weight: 4.6,
  },
  {
    keywords: ["conflict", "spanning", "meningsverschil", "wrijving"],
    insight:
      "⚡ ONDERSTROOM: Spanningen of conflicten zijn voelbaar aanwezig.",
    risk:
      "Onderdrukte conflicten blokkeren besluitvorming en verantwoordelijkheid.",
    opportunity:
      "Productief conflict verhoogt strategische scherpte en kwaliteit.",
    recommendation:
      "Normaliseer inhoudelijk conflict en maak het expliciet onderdeel van besluitvorming.",
    dimension: "conflict",
    weight: 4.9,
  },
  {
    keywords: ["alignment", "eens", "gezamenlijk", "richting"],
    insight:
      "🧭 ONDERSTROOM: Alignment wordt benoemd of impliciet verondersteld.",
    risk:
      "Schijn-alignment maskeert fundamentele verschillen in aannames.",
    opportunity:
      "Echte alignment versnelt executie exponentieel.",
    recommendation:
      "Toets alignment expliciet: waar zijn we het *oneens* over?",
    dimension: "alignment",
    weight: 4.2,
  },
  {
    keywords: ["macht", "politiek", "invloed", "dominant"],
    insight:
      "🏛️ ONDERSTROOM: Informele macht en invloed spelen een rol.",
    risk:
      "Onzichtbare macht ondermijnt formele besluitstructuren.",
    opportunity:
      "Heldere besluitrechten verminderen politieke frictie.",
    recommendation:
      "Maak informele macht zichtbaar en herijk besluitmandaten.",
    dimension: "power",
    weight: 4.7,
  },
  {
    keywords: ["vermijden", "niet benoemen", "stil", "onder tafel"],
    insight:
      "🙈 ONDERSTROOM: Vermijding van lastige of gevoelige thema’s.",
    risk:
      "Vermijding leidt tot sluimerende blokkades en vertraagde beslissingen.",
    opportunity:
      "Het benoemen van het onbespreekbare ontgrendelt beweging.",
    recommendation:
      "Introduceer vaste besluitmomenten voor ‘spanningen op tafel’.",
    dimension: "avoidance",
    weight: 4.8,
  },
];

/* ============================================================
   UNDERSTREAM FRAMEWORKS (ALTIJD TONEN)
============================================================ */
const UNDERSTREAM_FRAMEWORKS_2026 = [
  "Psychological Safety × Accountability",
  "Productive Conflict Model",
  "Power & Influence Mapping",
  "Alignment vs. Compliance Lens",
  "Undiscussables → Strategic Unlocks",
] as const;

/* ============================================================
   UNDERSTREAM NODE (CANON)
============================================================ */
export class UnderstreamNode {
  public readonly name = "Understream & Organizational Dynamics";
  public readonly confidence = 0.93; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const insights: string[] = [
      "🌊 ONDERSTROOM REALITEIT 2026: Wat niet wordt uitgesproken, stuurt besluiten vaak sterker dan formele strategie."
    ];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const text = extractText(context);

    // Geen expliciete input = hefboom, geen downgrade
    if (!text) {
      opportunities.push(
        "Het expliciet maken van de onderstroom kan direct besluitkwaliteit en executiekracht verhogen."
      );
      recommendations.push(
        "Faciliteer een board- of MT-sessie gericht op spanningen, aannames en onbesproken thema’s."
      );

      return {
        model: "Understream",
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: this.confidence,
        metadata: {
          understream_detected: false,
          maturity: "implicit",
          decision_impact: "high_potential",
          upgrade_policy: "only",
        },
      };
    }

    let understreamScore = 0;
    const dimensions = new Set<string>();

    for (const signal of UNDERSTREAM_SIGNALS_2026) {
      if (signal.keywords.some(kw => text.includes(kw))) {
        insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        recommendations.push(signal.recommendation);
        understreamScore += signal.weight;
        dimensions.add(signal.dimension);
      }
    }

    insights.push(
      "📐 ONDERSTROOM-KADERS (2026):",
      ...UNDERSTREAM_FRAMEWORKS_2026.map(f => `• ${f}`)
    );

    recommendations.push(
      "Integreer onderstroom structureel in strategische besluitvorming en governance."
    );

    return {
      model: "Understream",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        understream_detected: true,
        understream_score: understreamScore,
        dominant_dimensions: Array.from(dimensions),
        organizational_state_2026:
          understreamScore >= 10
            ? "blocked_but_unlockable"
            : understreamScore >= 6
            ? "latent_tension"
            : "relatively_open",
        decision_friction_level:
          understreamScore >= 9 ? "high" : understreamScore >= 6 ? "medium" : "low",
        upgrade_policy: "only",
      },
    };
  }
}
