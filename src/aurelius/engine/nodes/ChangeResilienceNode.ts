// src/aurelius/engine/nodes/ChangeResilienceNode.ts
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
    change_posture?: ChangePosture;
    signal_density?: number;
    pressure_context?: boolean;
    fatigue_signals?: boolean;
  };
}

/* =========================
   Change posture
========================= */

type ChangePosture =
  | "breakthrough_under_pressure"
  | "adaptive_transformation"
  | "fatigue_risk"
  | "latent_opportunity";

/* =========================
   Robust context extraction
========================= */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    context.userContext?.change,
    context.userContext?.transformation,
    context.userContext?.resilience,
    context.userContext?.pressure,
    context.userContext?.history,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p;
  }
  return "";
}

/* =========================
   Change resilience signal engine (2026)
========================= */

interface ChangeRule {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  weight?: number; // ADD ONLY — signal intensity
}

const CHANGE_RESILIENCE_SIGNALS_2026: ChangeRule[] = [
  {
    keywords: ["verandering", "change", "transformatie", "turnaround"],
    insight:
      "🔁 VERANDERDYNAMIEK: Organisatie bevindt zich actief in (of aan de vooravond van) verandering.",
    opportunity:
      "Heldere verandercadans kan onzekerheid omzetten in richting en momentum.",
    recommendation:
      "Definieer expliciet: waarom nu, wat verandert wel/niet en hoe succes wordt gemeten.",
    weight: 2,
  },
  {
    keywords: ["weerstand", "verzet", "moe", "verander-moeheid", "geen energie"],
    risk:
      "⚠️ CHANGE FATIGUE: Signalen van verandermoeheid of latent verzet aanwezig.",
    opportunity:
      "Herontwerp tempo en betekenis kan vertrouwen en energie herstellen.",
    recommendation:
      "Verminder initiatieven → verhoog betekenis → herstel psychologische veiligheid.",
    weight: 3,
  },
  {
    keywords: ["adaptief", "leren", "experiment", "feedback", "bijsturen"],
    insight:
      "🧠 ADAPTIEF VERMOGEN: Leren en bijsturen zijn zichtbaar onderdeel van verandering.",
    opportunity:
      "Adaptieve organisaties winnen structureel in volatiele markten.",
    recommendation:
      "Bouw korte leerloops (30–60 dagen) met expliciete stop-/pivot-regels.",
    weight: 2,
  },
  {
    keywords: ["leiderschap", "voorbeeld", "richting", "besluitvaardig"],
    insight:
      "🧭 LEIDERSCHAP IN VERANDERING: Richtinggevend leiderschap is zichtbaar.",
    opportunity:
      "Consistent voorbeeldgedrag versnelt acceptatie exponentieel.",
    recommendation:
      "Zorg dat leiders zichtbaar moeilijke keuzes maken én dragen.",
    weight: 2,
  },
  {
    keywords: ["onzeker", "chaos", "druk", "crisis"],
    insight:
      "🔥 DRUKCONTEXT: Verandering vindt plaats onder verhoogde interne of externe druk.",
    opportunity:
      "Juist onder druk ontstaat kans op doorbraak en versnelling.",
    recommendation:
      "Stabiliseer eerst basis (veiligheid, prioriteiten), versnel daarna.",
    weight: 3,
  },
];

/* =========================
   Change resilience frameworks (2026)
========================= */

const CHANGE_RESILIENCE_FRAMEWORKS_2026 = [
  "Adaptive Change vs. Technical Change (Heifetz)",
  "Change Energy Curve (2026 update)",
  "Psychological Safety as Change Accelerator",
  "Focus–Cadence–Meaning Model",
  "Resilience over Readiness (modern change doctrine)",
] as const;

/* =========================
   Change Resilience Node (MAXIMAL · UPGRADE-ONLY)
========================= */

export class ChangeResilienceNode implements ExpertNode {
  public readonly name = "Change Resilience & Adaptive Capacity";
  public readonly confidence = 0.92; // 🔒 HARD LOCK

  async analyze(context: AnalysisContext): Promise<NodeResult> {
    const text = extractRelevantText(context).toLowerCase();

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    let signalWeight = 0;
    let fatigueDetected = false;
    let pressureDetected = false;

    /* ---------- No explicit context = opportunity ---------- */

    if (!text) {
      return {
        insights: [
          "🔁 CHANGE RESILIENCE KANS: Geen expliciete veranderaanpak zichtbaar → ruimte voor bewuste, krachtige inrichting.",
        ],
        risks: [],
        opportunities: [
          "Een expliciet change-resilience model kan snelheid, draagvlak en executiekracht drastisch verhogen.",
        ],
        recommendations: [
          "Ontwerp verandering expliciet als systeem: richting, ritme, betekenis en leervermogen.",
        ],
        confidence: this.confidence,
        content: {
          change_posture: "latent_opportunity",
          signal_density: 0,
        },
        metadata: {
          downgrade_policy: "disabled",
          change_mode: "opportunity-first",
          version: "change-resilience-2026-max",
        },
      };
    }

    /* ---------- Signal detection ---------- */

    for (const rule of CHANGE_RESILIENCE_SIGNALS_2026) {
      if (rule.keywords.some(k => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);

        signalWeight += rule.weight ?? 1;

        if (
          rule.keywords.some(k =>
            ["moe", "verzet", "weerstand"].includes(k)
          )
        ) {
          fatigueDetected = true;
        }

        if (
          rule.keywords.some(k =>
            ["druk", "crisis", "chaos"].includes(k)
          )
        ) {
          pressureDetected = true;
        }
      }
    }

    /* ---------- Framework anchoring ---------- */

    insights.push(
      "\n📐 CHANGE RESILIENCE KADERS (2026):",
      ...CHANGE_RESILIENCE_FRAMEWORKS_2026.map(f => `  • ${f}`)
    );

    /* ---------- Posture inference ---------- */

    let posture: ChangePosture = "adaptive_transformation";

    if (fatigueDetected && signalWeight >= 4) {
      posture = "fatigue_risk";
    } else if (pressureDetected && signalWeight >= 5) {
      posture = "breakthrough_under_pressure";
    } else if (signalWeight <= 2) {
      posture = "latent_opportunity";
    }

    /* ---------- Final ---------- */

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence, // 🔒 NO DOWNGRADES
      content: {
        change_posture: posture,
        signal_density: signalWeight,
        pressure_context: pressureDetected,
        fatigue_signals: fatigueDetected,
      },
      metadata: {
        change_resilience_level:
          posture === "fatigue_risk"
            ? "fragile"
            : posture === "breakthrough_under_pressure"
            ? "high-under-pressure"
            : "adaptive",
        orientation: "adaptive-over-linear",
        downgrade_policy: "disabled",
        version: "change-resilience-2026-max",
      },
    };
  }
}
