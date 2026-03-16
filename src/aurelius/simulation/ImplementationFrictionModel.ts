export type ImplementationFrictionInput = {
  orgDynamicsText: string;
  interventionText: string;
};

export type FrictionPoint = {
  friction: string;
  bottleneckProcess: string;
  missingCondition: string;
  failureMode: string;
};

function hasAny(text: string, terms: string[]): boolean {
  const source = String(text ?? "").toLowerCase();
  return terms.some((t) => source.includes(t.toLowerCase()));
}

export function buildImplementationFrictionModel(
  input: ImplementationFrictionInput
): FrictionPoint[] {
  const source = `${input.orgDynamicsText}\n${input.interventionText}`;

  return [
    {
      friction: "Capaciteitsfrictie in weekritme",
      bottleneckProcess: "Planning, intake en opvolgafspraken",
      missingCondition: "Buffer op casemix/no-show en real-time capaciteitszicht",
      failureMode: "Interventies schuiven door naar ad-hoc prioriteiten",
    },
    {
      friction: "Procesvolwassenheid en datakwaliteit",
      bottleneckProcess: "KPI-sturing en escalatiebesluiten",
      missingCondition: hasAny(source, ["dashboard", "kpi"]) ? "KPI-definities consistent gebruiken" : "Betrouwbare KPI-definities en datadiscipline",
      failureMode: "Beslissingen worden genomen op incompleet of laat inzicht",
    },
    {
      friction: "Governancefrictie tussen formeel en informeel",
      bottleneckProcess: "Mandaatuitvoering en stop-doing handhaving",
      missingCondition: "Eenduidig mandaat, eigenaarschap en 48-uurs escalatieregel",
      failureMode: "Lokale uitzonderingen herstellen oude patronen",
    },
  ];
}
