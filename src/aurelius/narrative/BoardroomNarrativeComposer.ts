import { validateNarrativeCausality, type NarrativeCausalityResult } from "./NarrativeCausalityValidator";
import { validateNarrativeStructure, type NarrativeStructureResult } from "./NarrativeStructureEngine";

export type BoardroomNarrativeComposeInput = {
  text: string;
};

export type BoardroomNarrativeComposeResult = {
  composedText: string;
  structure: NarrativeStructureResult;
  causality: NarrativeCausalityResult;
  warnings: string[];
};

type SectionBlock = {
  heading: string;
  body: string;
};

function splitSections(text: string): SectionBlock[] {
  const source = String(text ?? "").trim();
  if (!source) return [];
  const headingRegex = /^###\s*\d+\.\s*[^\n]+$/gm;
  const matches = [...source.matchAll(headingRegex)];
  if (!matches.length) return [];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      heading: String(match[0] ?? "").trim(),
      body: source.slice(start, end).trim(),
    };
  });
}

function splitSentences(text: string): string[] {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeToSentences(text: string): string[] {
  const normalized = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return [];
      const lines = trimmed
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) return [];
      const compact = lines
        .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))
        .map((line) => line.replace(/^[A-Z][^:]{1,32}:\s*/i, ""))
        .join(" ");
      return splitSentences(compact);
    })
    .flat()
    .map((sentence) => sentence.replace(/\s+\./g, ".").trim())
    .filter(Boolean);

  return normalized;
}

function clampSentenceCount(sentences: string[], maxSentences: number): string {
  return sentences
    .filter(Boolean)
    .slice(0, maxSentences)
    .join(" ")
    .trim();
}

function buildContextParagraph(sentences: string[], sectionNumber: number): string {
  const leading = clampSentenceCount(sentences, 3);
  if (!leading) return "";
  if (sectionNumber === 1) {
    const normalized = leading.charAt(0).toLowerCase() + leading.slice(1);
    return clampSentenceCount(
      [
        `De dominante bestuurlijke these is dat ${normalized}`,
        "De spanning ontstaat doordat ambitie en uitvoerbaarheid nu uit elkaar lopen.",
      ],
      4
    );
  }
  return clampSentenceCount(
    [leading, "De spanning zit in het verschil tussen gewenste richting en operationele realiteit."],
    4
  );
}

function buildMechanismParagraph(sentences: string[]): string {
  const symptom = sentences.find((sentence) =>
    /\b(druk|tekort|uitval|vertraging|frictie|verlies|plafond|daling|stijging)\b/i.test(sentence)
  );
  const structuralCause = sentences.find((sentence) =>
    /\b(contract|tarief|kostprijs|capaciteit|governance|mandaat|transparantie|planning)\b/i.test(sentence)
  );
  const systemEffect = sentences.find((sentence) =>
    /\b(liquiditeit|marge|behandelcapaciteit|wachtlijst|doorlooptijd|voorspelbaarheid)\b/i.test(sentence)
  );

  return clampSentenceCount(
    [
      `Mechanisme: ${symptom ?? "De zichtbare symptomen stapelen zich op in uitvoering en planning."}`,
      `Structurele oorzaak: ${structuralCause ?? "Financiële en organisatorische randvoorwaarden begrenzen beslisruimte."}`,
      `Systeemeffect: ${systemEffect ?? "Zonder correctie verschuift druk van cijfers naar gedrag en uitvoering."}`,
    ],
    4
  );
}

function buildImplicationParagraph(sentences: string[], sectionNumber: number): string {
  const implication = sentences.find((sentence) =>
    /\b(bestuurlijk|besluit|mandaat|prioritering|stop|escalatie|keuze)\b/i.test(sentence)
  );
  const pressureBySection: Record<number, string> = {
    1: "Zonder consolidatie binnen 12 maanden verdwijnt behandelcapaciteit uit de kern.",
    2: "Zonder volgordekeuze blijft dubbel sturen bestaan en neemt liquiditeitsdruk toe.",
    3: "Zonder expliciet verlies blijft verbreding margedruk versnellen.",
    4: "Zonder stopregel wordt uitstel binnen 90 dagen operationeel onomkeerbaar.",
    5: "Zonder bindend mandaat blijven escalaties hangen en wordt sturing reactief.",
    6: "Zonder ritme op onderstroom blijft informele macht formele keuzes blokkeren.",
    7: "Zonder maandelijkse correcties verschuift falen naar kwartaalniveau en komt herstel te laat.",
    8: "Zonder eigenaar, deadline en escalatie vervalt het interventieplan tot intentie.",
    9: "Zonder besluitcontract is de gekozen richting niet afdwingbaar in uitvoering.",
    10: "Zonder dag-30, dag-60 en dag-90 gates ontbreekt bestuurlijke sluiting op uitvoering.",
    11: "Zonder toets op besluitkwaliteit groeit de kans op herhaling van dezelfde fout.",
    12: "Zonder expliciete keuze blijft bestuurlijke ruis bestaan en daalt uitvoerbaarheid.",
  };

  return clampSentenceCount(
    [
      `Bestuurlijke implicatie: ${implication ?? "Het bestuur moet volgorde, mandaat en stopregels direct formaliseren."}`,
      pressureBySection[sectionNumber] ?? "Zonder expliciete keuze blijft de uitvoering bestuurlijk diffuus.",
    ],
    4
  );
}

function enforceSectionChain(sectionNumber: number, body: string): string {
  const sentences = normalizeToSentences(body);
  if (!sentences.length) return String(body ?? "").trim();

  const context = buildContextParagraph(sentences, sectionNumber);
  const mechanism = buildMechanismParagraph(sentences);
  const implication = buildImplicationParagraph(sentences, sectionNumber);
  return [context, mechanism, implication].filter(Boolean).join("\n\n").trim();
}

function enforceNarrativeFlow(text: string): string {
  const sections = splitSections(text);
  if (!sections.length) return String(text ?? "").trim();

  const rebuilt = sections.map((section) => {
    const numberMatch = section.heading.match(/^###\s*(\d+)\./);
    const sectionNumber = Number(numberMatch?.[1] ?? 0);
    const body = enforceSectionChain(sectionNumber, section.body);

    return `${section.heading}\n\n${body}`.trim();
  });

  return rebuilt.join("\n\n").trim();
}

function getSectionBodyByNumber(text: string, sectionNumber: number): string {
  const source = String(text ?? "");
  const pattern = new RegExp(
    String.raw`###\s*${sectionNumber}\.\s*[^\n]+\n([\s\S]*?)(?=\n###\s*\d+\.\s*[^\n]+|$)`,
    "i"
  );
  const match = source.match(pattern);
  return String(match?.[1] ?? "").trim();
}

function sentenceFromSection(
  sectionBody: string,
  matcher: RegExp,
  fallback: string
): string {
  const sentence =
    splitSentences(sectionBody).find((line) => matcher.test(line)) ?? "";
  return sentence || fallback;
}

function collectHardFacts(text: string): string[] {
  const facts = splitSentences(text).filter((line) =>
    /(?:€\s?\d|\b\d+[.,]?\d*\s*%|\b\d+\s*(?:dagen|maanden|jaar|FTE|cliënten?|uren?)\b)/i.test(
      line
    )
  );
  return Array.from(new Set(facts)).slice(0, 5);
}

function collectInterpretations(text: string): string[] {
  const interpretations = splitSentences(text).filter((line) =>
    /\b(risico|druk|erosie|frictie|liquiditeit|bestuurlijk|mandaat|uitstel|verlies|spann)\b/i.test(
      line
    )
  );
  return Array.from(new Set(interpretations)).slice(0, 5);
}

function buildStrategicOptions(
  scenarioSection: string,
  recommendedSentence: string
): Array<{
  title: string;
  description: string;
  financial: string;
  operational: string;
  risk: string;
}> {
  const source = String(scenarioSection ?? "");
  const hasScenarioA = /\bSCENARIO A\b/i.test(source);
  const hasScenarioB = /\bSCENARIO B\b/i.test(source);
  const hasScenarioC = /\bSCENARIO C\b/i.test(source);
  const recommended =
    /consolid/i.test(recommendedSentence) || /stabilis/i.test(recommendedSentence)
      ? "C"
      : "B";

  const optionA = {
    title: "Optie A - Parallel consolideren en verbreden",
    description:
      hasScenarioA
        ? "Consolidatie en verbreding tegelijk doorzetten."
        : "Parallel sturen op kernstabilisatie en nieuwe initiatieven.",
    financial: "Hoge kans op margedruk en cash-volatiliteit.",
    operational: "MT-capaciteit versnipperd, hogere coördinatiedruk.",
    risk: "Hoog",
  };
  const optionB = {
    title: "Optie B - Volledige groeipauze buiten de kern",
    description:
      hasScenarioB
        ? "Kern consolideren met tijdelijke stop op verbreding."
        : "Alleen kernstabilisatie met tijdelijk stop-doing op uitbreidingen.",
    financial: "Snelste herstel op margecontrole en kasdiscipline.",
    operational: "Lagere complexiteit, lager innovatietempo.",
    risk: "Middel",
  };
  const optionC = {
    title: "Optie C - Gefaseerd model met harde gates",
    description:
      hasScenarioC
        ? "Eerst kernconsolidatie, daarna gecontroleerde verbreding."
        : "Consolideren -> stabiliseren -> gecontroleerd verbreden op KPI-gates.",
    financial: "Gebalanceerde risicoreductie met gecontroleerde investeringen.",
    operational: "Duidelijke volgorde en bestuurlijke focus.",
    risk: recommended === "C" ? "Laag-Middel" : "Middel",
  };

  return [optionA, optionB, optionC];
}

function buildBoardMemo(
  decisionQuestion: string,
  executiveThesis: string,
  hardFacts: string[],
  interpretations: string[],
  options: Array<{
    title: string;
    description: string;
    financial: string;
    operational: string;
    risk: string;
  }>,
  recommendation: string,
  mechanismSentence: string,
  implicationSentence: string,
  decisionSentence: string
): string {
  const facts = hardFacts.length
    ? hardFacts
    : ["Kosten en tarieven bewegen ongunstig terwijl contractruimte begrensd is."];
  const duiding = interpretations.length
    ? interpretations
    : ["Structurele druk vertaalt zich zonder prioritering naar capaciteits- en cashrisico."];

  return [
    "OUTPUT 1",
    "BESLISNOTA RvT / MT (BOARD MEMO)",
    "",
    "1. Besluitvraag",
    decisionQuestion,
    "",
    "2. Executive Thesis",
    executiveThesis,
    "",
    "3. Feitenbasis (HARD) vs Interpretatie",
    "HARD",
    ...facts.map((line) => `- ${line}`),
    "INTERPRETATIE",
    ...duiding.map((line) => `- ${line}`),
    "",
    "4. Strategische opties",
    ...options.flatMap((option) => [
      option.title,
      `- Beschrijving: ${option.description}`,
      `- Financieel effect: ${option.financial}`,
      `- Operationeel effect: ${option.operational}`,
      `- Risicoprofiel: ${option.risk}`,
    ]),
    "",
    "5. Aanbevolen keuze",
    recommendation,
    "",
    "6. Niet-onderhandelbare besluitregels",
    "- Geen nieuw initiatief zonder margevalidatie en capaciteitsimpact.",
    "- Geen capaciteitstoename zonder expliciete businesscase en owner.",
    "- Geen afwijking van prioritering zonder formele board-escalatie.",
    "- Geen parallelle KPI-sturing op conflicterende doelen.",
    "- Automatische pauze op verbreding bij ontbrekende kernstuurdata.",
    "",
    "7. 90-dagen interventieplan",
    "- Actie: Volledige margekaart per product. Owner: CFO/Finance. Deadline: Dag 14. Doel: Feitelijke stuurbasis.",
    "- Actie: Contractvloer en plafondstrategie per verzekeraar. Owner: CEO + CFO. Deadline: Dag 30. Doel: Contractdiscipline.",
    "- Actie: Capaciteitsritme op productiviteit en no-show. Owner: COO/Operations. Deadline: Dag 45. Doel: Betere benutting kerncapaciteit.",
    "- Actie: Centrale prioriteringstafel met stop-doing-lijst. Owner: MT. Deadline: Dag 60. Doel: Besluithelderheid en focus.",
    "",
    "8. KPI-set voor board monitoring",
    "- Marge per productlijn.",
    "- Cash runway (maanden).",
    "- Productiviteit versus norm (gecorrigeerd).",
    "- Contractdekking en plafondbenutting.",
    "- Wachttijd en behandelcontinuiteit.",
    "",
    "9. Besluittekst voor notulen",
    `De RvT besluit tot gefaseerde kernconsolidatie met harde stop/go-gates voor verbreding. ${decisionSentence}`,
    "",
    `Mechanisme: ${mechanismSentence}`,
    `Bestuurlijke implicatie: ${implicationSentence}`,
  ]
    .join("\n")
    .trim();
}

function buildBoardSlide(
  decisionQuestion: string,
  hardFacts: string[],
  recommendation: string,
  governanceLine: string
): string {
  const facts = hardFacts.slice(0, 4);
  return [
    "OUTPUT 2",
    "1-SLIDE BOARD SUMMARY",
    "",
    "1. Besluitvraag",
    `- ${decisionQuestion}`,
    "",
    "2. Feiten",
    ...(facts.length ? facts : ["- Kernsturing vereist harde fact-base en contractdiscipline."]).map(
      (line) => `- ${line.replace(/^-\s*/, "")}`
    ),
    "",
    "3. Aanbevolen keuze",
    `- ${recommendation}`,
    "",
    "4. 90-dagen plan",
    "- Dag 14: margekaart op productniveau.",
    "- Dag 30: contractvloer per verzekeraar.",
    "- Dag 60: capaciteitstafel met stop-doing-lijst.",
    "- Dag 90: board gate met doorpakken of pauzeren.",
    "",
    "5. Governance mechanisme",
    `- ${governanceLine}`,
    "- Geen verbreding zonder formele marge- en capaciteitsgate.",
    "",
    "6. KPI's",
    "- Marge per product",
    "- Cash runway",
    "- Productiviteit",
    "- Contractdekking",
    "- Wachttijd",
  ]
    .join("\n")
    .trim();
}

function buildCeoSpeech(
  executiveThesis: string,
  hardFacts: string[],
  recommendation: string,
  decisionQuestion: string
): string {
  const facts = hardFacts.slice(0, 3).join(" ");
  return [
    "OUTPUT 3",
    "SPREEKTEKST VOOR DIRECTEUR / CEO (2 MINUTEN)",
    "",
    "Probleem",
    `${executiveThesis}`,
    "",
    "Feiten",
    `${facts || "Onze kostenbasis, contractruimte en capaciteit zijn niet meer in balans."}`,
    "",
    "Keuze",
    `${recommendation}`,
    "",
    "Plan",
    "In de komende 90 dagen maken we eerst de feiten volledig: margekaart, contractvloer en capaciteitsturing. Daarna zetten we alleen stappen door die de kern aantoonbaar versterken. Alles zonder onderbouwing gaat op pauze.",
    "",
    "Besluitvraag",
    `${decisionQuestion}`,
  ]
    .join("\n")
    .trim();
}

export function ensureBoardroomOutputArtifacts(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return "";

  const hasAllArtifacts =
    /\bOUTPUT 1\b/i.test(source) &&
    /\bOUTPUT 2\b/i.test(source) &&
    /\bOUTPUT 3\b/i.test(source);
  if (hasAllArtifacts) return source;

  const section1 = getSectionBodyByNumber(source, 1);
  const section2 = getSectionBodyByNumber(source, 2);
  const section4 = getSectionBodyByNumber(source, 4);
  const section5 = getSectionBodyByNumber(source, 5);
  const section9 = getSectionBodyByNumber(source, 9);
  const section12 = getSectionBodyByNumber(source, 12);

  const decisionQuestion = sentenceFromSection(
    section2 || source,
    /\b(keuze|besluit|kernconflict|consolider|verbred)\b/i,
    "Moet de organisatie kiezen voor kernconsolidatie of voor parallelle verbreding?"
  );
  const executiveThesis = clampSentenceCount(
    [
      sentenceFromSection(
        section1 || source,
        /\b(dominante|marge|druk|capaciteit|contract|plafond)\b/i,
        "De organisatie staat onder structurele financiële en operationele druk."
      ),
      sentenceFromSection(
        section4 || source,
        /\b(uitstel|12|90|365|maanden|dagen)\b/i,
        "Uitstel verhoogt voorspelbaar het risico op margedruk en capaciteitsverlies."
      ),
      "Aanbevolen route: consolideren -> stabiliseren -> gecontroleerd verbreden.",
    ],
    3
  );
  const mechanismSentence = sentenceFromSection(
    section4 || source,
    /\b(mechanisme|druk|marge|contract|plafond|liquiditeit)\b/i,
    "Structurele margedruk en contractbeperkingen vertalen zich direct naar capaciteitsdruk."
  );
  const implicationSentence = sentenceFromSection(
    section5 || source,
    /\b(bestuurlijk|implicatie|mandaat|governance|besluit)\b/i,
    "Het bestuur moet volgorde, mandaat en stopregels hard formaliseren."
  );
  const decisionSentence = sentenceFromSection(
    section12 || source,
    /\b(besluit|keuze|stop|mandaat|prioritering)\b/i,
    "Nieuwe initiatieven worden alleen toegestaan na formele validatie op marge en capaciteit."
  );
  const recommendation = sentenceFromSection(
    `${section9}\n${section12}`,
    /\b(voorkeur|aanbevolen|consolid|stabilis|verbred)\b/i,
    "Kies voor gefaseerde kernconsolidatie met harde stop/go-gates richting verbreding."
  );
  const governanceLine = sentenceFromSection(
    section5 || section12 || source,
    /\b(mandaat|governance|escalatie|besluitrecht|stopregel)\b/i,
    "Besluitrecht wordt centraal belegd met expliciete stopregels en escalatieritme."
  );

  const hardFacts = collectHardFacts(source);
  const interpretations = collectInterpretations(`${section2}\n${section4}\n${section5}\n${section12}`);
  const options = buildStrategicOptions(section9, recommendation);
  const memo = buildBoardMemo(
    decisionQuestion,
    executiveThesis,
    hardFacts,
    interpretations,
    options,
    recommendation,
    mechanismSentence,
    implicationSentence,
    decisionSentence
  );
  const slide = buildBoardSlide(decisionQuestion, hardFacts, recommendation, governanceLine);
  const speech = buildCeoSpeech(executiveThesis, hardFacts, recommendation, decisionQuestion);

  return `${source}\n\n${memo}\n\n${slide}\n\n${speech}`.trim();
}

export function composeBoardroomNarrative(
  input: BoardroomNarrativeComposeInput
): BoardroomNarrativeComposeResult {
  let composedText = String(input.text ?? "").trim();
  composedText = enforceNarrativeFlow(composedText);
  composedText = ensureBoardroomOutputArtifacts(composedText);

  const structure = validateNarrativeStructure(composedText);
  const causality = validateNarrativeCausality(composedText);
  const warnings: string[] = [];

  if (!structure.pass) {
    warnings.push(`NarrativeStructureEngine: ontbrekende secties: ${structure.missing.join(", ")}`);
  }
  if (!causality.pass) {
    warnings.push(`NarrativeCausalityValidator: ontbrekende causale signalen: ${causality.missingSignals.join(", ")}`);
  }

  return {
    composedText,
    structure,
    causality,
    warnings,
  };
}
