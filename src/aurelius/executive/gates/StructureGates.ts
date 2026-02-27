import { ExecutiveGateError } from "@/aurelius/executive/types";
import { CANONICAL_HEADINGS, firstContentLine, parseSections } from "./utils";

const COMMIT_PREFIX = "De Raad van Bestuur committeert zich aan:";

export function validateStructureGates(text: string): void {
  const sections = parseSections(text);

  if (sections.length !== 9) {
    throw new ExecutiveGateError(
      "Exact 9 secties vereist.",
      "EXACT_9_SECTIONS",
      { count: sections.length },
      "Herbouw de volledige output met exact 9 canonieke secties."
    );
  }

  for (let i = 0; i < CANONICAL_HEADINGS.length; i += 1) {
    if (sections[i]?.heading !== CANONICAL_HEADINGS[i]) {
      throw new ExecutiveGateError(
        "Heading exact match mislukt.",
        "HEADING_EXACT_MATCH",
        { expected: CANONICAL_HEADINGS[i], observed: sections[i]?.heading },
        "Gebruik exact de 9 canonieke headings in vaste volgorde."
      );
    }
  }

  if (!sections.find((section) => section.number === 8)?.body.trim()) {
    throw new ExecutiveGateError(
      "Sectie 8 ontbreekt of is leeg.",
      "SECTION_8_PRESENT",
      undefined,
      "Vul sectie 8 volledig met maandblokken en interventies."
    );
  }

  const section9 = sections.find((section) => section.number === 9);
  if (!section9) {
    throw new ExecutiveGateError("Sectie 9 ontbreekt.", "SECTION_9_COMMIT_PREFIX");
  }

  const firstLine = firstContentLine(section9.body);
  if (firstLine !== COMMIT_PREFIX) {
    throw new ExecutiveGateError(
      "Sectie 9 moet exact starten met commit-prefix.",
      "SECTION_9_COMMIT_PREFIX",
      { firstLine },
      "Start sectie 9 exact met: De Raad van Bestuur committeert zich aan:"
    );
  }

  const headingCount = (String(text ?? "").match(/^###\s*\d+\./gm) ?? []).length;
  if (headingCount !== 9) {
    throw new ExecutiveGateError(
      "Extra headings gevonden.",
      "NO_EXTRA_HEADINGS",
      { headingCount },
      "Verwijder extra headings; behoud exact 9 hoofdkoppen."
    );
  }

  for (const section of sections) {
    if (section.number <= 7 && /^\s*([-*•]|\d+[.)])\s+/m.test(section.body)) {
      throw new ExecutiveGateError(
        "Bullets buiten sectie 8/9 zijn verboden.",
        "NO_BULLETS_OUTSIDE_8_9",
        { section: section.number },
        "Gebruik in sectie 1-7 alleen doorlopende alinea's zonder bullets."
      );
    }
  }
}
