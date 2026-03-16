import { buildImplementationFrictionModel } from "./ImplementationFrictionModel";
import { buildStakeholderAdoptionModel } from "./StakeholderAdoptionModel";
import { buildCoalition } from "./CoalitionBuilder";
import { predictResistance } from "./ResistancePredictor";

export type OrganizationalSimulationInput = {
  orgDynamicsOutput: string;
  boardroomOutput: string;
  interventionOutput: string;
  decisionPressureOutput: string;
};

export type OrganizationalSimulationResult = {
  interventionCount: number;
  block: string;
};

export function runOrganizationalSimulation(
  input: OrganizationalSimulationInput
): OrganizationalSimulationResult {
  const adoption = buildStakeholderAdoptionModel({
    interventionText: input.interventionOutput,
    boardroomText: input.boardroomOutput,
  });
  const resistance = predictResistance({
    orgDynamicsText: input.orgDynamicsOutput,
    boardroomText: input.boardroomOutput,
    decisionPressureText: input.decisionPressureOutput,
  });
  const friction = buildImplementationFrictionModel({
    orgDynamicsText: input.orgDynamicsOutput,
    interventionText: input.interventionOutput,
  });
  const coalition = buildCoalition({
    boardroomText: input.boardroomOutput,
    decisionPressureText: input.decisionPressureOutput,
  });

  const perIntervention = adoption
    .map((a, idx) => {
      const r = resistance[idx % resistance.length];
      const f = friction[idx % friction.length];
      return [
        `INTERVENTIE: ${a.intervention}`,
        `UITVOERINGSROUTE (WIE/WANNEER): ${a.mustAdopt}; uitvoering in maandcadans met weekreviews.`,
        `WAAR HET GAAT KNARSEN: ${r.point}; ${f.friction}.`,
        `WAAROM DIT GAAT KNARSEN (MECHANISME): ${r.why}; ${f.missingCondition}.`,
        `WAT JE MOET DOEN VOORDAT JE START: borg mandaat, dataritme en escalatie-eigenaarschap.`,
        `RISICO ALS JE DIT NIET DOET: ${r.risk} ${f.failureMode}.`,
        `AANPASSING VOOR UITVOERBAARHEID: fasering per team, expliciete stop-doing en 48-uurs escalatie.`,
      ].join("\n");
    })
    .join("\n\n");

  const block = [
    "EXECUTIEROUTE EN ADOPTIEPAD",
    adoption
      .map(
        (a) =>
          `${a.intervention} | STAKEHOLDERS: ${a.stakeholders} | WIE MOET ADOPTEREN: ${a.mustAdopt} | WIE KAN BLOKKEREN: ${a.canBlock} | WIE KAN VERSNELLEN: ${a.canAccelerate}`
      )
      .join("\n"),
    "",
    "VERWACHTE WEERSTANDSPUNTEN",
    resistance
      .map(
        (r) =>
          `WEERSTANDSPUNT: ${r.point} | WAAROM HIER WEERSTAND ONTSTAAT: ${r.why} | VORM (${r.form}) | RISICO ALS DIT NIET WORDT GEMITIGEERD: ${r.risk}`
      )
      .join("\n"),
    "",
    "UITVOERINGSFRICTIE",
    friction
      .map(
        (f) =>
          `UITVOERINGSFRICTIE: ${f.friction} | WELK PROCES HIER KNELT: ${f.bottleneckProcess} | WELKE VOORWAARDE ONTBREEKT: ${f.missingCondition} | WAT ER DAN MISGAAT: ${f.failureMode}`
      )
      .join("\n"),
    "",
    "BENODIGDE COALITIE EN MANDAAT",
    `COALITIE: ${coalition.coalition}`,
    `WELK MANDAAT NODIG IS: ${coalition.requiredMandate}`,
    `WIE EIGENAAR IS VAN WELKE BESLUITEN: ${coalition.ownershipMapping}`,
    "",
    "AANPASSINGEN VOOR UITVOERBAARHEID",
    "Start met pilot op hoogste frictie-interventies, leg stopregels vooraf vast en sluit elke blokkade binnen 48 uur.",
    "",
    perIntervention,
  ].join("\n");

  return {
    interventionCount: adoption.length,
    block,
  };
}
