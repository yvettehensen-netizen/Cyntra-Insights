import type { BoardroomMemoViewModel } from "@/components/reports/boardroomMemoFormatter";

export type Section =
  | "executive"
  | "problem"
  | "decision"
  | "why"
  | "risk"
  | "scenarios"
  | "mechanism"
  | "stopRules"
  | "actions"
  | "question";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function sanitize(text: string): string {
  return normalize(text)
    .replace(/\bmarkeer\s+u\.?/gi, "")
    .replace(/\bconsortium\s+of\s+re(?:levante partijen?)?\.?/gi, "consortium")
    .replace(/\bkan leiden tot\b/gi, "leidt tot")
    .replace(/\bkan zorgen voor\b/gi, "zorgt voor")
    .replace(/\bzou kunnen\b/gi, "zorgt voor")
    .replace(/\bin veel gevallen\b/gi, "")
    .replace(/\bde organisatie moet\b/gi, "")
    .replace(/\bhet bestuur moet\b/gi, "")
    .replace(/\bmogelijk\b/gi, "")
    .replace(/\bwellicht\b/gi, "")
    .replace(/\bmeta\b/gi, "")
    .replace(/\.{3,}/g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function splitSentence(sentence: string): string[] {
  const text = sanitize(sentence);
  if (text.length <= 160) return [text];
  const parts = text.split(/,\s+|;\s+|\s+en\s+/).map((part) => sanitize(part)).filter(Boolean);
  if (parts.length > 1) return parts;
  const midpoint = Math.floor(text.length / 2);
  const breakIndex = text.indexOf(" ", midpoint);
  if (breakIndex > 0) {
    return [sanitize(text.slice(0, breakIndex)), sanitize(text.slice(breakIndex + 1))].filter(Boolean);
  }
  return [text];
}

function enforceWordLimit(sentence: string, maxWords: number): string {
  const words = sanitize(sentence).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ").replace(/[.,;:!?]+$/g, "")}.`;
}

export function rewriteText(text: string): string {
  if (!text || text.length < 10) return "";
  let cleaned = sanitize(text);
  cleaned = splitLongSentences(cleaned);
  if (cleaned.includes("...") || cleaned.match(/\b[a-z]{1,3}$/)) {
    cleaned = sanitize(cleaned);
  }
  return cleaned
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => enforceWordLimit(sentence, 18))
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function splitLongSentences(text: string): string {
  const sentences = text.split(/(?<=[.?!])\s+/);
  return sentences
    .map((sentence) => {
      if (sentence.length > 160) {
        const parts = splitSentence(sentence);
        return parts.slice(0, 2).join(". ").replace(/\.\s*\./g, ".");
      }
      return sentence;
    })
    .join(" ");
}

export function generateDecisionHeadline(decision: string) {
  return `De enige verdedigbare keuze is: ${sanitize(decision).replace(/[.]$/, "")}.`;
}

function shortenBullet(text: string): string {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  if (words.length > 12) {
    return words.slice(0, 12).join(" ");
  }
  return words.join(" ");
}

export function rewriteBullets(items: string[]): string[] {
  if (!items) return [];
  return items
    .map((item) => rewriteText(item))
    .map((item) => shortenBullet(item))
    .filter(Boolean);
}

function rewriteScenarios(scenarios: BoardroomMemoViewModel["scenarios"]) {
  if (!scenarios) return [];
  return scenarios.map((scenario) => ({
    ...scenario,
    title: rewriteText(scenario.title).replace(/[.]$/, ""),
    explanation: rewriteText(scenario.explanation),
  }));
}

function rewriteActions(actions: string[]): string[] {
  return (actions || [])
    .map((action) => rewriteText(action))
    .map((action) => action.replace(/^(Het bestuur|De organisatie)\s+/i, ""))
    .map((action) => action.charAt(0).toUpperCase() + action.slice(1))
    .filter(Boolean)
    .map((action) => shortenBullet(action));
}

function unique(lines: string[]): string[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = normalize(line).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function rewriteReport(report: BoardroomMemoViewModel): BoardroomMemoViewModel {
  const executiveSummary = unique(
    report.executiveSummary
      .flatMap((item) => splitSentence(item))
      .map((item) => rewriteText(item))
  ).slice(0, 3);

  return {
    ...report,
    executiveSummary,
    coreProblem: rewriteText(report.coreProblem),
    decision: generateDecisionHeadline(report.decision),
    why: unique(rewriteBullets(report.why)).slice(0, 4),
    riskOfInaction: unique(rewriteBullets(report.riskOfInaction)).slice(0, 4),
    scenarios: rewriteScenarios(report.scenarios),
    mechanism: unique(rewriteBullets(report.mechanism)).slice(0, 4),
    stopRules: unique(rewriteBullets(report.stopRules)).slice(0, 3),
    actions: unique(rewriteActions(report.actions)).slice(0, 3),
    boardQuestion: rewriteText(report.boardQuestion),
  };
}
