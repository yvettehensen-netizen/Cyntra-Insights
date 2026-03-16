export type StrategicAssumption = {
  assumption: string;
  realism: "hoog" | "middel" | "laag";
  rationale: string;
};

export type StrategicAssumptionInput = {
  contextText: string;
  memoryText: string;
  graphText: string;
};

function hasAny(text: string, terms: string[]): boolean {
  const s = text.toLowerCase();
  return terms.some((t) => s.includes(t.toLowerCase()));
}

export function checkStrategicAssumptions(
  input: StrategicAssumptionInput
): StrategicAssumption[] {
  const source = [input.contextText, input.memoryText, input.graphText]
    .filter(Boolean)
    .join("\n\n");

  const assumptions: StrategicAssumption[] = [
    {
      assumption: "Groei lost financiële druk automatisch op.",
      realism: hasAny(source, ["contractplafond", "tariefdruk", "marge"]) ? "laag" : "middel",
      rationale:
        "Zonder prijs- en contractruimte kan volumegroei margedruk juist vergroten.",
    },
    {
      assumption: "Hogere productiviteit lost kostenproblemen op.",
      realism: hasAny(source, ["werkdruk", "uitval", "capaciteit"]) ? "laag" : "middel",
      rationale:
        "Productiviteitsverhoging zonder systeembuffer verhoogt vaak uitval- en kwaliteitsrisico.",
    },
    {
      assumption: "Nieuwe initiatieven genereren vanzelf extra marge.",
      realism: hasAny(source, ["governance", "complexiteit", "managementbelasting"]) ? "laag" : "middel",
      rationale:
        "Nieuwe initiatieven vragen eerst investeringen, managementaandacht en commerciële tractie.",
    },
  ];

  return assumptions;
}
