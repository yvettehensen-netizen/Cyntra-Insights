import { detectCausalMechanisms } from "@/aurelius/causal/CausalMechanismDetector";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type StrategicMechanism = {
  symptom: string;
  mechanism: string;
  structural_cause: string;
  system_effect: string;
};

export type StrategicMechanismEngineInput = {
  contextText: string;
  diagnosisText?: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function inferSystemEffect(mechanism: string, structuralCause: string): string {
  const source = `${mechanism} ${structuralCause}`.toLowerCase();
  if (/(tarief|kostprijs|contract|plafond|marge|verlies|liquiditeit)/.test(source)) {
    return "Economische druk versterkt volumegroei zonder proportioneel margeherstel.";
  }
  if (/(mandaat|governance|escalatie|besluit|onderstroom|uitstel)/.test(source)) {
    return "Besluitvertraging vertaalt zich in structureel uitvoeringsverlies en hogere correctiekosten.";
  }
  if (/(capaciteit|werkdruk|productiviteit|uitval|planning|casemix)/.test(source)) {
    return "Operationele belasting verschuift van tijdelijke frictie naar structurele instabiliteit.";
  }
  return "Het systeem blijft zichzelf versterken doordat korte-termijncorrecties de onderliggende oorzaak niet wegnemen.";
}

function dedupeMechanisms(items: StrategicMechanism[]): StrategicMechanism[] {
  const seen = new Set<string>();
  const output: StrategicMechanism[] = [];
  for (const item of items) {
    const key = normalize(`${item.symptom} ${item.mechanism}`).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

export class StrategicMechanismEngine {
  readonly name = "Strategic Mechanism Engine";

  analyze(input: StrategicMechanismEngineInput): StrategicMechanism[] {
    const contextText = normalize(input.contextText);
    const diagnosisText = normalize(input.diagnosisText ?? "");

    const base = detectCausalMechanisms({
      contextText,
      hypothesisText: diagnosisText,
      memoryText: "",
      graphText: "",
    });

    const mapped: StrategicMechanism[] = base.items.map((item) => ({
      symptom: normalize(item.symptom),
      mechanism: normalize(item.mechanism),
      structural_cause: normalize(item.structuralCause),
      system_effect: inferSystemEffect(item.mechanism, item.structuralCause),
    }));

    return dedupeMechanisms(mapped).slice(0, 6);
  }

  analyzeStandard(input: StrategicMechanismEngineInput): StrategicEngineResult {
    const mechanisms = this.analyze(input);
    return {
      insights: uniqueLines(mechanisms.map((item) => `${item.symptom}: ${item.mechanism}`)),
      risks: uniqueLines(mechanisms.map((item) => item.system_effect)),
      opportunities: uniqueLines(
        mechanisms.map((item) => `Doorbraak via structurele oorzaak: ${item.structural_cause}`)
      ),
      recommendations: uniqueLines(
        mechanisms.map(
          (item) => `Prioriteer interventie op mechanisme '${item.mechanism}' en monitor systeemeffect.`
        )
      ),
      confidence: clampConfidence(mechanisms.length >= 3 ? 0.74 : 0.58),
    };
  }
}
