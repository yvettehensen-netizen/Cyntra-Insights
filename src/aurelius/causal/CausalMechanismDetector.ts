export type CausalMechanismInput = {
  contextText: string;
  hypothesisText: string;
  memoryText: string;
  graphText: string;
};

export type CausalMechanismItem = {
  symptom: string;
  mechanism: string;
  structuralCause: string;
  breakingIntervention: string;
};

export type CausalMechanismResult = {
  items: CausalMechanismItem[];
};

function hasAny(text: string, terms: string[]): boolean {
  const source = String(text ?? "").toLowerCase();
  return terms.some((term) => source.includes(term.toLowerCase()));
}

export function detectCausalMechanisms(input: CausalMechanismInput): CausalMechanismResult {
  const source = [
    input.contextText,
    input.hypothesisText,
    input.memoryText,
    input.graphText,
  ]
    .filter(Boolean)
    .join("\n\n");

  const items: CausalMechanismItem[] = [];

  items.push({
    symptom: hasAny(source, ["marge", "verlies", "tarief", "kostprijs"])
      ? "Aanhoudende margedruk en verlies op kernactiviteiten."
      : "Financiele spanning zonder stabiel herstelpad.",
    mechanism:
      "Kostenstijging en tariefbeperking lopen uit elkaar waardoor elke extra productie minder marge oplevert.",
    structuralCause:
      "Verdienmodel is contract- en prijsafhankelijk zonder voldoende sturingsruimte op onderliggende kostenmix.",
    breakingIntervention:
      "Herijk prijs-volume-capaciteit met contractvloer, kostprijsdiscipline en stopregel voor verlieslatende varianten.",
  });

  items.push({
    symptom: hasAny(source, ["uitstel", "mandaat", "conflict", "onderstroom"])
      ? "Besluituitstel en inconsistente executie tussen teams."
      : "Lage executiesnelheid ondanks duidelijke strategische intentie.",
    mechanism:
      "Formele besluitlijnen en informele invloed lopen niet parallel, waardoor keuzes in uitvoering worden afgezwakt.",
    structuralCause:
      "Governance- en mandaatstructuur borgt onvoldoende eigenaarschap, ritme en escalatiediscipline.",
    breakingIntervention:
      "Instellen van bindende prioriteringstafel met vaste escalatietermijnen, expliciet eigenaarschap en afdwingbare stop-doing keuzes.",
  });

  items.push({
    symptom: hasAny(source, ["werkdruk", "productiviteit", "uitval", "capaciteit"])
      ? "Capaciteitsdruk, normspanning en verhoogd risico op uitval."
      : "Instabiele capaciteit en voorspelbaarheid in levering.",
    mechanism:
      "Productienormdruk zonder adaptieve buffer vergroot belasting en verlaagt duurzame inzetbaarheid.",
    structuralCause:
      "Systeem stuurt op outputmeting, maar beperkt op stuurinformatie over casemix, no-show en herstelcapaciteit.",
    breakingIntervention:
      "Inbouwen van kwaliteitsbuffer in norm, weekritme op capaciteitsindicatoren en vroege correctie op overbelasting.",
  });

  return { items: items.slice(0, 3) };
}
