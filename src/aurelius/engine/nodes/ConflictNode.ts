// src/aurelius/engine/nodes/ConflictNode.ts
// ✅ MAXIMAAL
// ✅ STRICT TS SAFE
// ✅ ADD-ONLY
// ✅ ENGINE-COMPATIBLE

import type { AnalysisContext } from "../../types";

/* =========================
   Core contracts (node-local)
========================= */

export interface ExpertNode {
  readonly name: string;
  readonly confidence: number;
  analyze(context: AnalysisContext): Promise<NodeResult>;

  /* ---- add only ---- */
  readonly id?: string;
  readonly domain?: "strategy" | "risk" | "synthesis";
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

  /* ---- add only ---- */
  content?: {
    conflict_index?: number;          // 0–1
    risk_opportunity_tension?: number; // 0–1
    contradiction_count?: number;
    dominant_dilemma?: string;
    escalation_required?: boolean;
  };
}

/* =========================
   Types
========================= */

interface AggregatedResults {
  [nodeName: string]: NodeResult | undefined;
}

/* =========================
   Conflict Node
========================= */

export class ConflictNode implements ExpertNode {
  public readonly name = "Strategic Conflict & Tension Engine";
  public readonly confidence = 0.94;

  public readonly id = "strategic_conflict_engine";
  public readonly domain = "synthesis";
  public readonly weight: 5 = 5;
  public readonly decision_relevant = true;

  public readonly policy = {
    no_downgrade: true,
    boardroom_safe: true,
    version: "2026.1",
    upgrade_policy: "add_only" as const,
  };

  /* =========================
     Utilities
  ========================= */

  private isValidNodeResult(value: unknown): value is NodeResult {
    if (!value || typeof value !== "object") return false;
    const r = value as NodeResult;
    return (
      Array.isArray(r.insights) &&
      Array.isArray(r.risks) &&
      Array.isArray(r.opportunities) &&
      Array.isArray(r.recommendations) &&
      typeof r.confidence === "number"
    );
  }

  private clamp01(n: number): number {
    if (n < 0) return 0;
    if (n > 1) return 1;
    return Math.round(n * 100) / 100;
  }

  private safeRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object") return value as Record<string, unknown>;
    return {};
  }

  private getAggregated(context: AnalysisContext): AggregatedResults {
    const uc = this.safeRecord((context as any)?.userContext);
    const nodeResults = uc["nodeResults"];
    if (nodeResults && typeof nodeResults === "object") {
      return nodeResults as AggregatedResults;
    }
    return {};
  }

  private detectContradictions(
    risks: string[],
    opportunities: string[]
  ): number {
    let count = 0;

    const riskLower = risks.map(r => r.toLowerCase());
    const oppLower = opportunities.map(o => o.toLowerCase());

    for (const r of riskLower) {
      for (const o of oppLower) {
        // simpele heuristiek: overlappende kernwoorden
        const tokens = r.split(" ").filter(t => t.length > 5);
        if (tokens.some(t => o.includes(t))) {
          count++;
        }
      }
    }

    return count;
  }

  /* =========================
     Main logic
  ========================= */

  public async analyze(context: AnalysisContext): Promise<NodeResult> {
    const aggregated = this.getAggregated(context);

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    const validEntries = Object.entries(aggregated).filter(([, v]) =>
      this.isValidNodeResult(v)
    ) as [string, NodeResult][];

    const activeNodes = validEntries.length;

    if (activeNodes === 0) {
      return {
        insights: ["Geen onderliggende analyses beschikbaar voor conflict-detectie."],
        risks: [],
        opportunities: [],
        recommendations: [],
        confidence: this.confidence,
        content: {
          conflict_index: 0,
          risk_opportunity_tension: 0,
          contradiction_count: 0,
          escalation_required: false,
        },
        metadata: {
          conflict_mode: "no_input",
        },
      };
    }

    const allRisks = validEntries.flatMap(([, r]) => r.risks);
    const allOpportunities = validEntries.flatMap(([, r]) => r.opportunities);

    const riskDensity = allRisks.length / activeNodes;
    const opportunityDensity = allOpportunities.length / activeNodes;

    const tension = Math.abs(riskDensity - opportunityDensity);
    const normalizedTension = this.clamp01(tension);

    const contradictionCount = this.detectContradictions(
      allRisks,
      allOpportunities
    );

    const contradictionIntensity = this.clamp01(
      contradictionCount / (activeNodes || 1)
    );

    const conflictIndex = this.clamp01(
      normalizedTension * 0.6 + contradictionIntensity * 0.4
    );

    let dominantDilemma: string | undefined;

    if (conflictIndex >= 0.7) {
      dominantDilemma =
        "Hoge gelijktijdige strategische spanning tussen groeikansen en risicodruk.";
      risks.push(
        "⚔️ SYSTEMISCHE SPANNING: meerdere prioriteiten concurreren om focus en middelen."
      );
      recommendations.push(
        "Formuleer expliciet welk strategisch dilemma prioriteit krijgt — en welke optie wordt opgeofferd."
      );
    } else if (conflictIndex >= 0.4) {
      dominantDilemma =
        "Matige spanning tussen expansie en stabilisatie.";
      insights.push(
        "⚖️ Er is spanning tussen groei en risicoreductie — scherpe keuzes bepalen uitkomst."
      );
      recommendations.push(
        "Forceer één duidelijke keuze: versnellen of consolideren."
      );
    } else {
      insights.push(
        "Strategische spanning beperkt — domeinen zijn relatief consistent."
      );
    }

    const escalationRequired = conflictIndex >= 0.75;

    if (escalationRequired) {
      recommendations.push(
        "Escaleer naar board-niveau: expliciete besluitronde over keuzeconflicten vereist."
      );
    }

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      content: {
        conflict_index: conflictIndex,
        risk_opportunity_tension: normalizedTension,
        contradiction_count: contradictionCount,
        dominant_dilemma: dominantDilemma,
        escalation_required: escalationRequired,
      },
      metadata: {
        active_nodes: activeNodes,
        risk_density: riskDensity,
        opportunity_density: opportunityDensity,
        conflict_index: conflictIndex,
        escalation_required: escalationRequired,
        version: "conflict-node-2026-max",
      },
    };
  }
}
