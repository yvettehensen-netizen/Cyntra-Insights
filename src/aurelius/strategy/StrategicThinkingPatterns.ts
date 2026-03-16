export type StrategicPatternName =
  | "BOTTLENECK ANALYSIS"
  | "ECONOMIC ENGINE"
  | "INCENTIVE STRUCTURE"
  | "SYSTEM DYNAMICS"
  | "POWER STRUCTURE"
  | "STRATEGIC TRADE-OFF"
  | "CAPABILITY GAP";

export type StrategicPatternObservation = {
  patternName: StrategicPatternName;
  observation: string;
  strategicImplication: string;
};

export type StrategicThinkingPatternsInput = {
  caseContextBlock: string;
  contextEngineOutput: string;
  memoryContextBlock?: string;
  diagnosisOutput?: string;
};

export type StrategicThinkingPatternsResult = {
  appliedPatterns: StrategicPatternObservation[];
  output: string;
};

function containsAny(text: string, keywords: string[]): boolean {
  const source = String(text ?? "").toLowerCase();
  return keywords.some((k) => source.includes(k.toLowerCase()));
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) return value.trim();
  }
  return "";
}

export function hasMinimumStrategicPatterns(output: string, min = 4): boolean {
  const count = (String(output ?? "").match(/\bPATTERN NAAM\b/gi) ?? []).length;
  return count >= min;
}

export function applyStrategicThinkingPatterns(
  input: StrategicThinkingPatternsInput
): StrategicThinkingPatternsResult {
  const source = [
    input.caseContextBlock,
    input.contextEngineOutput,
    input.memoryContextBlock,
    input.diagnosisOutput,
  ]
    .filter(Boolean)
    .join("\n\n")
    .toLowerCase();

  const observations: StrategicPatternObservation[] = [];

  const hasContractPressure = containsAny(source, [
    "contract",
    "plafond",
    "verzekeraar",
    "tarief",
  ]);
  observations.push({
    patternName: "BOTTLENECK ANALYSIS",
    observation: hasContractPressure
      ? "Contractruimte en plafondlogica begrenzen schaal direct."
      : "Capaciteit en besluittempo zijn de vermoedelijke primaire bottleneck.",
    strategicImplication:
      "Groei moet starten met expliciete bottleneck-oplossing; anders ontstaat versnelling van verlies.",
  });

  const hasMarginSignals = containsAny(source, [
    "marge",
    "kostprijs",
    "loonkosten",
    "verlies",
    "omzet",
  ]);
  observations.push({
    patternName: "ECONOMIC ENGINE",
    observation: hasMarginSignals
      ? "Economisch mechanisme staat onder druk door kostenstijging en beperkte pricing power."
      : "Verdienmodel is onvoldoende hard gemaakt in prijs-, volume- en capaciteitsdrivers.",
    strategicImplication:
      "Besluitvorming moet draaien op driver-based economics in plaats van activiteitengroei.",
  });

  observations.push({
    patternName: "INCENTIVE STRUCTURE",
    observation: containsAny(source, ["productiviteit", "norm", "autonomie", "kwaliteit"])
      ? "Productie- en kwaliteitsprikkels wijzen niet vanzelf in dezelfde richting."
      : "Prikkels zijn impliciet en daardoor gedragstechnisch inconsistent.",
    strategicImplication:
      "Zonder expliciete prikkelarchitectuur ontstaat stille weerstand in uitvoering.",
  });

  observations.push({
    patternName: "SYSTEM DYNAMICS",
    observation: containsAny(source, ["groei", "complexiteit", "uitstel", "werkdruk"])
      ? "Feedbackloop: uitstel verhoogt complexiteit, complexiteit verlaagt executiekracht."
      : "Feedbackloop: onduidelijke prioritering leidt tot vertraging en bestuurlijke ruis.",
    strategicImplication:
      "Interventies moeten eerst versterkende negatieve loops dempen voordat uitbreiding zinvol is.",
  });

  const powerObservation = firstNonEmpty(
    containsAny(source, ["mandaat", "besluit", "macht", "informele"])
      ? "Formele besluitmacht en informele invloed lopen niet volledig parallel."
      : "",
    "Besluitmacht is verspreid over formele rollen en informele routines."
  );
  observations.push({
    patternName: "POWER STRUCTURE",
    observation: powerObservation,
    strategicImplication:
      "Zonder expliciete herverdeling van besluitrechten blijven stopkeuzes niet afdwingbaar.",
  });

  observations.push({
    patternName: "STRATEGIC TRADE-OFF",
    observation: containsAny(source, ["groei", "stabiliteit", "kwaliteit", "controle"])
      ? "Er is een onvermijdelijke keuze tussen tempo van verbreding en kernstabilisatie."
      : "De strategie bevat impliciete trade-offs die nu nog niet expliciet geprijsd zijn.",
    strategicImplication:
      "Het bestuur moet expliciet benoemen wat tijdelijk wordt verloren om richting uitvoerbaar te maken.",
  });

  observations.push({
    patternName: "CAPABILITY GAP",
    observation: containsAny(source, ["leiderschap", "capacity", "capaciteit", "governance", "ritme"])
      ? "Uitvoeringscapaciteit en governance-ritme zijn beperkende capability-factors."
      : "De benodigde capabilities voor de gekozen strategie zijn nog niet volledig ingericht.",
    strategicImplication:
      "Zonder capability-upgrade wordt een goede strategie een slechte executie.",
  });

  const appliedPatterns = observations.slice(0, 7);
  const output = appliedPatterns
    .map(
      (item) =>
        `PATTERN NAAM: ${item.patternName}\nOBSERVATIE: ${item.observation}\nSTRATEGISCHE IMPLICATIE: ${item.strategicImplication}`
    )
    .join("\n\n");

  return { appliedPatterns, output };
}
