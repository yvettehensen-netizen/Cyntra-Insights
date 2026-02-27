export type SectorScoreInput = {
  signals: string[];
};

export type SectorScores = {
  sectorRiskIndex: number;
  regulatorPressureIndex: number;
  contractPowerScore: number;
  arbeidsmarktdrukIndex: number;
  rubric: Record<string, string>;
};

export function computeSectorScores(input: SectorScoreInput): SectorScores {
  const signals = input.signals ?? [];

  const regulator = signals.filter((s) => /toezicht|regelgeving|beleid|inspectie|compliance|igj|nza|afm|dnb|acm/i.test(s)).length;
  const contract = signals.filter((s) => /contract|tarief|verzekeraar|inkoop|prijs|contractmacht/i.test(s)).length;
  const labor = signals.filter((s) => /arbeidsmarkt|krapte|personeel|uitval|rooster|werkdruk/i.test(s)).length;
  const risk = signals.length;

  return {
    sectorRiskIndex: Math.min(100, risk * 20),
    regulatorPressureIndex: Math.min(100, regulator * 30),
    contractPowerScore: Math.min(100, contract * 30),
    arbeidsmarktdrukIndex: Math.min(100, labor * 30),
    rubric: {
      sectorRiskIndex: `20 * signal_count (${risk})`,
      regulatorPressureIndex: `30 * regulator_signal_count (${regulator})`,
      contractPowerScore: `30 * contract_signal_count (${contract})`,
      arbeidsmarktdrukIndex: `30 * labor_signal_count (${labor})`,
    },
  };
}
