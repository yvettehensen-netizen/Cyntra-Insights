import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";

function normalize(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function hasMechanismSignal(text: string): boolean {
  return /\b(mechanisme|oorzaak|waardoor|omdat|via|door|systemPressure|systeemdruk|gevolg)\b/i.test(text);
}

function hasSymptomSignal(text: string): boolean {
  return /\b(druk|wachttijd|wachtdruk|uitval|marge|vertraging|frictie|schaarste|drukte|risico)\b/i.test(text);
}

export function symptomWithoutMechanismCheck(
  text: string,
  analysisMap?: StrategicAnalysisMap
): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const source = normalize(text);
  if (!source && !analysisMap) {
    return { pass: true, issues };
  }

  if (analysisMap?.systemMechanism) {
    const fields = [
      analysisMap.systemMechanism.symptom,
      analysisMap.systemMechanism.cause,
      analysisMap.systemMechanism.mechanism,
      analysisMap.systemMechanism.consequence,
      analysisMap.systemMechanism.systemPressure,
      analysisMap.systemMechanism.boardImplication,
    ].map(normalize);
    const combined = fields.join(" ");
    const hasStructuredFields =
      Boolean(fields[0]) &&
      Boolean(fields[1]) &&
      Boolean(fields[2]) &&
      Boolean(fields[3]) &&
      Boolean(fields[4]);
    if (!hasStructuredFields && !hasMechanismSignal(combined)) {
      issues.push("Analysekaart mist expliciete mechanistische keten.");
    }
  }

  const dominantRisk = normalize(analysisMap?.dominantRisk || "");
  if (dominantRisk && !analysisMap?.systemMechanism && hasSymptomSignal(dominantRisk) && !hasMechanismSignal(dominantRisk)) {
    issues.push("Dominant risico beschrijft vooral een symptoom zonder expliciet mechanisme.");
  }

  const hasMechanismSection = /\bSysteemmechanisme\b/i.test(source);
  const hasMechanismChains = /\bMechanismeketens\b/i.test(source) || /\bMECHANISME\s*[—:-]/i.test(source);
  if (source && /\bKERNPROBLEEM\b/i.test(source) && !hasMechanismSection && !hasMechanismChains && hasSymptomSignal(source)) {
    issues.push("Rapport benoemt symptomen maar mist een expliciete systeemmechanismesectie.");
  }

  return {
    pass: issues.length === 0,
    issues,
  };
}
