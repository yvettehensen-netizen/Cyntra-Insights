export type StrategicHypothesis = {
  id: string;
  hypothesis: string;
  explanation: string;
  mechanism: string;
};

export type HypothesisGeneratorInput = {
  contextText: string;
  memoryText: string;
  graphText: string;
  minHypotheses?: number;
};

function hasAny(source: string, terms: string[]): boolean {
  const text = String(source ?? "").toLowerCase();
  return terms.some((term) => text.includes(term.toLowerCase()));
}

export function generateHypotheses(input: HypothesisGeneratorInput): StrategicHypothesis[] {
  const source = [input.contextText, input.memoryText, input.graphText]
    .filter(Boolean)
    .join("\n\n");

  const hypotheses: StrategicHypothesis[] = [];

  hypotheses.push({
    id: "H1",
    hypothesis: "Financiele begrenzing is de primaire oorzaak van het strategische probleem.",
    explanation:
      "Tariefdruk, contractplafonds of kostprijsdruk limiteren de strategische ruimte sterker dan operationele intentie.",
    mechanism:
      "Externe prijs- en contractbeperkingen drukken marge, waardoor capaciteit en groeiruimte direct krimpen.",
  });

  hypotheses.push({
    id: "H2",
    hypothesis: "Bestuurlijke en organisatorische uitvoeringsfrictie is de primaire oorzaak.",
    explanation:
      "Besluitdynamiek, onduidelijke mandaten en conflictvermijding verlagen executiekracht van een op papier juiste strategie.",
    mechanism:
      "Besluituitstel en verspreid eigenaarschap veroorzaken structurele vertraging en inconsistent gedrag.",
  });

  hypotheses.push({
    id: "H3",
    hypothesis: "Strategische scope en prioritering zijn onvoldoende geordend.",
    explanation:
      "Te veel parallelle initiatieven zonder expliciete stopregels veroorzaken versnippering en verlies aan focus.",
    mechanism:
      "Capaciteit wordt verdeeld over concurrerende agenda's, waardoor kernactiviteiten en resultaatdiscipline verzwakken.",
  });

  if (hasAny(source, ["markt", "verwijzer", "instroom", "vraag", "concurrent"])) {
    hypotheses.push({
      id: "H4",
      hypothesis: "Markt- en instroomdynamiek versterkt de interne kwetsbaarheid.",
      explanation:
        "Externe vraagverschuivingen en kanaalafhankelijkheid vergroten de druk op een al fragiele operationele basis.",
      mechanism:
        "Volatiliteit in instroom en verwijzingen maakt planning instabiel en verhoogt de foutmarge in capaciteitssturing.",
    });
  }

  const minCount = Math.max(3, input.minHypotheses ?? 3);
  return hypotheses.slice(0, Math.max(minCount, 3));
}
