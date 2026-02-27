import { parseInputAnchors, scanOutputCoverage } from "@/aurelius/executive/anchor/anchorScan";
import { ExecutiveGateError } from "@/aurelius/executive/types";
import { parseSections } from "./utils";

export function validateAnchorGates(text: string, context: string): void {
  const anchors = parseInputAnchors(context);
  const outputCoverage = scanOutputCoverage(text, anchors);

  if (outputCoverage.matched.length < 6) {
    throw new ExecutiveGateError(
      "Te weinig unieke casus-ankers in output.",
      "CASUS_ANCHORS_MIN",
      { matched: outputCoverage.matched.length, required: 6 },
      "ANCHOR REPAIR MODE: elke sectie minimaal 2 casus-ankers; sectie 8 elke interventie met casus-anker."
    );
  }

  const sections = parseSections(text);
  let richSections = 0;

  for (const section of sections) {
    const hits = anchors.filter((anchor) => section.body.toLowerCase().includes(anchor.toLowerCase())).length;
    if (hits >= 2) richSections += 1;
  }

  if (richSections < 6) {
    throw new ExecutiveGateError(
      "Te weinig secties met >=2 casus-ankers.",
      "SECTION_ANCHORS_DISTRIBUTION",
      { richSections, required: 6 },
      "ANCHOR REPAIR MODE: herbouw volledige output met minimaal 2 casus-ankers in elke sectie."
    );
  }

  const section8 = sections.find((section) => section.number === 8)?.body ?? "";
  const section8Anchors = anchors.filter((anchor) => section8.toLowerCase().includes(anchor.toLowerCase()));
  if (section8Anchors.length < 10) {
    throw new ExecutiveGateError(
      "Sectie 8 bevat te weinig casus-ankers.",
      "SECTION8_ANCHORS_MIN",
      { found: section8Anchors.length, required: 10 },
      "INTERVENTION REWRITE MODE: elke interventie koppelen aan expliciet casus-anker uit context."
    );
  }
}
