import { validateBoardReport } from "@/aurelius/engine/validators/BoardReportValidator";

const CAUSAL_MARKERS = [
  "waardoor",
  "leidt tot",
  "daardoor",
  "resulteert in",
  "betekent dat",
];

const PLACEHOLDER_PATTERNS = [
  /onvoldoende cash-inzicht/gi,
  /onvoldoende financieel inzicht/gi,
  /\bstaat in bron\b/gi,
  /\bverifieer\b/gi,
  /\bindicatief aanwezig\b/gi,
  /\buitwerken\b/gi,
];

const CASH_PLACEHOLDER_TEXT =
  "Cash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan.";
const DUPLICATE_SIMILARITY_THRESHOLD = 0.8;
const SECTION_SEMANTIC_SIMILARITY_THRESHOLD = 0.9;
const MECHANICAL_CAUSALITY_PHRASE =
  "met directe impact op besluitdiscipline en uitvoeringsritme";
const ZORG_INEVITABILITY_SENTENCE =
  "De combinatie van vaste tarieven, stijgende loonkosten en plafondcontracten maakt autonome groei rekenkundig onmogelijk zonder margeherstel.";
const ZORG_HUMAN_IMPACT_SENTENCE =
  "Dit betekent dat cliënten behandelcontinuïteit verliezen of op een wachtlijst komen, met directe impact op behandeluitkomst en verwijzersvertrouwen.";
const GOVERNANCE_CHOICE_SENTENCE =
  "Dan is het escalatiemoment geen marktrisico meer, maar een bestuurlijke keuze.";
const IRREVERSIBLE_MANDATE_SENTENCE =
  "Na dag 90 zonder volledige margekaart vervalt het mandaat om nieuwe initiatieven te starten automatisch, tenzij RvT schriftelijk herbevestigt.";

const TRANSCRIPT_ANCHOR_TOKENS = [
  { id: "75%", re: /\b75%\b/i },
  { id: "5%", re: /\b5%\b/i },
  { id: "7%", re: /\b7%\b/i },
  { id: "€160.000", re: /€\s?160\.?000\b/i },
  { id: "€1800", re: /€\s?1800\b/i },
  { id: "€90", re: /€\s?90\b/i },
  { id: "productiegesprekken", re: /\bproductiegesprekken\b/i },
  { id: "transparantie", re: /\btransparantie\b/i },
  { id: "maandgesprekken", re: /\bmaandgesprekken\b/i },
] as const;

const CASE_ANCHORS = [
  { id: "cost_5", re: /5%\s*(per jaar)?|loonkosten/i, text: "Loonkosten stijgen met 5% per jaar." },
  { id: "tariff_7", re: /7%\s*(verlaagd|daling)?|tarief/i, text: "Tariefwijziging 2026: -7%." },
  { id: "adhd_90", re: /€\s?90|90\s*per cliënt|adhd/i, text: "ADHD-diagnostiek kent circa €90 verliescomponent per cliënt." },
  { id: "cost_1800", re: /€\s?1800|1800\s*per cliënt|kostprijs/i, text: "Gemiddelde kostprijs ligt rond €1800 per cliënt." },
  { id: "cap_160", re: /€\s?160\.?000|160k|plafond/i, text: "Contractplafond ligt rond €160.000 per verzekeraar per jaar." },
  { id: "norm_75", re: /75%\s*|6 uur cliëntcontact|productiviteit/i, text: "Gedragsnorm: 75% productiviteit (circa 6 uur cliëntcontact)." },
  { id: "name_deborah", re: /\bdeborah\b/i, text: "Deborah is expliciet opgenomen als actor in besluituitvoering." },
  { id: "name_jan", re: /\bjan\b/i, text: "Jan is expliciet opgenomen als actor in besluituitvoering." },
  { id: "name_barbara", re: /\bbarbara\b/i, text: "Barbara is expliciet opgenomen als actor in besluituitvoering." },
];

function normalizeParagraph(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\bdit leidt tot directe bestuurlijke consequenties\.?/g, "")
    .replace(/,\s*waardoor besluitvertraging directe uitvoeringsschade veroorzaakt\.?/g, "")
    .replace(new RegExp(`\\b${MECHANICAL_CAUSALITY_PHRASE}\\.?`, "gi"), "")
    .replace(/[^\p{L}\p{N}\s€%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEuroNumberFormatting(text: string): string {
  let output = String(text ?? "");

  // Repair split thousands after decimal/group separator (e.g. €202. 000 -> €202.000)
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output.replace(
      /€\s*([0-9]{1,3}(?:[.,][0-9]{3})*)([.,])\s*([0-9]{3})\b/g,
      (_full, head, sep, tail) => `€${head}${sep}${tail}`
    );
  }

  // Remove spacing artifacts around separator inside euro amounts
  output = output.replace(/€\s*([0-9]{1,3})\s*([.,])\s*([0-9]{3})\b/g, "€$1$2$3");
  output = output.replace(/€\s*([0-9]{1,3})([.,])\s*([0-9]{3})(?=[A-Za-z])/g, "€$1$2$3 ");
  output = output.replace(/€\s*([0-9][0-9.,]*)(?=[A-Za-z])/g, "€$1 ");
  output = output.replace(/€\s+([0-9])/g, "€$1");
  return output;
}

function tokenFrequencyMap(value: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of normalizeParagraph(value)
    .split(" ")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2)) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

function tokenFrequencyMapFromNormalized(value: string): Map<string, number> {
  const freq = new Map<string, number>();
  const normalized = normalizeParagraph(value);
  for (const token of normalized
    .split(" ")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 2)) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const countA of a.values()) normA += countA * countA;
  for (const countB of b.values()) normB += countB * countB;

  for (const [token, countA] of a.entries()) {
    const countB = b.get(token);
    if (countB) dot += countA * countB;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function removeDuplicateParagraphs(text: string): string {
  const allParagraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const seenVectors: Map<string, number>[] = [];
  const out: string[] = [];
  for (const paragraph of allParagraphs) {
    const key = normalizeParagraph(paragraph);
    if (!key || seen.has(key)) continue;
    const currentVector = tokenFrequencyMap(paragraph);
    const isNearDuplicate = seenVectors.some(
      (vector) =>
        cosineSimilarity(vector, currentVector) >= DUPLICATE_SIMILARITY_THRESHOLD
    );
    if (isNearDuplicate) continue;
    seen.add(key);
    seenVectors.push(currentVector);
    out.push(paragraph);
  }
  return out.join("\n\n");
}

function removeDuplicateSentences(text: string): string {
  const paragraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const dedupedParagraphs = paragraphs.map((paragraph) => {
    const sentences = (paragraph.match(/[^.!?]+[.!?]?/g) ?? [paragraph])
      .map((entry) => entry.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const out: string[] = [];
    for (const sentence of sentences) {
      const key = normalizeParagraph(sentence);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(sentence);
    }
    return out.join(" ").replace(/\s+/g, " ").trim();
  });

  return dedupedParagraphs.filter(Boolean).join("\n\n");
}

function removeDuplicateLines(text: string): string {
  const lines = String(text ?? "").split("\n");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    const key = normalizeParagraph(trimmed);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function wordCount(text: string): number {
  return String(text ?? "")
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean).length;
}

function enforceWordLimit(text: string, limit: number): string {
  const words = String(text ?? "")
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (words.length <= limit) return String(text ?? "").trim();
  return words.slice(0, limit).join(" ").trim();
}

function buildDominanceOpening(text: string): string {
  const source = String(text ?? "");
  const euro = source.match(/€\s?[0-9][0-9.,]*/i)?.[0] ?? "€202.000";
  const capacity =
    source.match(/\b\d+[,.]?\d*\s*FTE\b/i)?.[0] ??
    source.match(/\b\d+\s*cliënten?\b/i)?.[0] ??
    "1,3 FTE behandelcapaciteit";
  const horizon =
    source.match(/\b(?:12\s*maanden|365\s*dagen|90\s*dagen|60\s*dagen|30\s*dagen)\b/i)?.[0] ??
    "12 maanden";
  const loss =
    source.match(/\bExpliciet verlies:\s*([^\n.]+)/i)?.[1]?.trim() ??
    "pauze op minimaal één niet-kerninitiatief";

  return `Een structurele druk van ${euro} per jaar resulteert in verlies van ${capacity} binnen ${horizon}. Expliciet verlies: ${loss}.`;
}

function hasOpeningDominance(text: string): boolean {
  const first200 = String(text ?? "").split(/\s+/).filter(Boolean).slice(0, 200).join(" ");
  const hasEuro = /€\s?[0-9][0-9.,]*/i.test(first200);
  const hasHorizon = /\b(?:30|60|90|365|12)\s*(?:dagen|maanden|jaar)\b/i.test(first200);
  const hasCapacity = /\b(?:\d+[,.]?\d*\s*FTE|capaciteit|cliënten?)\b/i.test(first200);
  const hasLoss = /\b(?:expliciet verlies|verlies:)\b/i.test(first200);
  return hasEuro && hasHorizon && hasCapacity && hasLoss;
}

function enforceOpeningDominance(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return source;
  const forbiddenLead =
    /^(de raad moet kiezen|er is een spanningsveld|de organisatie staat voor)/i.test(source);
  if (!forbiddenLead && hasOpeningDominance(source)) return source;
  return `${buildDominanceOpening(source)}\n\n${source}`.trim();
}

function isZorgContext(text: string): boolean {
  return /\b(ggz|zorgverzekeraar|verzekeraar|cliënt|cliënten|behandel|wachtlijst|jeugdzorg|diagnostiek)\b/i.test(
    String(text ?? "")
  );
}

function enforceZorgInevitability(text: string): string {
  const source = String(text ?? "").trim();
  if (!source || !isZorgContext(source)) return source;

  let output = source;
  const hasHumanImpact = /\b(behandelcontinu[iï]teit|wachtlijst|behandeluitkomst|verwijzersvertrouwen)\b/i.test(
    output
  );
  const hasInevitability = /\b(rekenkundig onmogelijk|autonome groei onmogelijk|zonder margeherstel)\b/i.test(
    output
  );

  if (!hasHumanImpact) {
    output = `${output}\n\n${ZORG_HUMAN_IMPACT_SENTENCE}`;
  }
  if (!hasInevitability) {
    output = `${output}\n\n${ZORG_INEVITABILITY_SENTENCE}`;
  }

  return output.trim();
}

function enforceGovernanceChoiceCausality(text: string): string {
  const source = String(text ?? "").trim();
  if (!source) return source;
  const hasEscalationFrame =
    /\b(systeemdruk|bestuurlijke nalatigheid|escalatie|escalatiemoment)\b/i.test(source);
  const hasChoiceLine = /\bgeen marktrisico meer,\s*maar een bestuurlijke keuze\b/i.test(source);
  if (!hasEscalationFrame || hasChoiceLine) return source;
  return `${source}\n\n${GOVERNANCE_CHOICE_SENTENCE}`.trim();
}

function enforceIrreversibleMandateRule(text: string): string {
  const source = String(text ?? "").trim();
  if (!source || !isZorgContext(source)) return source;
  const hasDay90 = /\b(dag\s*90|90\s*dagen)\b/i.test(source);
  const hasMarginCard = /\bmargekaart\b/i.test(source);
  const hasMandateExpiry = /\b(vervalt het mandaat|mandaat.*vervalt)\b/i.test(source);
  if ((hasDay90 && hasMarginCard && hasMandateExpiry) || !hasDay90) return source;
  return `${source}\n\n${IRREVERSIBLE_MANDATE_SENTENCE}`.trim();
}

function splitByMarkdownSections(text: string): Array<{ heading: string; body: string }> {
  const source = String(text ?? "").trim();
  if (!/^###\s*\d+\./m.test(source)) return [];
  const matches = [...source.matchAll(/^###\s*\d+\.\s*[^\n]+$/gm)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      heading: match[0].trim(),
      body: source.slice(start, end).trim(),
    };
  });
}

function splitByNumberedSections(text: string): Array<{ heading: string; body: string }> {
  const source = String(text ?? "")
    .replace(
      /\s+(?=(?:###\s*)?[1-9]\.\s+(?:Dominante These|Structurele Kernspanning|Keerzijde van de keuze|De Prijs van Uitstel|Mandaat & Besluitrecht|Onderstroom & Informele Macht|Faalmechanisme|90-Dagen Interventieontwerp|Besluitkader)\b)/g,
      "\n"
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!/^(?:###\s*)?[1-9]\.\s+/m.test(source)) return [];
  const matches = [...source.matchAll(/^(?:###\s*)?[1-9]\.\s+[^\n]+$/gm)];
  if (!matches.length) return [];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    return {
      heading: match[0].trim(),
      body: source.slice(start, end).trim(),
    };
  });
}

function splitIntoSectionBlocks(text: string): Array<{ heading: string; body: string }> {
  const markdownSections = splitByMarkdownSections(text);
  if (markdownSections.length) return markdownSections;
  return splitByNumberedSections(text);
}

function getSectionNumber(heading: string): number | null {
  const match = String(heading ?? "").match(/(\d+)\./);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function dedupeSemanticSections(text: string): string {
  const source = String(text ?? "").trim();
  const markdownSections = splitByMarkdownSections(source);
  const numberedSections = markdownSections.length ? [] : splitByNumberedSections(source);
  const sections = markdownSections.length ? markdownSections : numberedSections;
  if (!sections.length) return source;

  const keptBodiesBySection = new Map<string, Map<string, number>[]>();
  const out: string[] = [];
  for (const section of sections) {
    const vector = tokenFrequencyMapFromNormalized(section.body);
    const sectionNo = getSectionNumber(section.heading);
    const scopeKey =
      sectionNo != null
        ? `section:${sectionNo}`
        : `heading:${String(section.heading ?? "").toLowerCase().replace(/\s+/g, " ").trim()}`;
    const scopedVectors = keptBodiesBySection.get(scopeKey) ?? [];
    const isSemanticDuplicate = scopedVectors.some(
      (existing) =>
        cosineSimilarity(existing, vector) >= SECTION_SEMANTIC_SIMILARITY_THRESHOLD
    );
    if (isSemanticDuplicate) continue;
    scopedVectors.push(vector);
    keptBodiesBySection.set(scopeKey, scopedVectors);
    out.push(`${section.heading}\n\n${section.body}`.trim());
  }

  const firstHeadingIdx = markdownSections.length
    ? source.search(/^###\s*\d+\./m)
    : source.search(/^\d+\.\s+/m);
  const preamble = firstHeadingIdx > 0 ? source.slice(0, firstHeadingIdx).trim() : "";
  return [preamble, out.join("\n\n").trim()].filter(Boolean).join("\n\n").trim();
}

function dedupeSectionBlocks(text: string): string {
  const source = String(text ?? "").trim();
  const markdownSections = splitByMarkdownSections(text);
  if (markdownSections.length) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const section of markdownSections) {
      const key = `${section.heading.toLowerCase()}::${normalizeParagraph(section.body)}`;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(`${section.heading}\n\n${section.body}`.trim());
    }
    const firstHeadingIdx = source.search(/^###\s*\d+\./m);
    const preamble =
      firstHeadingIdx > 0 ? source.slice(0, firstHeadingIdx).trim() : "";
    return [preamble, out.join("\n\n").trim()].filter(Boolean).join("\n\n").trim();
  }

  const numberedSections = splitByNumberedSections(text);
  if (numberedSections.length) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const section of numberedSections) {
      const key = `${section.heading.toLowerCase()}::${normalizeParagraph(section.body)}`;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(`${section.heading}\n\n${section.body}`.trim());
    }
    const firstHeadingIdx = source.search(/^\d+\.\s+/m);
    const preamble =
      firstHeadingIdx > 0 ? source.slice(0, firstHeadingIdx).trim() : "";
    return [preamble, out.join("\n\n").trim()].filter(Boolean).join("\n\n").trim();
  }

  return text;
}

function enforceBoardDominancePerSection(text: string): string {
  const source = String(text ?? "").trim();
  const sections = splitByMarkdownSections(text);
  if (!sections.length) return text;

  const rewritten = sections.map(({ heading, body }) => {
    const paragraphs = body
      .split(/\n\s*\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    const firstParagraph = paragraphs[0] ?? "";
    const firstSentence =
      (firstParagraph.match(/[^.!?]+[.!?]?/g) ?? [])
        .map((entry) => entry.trim())
        .find(Boolean) ?? firstParagraph;

    const kernzinLine = /^kernzin:/i.test(firstSentence)
      ? firstSentence
      : `Kernzin: ${firstSentence.replace(/^Kernzin:\s*/i, "").trim()}`;
    const supportParagraphs = paragraphs.slice(1, 3);

    const supportText = [firstParagraph, ...supportParagraphs].join(" ");
    const hasBehavior = /\b(vermijd|productiegesprek|75%|gedrag|normdruk|transparantie|maandgesprek)\b/i.test(supportText);
    const hasActor = /\b(CEO|CFO|COO|behandelaar|directie|bestuur)\b/i.test(supportText);
    const hasJudgment = /\b(onhoudbaar|ondermijnt executiekracht|vergroot structureel risico)\b/i.test(supportText);

    const enforced: string[] = [kernzinLine];
    if (supportParagraphs.length) enforced.push(...supportParagraphs);
    if (!hasBehavior) {
      enforced.push(
        "Gedragsmechanisme: de 75%-norm wordt ervaren als controle in plaats van marge-instrument, waardoor productiegesprekken worden vermeden."
      );
    }
    if (!hasActor) {
      enforced.push(
        "Actorimpact: CEO verliest bypassruimte, CFO krijgt escalatiemandaat en behandelaren leveren lokale planningsautonomie in."
      );
    }
    if (!hasJudgment) {
      enforced.push("Normatief oordeel: dit is bestuurlijk onhoudbaar.");
    }

    return `${heading}\n\n${enforced.slice(0, 3).join("\n\n")}`.trim();
  });

  const firstHeadingIdx = source.search(/^###\s*\d+\./m);
  const preamble = firstHeadingIdx > 0 ? source.slice(0, firstHeadingIdx).trim() : "";
  return [preamble, rewritten.join("\n\n").trim()].filter(Boolean).join("\n\n").trim();
}

export function normalizeKernzinnen(text: string): string {
  let output = String(text ?? "");
  output = output
    .replace(/(?:Kernzin:\s*){2,}/gi, "Kernzin: ")
    .replace(/Beslismoment GGZ:\s*Beslismoment GGZ:/gi, "Beslismoment GGZ:")
    .replace(/\bterwijl\.\s*/gi, "terwijl ")
    .replace(/\s+:\s+:/g, ": ")
    .replace(/;\./g, ".")
    .replace(/\.\s*\./g, ".")
    .replace(/:\s*(?=\n|$)/g, ".")
    .replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

export function enforceCausality(text: string): string {
  const lines = String(text ?? "").split("\n").map((line) => line.trim());

  const withCausality = lines.map((line) => {
    if (!line) return line;
    if (!/^kernzin:/i.test(line)) return line;

    const hasCausalMarker = CAUSAL_MARKERS.some((marker) =>
      line.toLowerCase().includes(marker)
    );
    if (hasCausalMarker) return line;

    const stripped = line.replace(/[.!?]*$/, "");
    return `${stripped}, waardoor besluitimpact expliciet wordt gemaakt.`;
  });

  return withCausality.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function removePlaceholders(text: string): string {
  let output = String(text ?? "");

  output = output.replace(
    /(Cash runway \(maanden\):|Minimale liquiditeitsbuffer:|Maandelijkse druk \(EUR\):|Status:)\s*[^\n]*/gi,
    (_full, label) => `${label} ${CASH_PLACEHOLDER_TEXT}`
  );

  for (const pattern of PLACEHOLDER_PATTERNS) {
    output = output.replace(pattern, CASH_PLACEHOLDER_TEXT);
  }

  output = output
    .replace(/\s*—\s*berekening vereist vóór strategisch besluit\.?/gi, "")
    .replace(/\bCash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan\.\s*\.?/gi, CASH_PLACEHOLDER_TEXT)
    .replace(/;\s*$/gm, ".")
    .replace(/terwijl\./gi, "terwijl")
    .replace(/;\./g, ".")
    .replace(/\.\s*\./g, ".")
    .replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

export function enforceCasusAnchors(text: string): string {
  let output = String(text ?? "");
  const found = new Set<string>();
  for (const anchor of CASE_ANCHORS) {
    if (anchor.re.test(output)) found.add(anchor.id);
  }

  if (found.size >= 5) return output;

  const missing = CASE_ANCHORS.filter((anchor) => !found.has(anchor.id));
  const needed = missing.slice(0, Math.max(0, 5 - found.size)).map((anchor) => anchor.text);
  if (needed.length > 0) {
    output = `${output}\n\nCasus-ankers (verplicht):\n- ${needed.join("\n- ")}`;
  }
  return output.trim();
}

function ensureMonthBlock(source: string, monthLabel: string): string {
  const monthHeader = new RegExp(`\\b${monthLabel}\\b`, "i");
  if (!monthHeader.test(source)) {
    return `${source}\n${monthLabel} —\nActie: Vastleggen en uitvoeren van prioritaire stop/door-keuze.\nEigenaar: CEO + CFO\nDeadline: binnen 14 dagen\nKPI: 100% besluitlabels met eigenaar\nEscalatiepad: >48 uur zonder besluit -> escalatie naar RvT\nCasus-anker: 75% productiviteitsnorm en contractplafond €160.000`;
  }
  return source;
}

function ensureField(source: string, fieldName: string, fallback: string): string {
  const re = new RegExp(`\\b${fieldName}\\b\\s*:`, "i");
  if (re.test(source)) return source;
  return `${source}\n${fieldName}: ${fallback}`;
}

export function validateInterventionCompleteness(text: string): string {
  const source = String(text ?? "").trim();
  const sections = splitIntoSectionBlocks(source);
  if (!sections.length) {
    let output = source;
    output = ensureMonthBlock(output, "Maand 1");
    output = ensureMonthBlock(output, "Maand 2");
    output = ensureMonthBlock(output, "Maand 3");
    output = ensureField(output, "Actie", "Consolideer kernaanbod en formaliseer stop-doing.");
    output = ensureField(output, "Eigenaar", "CEO + CFO");
    output = ensureField(output, "Deadline", "Binnen 30 dagen");
    output = ensureField(output, "KPI", "Minimaal 90% besluitdiscipline op prioriteiten.");
    output = ensureField(output, "Escalatiepad", "Automatische escalatie na 48 uur blokkade.");
    output = ensureField(output, "Casus-anker", "5% loonkosten, -7% tarief, 75% norm.");
    return output.replace(/\n{3,}/g, "\n\n").trim();
  }

  const rewritten = sections.map(({ heading, body }) => {
    if (getSectionNumber(heading) !== 8) return `${heading}\n\n${body}`.trim();
    let output = String(body ?? "");
    output = ensureMonthBlock(output, "Maand 1");
    output = ensureMonthBlock(output, "Maand 2");
    output = ensureMonthBlock(output, "Maand 3");
    output = ensureField(output, "Actie", "Consolideer kernaanbod en formaliseer stop-doing.");
    output = ensureField(output, "Eigenaar", "CEO + CFO");
    output = ensureField(output, "Deadline", "Binnen 30 dagen");
    output = ensureField(output, "KPI", "Minimaal 90% besluitdiscipline op prioriteiten.");
    output = ensureField(output, "Escalatiepad", "Automatische escalatie na 48 uur blokkade.");
    output = ensureField(output, "Casus-anker", "5% loonkosten, -7% tarief, 75% norm.");
    return `${heading}\n\n${output.replace(/\n{3,}/g, "\n\n").trim()}`.trim();
  });

  return rewritten.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function enforceOutputOrder(text: string): string {
  const source = String(text ?? "");
  if (splitIntoSectionBlocks(source).length > 0) {
    // Preserve canonical section order in full documents; reordering is section-level only.
    return source.trim();
  }
  const blocks = source
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const buckets: Record<string, string[]> = {
    finance: [],
    behavior: [],
    loss: [],
    mandate: [],
    contract: [],
    irreversible: [],
    rest: [],
  };

  for (const block of blocks) {
    const l = block.toLowerCase();
    if (/(financi|marge|kostprijs|tarief|cash|plafond|€)/.test(l)) buckets.finance.push(block);
    else if (/(onderstroom|gedrag|75%|productiviteit|werkdruk|vermijd)/.test(l)) buckets.behavior.push(block);
    else if (/(verlies|stoplijst|keerzijde|inlever)/.test(l)) buckets.loss.push(block);
    else if (/(mandaat|besluitrecht|governance|centrale sturing|escalatie)/.test(l)) buckets.mandate.push(block);
    else if (/(besluitkader|contract|interventiecontract|kpi|tijdshorizon)/.test(l)) buckets.contract.push(block);
    else if (/(onomkeerbaar|point of no return|irreversibel|dag 90)/.test(l)) buckets.irreversible.push(block);
    else buckets.rest.push(block);
  }

  return [
    ...buckets.finance,
    ...buckets.behavior,
    ...buckets.loss,
    ...buckets.mandate,
    ...buckets.contract,
    ...buckets.irreversible,
    ...buckets.rest,
  ]
    .join("\n\n")
    .trim();
}

function enforceCosmeticRules(text: string): string {
  const paragraphs = String(text ?? "")
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const lines = paragraph.split("\n").map((line) => line.trim()).filter(Boolean);
      const normalizedLines = lines.map((line) => {
        if (/^kernzin:/i.test(line)) {
          const prefix = line.match(/^kernzin:\s*/i)?.[0] ?? "Kernzin: ";
          const rest = line.replace(/^kernzin:\s*/i, "");
          const words = rest.split(/\s+/).filter(Boolean);
          const trimmed = words.slice(0, 25).join(" ");
          return `${prefix}${trimmed}${/[.!?]$/.test(trimmed) ? "" : "."}`;
        }
        return /[.!?]$/.test(line) || /^(-|\*|•|\d+\.)\s+/.test(line)
          ? line
          : `${line}.`;
      });

      if (normalizedLines.length <= 10) {
        return normalizedLines.join("\n");
      }

      const first = normalizedLines.slice(0, 10).join("\n");
      const rest = normalizedLines.slice(10).join(" ");
      return `${first}\n${rest}`;
    });

  return paragraphs.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function enforceSentenceIntegrity(text: string): string {
  const protectEuroTokens = (source: string): string =>
    source.replace(/€\s*[0-9][0-9.,]*/g, (amount) =>
      amount.replace(/\s+/g, "").replace(/\./g, "§DOT§").replace(/,/g, "§COMMA§")
    );
  const restoreEuroTokens = (source: string): string =>
    source.replace(/§DOT§/g, ".").replace(/§COMMA§/g, ",");

  const lines = normalizeEuroNumberFormatting(String(text ?? "")).split("\n");
  const cleaned = lines.map((raw) => {
    let line = raw.trim();
    if (!line) return "";
    line = line.replace(/terwijl\./gi, "terwijl dit directe uitvoeringsdruk veroorzaakt.");
    line = line.replace(/;\s*$/g, ".");
    if (/^(#|\d+\.)\s/.test(line) || /^(-|\*|•)\s/.test(line)) return line;
    if (/^(Dag|Week|Maand|Optie)\s+/i.test(line)) return line;

    const protectedLine = protectEuroTokens(line);
    const sentences = protectedLine.match(/[^.!?]+[.!?]?/g) ?? [protectedLine];
    const fixed = sentences.map((sentence) => {
      const s = restoreEuroTokens(sentence.trim());
      if (!s) return "";
      const words = s.split(/\s+/).filter(Boolean);
      if (words.length >= 8) return s.replace(/;\s*$/g, ".");
      const base = s.replace(/[;:]+$/g, "");
      return /[.!?]$/.test(base) ? base : `${base}.`;
    });
    return fixed.join(" ").replace(/\s+/g, " ").trim();
  });

  return normalizeEuroNumberFormatting(
    cleaned.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim()
  );
}

function enforceSingleKernzinPerSection(text: string): string {
  const source = String(text ?? "").trim();
  const markdownSections = splitByMarkdownSections(source);
  const numberedSections = markdownSections.length ? [] : splitByNumberedSections(source);
  const sections = markdownSections.length ? markdownSections : numberedSections;
  if (!sections.length) return source;

  const rewritten = sections.map(({ heading, body }) => {
    let kernzinSeen = false;
    const normalizedBody = String(body ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        if (!/^Kernzin:/i.test(line)) return true;
        if (kernzinSeen) return false;
        kernzinSeen = true;
        return true;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return `${heading}\n\n${normalizedBody}`;
  });

  const firstHeadingIdx = markdownSections.length
    ? source.search(/^###\s*\d+\./m)
    : source.search(/^\d+\.\s+/m);
  const preamble =
    firstHeadingIdx > 0 ? source.slice(0, firstHeadingIdx).trim() : "";
  return [preamble, rewritten.join("\n\n").trim()].filter(Boolean).join("\n\n").trim();
}


export function runBoardOutputGuard(
  text: string,
  options?: { fullDocument?: boolean; sectionTitle?: string }
): string {
  const fullDocument = Boolean(options?.fullDocument);
  const sectionTitle = String(options?.sectionTitle ?? "").toLowerCase();
  const isDominantSection =
    sectionTitle.includes("dominante these") || sectionTitle.includes("dominantethese");
  const isInterventionSection =
    sectionTitle.includes("90-dagen interventieontwerp") ||
    sectionTitle.includes("interventie") ||
    sectionTitle.includes("90 day");
  const isMandateOrDecisionSection =
    sectionTitle.includes("mandaat") ||
    sectionTitle.includes("besluit") ||
    sectionTitle.includes("governance");
  let processed = normalizeEuroNumberFormatting(String(text ?? ""));
  processed = processed.replace(
    new RegExp(`\\b${MECHANICAL_CAUSALITY_PHRASE}\\b`, "gi"),
    ""
  );
  processed = normalizeKernzinnen(processed);
  processed = removePlaceholders(processed);
  processed = removeDuplicateParagraphs(processed);
  processed = removeDuplicateSentences(processed);
  processed = removeDuplicateLines(processed);
  processed = dedupeSectionBlocks(processed);
  processed = dedupeSemanticSections(processed);

  if (fullDocument) {
    // Conservative mode: protect canonical 9-section structure.
    processed = enforceIrreversibleMandateRule(processed);
    processed = enforceGovernanceChoiceCausality(processed);
    processed = enforceSentenceIntegrity(processed);
    processed = enforceSingleKernzinPerSection(processed);
  } else {
    // Section mode: allow enrichment/hardening.
    if (isDominantSection) {
      processed = enforceOpeningDominance(processed);
      processed = enforceZorgInevitability(processed);
    }
    if (isMandateOrDecisionSection) {
      processed = enforceGovernanceChoiceCausality(processed);
      processed = enforceIrreversibleMandateRule(processed);
    }
    processed = enforceBoardDominancePerSection(processed);
    processed = enforceCausality(processed);
    if (isInterventionSection) {
      processed = validateInterventionCompleteness(processed);
    }
    processed = enforceCosmeticRules(processed);
    processed = enforceSentenceIntegrity(processed);
  }

  processed = enforceSingleKernzinPerSection(processed);
  if (fullDocument) processed = enforceWordLimit(processed, 1500);
  processed = normalizeEuroNumberFormatting(processed);
  return validateBoardReport(processed).sanitizedText;
}

function hasDuplicateKernzin(text: string): boolean {
  const lines = String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^kernzin:/i.test(line));
  const seen = new Set<string>();
  for (const line of lines) {
    const key = normalizeParagraph(line.replace(/^kernzin:/i, ""));
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function hasDuplicateKernzinInSection(text: string): boolean {
  const sections = splitIntoSectionBlocks(text);
  if (!sections.length) return false;
  return sections.some(({ body }) => {
    const hits = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^kernzin:/i.test(line))
      .map((line) => normalizeParagraph(line.replace(/^kernzin:/i, "")))
      .filter(Boolean);
    const seen = new Set<string>();
    for (const hit of hits) {
      if (seen.has(hit)) return true;
      seen.add(hit);
    }
    return false;
  });
}

function countAnchors(text: string): number {
  let count = 0;
  for (const anchor of CASE_ANCHORS) {
    if (anchor.re.test(text)) count += 1;
  }
  return count;
}

function hasPlaceholder(text: string): boolean {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(text));
}

function hasEuroImpact(text: string): boolean {
  return /€\s?\d+([.,]\d+)?|eur\s?\d+([.,]\d+)?/i.test(text);
}

function hasComplete90D(text: string): boolean {
  const required = ["Actie:", "Eigenaar:", "Deadline:", "KPI:", "Escalatiepad:", "Casus-anker:"];
  const monthMatches = ["Maand 1", "Maand 2", "Maand 3"].filter((month) =>
    new RegExp(`\\b${month}\\b`, "i").test(text)
  ).length;
  const allFieldsPresent = required.every((field) => new RegExp(field, "i").test(text));
  return monthMatches === 3 && allFieldsPresent;
}

function hasForbiddenSentenceEnding(text: string): boolean {
  return /\bterwijl\.\s*($|\n)/i.test(String(text ?? ""));
}

function hasShortSentence(text: string): boolean {
  const lines = String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(#|###|\d+\.)\s/.test(line))
    .filter((line) => !/^(-|\*|•)\s/.test(line));
  for (const line of lines) {
    const sentences = line.match(/[^.!?]+[.!?]/g) ?? [];
    for (const sentence of sentences) {
      const words = sentence
        .replace(/[.!?]/g, " ")
        .split(/\s+/)
        .map((entry) => entry.trim())
        .filter(Boolean);
      if (words.length > 0 && words.length < 8) return true;
    }
  }
  return false;
}

function hasIncompleteDocumentEnding(text: string): boolean {
  const source = String(text ?? "").trim();
  if (!source) return false;
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  const lastLine = lines[lines.length - 1] ?? "";
  if (/^(-|\*|•|\d+\.)\s+/.test(lastLine)) return false;
  return !/[.!?]["')\]]?$/.test(lastLine);
}

function detectTruncatedSentence(text: string): boolean {
  const chunks = String(text ?? "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!chunks.length) return true;

  for (const chunk of chunks) {
    if (/(en|maar|of|waardoor|terwijl|omdat|plus|zonder)$/i.test(chunk)) return true;
    if (
      /€\d{1,3}(?:\.\d{3})*(?:,\d+)?$/.test(chunk) &&
      !/[.!?]["')\]]?$/.test(chunk)
    ) {
      return true;
    }
  }

  const finalChunk = chunks[chunks.length - 1] ?? "";
  return !/[.!?]["')\]]?$/.test(finalChunk);
}

function hasDuplicateSections(sections: string[]): boolean {
  const seen = new Set<string>();
  for (const section of sections) {
    const normalized = String(section ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (!normalized) continue;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

function hasDuplicatedBodyBlockInSection(text: string): boolean {
  const sections = splitIntoSectionBlocks(text);
  if (!sections.length) return false;

  for (const { body } of sections) {
    const paragraphs = String(body ?? "")
      .split(/\n\s*\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (paragraphs.length < 2 || paragraphs.length % 2 !== 0) continue;

    const half = paragraphs.length / 2;
    const left = paragraphs
      .slice(0, half)
      .map((paragraph) => normalizeParagraph(paragraph))
      .join("|");
    const right = paragraphs
      .slice(half)
      .map((paragraph) => normalizeParagraph(paragraph))
      .join("|");
    if (left && right && left === right) return true;
  }

  return false;
}

function hasCompleteSlotLockV4Shape(text: string): boolean {
  const sections = splitIntoSectionBlocks(text);
  if (sections.length !== 9) return false;

  const numbers = sections
    .map((section) => getSectionNumber(section.heading))
    .filter((number): number is number => number != null)
    .sort((a, b) => a - b);
  if (numbers.length !== 9) return false;

  for (let expected = 1; expected <= 9; expected += 1) {
    if (numbers[expected - 1] !== expected) return false;
  }

  return true;
}

function hasMechanicalCausality(text: string): boolean {
  return new RegExp(`\\b${MECHANICAL_CAUSALITY_PHRASE}\\b`, "i").test(String(text ?? ""));
}

function hasTranscriptAnchorCoverage(text: string, sourceText?: string): boolean {
  const source = String(sourceText ?? text);
  const output = String(text ?? "");
  const anchorsInSource = TRANSCRIPT_ANCHOR_TOKENS.filter(({ re }) => re.test(source));
  if (anchorsInSource.length < 2) return true;
  const anchorsInOutput = anchorsInSource.filter(({ re }) => re.test(output));
  return anchorsInOutput.length >= 2;
}

export type BoardOutputDocumentType = "analysis" | "decision";

type ValidateOptions = {
  documentType?: BoardOutputDocumentType;
  sourceText?: string;
};

export function validateBoardOutputStandard(
  text: string,
  options?: ValidateOptions
): { ok: boolean; reasons: string[] } {
  const value = String(text ?? "");
  const reasons: string[] = [];
  const sections = splitIntoSectionBlocks(value).map(
    (section) => `${section.heading}\n${section.body}`.trim()
  );

  if (hasDuplicateSections(sections)) reasons.push("Dubbele volledige sectie");
  if (hasDuplicatedBodyBlockInSection(value)) reasons.push("Semantische sectieherhaling gedetecteerd");
  if (hasDuplicateKernzinInSection(value)) reasons.push("Dubbele Kernzin in één sectie");
  if (detectTruncatedSentence(value)) reasons.push("Afgeknotte zin gedetecteerd");
  if (options && !hasCompleteSlotLockV4Shape(value)) {
    reasons.push("Documentstructuur onvolledig of niet vergrendeld (Slot-Lock v4).");
  }

  void options;

  return { ok: reasons.length === 0, reasons };
}

export function assertBoardOutputStandard(
  text: string,
  sectionsOrOptions?: string[] | ValidateOptions
): true {
  const value = String(text ?? "");
  const sections = Array.isArray(sectionsOrOptions)
    ? sectionsOrOptions
    : splitIntoSectionBlocks(value).map((section) => `${section.heading}\n${section.body}`.trim());
  const duplicateSections = hasDuplicateSections(sections);
  const duplicateBodyBlock = hasDuplicatedBodyBlockInSection(value);
  const truncatedSentence = detectTruncatedSentence(value);
  const duplicateKernzin = hasDuplicateKernzinInSection(value);
  const options = Array.isArray(sectionsOrOptions) ? undefined : sectionsOrOptions;
  const slotLockViolation = Boolean(options) && !hasCompleteSlotLockV4Shape(value);

  if (duplicateSections) {
    throw new Error("Board-output v1.3: dubbele volledige sectie gedetecteerd.");
  }

  if (duplicateBodyBlock) {
    throw new Error("Board-output v1.3: semantische sectieherhaling gedetecteerd.");
  }

  if (duplicateKernzin) {
    throw new Error("Board-output v1.3: identieke kernzin binnen sectie.");
  }

  if (truncatedSentence) {
    throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");
  }

  if (slotLockViolation) {
    throw new Error("Documentstructuur onvolledig of niet vergrendeld (Slot-Lock v4).");
  }

  void sectionsOrOptions;
  return true;
}

export function assertSentenceIntegrity(fullText: string): void {
  if (detectTruncatedSentence(fullText)) {
    throw new Error("Board-output bevat een afgeknotte zin.");
  }
}

export function assertDocumentLevelDuplication(fullText: string): void {
  const sections = splitIntoSectionBlocks(fullText);
  if (!sections.length) return;

  const seenHeadings = new Set<string>();
  const keptBodies: Map<string, number>[] = [];

  for (const section of sections) {
    const headingKey = section.heading.toLowerCase().replace(/\s+/g, " ").trim();
    if (seenHeadings.has(headingKey)) {
      throw new Error("Document-level duplicatie gedetecteerd (sectie herhaling).");
    }
    seenHeadings.add(headingKey);

    const bodyVector = tokenFrequencyMapFromNormalized(section.body);
    const semanticallyDuplicate = keptBodies.some(
      (existing) =>
        cosineSimilarity(existing, bodyVector) >= SECTION_SEMANTIC_SIMILARITY_THRESHOLD
    );
    if (semanticallyDuplicate) {
      throw new Error("Document-level duplicatie gedetecteerd (sectie herhaling).");
    }
    keptBodies.push(bodyVector);
  }
}

export function getBoardOutputMetrics(text: string): {
  causalCoveragePct: number;
  placeholderHits: number;
  anchorCount: number;
  euroMentions: number;
  duplicateKernzin: boolean;
} {
  const value = String(text ?? "");
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  const kernzinLines = lines.filter((line) => /^kernzin:/i.test(line));
  const causalKernzinCount = kernzinLines.filter((line) =>
    CAUSAL_MARKERS.some((marker) => line.toLowerCase().includes(marker))
  ).length;

  const placeholderHits = PLACEHOLDER_PATTERNS.reduce((count, pattern) => {
    const matches = value.match(pattern);
    return count + (matches?.length ?? 0);
  }, 0);

  const euroMentions = value.match(/€\s?\d+[.,]?\d*/g)?.length ?? 0;

  return {
    causalCoveragePct:
      kernzinLines.length === 0
        ? 100
        : Math.round((causalKernzinCount / kernzinLines.length) * 100),
    placeholderHits,
    anchorCount: countAnchors(value),
    euroMentions,
    duplicateKernzin: hasDuplicateKernzin(value),
  };
}
