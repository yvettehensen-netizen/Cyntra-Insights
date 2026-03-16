import type { AnalysisContext } from "@/aurelius/engine/types";
import {
  clampConfidence,
  uniqueLines,
  type StrategicEngineResult,
} from "@/aurelius/engine/contracts/StrategicEngineResult";

export type StrategicConflict = {
  tensionA: string;
  tensionB: string;
  explanation: string;
};

export type StrategicConflictInput = {
  analysisContext?: AnalysisContext | string;
  caseStructure?: Array<{ theme: string; description?: string; signals?: string[] }>;
  mechanisms?: string[];
  economicSignals?: string[];
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toText(input: StrategicConflictInput): string {
  const fromContext =
    typeof input.analysisContext === "string"
      ? input.analysisContext
      : [
          input.analysisContext?.rawText ?? "",
          ...(Array.isArray(input.analysisContext?.documents) ? input.analysisContext.documents : []),
        ].join("\n");

  const fromThemes = (input.caseStructure ?? [])
    .map((item) => `${item.theme} ${item.description ?? ""} ${(item.signals ?? []).join(" ")}`)
    .join("\n");

  const fromMechanisms = [...(input.mechanisms ?? []), ...(input.economicSignals ?? [])].join("\n");

  return normalize([fromContext, fromThemes, fromMechanisms].filter(Boolean).join("\n"));
}

export class StrategicConflictNode {
  readonly name = "StrategicConflictNode";

  analyze(input: StrategicConflictInput): StrategicConflict {
    const source = toText(input).toLowerCase();

    const qualityVsScaleScore =
      Number(/\bkwaliteit|behandelrelatie|cultuur|eigenaarschap\b/.test(source)) * 2 +
      Number(/\bgroei|schaal|impact|wachttijd|instroom\b/.test(source)) * 2;

    const autonomyVsStandardScore =
      Number(/\bautonomie|professionele ruimte|decentraal\b/.test(source)) * 2 +
      Number(/\bstandaard|protocol|uniform|governance\b/.test(source)) * 2;

    const marginVsInnovationScore =
      Number(/\bmarge|tarief|kostprijs|loonkosten|contract\b/.test(source)) * 2 +
      Number(/\binnovatie|pilot|ontwikkeling|vernieuwing\b/.test(source)) * 2;

    if (
      qualityVsScaleScore >= autonomyVsStandardScore &&
      qualityVsScaleScore >= marginVsInnovationScore
    ) {
      return {
        tensionA: "Behandelkwaliteit beschermen",
        tensionB: "Maatschappelijke impact vergroten",
        explanation:
          "Door groei te begrenzen blijft kwaliteit en eigenaarschap stabiel, maar impact kan alleen versnellen via overdraagbare netwerkadoptie in plaats van extra FTE.",
      };
    }

    if (autonomyVsStandardScore >= marginVsInnovationScore) {
      return {
        tensionA: "Professionele autonomie behouden",
        tensionB: "Standaardisatie afdwingen",
        explanation:
          "Lokale professionele ruimte verhoogt maatwerk, maar zonder standaardkaders neemt variatie toe en daalt bestuurlijke voorspelbaarheid van resultaten.",
      };
    }

    return {
      tensionA: "Financiele weerbaarheid borgen",
      tensionB: "Innovatieruimte behouden",
      explanation:
        "Tarief- en kostendruk vereisen strakke margecontrole; zonder expliciete innovatieruimte droogt het toekomstige schaalmechanisme via nieuwe modellen op.",
    };
  }

  analyzeStandard(input: StrategicConflictInput): StrategicEngineResult {
    const conflict = this.analyze(input);
    return {
      insights: [`Kernconflict: ${conflict.tensionA} versus ${conflict.tensionB}.`],
      risks: [
        `Zonder expliciete keuze tussen '${conflict.tensionA}' en '${conflict.tensionB}' verschuift executie naar ad-hoc compromis.`,
      ],
      opportunities: [`Maak het conflict bestuurbaar via keuzeprioriteit en vaste escalatieregels.`],
      recommendations: [
        `Formuleer een board-besluit dat expliciet prioriteert tussen '${conflict.tensionA}' en '${conflict.tensionB}'.`,
      ],
      confidence: clampConfidence(0.79),
    };
  }
}

