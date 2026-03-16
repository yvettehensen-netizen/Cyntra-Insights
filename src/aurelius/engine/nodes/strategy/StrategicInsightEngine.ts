import type { StrategicMechanism } from "./StrategicMechanismEngine";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type StrategicInsight = {
  insight: string;
  implication: string;
  strategic_lever: string;
};

export type StrategicInsightEngineInput = {
  mechanisms: StrategicMechanism[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function buildLever(mechanism: StrategicMechanism): string {
  const source = `${mechanism.mechanism} ${mechanism.structural_cause}`.toLowerCase();
  if (/(contract|plafond|tarief|kostprijs|marge)/.test(source)) {
    return "Contractdiscipline met tariefvloer, plafondrouting en expliciete verliesgrens per product.";
  }
  if (/(mandaat|governance|escalatie|besluit|onderstroom)/.test(source)) {
    return "Bindende besluitarchitectuur met vast escalatieritme, eigenaarschap en stop-doing discipline.";
  }
  if (/(capaciteit|werkdruk|productiviteit|casemix|uitval|planning)/.test(source)) {
    return "Capaciteitssturing op casemix, kwaliteitsbuffer en vroegtijdige correctie op overbelasting.";
  }
  return "Gefaseerde prioritering: eerst stabiliseren, daarna gecontroleerd verbreden.";
}

function dedupeInsights(items: StrategicInsight[]): StrategicInsight[] {
  const seen = new Set<string>();
  const output: StrategicInsight[] = [];
  for (const item of items) {
    const key = normalize(item.insight).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

export class StrategicInsightEngine {
  readonly name = "Strategic Insight Engine";

  analyze(input: StrategicInsightEngineInput): StrategicInsight[] {
    const insights = input.mechanisms.map((mechanism) => {
      const insight = mechanism.system_effect.includes("volumegroei")
        ? "Groei boven contractruimte produceert verliesvolume in plaats van waarde."
        : mechanism.system_effect.includes("Besluitvertraging")
          ? "Besluituitstel is een systeemmechanisme dat financiële en operationele schade versnelt."
          : "Operationele druk is geen incident, maar een voorspelbaar gevolg van systeemontwerp.";

      const implication = `Bestuurlijk betekent dit dat ${normalize(mechanism.system_effect).charAt(0).toLowerCase()}${normalize(mechanism.system_effect).slice(1)}`;

      return {
        insight,
        implication,
        strategic_lever: buildLever(mechanism),
      };
    });

    return dedupeInsights(insights).slice(0, 6);
  }

  analyzeStandard(input: StrategicInsightEngineInput): StrategicEngineResult {
    const insights = this.analyze(input);
    return {
      insights: uniqueLines(insights.map((item) => item.insight)),
      risks: uniqueLines(insights.map((item) => item.implication)),
      opportunities: uniqueLines(insights.map((item) => item.strategic_lever)),
      recommendations: uniqueLines(
        insights.map((item) => `Operationaliseer hefboom: ${item.strategic_lever}`)
      ),
      confidence: clampConfidence(insights.length >= 3 ? 0.78 : 0.6),
    };
  }
}
