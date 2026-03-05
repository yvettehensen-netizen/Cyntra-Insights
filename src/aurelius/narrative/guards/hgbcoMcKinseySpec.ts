const CYNTRA_HEADINGS = [
  "### 1. DOMINANTE THESE",
  "### 2. KERNCONFLICT",
  "### 3. KEERZIJDE VAN DE KEUZE",
  "### 4. PRIJS VAN UITSTEL",
  "### 5. GOVERNANCE IMPACT",
  "### 6. MACHTSDYNAMIEK",
  "### 7. EXECUTIERISICO",
  "### 8. 90-DAGEN INTERVENTIEPROGRAMMA",
  "### 9. BESLUITKADER",
] as const;
const STRATEGIC_INSIGHTS_HEADING = "### 3 STRATEGISCHE INZICHTEN";

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bstaat onder druk\b/gi,
  /\bmogelijk\b/gi,
  /\bzou kunnen\b/gi,
  /\bbelangrijk om\b/gi,
  /\bvaak zien we\b/gi,
  /\bin veel organisaties\b/gi,
  /\bquick win\b/gi,
  /\blaaghangend fruit\b/gi,
  /\bessentieel\b/gi,
  /\bcruciaal\b/gi,
  /\balignment\b/gi,
  /\boptimaliseren\b/gi,
  /\btransformatie\b/gi,
  /\broadmap\b/gi,
  /\bblueprint\b/gi,
  /\bbest practice\b/gi,
  /\ber is sprake van\b/gi,
  /\ber lijkt sprake van\b/gi,
  /\bdefault template\b/gi,
  /\bas ai\b/gi,
  /\bals taalmodel\b/gi,
];

const DECISION_BLOCK_HEAD = "Het bestuur committeert zich aan het volgende besluit:";
const DECISION_BLOCK_TEMPLATE = [
  DECISION_BLOCK_HEAD,
  "Keuze:",
  "Expliciet verlies:",
  "Besluitrecht ligt bij:",
  "Stoppen per direct:",
  "Niet meer escaleren:",
  "Maandelijkse KPI:",
  "Failure trigger:",
  "Point of no return:",
  "Herijkingsmoment:",
  "Dit betekent dat het bestuur nu moet kiezen voor ...",
].join("\n");

function normalizeText(input: string): string {
  return String(input ?? "").replace(/\r\n?/g, "\n").trim();
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
  const byNumber = new Map<number, string>();
  for (const section of sections) {
    if (!section.number) continue;
    if (!byNumber.has(section.number)) {
      byNumber.set(section.number, section.body || "Niet onderbouwd in geuploade documenten of vrije tekst.");
    }
  }

  const canonicalBlocks = CYNTRA_HEADINGS.map((heading, index) => {
    const number = index + 1;
    const body = normalizeText(
      byNumber.get(number) || "Niet onderbouwd in geuploade documenten of vrije tekst."
    );
    return `${heading}\n\n${body}`;
  });

  const strategicInsightBlock = [
    STRATEGIC_INSIGHTS_HEADING,
    "INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "",
    "INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "",
    "INZICHT: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "WAAROM DIT BELANGRIJK IS: Niet onderbouwd in geuploade documenten of vrije tekst.",
    "BESTUURLIJKE CONSEQUENTIE: Niet onderbouwd in geuploade documenten of vrije tekst.",
  ].join("\n");

  const first = canonicalBlocks[0] ?? "";
  const rest = canonicalBlocks.slice(1);
  return [first, strategicInsightBlock, ...rest].filter(Boolean).join("\n\n").trim();
}

function ensureDecisionContractBlock(sectionBody: string): string {
  const cleaned = normalizeText(sectionBody)
    .replace(/Het bestuur committeert zich aan het volgende besluit:[\s\S]*$/i, "")
    .trim();

  const readLabel = (label: string): string => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cleaned.match(new RegExp(`^${escaped}\\s*(.*)$`, "im"));
    return String(match?.[1] ?? "").trim();
  };

  const block = [
    DECISION_BLOCK_HEAD,
    `Keuze: ${readLabel("Keuze:") || "Een expliciete voorkeurskeuze met direct mandaat."}`,
    `Expliciet verlies: ${readLabel("Expliciet verlies:") || "Tijdelijke inlevering van parallelle prioriteiten."}`,
    `Besluitrecht ligt bij: ${readLabel("Besluitrecht ligt bij:") || "De benoemde eindverantwoordelijke in het bestuur."}`,
    `Stoppen per direct: ${readLabel("Stoppen per direct:") || "Alle uitzonderingsroutes buiten het besluitritme."}`,
    `Niet meer escaleren: ${readLabel("Niet meer escaleren:") || "Informele bypasses buiten het formele escalatiepad."}`,
    `Maandelijkse KPI: ${readLabel("Maandelijkse KPI:") || "Doorlooptijd, escalaties en uitvoeringsdiscipline."}`,
    `Failure trigger: ${readLabel("Failure trigger:") || "Twee opeenvolgende periodes zonder aantoonbare voortgang."}`,
    `Point of no return: ${readLabel("Point of no return:") || "Na het missen van Dag 60-gate wordt verlies onomkeerbaar."}`,
    `Herijkingsmoment: ${readLabel("Herijkingsmoment:") || "Maandelijks bestuursmoment met stop/door-besluit."}`,
    "Dit betekent dat het bestuur nu moet kiezen voor ...",
  ].join("\n");

  return cleaned ? `${cleaned}\n\n${block}`.trim() : block;
}

export const HGBCO_MCKINSEY_SYSTEM_INJECT = `
CYNTRA Executive Decision Engine Spec.
Volg exact de sectiestructuur die in de actieve prompt of skeleton is opgegeven.
Gebruik waar gevraagd een 1-pagina Board Memo direct boven het Decision Contract.
Schrijf menselijk, financieel hard, bestuurlijk rustig en zonder dreigtoon.
Geen algemene statements, geen meta-tekst, geen AI-taal, geen consultant-jargon.
Maak besluituitstel psychologisch onmogelijk: geen twijfelzinnen, geen open einde.
Formuleer bestuurlijke causaliteit als onvermijdelijkheid, niet als advies.
Het 90-dagenplan bevat exact 6 kerninterventies (2 per maand) met velden:
Probleem dat wordt opgelost/Concrete actie/Waarom deze interventie/Eigenaar/Deadline/Meetbare KPI/Escalatieregel met gevolg/Gevolg voor organisatie/Gevolg voor klant-cliënt/Risico van niet handelen/Direct zichtbaar effect/Casus-anker.
Escalatie gebruikt niveaus L1-L2-L3 (operationeel, MT, bestuurlijke herprioritering).
Decision Contract bevat een rustig geformuleerd point of no return en mandaatverschuiving.
In zorgcontext (GGZ/Jeugdzorg) zijn deze zinnen verplicht aanwezig:
1) "De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel."
2) "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze."
3) "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt."
Vertaal capaciteit altijd naar menselijk effect: behandelcontinuiteit, wachtlijst, behandeluitkomst en verwijzersvertrouwen.
`.trim();

export const HGBCO_MCKINSEY_USER_INJECT = `
Schrijf uitsluitend op basis van broncontext.
Geen nieuwe feiten buiten input.
Geen bullets buiten sectie 8 en 9.
Geen verboden generieke woorden.
`.trim();

export function enforceNoMetaNoTemplate(markdown: string): string {
  return normalizeText(markdown)
    .split("\n")
    .filter((line) => !/^(meta|toelichting|uitleg|opmerking)\s*:/i.test(line.trim()))
    .join("\n")
    .trim();
}

export function enforceHgbcoHeadings(markdown: string): string {
  return buildCanonicalMarkdown(parseSections(markdown));
}

export function enforceAtoERatioStructure(markdown: string): string {
  return enforceHgbcoHeadings(markdown);
}

export function enforceUpperLowerStream(markdown: string): string {
  return enforceHgbcoHeadings(markdown);
}

export function enforceDecisionContractHard(markdown: string): string {
  const sections = parseSections(enforceHgbcoHeadings(markdown)).map((section) => {
    if (section.number !== 9) return section;
    return { ...section, body: ensureDecisionContractBlock(section.body) };
  });
  return buildCanonicalMarkdown(sections);
}

export function enforceAtoERatioStructurePresence(markdown: string): boolean {
  return parseSections(markdown).length === 9;
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
  return [
    /^Het bestuur committeert zich aan het volgende besluit:/im,
    /^Keuze:/im,
    /^Expliciet verlies:/im,
    /^Besluitrecht ligt bij:/im,
    /^Stoppen per direct:/im,
    /^Niet meer escaleren:/im,
    /^Maandelijkse KPI:/im,
    /^Failure trigger:/im,
    /^Point of no return:/im,
    /^Herijkingsmoment:/im,
    /^Dit betekent dat het bestuur nu moet kiezen voor /im,
  ].every((guard) => guard.test(body));
}

export function enforceNoMetaNoTemplateRuntime(markdown: string): string {
  return enforceNoMetaNoTemplate(markdown);
}

export const HGBCO_MCKINSEY_DECISION_TEMPLATE = DECISION_BLOCK_TEMPLATE;
export const hasForbiddenHgbcoLanguageAlias = hasForbiddenLanguage;
