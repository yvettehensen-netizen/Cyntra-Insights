// src/aurelius/engine/nlpExtractor.ts
import { NLPSignal } from "./signalTypes";
import { ConfidenceLevel } from "../types";

export function extractNLPSignals(context: string): NLPSignal[] {
  const signals: NLPSignal[] = [];

  if (context.includes("men ") || context.includes("wordt besloten")) {
    signals.push({
      type: "agency_diffusion",
      description: "Verantwoordelijkheid wordt diffuus geformuleerd.",
      evidence: ["men", "wordt besloten"],
      confidence: ConfidenceLevel.Medium,
    });
  }

  if (context.includes("uiteindelijk beslist")) {
    signals.push({
      type: "authority_shift",
      description: "Besluitvorming wordt impliciet doorgeschoven.",
      evidence: ["uiteindelijk beslist"],
      confidence: ConfidenceLevel.High,
    });
  }

  return signals;
}
