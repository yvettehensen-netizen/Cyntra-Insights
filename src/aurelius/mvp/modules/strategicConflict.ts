import type { SignalExtractionOutput, StrategicConflictOutput } from "../types";

export function strategicConflict(signals: SignalExtractionOutput): StrategicConflictOutput {
  const dominant = signals.tensions[0] || "impact vergroten vs kernkwaliteit beschermen";
  const [rawA, rawB] = dominant.split(/\s+vs\s+/i);
  const sideA = rawA?.trim() || "impact vergroten";
  const sideB = rawB?.trim() || "kernkwaliteit beschermen";

  return {
    conflict: dominant,
    sideA,
    sideB,
    mechanism:
      "Beide doelen vragen verschillende besturingslogica: schaal stuurt op standaardisatie, kwaliteit op lokaal eigenaarschap.",
    boardQuestion:
      "Als deze doelen niet tegelijk maximaal haalbaar zijn, welke krijgt expliciet prioriteit in de komende 12 maanden?",
  };
}

