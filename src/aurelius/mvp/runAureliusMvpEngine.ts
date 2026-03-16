import { boardMemo } from "./modules/boardMemo";
import { interventionEngine } from "./modules/interventionEngine";
import { killerInsight } from "./modules/killerInsight";
import { signalExtraction } from "./modules/signalExtraction";
import { strategicConflict } from "./modules/strategicConflict";
import type { AureliusMvpResult } from "./types";

export function runAureliusMvpEngine(input: {
  organizationName?: string;
  context: string;
}): AureliusMvpResult {
  const signals = signalExtraction(input.context);
  const conflict = strategicConflict(signals);
  const insight = killerInsight(signals, conflict);
  const interventions = interventionEngine({
    signals,
    conflict,
    insight,
  });
  const memo = boardMemo({
    organizationName: input.organizationName,
    signals,
    conflict,
    insight,
    intervention: interventions,
  });

  return {
    signalExtraction: signals,
    strategicConflict: conflict,
    killerInsight: insight,
    interventionEngine: interventions,
    boardMemo: memo,
  };
}

