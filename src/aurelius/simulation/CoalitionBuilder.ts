export type CoalitionBuilderInput = {
  boardroomText: string;
  decisionPressureText: string;
};

export type CoalitionPlan = {
  coalition: string;
  requiredMandate: string;
  ownershipMapping: string;
};

export function buildCoalition(input: CoalitionBuilderInput): CoalitionPlan {
  const source = `${input.boardroomText}\n${input.decisionPressureText}`.toLowerCase();
  const hasCentralization = /centrale|mandaat|prioritering|besluitrecht/.test(source);

  return {
    coalition:
      "Kernbeslissers (CEO/CFO/COO), informele beïnvloeders (planning/operations leads) en uitvoeringsdragers (teamleads/HR/secretariaat)",
    requiredMandate: hasCentralization
      ? "Centrale mandaten op capaciteit, uitzonderingen en portfolio-besluiten"
      : "Eenduidige mandaten op prioriteiten, escalatie en resource-allocatie",
    ownershipMapping:
      "CEO: volgorde en stopregels; CFO: financiële grenzen; COO: uitvoeringsritme; HR/Operations: adoptie en capaciteitscorrectie",
  };
}
