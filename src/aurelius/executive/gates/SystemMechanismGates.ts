import { ExecutiveGateError } from "@/aurelius/executive/types";
import { parseSections, sentences } from "./utils";

const MECHANISM_GUARD = /\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|prikkel|mechanisme|feedbackloop|frictie)\b/i;

export function validateSystemMechanismGates(text: string): void {
  const sections = parseSections(text);

  for (const section of sections) {
    const firstSentence = sentences(section.body)[0] ?? "";

    if (/^de\s+organisatie\b/i.test(firstSentence) && !MECHANISM_GUARD.test(firstSentence)) {
      throw new ExecutiveGateError(
        `Sectie ${section.number} start als observatie zonder mechanisme.`,
        "SYSTEM_MECHANISM_REQUIRED",
        { section: section.number, firstSentence },
        "Start elke sectie met mechanische causalketen: Omdat A -> ontstaat B -> leidt tot C."
      );
    }

    if (!MECHANISM_GUARD.test(section.body)) {
      throw new ExecutiveGateError(
        `Sectie ${section.number} mist mechanisme.`,
        "SYSTEM_MECHANISM_REQUIRED",
        { section: section.number },
        "Voeg expliciete oorzaak-gevolg mechaniek toe in de openingszinnen van elke sectie."
      );
    }
  }
}
