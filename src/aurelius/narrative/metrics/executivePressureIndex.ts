export function calculateExecutivePressureIndex(text: string): {
  score: number;
  causalDensity: number;
  lossSignals: number;
  timePressure: number;
  powerShifts: number;
  irreversibility: number;
  choiceSignals: number;
} {
  const source = String(text ?? "");
  const causalDensity = (source.match(/\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat)\b/gi) ?? []).length;
  const lossSignals = (source.match(/\b(verlies|inlevering|accepted loss|opoffering|schade)\b/gi) ?? []).length;
  const timePressure = (source.match(/\b(30 dagen|90 dagen|365 dagen|dag 30|dag 60|dag 90|venster sluit|tijdsdruk)\b/gi) ?? []).length;
  const powerShifts = (source.match(/\b(mandaat verschuift|besluitrecht verschuift|eigenaarschap verschuift|status verliest|wint tempo|gatekeeping|stil veto)\b/gi) ?? []).length;
  const irreversibility = (source.match(/\b(point of no return|onomkeerbaar|irreversibel)\b/gi) ?? []).length;
  const choiceSignals = (source.match(/\b(bestuur nu moet kiezen|de raad kiest|keuze:|besluitrecht ligt bij)\b/gi) ?? []).length;

  const weighted =
    Math.min(causalDensity * 2.2, 25) +
    Math.min(lossSignals * 3, 15) +
    Math.min(timePressure * 2.5, 15) +
    Math.min(powerShifts * 4.5, 20) +
    Math.min(irreversibility * 6, 15) +
    Math.min(choiceSignals * 2, 10);

  return {
    score: Math.min(100, Math.round(weighted)),
    causalDensity,
    lossSignals,
    timePressure,
    powerShifts,
    irreversibility,
    choiceSignals,
  };
}
