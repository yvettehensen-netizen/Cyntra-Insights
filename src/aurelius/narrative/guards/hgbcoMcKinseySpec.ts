const CANONICAL_HGBCO_HEADINGS = [
  "### 1. DOMINANTE BESTUURLIJKE THESE",
  "### 2. HET KERNCONFLICT",
  "### 3. EXPLICIETE TRADE-OFFS",
  "### 4. OPPORTUNITY COST",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK & ONDERSTROOM",
  "### 7. EXECUTIERISICO",
  "### 8. 90-DAGEN INTERVENTIEPLAN",
  "### 9. DECISION CONTRACT",
] as const;

const RATIO_SUBHEADS = [
  "#### A. Analyse — Wat zien we?",
  "#### B. Mechanisme — Waarom gebeurt dit?",
  "#### C. Gevolg — Wat betekent dit financieel, operationeel en cultureel?",
  "#### D. Bestuurlijke implicatie — Welke keuze, welk mandaat, welk verlies?",
  "#### E. Overgang — Waarom dit logisch leidt naar het volgende hoofdstuk",
] as const;

const BOVEN_ONDERSTROOM_REQUIRED_SECTIONS = new Set([2, 5, 6, 7, 9]);

const FORBIDDEN_PATTERNS: RegExp[] = [
  /default\s+transformatie-template/gi,
  /default\s+template/gi,
  /governance-technisch/gi,
  /duid\s+structureel/gi,
  /context\s+is\s+schaars\s*\/\s*ontbreekt/gi,
  /context\s+is\s+schaars/gi,
  /formuleer/gi,
  /analyseer/gi,
  /\bmoet\b/gi,
  /key\s+takes?away/gi,
  /succesfactor/gi,
  /quick\s+win/gi,
  /low[-\s]?hanging\s+fruit/gi,
  /\bmogelijk\b/gi,
  /\bwellicht\b/gi,
  /\bzou\s+kunnen\b/gi,
  /als\s+ai/gi,
  /als\s+taalmodel/gi,
  /op\s+basis\s+van\s+de\s+analyse/gi,
  /gebruik\s+alle\s+feiten/gi,
];

const SECTION_DEFAULT_INFERENCE =
  "Op basis van bestuurlijke patronen in deze sector: de casus vraagt nu een expliciete keuze met direct mandaat en zichtbaar verlies.";

const BOVEN_ONDERSTREAM_SENTENCES: Record<number, { boven: string; onder: string }> = {
  2: {
    boven:
      "In de bovenstroom staat de formele keuze helder op tafel: prioriteit, mandaat en volgorde moeten nu onomkeerbaar worden vastgezet.",
    onder:
      "In de onderstroom beschermen teams en leidinggevenden begrijpelijkerwijs hun dagelijkse werkbaarheid, waardoor uitstel zich vermomt als zorgvuldigheid.",
  },
  5: {
    boven:
      "In de bovenstroom wordt governance zichtbaar in besluitrechten, escalatieregels en het wekelijkse ritme waarin keuzes worden afgedwongen.",
    onder:
      "In de onderstroom bepaalt de feitelijke informatie- en planningsmacht of die governance echt wordt nageleefd of opnieuw wordt omzeild.",
  },
  6: {
    boven:
      "In de bovenstroom verschuift macht via formele mandaten, budgetrechten en expliciete prioritering van schaarse capaciteit.",
    onder:
      "In de onderstroom verschuift macht via relationeel krediet, uitzonderingen en de actor die tempo kan remmen zonder formeel nee te zeggen.",
  },
  7: {
    boven:
      "In de bovenstroom is executie een ritmevraag: wie beslist, wanneer corrigeert men en welke afwijking accepteert het bestuur niet meer.",
    onder:
      "In de onderstroom ontstaat terugval zodra spanning oploopt en oude loyaliteiten sterker worden dan de nieuw afgesproken keuzevolgorde.",
  },
  9: {
    boven:
      "In de bovenstroom bindt het contract de Raad aan één keuze, één beslisrecht en één zichtbaar ritme van maandelijkse toetsing.",
    onder:
      "In de onderstroom markeert dit contract welke informele route per direct ophoudt en welk verlies de organisatie volwassen accepteert.",
  },
};

const DECISION_BLOCK_HEAD = "De Raad van Bestuur committeert zich aan:";
const DECISION_BLOCK_TEMPLATE = [
  "De Raad van Bestuur committeert zich aan:",
  "Keuze:",
  "Accepted loss:",
  "Besluitrecht ligt bij:",
  "Stoppen per direct:",
  "Niet meer escaleren:",
  "Maandelijkse KPI:",
  "Failure trigger:",
  "Point of no return:",
  "Herijkingsmoment:",
].join("\n");

function normalizeText(input: string): string {
  return String(input ?? "").replace(/\r\n?/g, "\n").trim();
}

function splitParagraphs(value: string): string[] {
  return normalizeText(value)
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseSections(markdown: string): Array<{ heading: string; number: number; body: string }> {
  const source = normalizeText(markdown);
  if (!source) return [];

  const headingRegex = /^###\s*(\d+)\.\s*([^\n]+)$/gm;
  const matches = [...source.matchAll(headingRegex)];
  if (!matches.length) return [];

  return matches.map((match, index) => {
    const heading = match[0].trim();
    const number = Number(match[1] || 0);
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const body = source.slice(start, end).replace(/^\n+/, "").trim();
    return { heading, number, body };
  });
}

function buildCanonicalMarkdown(
  sections: Array<{ heading: string; number: number; body: string }>
): string {
  const bodyByNumber = new Map<number, string>();
  for (const section of sections) {
    if (!section.number) continue;
    if (!bodyByNumber.has(section.number)) {
      bodyByNumber.set(section.number, section.body || SECTION_DEFAULT_INFERENCE);
    }
  }

  const rebuilt = CANONICAL_HGBCO_HEADINGS.map((heading, index) => {
    const number = index + 1;
    const body = normalizeText(bodyByNumber.get(number) || SECTION_DEFAULT_INFERENCE);
    return `${heading}\n\n${body}`;
  });

  return rebuilt.join("\n\n").trim();
}

function ensureRatioStructureForSectionBody(body: string): string {
  const source = normalizeText(body);
  if (!source) {
    return `${RATIO_SUBHEADS[0]}\n${SECTION_DEFAULT_INFERENCE}\n\n${RATIO_SUBHEADS[1]}\n${SECTION_DEFAULT_INFERENCE}\n\n${RATIO_SUBHEADS[2]}\n${SECTION_DEFAULT_INFERENCE}\n\n${RATIO_SUBHEADS[3]}\n${SECTION_DEFAULT_INFERENCE}\n\n${RATIO_SUBHEADS[4]}\n${SECTION_DEFAULT_INFERENCE}`;
  }

  const hasAllRatioBlocks = ["A", "B", "C", "D", "E"].every((letter) =>
    new RegExp(`^\\s*#{0,6}\\s*${letter}\\.`, "im").test(source)
  );

  if (hasAllRatioBlocks) {
    return source;
  }

  const paragraphs = splitParagraphs(source);
  const getParagraph = (index: number) =>
    paragraphs[index] || paragraphs[paragraphs.length - 1] || SECTION_DEFAULT_INFERENCE;

  return [
    `${RATIO_SUBHEADS[0]}\n${getParagraph(0)}`,
    `${RATIO_SUBHEADS[1]}\n${getParagraph(1)}`,
    `${RATIO_SUBHEADS[2]}\n${getParagraph(2)}`,
    `${RATIO_SUBHEADS[3]}\n${getParagraph(3)}`,
    `${RATIO_SUBHEADS[4]}\n${getParagraph(4)}`,
  ]
    .join("\n\n")
    .trim();
}

function readDecisionValue(source: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*:?\\s*([^\\n]+)`, "i"));
  if (!match) return "";
  return String(match[1] || "").trim();
}

function ensureDecisionContractBlock(sectionBody: string): string {
  const cleaned = normalizeText(sectionBody).replace(
    /DE RAAD COMMITTEERT:[\s\S]*$/i,
    ""
  ).trim();

  const keuze =
    readDecisionValue(cleaned, "Keuze") ||
    readDecisionValue(cleaned, "choice") ||
    "De Raad kiest één dominante koers met directe uitvoering.";
  const acceptedLoss =
    readDecisionValue(cleaned, "Accepted loss") ||
    readDecisionValue(cleaned, "Geaccepteerd verlies") ||
    "Tijdelijke inlevering van parallelle initiatieven en lokale uitzonderingsruimte.";
  const besluitrecht =
    readDecisionValue(cleaned, "Besluitrecht ligt bij") ||
    readDecisionValue(cleaned, "beslismonopolie") ||
    "De expliciet benoemde eindverantwoordelijke in de Raad van Bestuur.";
  const stopDirect =
    readDecisionValue(cleaned, "Stoppen per direct") ||
    readDecisionValue(cleaned, "Stop per direct") ||
    "Elke route zonder owner, deadline en KPI op kernstabiliteit.";
  const nietEscaleren =
    readDecisionValue(cleaned, "Niet meer escaleren") ||
    "Informele bypasses buiten de formele regietafel.";
  const maandKpi =
    readDecisionValue(cleaned, "Maandelijkse KPI") ||
    "Doorlooptijd, werkdruk, margedruk en executiediscipline op 30/90/365.";
  const failureTrigger =
    readDecisionValue(cleaned, "Failure trigger") ||
    "Twee opeenvolgende periodes zonder meetbare voortgang op de dominante keuze.";
  const pointOfNoReturn =
    readDecisionValue(cleaned, "Point of no return") ||
    "Als Dag 60-gates niet gehaald worden, wordt verlies aan contractmacht en retentie onomkeerbaar.";
  const herijking =
    readDecisionValue(cleaned, "Herijkingsmoment") ||
    readDecisionValue(cleaned, "Herijking") ||
    "Maandelijks in de Raad, met expliciete keuze voor bijsturen of stoppen.";

  const decisionBlock = [
    DECISION_BLOCK_HEAD,
    `Keuze: ${keuze}`,
    `Accepted loss: ${acceptedLoss}`,
    `Besluitrecht ligt bij: ${besluitrecht}`,
    `Stoppen per direct: ${stopDirect}`,
    `Niet meer escaleren: ${nietEscaleren}`,
    `Maandelijkse KPI: ${maandKpi}`,
    `Failure trigger: ${failureTrigger}`,
    `Point of no return: ${pointOfNoReturn}`,
    `Herijkingsmoment: ${herijking}`,
  ].join("\n");

  if (!cleaned) return decisionBlock;
  return `${cleaned}\n\n${decisionBlock}`.trim();
}

function replaceForbiddenLanguage(source: string): string {
  let output = source;

  output = output
    .replace(/op basis van de analyse/gi, "")
    .replace(/als ai[^,.\n]*/gi, "")
    .replace(/als taalmodel[^,.\n]*/gi, "")
    .replace(/\bmoet\b/gi, "is direct nodig")
    .replace(/key\s+takes?away/gi, "bestuurlijke conclusie")
    .replace(/succesfactor/gi, "harde randvoorwaarde")
    .replace(/quick\s+win/gi, "directe ingreep")
    .replace(/low[-\s]?hanging\s+fruit/gi, "direct uitvoerbare ingreep")
    .replace(/governance-technisch/gi, "bestuurlijk scherp")
    .replace(/default\s+transformatie-template/gi, "sectordiscipline")
    .replace(/default\s+template/gi, "vaste structuur")
    .replace(/\bwellicht\b/gi, "")
    .replace(/\bmogelijk\b/gi, "")
    .replace(/\bzou\s+kunnen\b/gi, "leidt")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  return output.trim();
}

function appendUpperLowerStream(body: string, sectionNumber: number): string {
  if (!BOVEN_ONDERSTROOM_REQUIRED_SECTIONS.has(sectionNumber)) {
    return body;
  }

  const current = normalizeText(body);
  const hasBoven = /^\s*#{0,6}\s*Bovenstroom\b/im.test(current);
  const hasOnder = /^\s*#{0,6}\s*Onderstroom\b/im.test(current);
  const hints = BOVEN_ONDERSTREAM_SENTENCES[sectionNumber];

  if (hasBoven && hasOnder) return current;

  const injections: string[] = [];
  if (!hasBoven) {
    injections.push(`#### Bovenstroom\n${hints?.boven || SECTION_DEFAULT_INFERENCE}`);
  }
  if (!hasOnder) {
    injections.push(`#### Onderstroom\n${hints?.onder || SECTION_DEFAULT_INFERENCE}`);
  }

  if (!injections.length) return current;
  return `${current}\n\n${injections.join("\n\n")}`.trim();
}

export const HGBCO_MCKINSEY_SYSTEM_INJECT = `
HGBCO v5 — MCKINSEY+ BOARDROOM SPEC
Schrijf met boardroom-hardheid en sectorinzicht: empathisch in mensbeeld, economisch onontkoombaar in besluitlogica.
Elke sectie brengt nieuwe informatie, geen herhaling, geen templatespraak.
Gebruik uitsluitend casusfeiten uit documentcontext en vrije velden.
Gebruik exact 9 HGBCO-secties en per sectie ratio-opbouw A-E.
In secties 2, 5, 6, 7, 9 moeten expliciet Bovenstroom en Onderstroom zichtbaar zijn.
In secties 1, 4, 5, 9 moet economisch effect zichtbaar zijn: marge/cash, investeringsruimte/solvabiliteit, en opportunity cost 30/90/365 met irreversibiliteit.
Sectie 8 bevat minimaal 15 interventies met exact: Actie, Eigenaar, Deadline, KPI, Escalatiepad, Direct zichtbaar effect, Anchor-ref.
Decision Contract begint exact met "De Raad van Bestuur committeert zich aan:" en bevat alle verplichte labels.
Verboden taal direct herschrijven: default transformatie-template, governance-technisch, duid structureel, context is schaars/ontbreekt, formuleer, analyseer, moet, key takeaway, succesfactor, quick win, low-hanging fruit, mogelijk, wellicht, zou kunnen.
Als data impliciet blijft, gebruik bestuurlijke aannames in deze vorm: Op basis van bestuurlijke patronen in deze sector: ...
`.trim();

export const HGBCO_MCKINSEY_USER_INJECT = `
Verwerk de casus als één doorlopend strategisch verhaal.
Elke sectie bevat A. Analyse, B. Mechanisme, C. Gevolg, D. Bestuurlijke implicatie, E. Overgang.
Vermijd abstracte managementzinnen, herhaling en meta-tekst.
Maak bovenstroom/onderstroom expliciet waar verplicht.
Gebruik economische causaliteit met 30/90/365 irreversibiliteit.
Gebruik uitsluitend casus-ankers uit context; geen nieuwe feiten.
Decision Contract begint exact met "De Raad van Bestuur committeert zich aan:".
`.trim();

export function enforceNoMetaNoTemplate(markdown: string): string {
  let output = normalizeText(markdown);
  if (!output) return output;

  output = output
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^(meta|toelichting|uitleg|opmerking)\s*:/i.test(trimmed)) return false;
      if (/^gebruik\s+alle\s+feiten/i.test(trimmed)) return false;
      return true;
    })
    .join("\n");

  output = replaceForbiddenLanguage(output);
  return output;
}

export function enforceHgbcoHeadings(markdown: string): string {
  const sections = parseSections(markdown);
  const canonical = buildCanonicalMarkdown(sections);
  return canonical;
}

export function enforceAtoERatioStructure(markdown: string): string {
  const canonical = enforceHgbcoHeadings(markdown);
  const sections = parseSections(canonical).map((section) => ({
    ...section,
    body: ensureRatioStructureForSectionBody(section.body),
  }));
  return buildCanonicalMarkdown(sections);
}

export function enforceUpperLowerStream(markdown: string): string {
  const source = enforceAtoERatioStructure(markdown);
  const sections = parseSections(source).map((section) => ({
    ...section,
    body: appendUpperLowerStream(section.body, section.number),
  }));
  return buildCanonicalMarkdown(sections);
}

export function enforceDecisionContractHard(markdown: string): string {
  const source = enforceUpperLowerStream(markdown);
  const sections = parseSections(source).map((section) => {
    if (section.number !== 9) return section;
    return {
      ...section,
      body: ensureDecisionContractBlock(section.body),
    };
  });
  return buildCanonicalMarkdown(sections);
}

export function enforceAtoERatioStructurePresence(markdown: string): boolean {
  const sections = parseSections(markdown);
  if (sections.length !== 9) return false;
  return sections.every((section) =>
    ["A", "B", "C", "D", "E"].every((letter) =>
      new RegExp(`^\\s*#{0,6}\\s*${letter}\\.`, "im").test(section.body)
    )
  );
}

export function hasForbiddenLanguage(markdown: string): boolean {
  const source = String(markdown ?? "");
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(source));
}

export const hasForbiddenHgbcoLanguage = hasForbiddenLanguage;

export function hasDecisionContractCommitBlock(markdown: string): boolean {
  const sectionNine = parseSections(markdown).find((section) => section.number === 9);
  if (!sectionNine) return false;
  const body = sectionNine.body;
  const hasCanonicalPrefix = /^De Raad van Bestuur committeert zich aan:/im.test(body);
  const hasLegacyPrefix = /^DE RAAD COMMITTEERT:/im.test(body);
  const hasPrefix = hasCanonicalPrefix || hasLegacyPrefix;

  const hasCanonicalLabels = [
    /^Keuze:/im,
    /^Accepted loss:/im,
    /^Besluitrecht ligt bij:/im,
    /^Stoppen per direct:/im,
    /^Niet meer escaleren:/im,
    /^Maandelijkse KPI:/im,
    /^Failure trigger:/im,
    /^Point of no return:/im,
    /^Herijkingsmoment:/im,
  ].every((guard) => guard.test(body));

  const hasLegacyLabels = [
    /^Keuze:/im,
    /^Accepted loss:/im,
    /^Besluitrecht ligt bij:/im,
    /^Stop per direct:/im,
    /^Niet meer escaleren:/im,
    /^Maandelijkse KPI:/im,
    /^Failure trigger:/im,
    /^Herijking:/im,
  ].every((guard) => guard.test(body));

  return hasPrefix && (hasCanonicalLabels || hasLegacyLabels);
}

export function enforceNoMetaNoTemplateRuntime(markdown: string): string {
  return enforceNoMetaNoTemplate(markdown);
}

export const HGBCO_MCKINSEY_DECISION_TEMPLATE = DECISION_BLOCK_TEMPLATE;
export const hasForbiddenHgbcoLanguageAlias = hasForbiddenLanguage;
