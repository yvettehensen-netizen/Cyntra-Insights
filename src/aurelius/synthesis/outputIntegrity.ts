export type OutputIntegrityMetrics = {
  headingMatches: number;
  duplicateSections: number;
  duplicateParagraphBlocks: number;
  duplicateKernzin: number;
  splitEuro: boolean;
  sentenceIntegrity: boolean;
  statusLineDuplicates: number;
};

type SectionBlock = {
  heading: string;
  body: string;
};

const CANONICAL_HEADING_TITLES =
  "Dominante These|Structurele Kernspanning|Keerzijde van de keuze|De Prijs van Uitstel|Mandaat & Besluitrecht|Onderstroom & Informele Macht|Faalmechanisme|90-Dagen Interventieontwerp|Besluitkader";

function normalizeHeadingBoundaries(text: string): string {
  return String(text ?? "")
    .replace(
      new RegExp(
        `\\s+(?=(?:###\\s*)?[1-9]\\.\\s+(?:${CANONICAL_HEADING_TITLES})\\b)`,
        "g"
      ),
      "\n"
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeComparable(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s€%]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(
    normalizeComparable(value)
      .split(" ")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function splitNumberedSections(text: string): SectionBlock[] {
  const source = normalizeHeadingBoundaries(String(text ?? "").trim());
  if (!source) return [];
  const headingRegex = /^(?:###\s*)?[1-9]\.\s+[^\n]+$/gm;
  const matches = [...source.matchAll(headingRegex)];
  if (!matches.length) return [];
  return matches.map((match, index) => {
    const heading = String(match[0] ?? "").trim();
    const start = (match.index ?? 0) + heading.length;
    const end = matches[index + 1]?.index ?? source.length;
    const body = source.slice(start, end).trim();
    return { heading, body };
  });
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

function countDuplicateKernzinLines(text: string): number {
  const sections = splitNumberedSections(text);
  let duplicateCount = 0;
  for (const section of sections) {
    const lines = section.body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^kernzin:/i.test(line));
    if (lines.length > 1) duplicateCount += lines.length - 1;
  }
  return duplicateCount;
}

function countStatusLineDuplicates(text: string): number {
  const sections = splitNumberedSections(text);
  let duplicates = 0;
  for (const section of sections) {
    const lines = section.body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    let statusSeen = false;
    for (const line of lines) {
      if (!/^status:/i.test(line)) continue;
      if (statusSeen) duplicates += 1;
      statusSeen = true;
    }
  }
  return duplicates;
}

function countDuplicateParagraphBlocks(sections: SectionBlock[]): number {
  let duplicates = 0;
  for (const section of sections) {
    const paragraphs = String(section.body ?? "")
      .split(/\n\s*\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    const seen: Set<string>[] = [];
    for (const paragraph of paragraphs) {
      const normalized = normalizeComparable(paragraph);
      if (!normalized) continue;
      const current = tokenSet(paragraph);
      const isDuplicate = seen.some((candidate) => jaccardSimilarity(candidate, current) >= 0.96);
      if (isDuplicate) {
        duplicates += 1;
      } else {
        seen.push(current);
      }
    }
  }
  return duplicates;
}

function hasSplitEuroNumber(text: string): boolean {
  return /€\s*\d{1,3}\.\s+\d{3}\b/.test(String(text ?? ""));
}

function hasTruncatedDrukSentence(text: string): boolean {
  return /veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk(?!\s+per maand)/i.test(
    String(text ?? "")
  );
}

function enforceParagraphSubtitles(text: string): string {
  return String(text ?? "")
    .replace(/\s+(Bovenstroom:)/gi, "\n\n$1")
    .replace(/\s+(Onderstroom:)/gi, "\n\n$1")
    .replace(/\s+-\s+(?=\p{L})/gu, "\n- ")
    .replace(/\s+(Maand\s+[123]\s+—)/gi, "\n\n$1")
    .replace(/\s+(Week\s+\d+:)/gi, "\n$1")
    .replace(/Interventieplan 90 dagen \(6 kerninterventies\.\s*causaal en afdwingbaar\)/gi, "Interventieplan 90 dagen (6 kerninterventies, causaal en afdwingbaar)")
    .replace(/Verankering\.\s*strategiebesluit/gi, "Verankering, strategiebesluit")
    .replace(/KPI\.\s*tijdshorizon/gi, "KPI, tijdshorizon")
    .replace(/\n{2,}(Bestuurlijke implicatie:)/gi, "\n$1")
    .replace(/\n{2,}(Kernzin:)/gi, "\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasDuplicateSections(sections: SectionBlock[]): boolean {
  const seen = new Set<string>();
  for (const section of sections) {
    const normalized = normalizeComparable(`${section.heading}\n${section.body}`);
    if (!normalized) continue;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

function hasDuplicatedBodyBlockInSection(sections: SectionBlock[]): boolean {
  for (const section of sections) {
    const paragraphs = String(section.body ?? "")
      .split(/\n\s*\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (paragraphs.length < 2 || paragraphs.length % 2 !== 0) continue;

    const half = paragraphs.length / 2;
    const left = paragraphs
      .slice(0, half)
      .map((paragraph) => normalizeComparable(paragraph))
      .join("|");
    const right = paragraphs
      .slice(half)
      .map((paragraph) => normalizeComparable(paragraph))
      .join("|");

    if (left && right && left === right) return true;
  }
  return false;
}

export function normalizeSectionBodyForOutput(body: string, slotId?: string): string {
  let output = normalizeHeadingBoundaries(String(body ?? ""))
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\.\s+(maar|waardoor|terwijl)\b/gi, ", $1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // If a full document fragment leaked into one slot, keep only the current slot body.
  const leakedHeadingPattern = new RegExp(
    `\\n(?:###\\s*)?[1-9]\\.\\s+(?:${CANONICAL_HEADING_TITLES})\\b[\\s\\S]*$`,
    "i"
  );
  output = output.replace(leakedHeadingPattern, "").trim();

  // Remove accidental exact block duplication when a section body is appended twice.
  const compactLines = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (compactLines.length >= 6 && compactLines.length % 2 === 0) {
    const half = compactLines.length / 2;
    const left = compactLines
      .slice(0, half)
      .map((line) => normalizeComparable(line))
      .join("|");
    const right = compactLines
      .slice(half)
      .map((line) => normalizeComparable(line))
      .join("|");
    if (left && left === right) {
      output = compactLines.slice(0, half).join("\n");
    }
  }

  const slotKey = String(slotId ?? "").toLowerCase();
  if (slotKey === "besluitkader" || slotKey.includes("besluitkader")) {
    const markerIdx = output.toLowerCase().indexOf("\n90-dagen executieplan");
    if (markerIdx >= 0) output = output.slice(0, markerIdx).trim();
  }

  const paragraphs = output
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const uniqueParagraphs: string[] = [];
  const seenParagraphs = new Set<string>();
  for (const paragraph of paragraphs) {
    const key = normalizeComparable(paragraph);
    if (!key || seenParagraphs.has(key)) continue;
    seenParagraphs.add(key);
    uniqueParagraphs.push(paragraph);
  }
  output = uniqueParagraphs.join("\n\n");

  // Remove semantic near-duplicate paragraphs inside one section body.
  const semanticallyUnique: string[] = [];
  const semanticVectors: Set<string>[] = [];
  for (const paragraph of output
    .split(/\n\s*\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    const vector = tokenSet(paragraph);
    const isNearDuplicate = semanticVectors.some(
      (candidate) => jaccardSimilarity(candidate, vector) >= 0.96
    );
    if (isNearDuplicate) continue;
    semanticVectors.push(vector);
    semanticallyUnique.push(paragraph);
  }
  output = semanticallyUnique.join("\n\n");

  const lines = output.split("\n");
  let kernzinSeen = false;
  let statusSeen = false;
  const filteredLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^kernzin:/i.test(trimmed)) {
      if (kernzinSeen) continue;
      kernzinSeen = true;
    }
    if (/^status:/i.test(trimmed)) {
      if (statusSeen) continue;
      statusSeen = true;
    }
    filteredLines.push(line);
  }
  output = filteredLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // Deduplicate repeated Status fields even when embedded in long lines.
  let statusSeenGlobal = false;
  output = output
    .replace(/Status:\s*[^\n]+/gi, (match) => {
      if (statusSeenGlobal) return "";
      statusSeenGlobal = true;
      return match;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Guarantee at most one explicit Status line in a section.
  let statusSeenLine = false;
  output = output
    .split("\n")
    .map((line) => {
      if (!/^status:/i.test(line.trim())) return line;
      if (statusSeenLine) return "";
      statusSeenLine = true;
      return line;
    })
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  output = output.replace(
    /\b(veroorzaakt\s+circa\s+€\d{1,3}(?:\.\d{3})*\s+druk)(?!\s+per maand)\b/gi,
    "$1 per maand"
  );
  output = output
    .replace(/\.\s+(maar|waardoor|terwijl)\b/gi, ", $1")
    .replace(/\s+\./g, ".")
    .replace(/\.\./g, ".");

  if (slotKey === "besluitkader" || slotKey.includes("besluitkader")) {
    output = output
      .replace(/\b90-dagen executieplan\b[\s\S]*$/i, "")
      .replace(/\bBesluitdocument Raad van Bestuur\b[\s\S]*$/i, "")
      .replace(/\s+(Mandaatverschuiving:|Expliciet verlies:|Verbod:|Onomkeerbaar moment:|1-PAGINA BESTUURLIJKE SAMENVATTING|Besluit vandaag:|Voorkeursoptie:|Waarom onvermijdelijk:|30\/60\/90 meetpunten:|Bestuurlijke implicatie:|Contractprincipe:)/gi, "\n\n$1")
      .trim();
  }

  if (slotKey === "interventie" || slotKey.includes("interventie")) {
    output = output
      .replace(new RegExp(`\\n(?:###\\s*)?[1-9]\\.\\s+(?:${CANONICAL_HEADING_TITLES})\\b[\\s\\S]*$`, "i"), "")
      .replace(/\s+(Eigenaar:|Deadline:|KPI:|Escalatiepad:|Casus-anker:|Actie:)/gi, "\n$1")
      .replace(/\s+(Maand\s+[123]\s+—)/gi, "\n\n$1")
      .trim();
  }

  output = enforceParagraphSubtitles(output);

  if (output && !/[.!?]["')\]]?$/.test(output)) output = `${output}.`;

  return output;
}

export function normalizeBoardDocumentForOutput(fullText: string): string {
  const source = String(fullText ?? "").replace(/\r\n/g, "\n").trim();
  if (!source) return "";
  const sections = splitNumberedSections(source);
  if (!sections.length) {
    return normalizeSectionBodyForOutput(source);
  }

  const out = sections.map((section) => {
    const slotId = (() => {
      const h = section.heading.toLowerCase();
      if (h.includes("1.")) return "dominanteThese";
      if (h.includes("2.")) return "kernspanning";
      if (h.includes("3.")) return "keerzijde";
      if (h.includes("4.")) return "prijsUitstel";
      if (h.includes("5.")) return "mandaat";
      if (h.includes("6.")) return "onderstroom";
      if (h.includes("7.")) return "faalmechanisme";
      if (h.includes("8.")) return "interventie";
      if (h.includes("9.")) return "besluitkader";
      return undefined;
    })();
    const normalizedBody = normalizeSectionBodyForOutput(section.body, slotId);
    return `${section.heading}\n\n${normalizedBody}`;
  });

  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function sanitizeExecutiveReportFields<T extends Record<string, string>>(fields: T): T {
  return {
    ...fields,
    dominantThesis: normalizeSectionBodyForOutput(String(fields.dominantThesis ?? ""), "dominanteThese"),
    coreConflict: normalizeSectionBodyForOutput(String(fields.coreConflict ?? ""), "kernspanning"),
    tradeoffs: normalizeSectionBodyForOutput(String(fields.tradeoffs ?? ""), "keerzijde"),
    opportunityCost: normalizeSectionBodyForOutput(String(fields.opportunityCost ?? ""), "prijsUitstel"),
    governanceImpact: normalizeSectionBodyForOutput(String(fields.governanceImpact ?? ""), "mandaat"),
    powerDynamics: normalizeSectionBodyForOutput(String(fields.powerDynamics ?? ""), "onderstroom"),
    executionRisk: normalizeSectionBodyForOutput(String(fields.executionRisk ?? ""), "faalmechanisme"),
    interventionPlan90D: normalizeSectionBodyForOutput(
      String(fields.interventionPlan90D ?? ""),
      "interventie"
    ),
    decisionContract: normalizeSectionBodyForOutput(String(fields.decisionContract ?? ""), "besluitkader"),
  };
}

export function getOutputIntegrityMetrics(text: string): OutputIntegrityMetrics {
  const source = String(text ?? "");
  const sections = splitNumberedSections(source);
  const truncated = detectTruncatedSentence(source);
  return {
    headingMatches: sections.length,
    duplicateSections: hasDuplicateSections(sections) ? 1 : 0,
    duplicateParagraphBlocks: countDuplicateParagraphBlocks(sections),
    duplicateKernzin: countDuplicateKernzinLines(source),
    splitEuro: hasSplitEuroNumber(source),
    sentenceIntegrity: !truncated,
    statusLineDuplicates: countStatusLineDuplicates(source),
  };
}

export function assertOutputIntegrity(text: string): OutputIntegrityMetrics {
  const metrics = getOutputIntegrityMetrics(text);
  if (typeof process !== "undefined" && process.env?.BOARD_DEBUG_LOGS === "1") {
    console.info("[board_output_integrity_metrics]", metrics);
  }
  const sections = splitNumberedSections(String(text ?? ""));

  if (metrics.duplicateSections > 0) {
    throw new Error("Board-output v1.3: dubbele volledige sectie gedetecteerd.");
  }

  if (metrics.duplicateParagraphBlocks > 0) {
    throw new Error("Board-output faalt integriteitscontrole: duplicatie gedetecteerd (exact/paragraph/section).");
  }

  if (hasDuplicatedBodyBlockInSection(sections)) {
    throw new Error("Board-output v1.3: semantische sectieherhaling gedetecteerd.");
  }

  if (metrics.duplicateKernzin > 0) {
    throw new Error("Board-output v1.3: identieke kernzin binnen sectie.");
  }

  if (metrics.statusLineDuplicates > 0) {
    throw new Error("Board-output v1.3: dubbele statusregel binnen sectie.");
  }

  if (metrics.splitEuro || hasTruncatedDrukSentence(text)) {
    throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");
  }

  if (!metrics.sentenceIntegrity) {
    throw new Error("Board-output v1.3: afgeknotte zin gedetecteerd.");
  }

  return metrics;
}
