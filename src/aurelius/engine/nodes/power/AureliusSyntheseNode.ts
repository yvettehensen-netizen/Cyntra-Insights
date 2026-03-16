// src/aurelius/engine/nodes/power/AureliusSyntheseNode.ts
// 🔥 2026.5 MAXIMAL EXECUTIVE VERSION
// ADD-ONLY • NO DOWNGRADE • STRICT TS SAFE

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

/* ============================================================
   Strategic posture
============================================================ */

type StrategicPosture =
  | "offensive_growth"
  | "defensive_stabilization"
  | "adaptive_balance"
  | "crisis_mode";

/* ============================================================
   Conflict object
============================================================ */

interface ConflictObject {
  tension: string;
  risk_weight: number;
  opportunity_weight: number;
  dominance: "risk" | "opportunity" | "balanced";
}

/* ============================================================
   Synthese Node
============================================================ */

export class AureliusSyntheseNode {
  readonly name = "Aurelius Executive Synthesis";
  readonly confidence = 0.99;

  /* =========================
     Utilities
  ========================= */

  private safeRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  }

  private clamp01(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Math.round(value * 100) / 100;
  }

  private determinePosture(
    riskDensity: number,
    opportunityDensity: number
  ): StrategicPosture {
    if (riskDensity >= 0.9) return "crisis_mode";
    if (riskDensity > opportunityDensity) return "defensive_stabilization";
    if (opportunityDensity >= 0.9) return "offensive_growth";
    return "adaptive_balance";
  }

  /* ============================================================
     MAIN
  ============================================================ */

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const uc = this.safeRecord(context.userContext);
    const aggregated =
      (uc["nodeResults"] as Record<string, ModelResult>) ?? {};

    const entries = Object.values(aggregated).filter(Boolean);

    const activeNodes = entries.length;

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    insights.push(
      "Structurele winnaars combineren focus, besluitkracht en executieritme."
    );

    /* =========================
       Aggregation
    ========================= */

    const allRisks = entries.flatMap((r) => r.risks ?? []);
    const allOpps = entries.flatMap((r) => r.opportunities ?? []);
    const allInsights = entries.flatMap((r) => r.insights ?? []);
    const allRecs = entries.flatMap((r) => r.recommendations ?? []);

    risks.push(...allRisks);
    opportunities.push(...allOpps);
    insights.push(...allInsights);
    recommendations.push(...allRecs);

    const riskDensity =
      activeNodes > 0 ? allRisks.length / activeNodes : 0;

    const opportunityDensity =
      activeNodes > 0 ? allOpps.length / activeNodes : 0;

    /* =========================
       Weighted densities
    ========================= */

    const totalConfidence =
      entries.reduce((s, r) => s + r.confidence, 0) || 1;

    const weightedRiskDensity =
      entries.reduce(
        (s, r) => s + (r.risks?.length ?? 0) * r.confidence,
        0
      ) / totalConfidence;

    const weightedOpportunityDensity =
      entries.reduce(
        (s, r) => s + (r.opportunities?.length ?? 0) * r.confidence,
        0
      ) / totalConfidence;

    /* =========================
       Conflict objects
    ========================= */

    const conflictObjects: ConflictObject[] = [];

    if (riskDensity > 0.6 && opportunityDensity > 0.6) {
      conflictObjects.push({
        tension: "Gelijktijdige hoge risico- en kansendruk.",
        risk_weight: this.clamp01(riskDensity),
        opportunity_weight: this.clamp01(opportunityDensity),
        dominance:
          riskDensity > opportunityDensity
            ? "risk"
            : opportunityDensity > riskDensity
            ? "opportunity"
            : "balanced",
      });
    }

    const conflictIndex = this.clamp01(
      Math.min(riskDensity, opportunityDensity)
    );

    /* =========================
       Decision signal consolidation
    ========================= */

    const decisionSignals = entries.map((r) => r.decision_signals ?? {});

    const consolidated = {
      has_clear_decision: decisionSignals.some(
        (s) => s.has_clear_decision
      ),
      tradeoffs_identified: decisionSignals.some(
        (s) => s.tradeoffs_identified
      ),
      irreversible_choices_present: decisionSignals.some(
        (s) => s.irreversible_choices_present
      ),
      ownership_assigned: decisionSignals.some(
        (s) => s.ownership_assigned
      ),
      decision_urgency: conflictIndex > 0.7
        ? "existential"
        : riskDensity > 0.6
        ? "high"
        : "medium" as
            | "low"
            | "medium"
            | "high"
            | "existential",
    };

    /* =========================
       Irreversibility index
    ========================= */

    const irreversibilityIndex = this.clamp01(
      decisionSignals.filter((s) => s.irreversible_choices_present)
        .length / activeNodes
    );

    /* =========================
       Governance pressure
    ========================= */

    const governancePressure =
      decisionSignals.filter((s) => !s.ownership_assigned)
        .length / activeNodes;

    /* =========================
       Strategic posture
    ========================= */

    const posture = this.determinePosture(
      riskDensity,
      opportunityDensity
    );

    /* =========================
       HGBCO HOOK
    ========================= */

    const hgbco = {
      huidige_situatie:
        riskDensity > opportunityDensity
          ? "Risico's domineren strategisch speelveld."
          : "Kansen domineren strategisch speelveld.",
      gewenste_situatie:
        "Gefocuste besluitset met expliciete keuzeconflicten en eigenaarschap.",
      belemmeringen: risks.slice(0, 5),
      consequenties:
        riskDensity > 0.8
          ? ["Systemische instabiliteit."]
          : ["Strategische versnippering."],
      oplossingsrichting: recommendations.slice(0, 5),
    };

    /* =========================
       Final result
    ========================= */

    return {
      section: "executive_synthesis",
      model: "AureliusSyntheseNode",
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: this.confidence,
      decision_signals: consolidated,
      execution_readiness: {
        clarity_level: this.clamp01(opportunityDensity),
        governance_alignment: this.clamp01(
          1 - governancePressure
        ),
        operational_feasibility: 0.8,
        risk_exposure:
          riskDensity > 0.7 ? "high" : "medium",
      },
      content: {
        strategic_posture: posture,
        active_nodes: activeNodes,
        risk_density: riskDensity,
        opportunity_density: opportunityDensity,
        weighted_risk_density: weightedRiskDensity,
        weighted_opportunity_density:
          weightedOpportunityDensity,
        conflict_index: conflictIndex,
        irreversibility_index: irreversibilityIndex,
        governance_pressure_score:
          this.clamp01(governancePressure),
        conflict_objects: conflictObjects,
        hgbco,
      },
      metadata: {
        version: "2026.5-maximal",
        doctrine: "Focus × Keuzeconflict × Ownership × Execution",
        upgrade_policy: "add_only",
      },
    };
  }
}
