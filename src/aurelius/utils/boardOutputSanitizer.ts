type SectionLike = { title: string; content: string };
import { runBoardOutputGuard } from "@/aurelius/synthesis/boardOutputGuard";
import { validateBoardReport } from "@/aurelius/engine/validators/BoardReportValidator";
const CASH_REQUIRED =
  "Cash-runway onbekend; berekening vereist binnen 14 dagen als onderdeel van interventieplan.";

function normalizeWhitespace(value: string): string {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeHeading(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeBoardOutput(text: string): string {
  const cleaned = normalizeWhitespace(String(text ?? ""))
    .replace(/Bronbasis:.*$/gim, "")
    .replace(/Bronankers:.*$/gim, "")
    .replace(/\(Interpretatie\)/g, "")
    .replace(/\(Hypothese\)/g, "")
    .replace(/^\s*(Aanname|Contextanker|Contextsignaal):.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return validateBoardReport(cleaned).sanitizedText;
}

function splitLongSentence(sentence: string, maxWords = 20): string[] {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [sentence.trim()];
  // Avoid injecting hard sentence breaks in long clauses; this caused artifacts like "circa. €16.833".
  return [sentence.trim()];
}

function protectEuroTokens(source: string): string {
  return String(source ?? "").replace(/€\s*[0-9][0-9.,]*/g, (amount) =>
    amount.replace(/\s+/g, "").replace(/\./g, "§DOT§").replace(/,/g, "§COMMA§")
  );
}

function restoreEuroTokens(source: string): string {
  return String(source ?? "").replace(/§DOT§/g, ".").replace(/§COMMA§/g, ",");
}

export function enforceParagraphDiscipline(text: string): string {
  const source = sanitizeBoardOutput(text);
  if (!source) return "";

  const blocks = source
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const disciplinedBlocks: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const hasBullet = lines.some((line) => /^([-*•]|\d+[.)])\s+/.test(line));
    if (hasBullet) {
      disciplinedBlocks.push(lines.join("\n"));
      continue;
    }

    const protectedBlock = protectEuroTokens(block);
    const sentences = (protectedBlock.match(/[^.!?\n]+[.!?]?/g) ?? [])
      .map((sentence) => restoreEuroTokens(sentence.trim()))
      .filter(Boolean)
      .flatMap((sentence) => splitLongSentence(sentence, 20));

    const paragraphChunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 5) {
      paragraphChunks.push(sentences.slice(i, i + 5).join(" "));
    }
    disciplinedBlocks.push(paragraphChunks.join("\n"));
  }

  return normalizeWhitespace(disciplinedBlocks.join("\n\n"));
}

export function dedupeSectionHeadings<T extends { title: string }>(sections: T[]): T[] {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const section of sections) {
    const key = normalizeHeading(section.title);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(section);
  }
  return output;
}

export function dedupeOpportunityWindows(text: string): string {
  const lines = sanitizeBoardOutput(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const filtered: string[] = [];
  for (const line of lines) {
    const isWindowHeader = /^(30|90|365)\s*dagen\b/i.test(line);
    if (!isWindowHeader) {
      filtered.push(line);
      continue;
    }
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    filtered.push(line);
  }
  return filtered.join("\n");
}

export function ensureCashExplicitness(text: string, sectionTitle: string): string {
  const source = sanitizeBoardOutput(text);
  const section = normalizeHeading(sectionTitle);
  const shouldApply =
    section.includes("financiele onderbouwing") || section.includes("prijs van uitstel");
  if (!shouldApply) return source;

  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const hasRunway = /cash\s*runway|liquiditeitsruimte|runway/i.test(source);
  const hasBuffer = /liquiditeitsbuffer|minimale liquiditeitsbuffer/i.test(source);
  const hasMonthly = /maandelijkse druk|druk per maand|per maand/i.test(source);
  const hasCashStatus = /^status:/im.test(source) || /onvoldoende cash-inzicht|cash-inzicht/i.test(source);

  if (!hasRunway) {
    lines.push(`Cash runway (maanden): ${CASH_REQUIRED}`);
  }
  if (!hasBuffer) {
    lines.push(`Minimale liquiditeitsbuffer: ${CASH_REQUIRED}`);
  }
  if (!hasMonthly) {
    lines.push(`Maandelijkse druk (EUR): ${CASH_REQUIRED}`);
  }
  if (!hasCashStatus) {
    lines.push(`Status: ${CASH_REQUIRED}`);
  }

  let statusSeen = false;
  const deduped = lines.filter((line) => {
    if (!/^status:/i.test(line)) return true;
    if (statusSeen) return false;
    statusSeen = true;
    return true;
  });
  return deduped.join("\n");
}

export function applyBoardEditorialPolicy(text: string, sectionTitle = ""): string {
  const cleaned = sanitizeBoardOutput(text);
  const cashAware = ensureCashExplicitness(cleaned, sectionTitle);
  const dedupedWindows = dedupeOpportunityWindows(cashAware);
  const hardened = runBoardOutputGuard(dedupedWindows, { fullDocument: false });
  return runBoardOutputGuard(enforceParagraphDiscipline(hardened), {
    fullDocument: false,
  });
}

export function sanitizeBoardSections<T extends SectionLike>(sections: T[]): T[] {
  const deduped = dedupeSectionHeadings(sections);
  return deduped.map((section) => ({
    ...section,
    content: applyBoardEditorialPolicy(section.content, section.title),
  }));
}
