import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";

export class TradeOffEnforcerNode {
  readonly name = "Trade-Off Enforcer";
  readonly confidence = 0.98;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = JSON.stringify(context ?? {}).toLowerCase();

    const insights = [
      "Strategie zonder opoffering is geen strategie."
    ];

    const risks: string[] = [];
    const recommendations: string[] = [];

    const hasStop = /stop|niet doen|uitsluiten|afbouwen/.test(text);

    if (!hasStop) {
      risks.push("Geen expliciete stop-doing keuzes gedetecteerd.");
      recommendations.push("Formuleer minimaal één bewuste opoffering.");
    }

    recommendations.push("Maak zichtbaar wat deze keuze onmogelijk maakt.");

    return {
      section: "power_tradeoff",
      model: "TradeOffEnforcerNode",
      insights,
      risks,
      opportunities: [],
      recommendations,
      confidence: this.confidence,
      decision_signals: {
        has_clear_decision: true,
        tradeoffs_identified: hasStop,
        irreversible_choices_present: true,
        ownership_assigned: false,
        decision_urgency: "high"
      },
      metadata: {
        doctrine: "no_tradeoff_no_strategy",
        version: "2026.5",
        upgrade_policy: "add_only"
      }
    };
  }
}
