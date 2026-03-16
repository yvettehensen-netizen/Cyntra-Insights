export type StrategicTension = {
  optionA: string;
  optionB: string;
  dominantRisk: string;
  decisionPressure: string;
};

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export class StrategicTensionEngine {
  detectStrategicOptions(options: string[]): string[] {
    return Array.from(new Set(options.map((item) => normalize(item)).filter(Boolean))).slice(0, 3);
  }

  identifyDominantTension(options: string[], dominantRisk: string): StrategicTension {
    const [optionA, optionB] = this.detectStrategicOptions(options);
    return {
      optionA: optionA || "Optie A niet beschikbaar",
      optionB: optionB || "Optie B niet beschikbaar",
      dominantRisk: normalize(dominantRisk) || "onvoldoende informatie beschikbaar",
      decisionPressure:
        normalize(dominantRisk) ||
        "Keuze-uitstel vergroot structurele schade sneller dan aanvullende activiteit die kan compenseren.",
    };
  }

  validateOptionContrast(tension: StrategicTension): boolean {
    return Boolean(
      tension.optionA &&
        tension.optionB &&
        tension.optionA.toLowerCase() !== tension.optionB.toLowerCase()
    );
  }
}
