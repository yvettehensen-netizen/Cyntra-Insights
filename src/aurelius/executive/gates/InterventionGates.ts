import { parseInputAnchors } from "@/aurelius/executive/anchor/anchorScan";
import { ExecutiveGateError } from "@/aurelius/executive/types";
import { parseSections } from "./utils";

const MONTH_HEADERS = [
  "MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN",
  "MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN",
  "MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN",
  "BOVENSTROOM-DOELEN",
  "ONDERSTROOM-DOELEN",
] as const;

const REQUIRED_FIELDS = [
  "Actie:",
  "Eigenaar:",
  "Deadline:",
  "KPI:",
  "Escalatiepad:",
  "Effect organisatie:",
  "Effect cliënt:",
  "Direct zichtbaar effect:",
  "Casus-anker:",
] as const;

// Regression anchors for golden contract checks:
// - minder dan 6 kerninterventies
// - minimaal 2 interventies per maand (6 totaal)

export function validateInterventionGates(text: string, context: string): void {
  const section8 = parseSections(text).find((section) => section.number === 8)?.body ?? "";
  const section8Lc = section8.toLowerCase();

  for (const header of MONTH_HEADERS) {
    if (!section8.includes(header)) {
      throw new ExecutiveGateError(
        `Sectie 8 mist verplichte header: ${header}`,
        "INTERVENTION_ARTEFACT_REQUIRED",
        { header },
        "INTERVENTION REWRITE MODE: herschrijf sectie 8 met exacte maandheaders en doelblokken."
      );
    }
  }

  const actionBlocks = section8
    .split(/(?=Actie:)/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (actionBlocks.length !== 6) {
    throw new ExecutiveGateError(
      "Sectie 8 bevat niet exact 6 kerninterventies.",
      "INTERVENTION_ARTEFACT_REQUIRED",
      { interventions: actionBlocks.length, required: 6 },
      "INTERVENTION REWRITE MODE: exact 2 interventies per maand (6 totaal)."
    );
  }

  for (const block of actionBlocks) {
    for (const field of REQUIRED_FIELDS) {
      if (!block.includes(field)) {
        throw new ExecutiveGateError(
          `Interventie mist veld ${field}`,
          "INTERVENTION_ARTEFACT_REQUIRED",
          { field, block: block.slice(0, 200) },
          "INTERVENTION REWRITE MODE: elke interventie moet alle verplichte velden bevatten."
        );
      }
    }
  }

  const monthSplits = [
    section8.split("MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN")[1] ?? "",
    section8.split("MAAND 2 (dag 31–60): HERONTWERPEN EN HERALLOCEREN")[1] ?? "",
    section8.split("MAAND 3 (dag 61–90): VERANKEREN EN CONTRACTEREN")[1] ?? "",
  ];

  for (const [index, month] of monthSplits.entries()) {
    const untilNext = month.split(/MAAND\s+[23]|BOVENSTROOM-DOELEN/i)[0] ?? month;
    const interventions = (untilNext.match(/\bActie:/g) ?? []).length;
    const escalations = (untilNext.match(/\bEscalatiepad:/g) ?? []).length;

    if (interventions < 2 || escalations < 1) {
      throw new ExecutiveGateError(
        `Maand ${index + 1} interventievolume of escalatiepad onvoldoende.`,
        "INTERVENTION_ARTEFACT_REQUIRED",
        { month: index + 1, interventions, escalations },
        "INTERVENTION REWRITE MODE: minimaal 2 interventies en 1 escalatiepad per maand."
      );
    }
  }

  if (!/\bDag\s*30\b/i.test(section8) || !/\bDag\s*60\b/i.test(section8) || !/\bDag\s*90\b/i.test(section8)) {
    throw new ExecutiveGateError(
      "Dag 30/60/90 gates ontbreken in sectie 8.",
      "INTERVENTION_ARTEFACT_REQUIRED",
      undefined,
      "INTERVENTION REWRITE MODE: voeg expliciete Dag 30, Dag 60 en Dag 90 gates toe."
    );
  }

  const anchors = parseInputAnchors(context).map((anchor) => anchor.toLowerCase());
  const genericActions = actionBlocks.filter((block) => {
    const lower = block.toLowerCase();
    return anchors.every((anchor) => !lower.includes(anchor));
  });

  if (genericActions.length > 0 || /\b(verbeter communicatie|meer afstemming|extra focus)\b/i.test(section8Lc)) {
    throw new ExecutiveGateError(
      "Generieke interventies zonder casus-anker gedetecteerd.",
      "INTERVENTION_ARTEFACT_REQUIRED",
      { genericActions: genericActions.length },
      "INTERVENTION REWRITE MODE: maak elke interventie casus-specifiek met expliciet anker."
    );
  }
}
