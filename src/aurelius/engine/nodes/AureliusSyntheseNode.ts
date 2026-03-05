// src/aurelius/engine/nodes/AureliusSyntheseNode.ts

import type { AnalysisContext } from "../types";
import { buildDualLayerOutput } from "../../synthesis/dualLayer";

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
    strategic_posture?: StrategicPosture;
    active_nodes?: number;
    risk_density?: number;
    opportunity_density?: number;
    dual_layer?: ReturnType<typeof buildDualLayerOutput>;
  };
}

/* =========================
   Aggregated results model
========================= */

interface AggregatedResults {
  [nodeName: string]: NodeResult | undefined;
}

type StrategicPosture =
  | "offensive_growth"
  | "defensive_stabilization"
  | "adaptive_balance"
  | "crisis_mode";

/* =========================
   Aurelius Synthese Node
========================= */

export class AureliusSyntheseNode implements ExpertNode {
  public readonly name = "Aurelius Executive Synthesis";
  public readonly confidence = 0.96; // 🔒 NEVER DOWNGRADE

  /* ---------- Tunables (upgrade-only) ---------- */

  private readonly minActiveNodes = 6;

  private readonly highRiskDensity = 0.9;
  private readonly mediumRiskDensity = 0.6;

  private readonly highOpportunityDensity = 0.9;
  private readonly mediumOpportunityDensity = 0.6;

  private readonly confidenceBoostFactor = 1.08;
  private readonly maxConfidenceCap = 0.99;

  /* ---------- Utilities ---------- */

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

  private deduplicate(items: string[]): string[] {
    const seen = new Set<string>();
    return items.filter((i) => {
      const key = i.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculateDensity(count: number, nodes: number): number {
    if (nodes === 0) return 0;
    return Math.round((count / nodes) * 100) / 100;
  }

  private determinePosture(
    riskDensity: number,
    opportunityDensity: number
  ): StrategicPosture {
    if (riskDensity >= this.highRiskDensity) return "crisis_mode";
    if (riskDensity > opportunityDensity)
      return "defensive_stabilization";
    if (opportunityDensity >= this.highOpportunityDensity)
      return "offensive_growth";
    return "adaptive_balance";
  }

  /* =========================
     Main synthesis
  ========================= */

  public async analyze(context: AnalysisContext): Promise<NodeResult> {
    const aggregated =
      (context.userContext?.nodeResults as AggregatedResults | undefined) ?? {};

    const insights: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    insights.push(
      "🧠 AURELIUS SYNTHESIS 2026: Structurele winnaars combineren focus, besluitkracht en executieritme — niet perfecte plannen."
    );

    const validEntries = Object.entries(aggregated).filter(([, v]) =>
      this.isValidNodeResult(v)
    ) as [string, NodeResult][];

    const activeNodes = validEntries.length;
    const activeNodeNames = validEntries.map(([k]) => k);

    /* ---------- Partial input handling ---------- */

    if (activeNodes < this.minActiveNodes) {
      const dualLayer = buildDualLayerOutput({
        dominante_these: insights.join(" "),
        structurele_kernspanning: risks.join(" "),
        onvermijdelijke_keuzes: recommendations.join(" "),
        prijs_van_uitstel: risks.join(" "),
        mandaat_besluitrecht: recommendations.join(" "),
        onderstroom_informele_macht: insights.join(" "),
        faalmechanisme: risks.join(" "),
        interventieplan_90_dagen: recommendations.join(" "),
        decision_contract: recommendations.join(" "),
      });
      risks.push(
        `⚠️ Onvolledig strategisch beeld: slechts ${activeNodes} actieve analyses.`
      );

      recommendations.push(
        `Activeer minimaal ${this.minActiveNodes} kernnodes voor bestuurlijk betrouwbare synthese.`
      );

      return {
        insights,
        risks,
        opportunities,
        recommendations,
        confidence: Math.min(
          this.confidence,
          0.85 + activeNodes * 0.02
        ),
        content: {
          strategic_posture: "adaptive_balance",
          active_nodes: activeNodes,
          dual_layer: dualLayer,
        },
        metadata: {
          synthesis_quality: "partial",
          active_nodes: activeNodes,
          input_nodes: activeNodeNames,
          dual_layer: dualLayer,
          upgrade_policy: "only",
          version: "ultimate-2026-v3",
        },
      };
    }

    /* ---------- Aggregation ---------- */

    const allInsights = this.deduplicate(
      validEntries.flatMap(([, r]) => r.insights)
    );
    const allRisks = this.deduplicate(
      validEntries.flatMap(([, r]) => r.risks)
    );
    const allOpportunities = this.deduplicate(
      validEntries.flatMap(([, r]) => r.opportunities)
    );
    const allRecommendations = this.deduplicate(
      validEntries.flatMap(([, r]) => r.recommendations)
    );

    insights.push(...allInsights);
    risks.push(...allRisks);
    opportunities.push(...allOpportunities);
    recommendations.push(...allRecommendations);

    const riskDensity = this.calculateDensity(
      allRisks.length,
      activeNodes
    );
    const opportunityDensity = this.calculateDensity(
      allOpportunities.length,
      activeNodes
    );

    const posture = this.determinePosture(
      riskDensity,
      opportunityDensity
    );

    /* ---------- Strategic posture logic ---------- */

    switch (posture) {
      case "crisis_mode":
        risks.push(
          "🚨 SYSTEMISCHE DRUK: meerdere strategische domeinen tegelijk instabiel."
        );
        recommendations.push(
          "Schakel naar crisisritme: 1 prioriteit, 1 eigenaar, 30–60 dagen stabilisatie."
        );
        break;

      case "defensive_stabilization":
        insights.push(
          "Defensieve fase: risicoreductie heeft prioriteit boven expansie."
        );
        recommendations.push(
          "Stabiliseer kernprocessen en verlaag structurele risico’s vóór nieuwe groei."
        );
        break;

      case "offensive_growth":
        opportunities.push(
          "🌟 Offensief momentum: kansen domineren structureel."
        );
        recommendations.push(
          "Activeer groeimodus met strakke executiediscipline en korte feedbackloops."
        );
        break;

      case "adaptive_balance":
        insights.push(
          "⚖️ Gebalanceerd speelveld: scherpte in keuzes bepaalt succes."
        );
        recommendations.push(
          "Combineer selectieve groei met gerichte risicoreductie."
        );
        break;
    }

    /* ---------- Executive doctrine ---------- */

    insights.push(
      "Analyse creëert inzicht — maar alleen besluitkracht creëert resultaat."
    );

    recommendations.push(
      "1. Kies **maximaal 2** echte doorbraakprioriteiten voor 90 dagen."
    );
    recommendations.push(
      "2. Maak expliciet wat je **niet** meer doet (stop-lijst)."
    );
    recommendations.push(
      "3. Eén eigenaar per prioriteit, wekelijkse executiepulse."
    );
    recommendations.push(
      "4. Maandelijkse harde review: besluiten > discussie."
    );

    const dualLayer = buildDualLayerOutput({
      dominante_these: insights.join(" "),
      structurele_kernspanning: risks.join(" "),
      onvermijdelijke_keuzes: recommendations.join(" "),
      prijs_van_uitstel: risks.join(" "),
      mandaat_besluitrecht: recommendations.join(" "),
      onderstroom_informele_macht: insights.join(" "),
      faalmechanisme: risks.join(" "),
      interventieplan_90_dagen: recommendations.join(" "),
      decision_contract: recommendations.join(" "),
    });

    /* ---------- Confidence synthesis ---------- */

    const avgInputConfidence =
      validEntries.reduce((s, [, r]) => s + r.confidence, 0) /
      activeNodes;

    const finalConfidence = Math.min(
      this.maxConfidenceCap,
      Math.max(
        this.confidence,
        avgInputConfidence * this.confidenceBoostFactor
      )
    );

    /* ---------- Final result ---------- */

    return {
      insights,
      risks,
      opportunities,
      recommendations,
      confidence: finalConfidence,
      content: {
        strategic_posture: posture,
        active_nodes: activeNodes,
        risk_density: riskDensity,
        opportunity_density: opportunityDensity,
        dual_layer: dualLayer,
      },
      metadata: {
        synthesis_quality: "high",
        active_nodes: activeNodes,
        input_nodes: activeNodeNames,
        dual_layer: dualLayer,
        densities: {
          risk: riskDensity,
          opportunity: opportunityDensity,
        },
        strategic_posture: posture,
        dominant_equation:
          "Focus × Besluitkracht × Discipline × Leerloops",
        version: "ultimate-2026-v3",
        upgrade_policy: "only",
      },
    };
  }
}
