// ============================================================
// src/aurelius/engine/nodes/strategy/StrategyCoreNode.ts
// AURELIUS — STRATEGY CORE NODE (CANON)
// ============================================================

import type {
  AnalysisContext,
  ModelResult,
} from "../../types";
import type { ExpertNode } from "../ExpertNode";

/* =========================
   CONTEXT EXTRACTION
========================= */
function extractText(context: AnalysisContext): string {
  return [
    context.rawText ?? "",
    ...(context.documents ?? []),
    JSON.stringify(context.userContext ?? {}),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/* =========================
   STRATEGY CORE NODE
========================= */
export class StrategyCoreNode implements ExpertNode {
  readonly name = "Strategic Core Clarity";
  readonly confidence = 0.92;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    const text = extractText(context);

    const hasExplicitChoices =
      /keuze|focus|prioriteit|stoppen|niet doen/i.test(text);

    const hasClearFocus =
      /kernstrategie|hoofdrichting|dominante keuze/i.test(text);

    const hasExecutionSignals =
      /uitvoering|executie|ownership|kpi|planning/i.test(text);

    const score =
      (hasExplicitChoices ? 30 : 10) +
      (hasClearFocus ? 40 : 15) +
      (hasExecutionSignals ? 30 : 20);

    return {
      section: "strategy",

      model: "Strategy Core",

      insights: [
        "Strategische kracht ontstaat door expliciete keuzes.",
        !hasExplicitChoices &&
          "Gebrek aan stop-keuzes verzwakt strategische focus.",
        !hasClearFocus &&
          "Diffuus strategisch verhaal leidt tot versnippering.",
      ].filter(Boolean) as string[],

      risks: [
        !hasExplicitChoices && "Strategische drift door keuze-vermijding.",
        !hasExecutionSignals &&
          "Strategie blijft conceptueel zonder executiekracht.",
      ].filter(Boolean) as string[],

      opportunities: [
        "Aanscherping van strategische kern levert directe executiewinst.",
        "Stop-keuzes creëren focus en eigenaarschap.",
      ],

      recommendations: [
        "Formuleer één dominante strategische keuze.",
        "Benoem expliciet wat niet meer wordt gedaan.",
        "Koppel keuzes aan eindverantwoordelijkheid.",
      ],

      confidence: this.confidence,

      content: {
        choices_clarity: hasExplicitChoices ? "hoog" : "laag",
        focus_level: hasClearFocus ? "geconcentreerd" : "diffuus",
        execution_readiness: hasExecutionSignals ? "hoog" : "middel",
        score,
        urgency: score < 70 ? "Hoog" : "Middel",
      },

      metadata: {
        judgement_model: "strategy-core-clarity",
        detected: {
          explicit_choices: hasExplicitChoices,
          clear_focus: hasClearFocus,
          execution_signals: hasExecutionSignals,
        },
      },
    };
  }
}
