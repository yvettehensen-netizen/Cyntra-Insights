import { ExecutiveGateError } from "@/aurelius/executive/types";
import { parseSections } from "./utils";

const CAUSAL = /\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|daardoor|hierdoor)\b/i;

export function validateCausalityGates(text: string): void {
  for (const section of parseSections(text)) {
    const hits = (section.body.match(/\b(omdat|waardoor|leidt tot|resulteert in|met gevolg dat|daardoor|hierdoor)\b/gi) ?? []).length;
    if (hits < 1 || !CAUSAL.test(section.body)) {
      throw new ExecutiveGateError(
        `Sectie ${section.number} mist causale keten.`,
        "SYSTEM_MECHANISM_REQUIRED",
        { section: section.number, hits },
        "Maak per sectie minimaal één expliciete causale keten zichtbaar."
      );
    }
  }
}
