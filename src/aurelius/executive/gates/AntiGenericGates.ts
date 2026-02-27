import { ExecutiveGateError } from "@/aurelius/executive/types";

const FORBIDDEN = /\b(default template|transformatie-template|state under pressure|mogelijk|zou kunnen|quick win|low hanging fruit|geen expliciete context aangeleverd|analyseer structureel)\b/i;

export function validateAntiGenericGates(text: string): void {
  if (FORBIDDEN.test(text)) {
    throw new ExecutiveGateError(
      "Generieke of verboden taal gedetecteerd.",
      "SEMANTIC_DENSITY_TOO_LOW",
      undefined,
      "Vervang generieke taal door concrete casusfrictie met actor, mechanisme en gevolg."
    );
  }
}
