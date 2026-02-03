// src/aurelius/engine/nodes/ESGNode.ts
import type { AnalysisContext } from "../types";

/* =========================
   Core contracts (node-local)
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
    esg_posture?: ESGPosture;
    signal_density?: number;
    risk_intensity?: number;
    transition_ready?: boolean;
  };
}

/* =========================
   ESG posture
========================= */

type ESGPosture =
  | "strategic_value_driver"
  | "transition_ready"
  | "compliance_bound"
  | "greenwashing_risk"
  | "latent_opportunity";

/* =========================
   Robust context extraction
========================= */

function extractRelevantText(context: AnalysisContext): string {
  if (!context || typeof context !== "object") return "";

  const candidates: unknown[] = [
    context.rawText,
    (context.userContext as Record<string, unknown> | undefined)?.sustainability,
    (context.userContext as Record<string, unknown> | undefined)?.esg,
    (context.userContext as Record<string, unknown> | undefined)?.impact,
    (context.userContext as Record<string, unknown> | undefined)?.climate,
    (context.userContext as Record<string, unknown> | undefined)?.governance,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

/* =========================
   ESG Rule Engine (2026)
========================= */

interface ESGRule {
  keywords: string[];
  type: "positive" | "risk" | "transition";
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  weight: number; // 1–4
}

const ESG_SIGNALS_2026: ESGRule[] = [
  {
    keywords: [
      "duurzaam",
      "esg",
      "impact",
      "sustainability",
      "circulair",
      "net zero",
      "transitieplan",
    ],
    type: "positive",
    insight:
      "🌱 STRATEGISCHE ESG: Duurzaamheid is geïntegreerd in waardecreatie en businessmodel.",
    opportunity:
      "ESG-integratie kan WACC 50–150 bps verlagen en merk- en talentwaarde versterken.",
    recommendation:
      "Ontwikkel een science-based Climate Transition Plan met harde milestones.",
    weight: 3,
  },
  {
    keywords: ["double materiality", "dubbele materialiteit"],
    type: "positive",
    insight:
      "🔍 DOUBLE MATERIALITY: Boardroom-volwassen ESG-benadering (2026-standaard).",
    opportunity:
      "Gerichte DMA verhoogt strategische focus en risicosturing.",
    recommendation:
      "Verbind impact- en financiële materialiteit direct aan strategie en KPI’s.",
    weight: 3,
  },
  {
    keywords: ["compliance", "csrd", "csddd", "taxonomie"],
    type: "risk",
    risk:
      "🚩 COMPLIANCE-ONLY RISICO: ESG wordt primair als verplichting benaderd.",
    recommendation:
      "Verschuif van rapportage-focus naar waardecreatie en risicoreductie.",
    weight: 2.5,
  },
  {
    keywords: ["greenwashing", "misleidend", "overdreven beloftes"],
    type: "risk",
    risk:
      "🚨 GREENWASHING RISICO: Reputatie- en handhavingsrisico’s nemen toe in 2026.",
    recommendation:
      "Onderbouw ESG-claims met data, verificatie en conservatieve framing.",
    weight: 3,
  },
  {
    keywords: [
      "transition risk",
      "fysiek risico",
      "klimaatadaptatie",
      "resilience",
    ],
    type: "transition",
    insight:
      "⚡ TRANSITIE & FYSIEKE RISICO’S: Dominant ESG-thema voor waarde en continuïteit.",
    risk:
      "Onvoldoende voorbereiding leidt tot stranded assets en waardeverlies.",
    opportunity:
      "Proactieve transitieplanning verbetert toegang tot kapitaal.",
    recommendation:
      "Voer scenario-analyses uit (1.5°C, delayed transition, physical risk).",
    weight: 3,
  },
  {
    keywords: ["biodiversiteit", "nature", "water", "deforestation"],
    type: "transition",
    insight:
      "🌍 NATURE & CIRCULARITY: Snel stijgende strategische prioriteit (TNFD / EUDR).",
    opportunity:
      "Nature-positive strategieën openen nieuwe verdienmodellen.",
    recommendation:
      "Start TNFD-scan voor natuur-, water- en ketenrisico’s.",
    weight: 2,
  },
];

/* =========================
   Reference frameworks (2026)
========================= */

const CORE_ESG_FRAMEWORKS_2026 = [
  "Double Materiality Assessment (CSRD / ESRS – 2026)",
  "Science-Based Climate Transition Plan",
  "EU Taxonomy (Climate Delegated Act)",
  "TNFD – Nature-related Financial Disclosures",
  "ISSB IFRS S1/S2",
  "EU Transition Finance Frameworks",
] as const;

/* =========================
   ESG Node (MAXIMAL · UPGRADE-ONLY)
========================= */

export class ESGNode implements ExpertNode {
  public readonly name = "ESG & Strategic Sustainability";
  public readonly confidence = 0.9; // 🔒 BASELINE — uplift only

  public async analyze(context: AnalysisContext): Promise<NodeResult> {
    const text = extractRelevantText(context).toLowerCase();

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    let signalScore = 0;
    let riskScore = 0;
    let transitionDetected = false;

    /* ---------- No explicit input = latent opportunity ---------- */

    if (!text) {
      return {
        insights: ["ℹ️ ESG is niet expliciet gepositioneerd in de strategie."],
        risks: [
          "ESG blijft impliciet → verhoogd risico op compliance-issues en gemiste waardecreatie.",
        ],
        opportunities: [
          "Strategische ESG-integratie kan kosten van kapitaal verlagen en merkwaarde versterken.",
        ],
        recommendations: [
          "Start met een beknopte Double Materiality Assessment als fundament.",
        ],
        confidence: 0.6,
        content: {
          esg_posture: "latent_opportunity",
          signal_density: 0,
          risk_intensity: 0,
          transition_ready: false,
        },
        metadata: {
          downgrade_policy: "disabled",
          version: "esg-2026-max",
        },
      };
    }

    /* ---------- Signal detection ---------- */

    for (const rule of ESG_SIGNALS_2026) {
      if (rule.keywords.some(k => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);

        signalScore += rule.weight;
        if (rule.type === "risk") riskScore += rule.weight;
        if (rule.type === "transition") transitionDetected = true;
      }
    }

    /* ---------- Framework anchoring ---------- */

    if (signalScore > 2) {
      insights.push(
        "\n📐 ESG-kaders (2026):",
        ...CORE_ESG_FRAMEWORKS_2026.map(f => `  • ${f}`)
      );
    }

    /* ---------- Posture inference ---------- */

    let posture: ESGPosture = "compliance_bound";

    if (riskScore >= 4) {
      posture = "greenwashing_risk";
    } else if (transitionDetected && signalScore >= 6) {
      posture = "transition_ready";
    } else if (signalScore >= 7 && riskScore < 2) {
      posture = "strategic_value_driver";
    }

    /* ---------- Final ---------- */

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: Math.min(0.95, this.confidence + signalScore * 0.02),
      content: {
        esg_posture: posture,
        signal_density: signalScore,
        risk_intensity: riskScore,
        transition_ready: transitionDetected,
      },
      metadata: {
        esg_signal_strength: signalScore,
        risk_intensity: riskScore,
        strategic_mode: signalScore > riskScore,
        downgrade_policy: "disabled",
        version: "esg-2026-max",
      },
    };
  }
}
