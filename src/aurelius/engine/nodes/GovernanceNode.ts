// src/aurelius/engine/nodes/GovernanceNode.ts

import type { AnalysisContext } from "../types";

/* ============================================================
   CORE CONTRACTS (ADD-ONLY, BACKWARD COMPATIBLE)
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;

  analyze(context: AnalysisContext): Promise<NodeResult>;

  /* -------- optional governance-aware extensions -------- */
  readonly id?: string;
  readonly domain?: "governance";
  readonly weight?: 1 | 2 | 3 | 4 | 5;
  readonly decision_relevant?: boolean;
  readonly policy?: {
    no_downgrade?: boolean;
    boardroom_safe?: boolean;
    version?: string;
    upgrade_policy?: "add_only" | "locked" | "experimental";
  };
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
   ROBUST CONTEXT EXTRACTION (STRICT & SAFE)
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context?.rawText,
    context?.documents?.join(" "),
    (context?.userContext as any)?.governance,
    (context?.userContext as any)?.board,
    (context?.userContext as any)?.decisionRights,
    (context?.userContext as any)?.ownership,
    (context?.userContext as any)?.escalation,
    (context?.userContext as any)?.oversight,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p;
  }
  return "";
}

/* ============================================================
   GOVERNANCE SIGNAL ENGINE (2026)
============================================================ */

interface GovernanceRule {
  keywords: string[];
  insight?: string;
  risk?: string;
  opportunity?: string;
  recommendation?: string;
}

const GOVERNANCE_SIGNALS_2026: GovernanceRule[] = [
  {
    keywords: ["governance", "bestuur", "board", "toezicht"],
    insight:
      "🏛️ GOVERNANCE-AANDACHT: Bestuur en toezicht spelen expliciete rol in de organisatie.",
    opportunity:
      "Actieve governance verhoogt besluitkwaliteit, strategische scherpte en rust.",
    recommendation:
      "Verschuif van passief toezicht naar actieve, waardecreërende governance.",
  },
  {
    keywords: ["beslisrecht", "decision rights", "raci", "eigenaarschap", "ownership"],
    insight:
      "⚖️ DECISION RIGHTS: Duidelijkheid over wie beslist en wie verantwoordelijk is.",
    opportunity:
      "Heldere beslisrechten versnellen besluitvorming met factor 2–4.",
    recommendation:
      "Implementeer RACI-DD (Decide, Recommend, Input, Veto) per kernbesluit.",
  },
  {
    keywords: ["escalatie", "escalation", "mandaat", "bevoegd"],
    insight:
      "📡 ESCALATIESTRUCTUUR: Mandaten en escalatiepaden zijn onderwerp van gesprek.",
    opportunity:
      "Goede escalatie voorkomt blokkades zonder micromanagement.",
    recommendation:
      "Definieer escalatiecriteria: wanneer omhoog, wanneer doorpakken.",
  },
  {
    keywords: ["cadence", "ritme", "governance cycle", "review"],
    insight:
      "⏱️ GOVERNANCE CADENCE: Ritme van besluitvorming en reviews aanwezig.",
    opportunity:
      "Strakke cadence verhoogt accountability en voorkomt strategische drift.",
    recommendation:
      "Installeer vaste governance-cyclus: wekelijks tactisch, maandelijks strategisch.",
  },
  {
    keywords: ["ai", "data", "algoritme", "automatisering", "agent"],
    insight:
      "🤖 AI & DATA GOVERNANCE: Technologie beïnvloedt besluitvorming en toezicht.",
    opportunity:
      "Goede AI-governance maakt veilige schaal en versnelling mogelijk.",
    recommendation:
      "Definieer AI-governance: gebruiksregels, toezicht, audit en human-in-the-loop.",
  },
];

/* ============================================================
   GOVERNANCE FRAMEWORKS (2026)
============================================================ */

const GOVERNANCE_FRAMEWORKS_2026 = [
  "Active Governance vs Passive Oversight",
  "RACI-DD (Decision Rights Clarity)",
  "Decision Velocity & Governance Cadence",
  "AI & Data Governance Framework",
  "Boardroom as Value-Creation Engine",
] as const;

/* ============================================================
   GOVERNANCE NODE — MAXIMAL, NO-DOWNGRADE
============================================================ */

export class GovernanceNode implements ExpertNode {
  public readonly name = "Governance & Decision Rights";
  public readonly confidence = 0.92;

  /* ---- governance extensions ---- */
  public readonly id = "governance_decision_rights";
  public readonly domain: "governance" = "governance";
  public readonly weight: 1 | 2 | 3 | 4 | 5 = 5;
  public readonly decision_relevant = true;
  public readonly policy = {
    no_downgrade: true,
    boardroom_safe: true,
    version: "2026.1",
    upgrade_policy: "add_only" as const,
  };

  async analyze(context: AnalysisContext): Promise<NodeResult> {
    const text = extractRelevantText(context).toLowerCase();

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    // Geen expliciete input = governance-kans (geen downgrade)
    if (!text) {
      return {
        insights: [
          "🏛️ GOVERNANCE POTENTIEEL: Governance is impliciet → ruimte voor professionalisering.",
        ],
        risks: [],
        opportunities: [
          "Expliciete governance en decision rights verhogen snelheid, kwaliteit en rust.",
        ],
        recommendations: [
          "Maak governance expliciet: wie beslist wat, wanneer en met welk mandaat.",
        ],
        confidence: this.confidence,
        metadata: {
          governance_mode: "opportunity-first",
          downgrade_policy: "disabled",
        },
      };
    }

    for (const rule of GOVERNANCE_SIGNALS_2026) {
      if (rule.keywords.some((k) => text.includes(k))) {
        if (rule.insight) insights.push(rule.insight);
        if (rule.risk) risks.push(rule.risk);
        if (rule.opportunity) opportunities.push(rule.opportunity);
        if (rule.recommendation) recommendations.push(rule.recommendation);
      }
    }

    insights.push(
      "\n📐 GOVERNANCE-KADERS (2026):",
      ...GOVERNANCE_FRAMEWORKS_2026.map((f) => `  • ${f}`)
    );

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        governance_maturity: insights.length > 3 ? "high" : "emerging",
        dominant_logic: "clarity → speed → accountability",
        decision_relevant: true,
        downgrade_policy: "disabled",
      },
    };
  }
}
