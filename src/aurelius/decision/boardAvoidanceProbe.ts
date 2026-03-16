// ============================================================
// AURELIUS — BOARD AVOIDANCE PROBE
// ROUTE: src/aurelius/decision/boardAvoidanceProbe.ts
//
// DOEL:
// - Detecteert ontwijkgedrag van bestuur
// - Vangt verhullende taal en uitstelconstructies
// ============================================================

export interface BoardAvoidanceSignal {
  detected: boolean;
  indicators: string[];
}

export function boardAvoidanceProbe(text: string): BoardAvoidanceSignal {
  const lc = text.toLowerCase();

  const avoidancePatterns = [
    "verder onderzoeken",
    "nader analyseren",
    "in een volgende fase",
    "op termijn",
    "verkennen",
    "openhouden",
    "flexibel blijven",
    "geen definitieve keuze",
  ];

  const indicators = avoidancePatterns.filter((p) => lc.includes(p));

  return {
    detected: indicators.length > 0,
    indicators,
  };
}
