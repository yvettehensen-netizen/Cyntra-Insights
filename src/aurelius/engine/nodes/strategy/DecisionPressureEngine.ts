import {
  generateDecisionOptions,
  type StrategicDecisionOption,
} from "@/aurelius/decision/DecisionOptionGenerator";
import {
  analyzeDecisionTradeoffs,
  type DecisionTradeoff,
} from "@/aurelius/decision/DecisionTradeoffAnalyzer";
import { buildDecisionPressure } from "@/aurelius/decision/DecisionPressureEngine";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";
import type { StrategicInsight } from "./StrategicInsightEngine";
import type { StrategicMechanism } from "./StrategicMechanismEngine";

export type StrategicDecisionOutput = {
  dominant_thesis: string;
  strategic_options: StrategicDecisionOption[];
  explicit_tradeoffs: DecisionTradeoff[];
  price_of_delay: {
    days_30: string;
    days_90: string;
    days_365: string;
  };
  preferred_option: "A" | "B" | "C";
  preferred_option_reason: string;
  decision_block: string;
};

export type StrategicDecisionEngineInput = {
  contextText: string;
  diagnosisText?: string;
  mechanisms: StrategicMechanism[];
  insights: StrategicInsight[];
};

function composeDominantThesis(
  preferredOption: "A" | "B" | "C",
  preferredReason: string
): string {
  const direction =
    preferredOption === "A"
      ? "consolidatie van de kern"
      : preferredOption === "B"
        ? "versnelling van verbreding"
        : "gerichte herstructurering met harde prioritering";
  return `De dominante bestuurlijke these is dat ${direction} nu noodzakelijk is omdat ${preferredReason.charAt(0).toLowerCase()}${preferredReason.slice(1)}`;
}

export class DecisionPressureEngine {
  readonly name = "Strategic Decision Pressure Engine";

  analyze(input: StrategicDecisionEngineInput): StrategicDecisionOutput {
    const mechanismsText = input.mechanisms
      .map((m) => `${m.symptom} ${m.mechanism} ${m.structural_cause} ${m.system_effect}`)
      .join("\n");
    const insightText = input.insights
      .map((i) => `${i.insight} ${i.implication} ${i.strategic_lever}`)
      .join("\n");
    const diagnosisText = String(input.diagnosisText ?? "");

    const strategic_options = generateDecisionOptions({
      contextText: input.contextText,
      causalText: mechanismsText,
      hypothesisText: `${diagnosisText}\n${insightText}`.trim(),
    });
    const explicit_tradeoffs = analyzeDecisionTradeoffs(strategic_options);
    const pressure = buildDecisionPressure({
      tradeoffs: explicit_tradeoffs,
      causalText: mechanismsText,
      hypothesisText: insightText,
      memoryText: diagnosisText,
      graphText: "",
    });

    const price_of_delay = {
      days_30:
        "Binnen 30 dagen verschuift de schade van analyse naar tempoverlies: besluiten blijven liggen en correcties worden ad-hoc.",
      days_90:
        "Binnen 90 dagen verschuift de schade naar beheersbaarheid: frictie in capaciteit, planning en mandaat wordt structureel zichtbaar.",
      days_365:
        "Binnen 365 dagen verschuift de schade naar keuzevrijheid: herstel blijft mogelijk, maar alleen tegen hogere kosten en met minder strategische ruimte.",
    };

    return {
      dominant_thesis: composeDominantThesis(
        pressure.preferredOptionCode,
        pressure.preferredOptionReason
      ),
      strategic_options,
      explicit_tradeoffs,
      price_of_delay,
      preferred_option: pressure.preferredOptionCode,
      preferred_option_reason: pressure.preferredOptionReason,
      decision_block: pressure.block,
    };
  }

  analyzeStandard(input: StrategicDecisionEngineInput): StrategicEngineResult {
    const decision = this.analyze(input);
    const recommended = decision.strategic_options.find(
      (item) => item.code === decision.preferred_option
    );

    return {
      insights: uniqueLines([decision.dominant_thesis]),
      risks: uniqueLines([
        decision.price_of_delay.days_30,
        decision.price_of_delay.days_90,
        decision.price_of_delay.days_365,
      ]),
      opportunities: uniqueLines(
        decision.strategic_options.map(
          (item) => `${item.code}: ${item.name} - ${item.strategicDirection}`
        )
      ),
      recommendations: uniqueLines([
        `Kies optie ${decision.preferred_option}: ${recommended?.name ?? "Voorkeursoptie"}`,
        decision.preferred_option_reason,
      ]),
      confidence: clampConfidence(decision.explicit_tradeoffs.length >= 3 ? 0.76 : 0.61),
    };
  }
}
