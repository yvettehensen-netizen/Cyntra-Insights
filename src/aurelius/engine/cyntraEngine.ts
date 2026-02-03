// ============================================================
// src/aurelius/engine/cyntraEngine.ts
// ============================================================

import { extractNLPSignals } from "./nlpExtractor";
import { runConsultant } from "./consultantRunner";
import { synthesize } from "./synthesis";
import { consultants } from "../consultants";

export async function runCyntra(context: string) {
  const signals = extractNLPSignals(context);

  const results = [];

  for (const consultant of consultants) {
    results.push(
      await runConsultant(consultant, context, signals)
    );
  }

  return synthesize(results);
}
