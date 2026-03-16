import type { AnalysisContext } from "../types";

/* ============================================================
   CONTRACT
============================================================ */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<NodeResult>;

  readonly id?: string;
  readonly domain?: string;
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
   HELPER
============================================================ */

function extractRelevantText(context: AnalysisContext): string {
  const parts: unknown[] = [
    context?.rawText,
    context?.documents?.join(" "),
    (context?.userContext as any)?.governance,
    (context?.userContext as any)?.decision,
    (context?.userContext as any)?.escalation,
    (context?.userContext as any)?.process,
  ];

  for (const p of parts) {
    if (typeof p === "string" && p.trim()) return p;
  }
  return "";
}

/* ============================================================
   DECISION VELOCITY NODE
============================================================ */

export class DecisionVelocityNode implements ExpertNode {
  public readonly name = "Decision Velocity & Governance Friction";
  public readonly confidence = 0.93;

  public readonly id = "decision_velocity";
  public readonly domain = "governance";
  public readonly weight: 5 = 5;
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

    let frictionScore = 0;
    let clarityScore = 0;
    let escalationScore = 0;

    if (!text) {
      return {
        insights: [
          "⏱️ Besluitritme en snelheid zijn niet expliciet beschreven."
        ],
        risks: [
          "Onzichtbare besluitvertraging kan strategische momentum ondermijnen."
        ],
        opportunities: [
          "Expliciet meten van besluitdoorlooptijd verhoogt execution power."
        ],
        recommendations: [
          "Meet per strategisch besluit: issue → besluit → implementatie (in dagen)."
        ],
        confidence: this.confidence,
        metadata: {
          velocity: "unknown",
          friction_index: "unknown",
          strategic_impact_weight: 9,
          risk_weight: 8,
          execution_complexity: 5
        }
      };
    }

    if (text.includes("escalatie")) escalationScore += 3;
    if (text.includes("mandaat")) clarityScore += 2;
    if (text.includes("committee") || text.includes("comité")) frictionScore += 3;
    if (text.includes("afstemming") || text.includes("alignment")) frictionScore += 2;
    if (text.includes("raci") || text.includes("decision rights")) clarityScore += 3;

    const velocity =
      clarityScore >= 4 && frictionScore <= 2
        ? "high"
        : frictionScore >= 4
        ? "low"
        : "moderate";

    if (velocity === "low") {
      risks.push(
        "🚨 Governance friction vertraagt strategische besluitvorming."
      );
      recommendations.push(
        "Reduceer besluitlagen en wijs één accountable owner per kernbesluit aan."
      );
    }

    if (escalationScore < 2) {
      risks.push(
        "Onvoldoende escalatiecriteria → risico op besluitblokkades."
      );
    }

    insights.push(
      `Decision Velocity: ${velocity.toUpperCase()}`
    );

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      metadata: {
        velocity,
        friction_index: frictionScore,
        clarity_score: clarityScore,
        escalation_score: escalationScore,
        strategic_impact_weight: 9,
        risk_weight: 8,
        execution_complexity: 6
      }
    };
  }
}
