import { ExecutiveGateError } from "@/aurelius/executive/types";
import { ngramOverlap, tokenize } from "./utils";

const MAX_OVERLAP = 0.18;
const MIN_DENSITY = 0.18;

export function validateAntiStagnationGates(text: string, lastOutput?: string): void {
  if (lastOutput) {
    const overlap = ngramOverlap(lastOutput, text, 4);
    if (overlap > MAX_OVERLAP) {
      throw new ExecutiveGateError(
        "Repetition overlap te hoog.",
        "REPETITION_TOO_HIGH",
        { overlap, threshold: MAX_OVERLAP },
        "Herschrijf volledig met andere mechanische ketens en andere formuleringen."
      );
    }
  }

  const tokens = tokenize(text);
  const uniqueRatio = tokens.length ? new Set(tokens).size / tokens.length : 0;
  if (uniqueRatio < MIN_DENSITY) {
    throw new ExecutiveGateError(
      "Semantische dichtheid te laag.",
      "SEMANTIC_DENSITY_TOO_LOW",
      { uniqueRatio, threshold: MIN_DENSITY },
      "Verhoog lexicale variatie en verwijder herhaling per sectie."
    );
  }
}
