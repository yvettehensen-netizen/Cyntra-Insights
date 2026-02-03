// src/aurelius/engine/nodes/CultureNode.ts
import type { AnalysisContext } from "../types";

/* =========================
   Core contracts
========================= */

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

  /* ================= ADD ONLY ================= */
  content?: {
    culture_posture?: CulturePosture;
    signal_density?: number;
    psychological_safety?: boolean;
    overload_risk?: boolean;
  };
}

/* =========================
   Culture posture
========================= */

type CulturePosture =
  | "high_performance_enabler"
  | "learning_culture"
  | "latent_culture_debt"
  | "overload_risk"
  | "latent_opportunity";

/* =========================
   Context extraction (STRICT & SAFE)
========================= */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.culture,
    context.userContext?.values,
    context.userContext?.behaviour,
    context.userContext?.team,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p;
  }
  return "";
}

/* =========================
   Culture signal engine (2026)
========================= */

interface CultureRule {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  weight?: number;
}

const CULTURE_SIGNALS_2026: CultureRule[] = [
  {
    keywords: ["cultuur", "waarden", "purpose", "normen", "gedrag"],
    insight:
      "🧬 CULTURE FOUNDATION: Waarden en cultuur functioneren als expliciet sturingsmechanisme.",
    opportunity:
      "Expliciete cultuur versnelt eigenaarschap, consistentie en besluitvorming.",
    recommendation:
      "Vertaal waarden systematisch naar concreet gedrag en besluitregels.",
    weight: 2,
  },
  {
    keywords: [
      "vertrouwen",
      "psychologische veiligheid",
      "open feedback",
      "speak up",
    ],
    insight:
      "🤝 PSYCHOLOGISCHE VEILIGHEID: Teams durven te spreken en corrigeren.",
    opportunity:
      "Hoge veiligheid verhoogt leervermogen en besluitkwaliteit structureel.",
    recommendation:
      "Positioneer psychologische veiligheid als leiderschapsverantwoordelijkheid.",
    weight: 3,
  },
  {
    keywords: ["leren", "experiment", "growth mindset", "ontwikkeling"],
    insight:
      "🌱 LEERCULTUUR: Experimenteren en leren zijn geaccepteerd gedrag.",
    opportunity:
      "Sterke leercultuur versnelt innovatie en adaptief vermogen.",
    recommendation:
      "Normaliseer experimenten met korte feedback- en stoploops.",
    weight: 2,
  },
  {
    keywords: ["burn-out", "overwerk", "druk", "always on"],
    risk:
      "⚠️ OVERBELASTING: Signalen van structurele energielekkage aanwezig.",
    opportunity:
      "Herontwerp van ritme en herstel verhoogt duurzame performance.",
    recommendation:
      "Maak energie-, focus- en herstelprincipes expliciet onderdeel van cultuur.",
    weight: 3,
  },
  {
    keywords: ["conflict vermijden", "harmonie", "geen feedback"],
    risk:
      "⚠️ CONFLICT-ARMOEDE: Vermijden van spanning verlaagt besluitkwaliteit.",
    opportunity:
      "Productief conflict verhoogt scherpte en eigenaarschap.",
    recommendation:
      "Train leiders en teams in constructief meningsverschil.",
    weight: 2,
  },
];

/* =========================
   Culture frameworks (2026)
========================= */

const CULTURE_FRAMEWORKS_2026 = [
  "Psychological Safety (Edmondson)",
  "Values → Behaviors → Outcomes",
  "High-Performance Culture Pyramid",
  "Learning Organization (Senge, 2026 update)",
  "Culture as Operating System (McKinsey/Bain)",
] as const;

/* =========================
   Culture Node (MAXIMAL · UPGRADE-ONLY)
========================= */

export class CultureNode implements ExpertNode {
  public readonly name = "Culture & Organizational Health";
  public readonly confidence = 0.91; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<NodeResult> {
    const text = extractRelevantText(context).toLowerCase();

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    let signalWeight = 0;
    let psychologicalSafety = false;
    let overloadRisk = false;

    /* ---------- No explicit input = opportunity ---------- */

    if (!text) {
      return {
        insights: [
          "🧬 CULTURELE KANS: Geen expliciete cultuurinput → maximale ruimte voor bewuste cultuurvorming.",
        ],
        risks: [],
        opportunities: [
          "Expliciete cultuursturing kan een van de grootste performance-hefbomen worden.",
        ],
        recommendations: [
          "Maak cultuur expliciet: gewenst gedrag, besluitregels en voorbeeldgedrag.",
        ],
        confidence: this.confidence,
        content: {
          culture_posture: "latent_opportunity",
          signal_density: 0,
        },
        metadata: {
          downgrade_policy: "disabled",
          culture_mode: "opportunity-first",
          version: "culture-2026-max",
        },
      };
    }

    /* ---------- Signal detection ---------- */

    for (const rule of CULTURE_SIGNALS_2026) {
      if (rule.keywords.some(k => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);

        signalWeight += rule.weight ?? 1;

        if (
          rule.keywords.some(k =>
            ["vertrouwen", "psychologische veiligheid", "feedback"].includes(k)
          )
        ) {
          psychologicalSafety = true;
        }

        if (
          rule.keywords.some(k =>
            ["burn-out", "overwerk", "druk"].includes(k)
          )
        ) {
          overloadRisk = true;
        }
      }
    }

    /* ---------- Framework anchoring ---------- */

    insights.push(
      "\n📐 CULTUURKADERS (2026):",
      ...CULTURE_FRAMEWORKS_2026.map(f => `  • ${f}`)
    );

    /* ---------- Posture inference ---------- */

    let posture: CulturePosture = "learning_culture";

    if (overloadRisk && signalWeight >= 4) {
      posture = "overload_risk";
    } else if (psychologicalSafety && signalWeight >= 4) {
      posture = "high_performance_enabler";
    } else if (signalWeight <= 2) {
      posture = "latent_culture_debt";
    }

    /* ---------- Final ---------- */

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence, // 🔒 NO DOWNGRADES
      content: {
        culture_posture: posture,
        signal_density: signalWeight,
        psychological_safety: psychologicalSafety,
        overload_risk: overloadRisk,
      },
      metadata: {
        culture_maturity:
          posture === "high_performance_enabler"
            ? "advanced"
            : posture === "overload_risk"
            ? "fragile"
            : "developing",
        orientation: "behavior-driven-performance",
        downgrade_policy: "disabled",
        version: "culture-2026-max",
      },
    };
  }
}
