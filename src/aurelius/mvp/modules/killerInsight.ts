import type { KillerInsightOutput, SignalExtractionOutput, StrategicConflictOutput } from "../types";

export function killerInsight(
  signals: SignalExtractionOutput,
  conflict: StrategicConflictOutput
): KillerInsightOutput {
  const hasNetwork = signals.patterns.some((item) => /network/i.test(item));
  const hasOwnership = signals.patterns.some((item) => /partnership/i.test(item));

  if (hasNetwork && hasOwnership) {
    return {
      insight: "De organisatie heeft primair een replicatieprobleem, geen klassiek groeiprobleem.",
      mechanism:
        "Waarde ontstaat lokaal via eigenaarschap; lineaire personeelsgroei verzwakt dat mechanisme sneller dan netwerkreplicatie.",
      implication:
        "Bestuur moet schaal organiseren via modeladoptie met guardrails in plaats van via volumegroei.",
    };
  }

  return {
    insight: "Het kernprobleem is strategische prioritering, niet gebrek aan initiatieven.",
    mechanism:
      "Conflicterende doelen zonder expliciete keuze veroorzaken besluitversnippering en uitvoeringsverlies.",
    implication: `Bestuur moet expliciet kiezen tussen "${conflict.sideA}" en "${conflict.sideB}".`,
  };
}

