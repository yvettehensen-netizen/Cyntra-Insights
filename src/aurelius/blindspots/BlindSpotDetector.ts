import { analyzeCognitiveBiases, type CognitiveBiasFinding } from "./CognitiveBiasAnalyzer";
import { checkStrategicAssumptions, type StrategicAssumption } from "./StrategicAssumptionChecker";

export type BlindSpotInput = {
  contextText: string;
  memoryText: string;
  graphText: string;
  hypothesisText: string;
  causalText: string;
};

export type BlindSpotItem = {
  blindSpot: string;
  whatOrgThinks: string;
  reality: string;
  whyUnseen: string;
  risk: string;
};

export type BlindSpotResult = {
  items: BlindSpotItem[];
  biases: CognitiveBiasFinding[];
  assumptions: StrategicAssumption[];
  block: string;
};

function hasAny(text: string, terms: string[]): boolean {
  const s = text.toLowerCase();
  return terms.some((t) => s.includes(t.toLowerCase()));
}

export function detectBlindSpots(input: BlindSpotInput): BlindSpotResult {
  const source = [
    input.contextText,
    input.memoryText,
    input.graphText,
    input.hypothesisText,
    input.causalText,
  ]
    .filter(Boolean)
    .join("\n\n");

  const biases = analyzeCognitiveBiases({
    contextText: input.contextText,
    hypothesisText: input.hypothesisText,
    causalText: input.causalText,
  });
  const assumptions = checkStrategicAssumptions({
    contextText: input.contextText,
    memoryText: input.memoryText,
    graphText: input.graphText,
  });

  const items: BlindSpotItem[] = [
    {
      blindSpot: "Strategie-gedrag mismatch",
      whatOrgThinks: "De gekozen strategie wordt consistent uitgevoerd.",
      reality:
        hasAny(source, ["uitstel", "vermijding", "onderstroom", "mandaat"])
          ? "Besluituitvoering is inconsistent door uitstel en informeel tegenstuurgedrag."
          : "Uitvoeringsdiscipline is kwetsbaar en niet overal gelijk.",
      whyUnseen: "Formele voortgangsrapportage maskeert informele uitvoeringsfrictie.",
      risk: "Strategie op papier blijft achter bij gerealiseerde resultaten.",
    },
    {
      blindSpot: "Onbenoemde financiële grens",
      whatOrgThinks: "Extra activiteit levert direct herstel op.",
      reality:
        hasAny(source, ["contractplafond", "tarief", "marge", "kostprijs"])
          ? "Economische randvoorwaarden begrenzen herstel ondanks extra inzet."
          : "Financiële herstelruimte is beperkter dan operationeel wordt aangenomen.",
      whyUnseen: "Sturing focust op output, niet op causale marge- en contractlogica.",
      risk: "Capaciteit groeit zonder structureel financieel herstel.",
    },
    {
      blindSpot: "Vermijdingspatroon in besluitvorming",
      whatOrgThinks: "Consensus voorkomt frictie en houdt teams betrokken.",
      reality: "Conflictmijding verschuift scherpe keuzes naar later en vergroot cumulatieve schade.",
      whyUnseen: "Uitstel voelt op korte termijn relationeel veiliger dan expliciete stopkeuzes.",
      risk: "Bestuurlijke voorspelbaarheid en executiesnelheid nemen structureel af.",
    },
  ];

  const lines: string[] = [];
  items.forEach((item) => {
    lines.push(`BLINDE VLEK: ${item.blindSpot}`);
    lines.push(`WAT DE ORGANISATIE DENKT: ${item.whatOrgThinks}`);
    lines.push(`WAT DE REALITEIT IS: ${item.reality}`);
    lines.push(`WAAROM DIT PROBLEEM NIET WORDT GEZIEN: ${item.whyUnseen}`);
    lines.push(`WELK RISICO DIT CREËERT: ${item.risk}`);
    lines.push("");
  });

  lines.push(
    `COGNITIVE BIAS SIGNALEN: ${biases.map((b) => `${b.bias} (${b.signal})`).join("; ")}`
  );
  lines.push(
    `STRATEGISCHE AANNAMES: ${assumptions
      .map((a) => `${a.assumption} [realisme=${a.realism}]`)
      .join("; ")}`
  );

  return {
    items,
    biases,
    assumptions,
    block: lines.join("\n").trim(),
  };
}
