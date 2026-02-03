// src/aurelius/engine/nodes/strategy/AIDataNode.ts

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
  model: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
  content?: {
    score?: number;
    maturity?: string;
  };
}

/* =========================
   Robust text extraction
   (100% AnalysisContext-safe)
========================= */

function extractRelevantText(context: AnalysisContext): string {
  const candidates: unknown[] = [
    context.rawText,
    context.documents?.join(" "),
    (context.userContext as Record<string, unknown> | undefined)?.ai,
    (context.userContext as Record<string, unknown> | undefined)?.data,
    (context.userContext as Record<string, unknown> | undefined)?.analytics,
    (context.userContext as Record<string, unknown> | undefined)?.automation,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }

  return "";
}

/* =========================
   AI & DATA SIGNAL ENGINE — 2026
========================= */

interface AIDataSignal {
  keywords: string[];
  type: "strength" | "risk" | "opportunity" | "governance";
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
  weight: number; // 1–5 impact
}

const AIDATA_SIGNALS_2026: AIDataSignal[] = [
  {
    keywords: ["ai", "artificial intelligence", "machine learning", "ml", "agentic"],
    type: "strength",
    insight: "🤖 AI is gepositioneerd als strategische capability (niet alleen tooling).",
    opportunity: "AI-first organisaties realiseren structureel 20–60% productiviteitsvoordeel.",
    recommendation: "Definieer AI als capability met duidelijke business-ownership per use-case.",
    weight: 4,
  },
  {
    keywords: ["data", "dataset", "analytics", "insights", "dashboards"],
    type: "strength",
    insight: "📊 Data wordt actief gebruikt voor besluitvorming en performance-sturing.",
    opportunity: "High-quality decision data versnelt strategische cycli met factor 2–3.",
    recommendation: "Koppel kernbesluiten expliciet aan data-bronnen en decision-metrics.",
    weight: 3.5,
  },
  {
    keywords: ["handmatig", "excel", "copy paste", "ad hoc"],
    type: "risk",
    risk: "🚩 Handmatige dataprocessen beperken schaalbaarheid en betrouwbaarheid.",
    recommendation: "Automatiseer datastromen en elimineer menselijke tussenstappen.",
    weight: 4,
  },
  {
    keywords: ["governance", "ethiek", "bias", "hallucinatie", "compliance"],
    type: "governance",
    insight: "🧭 Bewustzijn van AI-governance en ethische risico’s aanwezig.",
    risk: "Onvoldoende governance maakt AI-risico’s oncontroleerbaar bij schaal.",
    opportunity: "Goede AI-governance versnelt veilige adoptie en vergroot vertrouwen.",
    recommendation: "Implementeer minimaal AI Governance Framework (ownership, monitoring, rollback).",
    weight: 4.5,
  },
  {
    keywords: ["automation", "rpa", "workflow", "orchestratie"],
    type: "opportunity",
    insight: "⚙️ Automatisering en AI-orchestratie bieden directe execution-voordelen.",
    opportunity: "AI-gedreven workflows kunnen 30–70% operationele tijd besparen.",
    recommendation: "Start met 3 high-volume, rule-based processen als AI-automation pilots.",
    weight: 3.8,
  },
];

/* =========================
   Reference frameworks – 2026
========================= */

const AIDATA_FRAMEWORKS_2026 = [
  "AI Capability Model (Strategy → Data → Models → Governance → Adoption)",
  "Decision Intelligence (data → beslissing → actie → feedback)",
  "Agentic AI Control Loop (human-in-the-loop, rollback, audit)",
  "AI Governance Lite (ownership, bias checks, security, compliance)",
  "Automation ROI Ladder (manual → assisted → autonomous)",
] as const;

/* =========================
   AI & DATA NODE — CANON
========================= */

export class AIDataNode implements ExpertNode {
  public readonly name = "AI & Data Capability";
  public readonly confidence = 0.93;

  public async analyze(context: AnalysisContext): Promise<NodeResult> {
    const text = extractRelevantText(context).toLowerCase().trim();

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    let signalScore = 0;
    let riskWeight = 0;

    if (!text) {
      return {
        model: "AI & Data",
        insights: ["ℹ️ Geen expliciete AI- of data-context aangetroffen."],
        risks: [
          "AI en data blijven impliciet → productiviteits- en schaalvoordeel blijft onbenut.",
        ],
        opportunities: [
          "Gerichte AI-adoptie kan een van de snelste waardehefbomen zijn in 2026.",
        ],
        recommendations: [
          "Maak AI- en data-capabilities expliciet: use-cases, data-assets en besluitpunten.",
        ],
        confidence: 0.6,
        content: {
          score: 45,
          maturity: "nascent",
        },
        metadata: {
          ai_data_signals_detected: false,
        },
      };
    }

    for (const signal of AIDATA_SIGNALS_2026) {
      if (signal.keywords.some((kw) => text.includes(kw))) {
        if (signal.insight) insights.push(signal.insight);
        if (signal.risk) risks.push(signal.risk);
        if (signal.opportunity) opportunities.push(signal.opportunity);
        if (signal.recommendation) recommendations.push(signal.recommendation);

        signalScore += signal.weight;
        if (signal.type === "risk" || signal.type === "governance") {
          riskWeight += signal.weight;
        }
      }
    }

    if (signalScore > 2 || text.length > 120) {
      insights.push("📐 AI & Data kaders (2026):");
      insights.push(...AIDATA_FRAMEWORKS_2026.map((f) => `• ${f}`));
    }

    const maturity =
      signalScore >= 10
        ? "scaling"
        : signalScore >= 6
        ? "emerging"
        : "nascent";

    const score = Math.min(100, 40 + Math.round(signalScore * 6));

    const finalConfidence =
      riskWeight >= 6 ? Math.max(0.7, this.confidence - 0.18) : this.confidence;

    return {
      model: "AI & Data",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: finalConfidence,
      content: {
        score,
        maturity,
      },
      metadata: {
        ai_data_signals_detected: signalScore > 4,
        risk_intensity: Math.round(riskWeight * 10) / 10,
        maturity_estimate: maturity,
        key_2026_focus: [
          "agentic_ai",
          "decision_intelligence",
          "automation",
          "ai_governance",
        ],
      },
    };
  }
}
