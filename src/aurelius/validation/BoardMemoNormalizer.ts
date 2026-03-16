import { noFragmentEndings } from "@/aurelius/validators/no_fragment_endings";
import { noPromptLeakage } from "@/aurelius/validators/no_prompt_leakage";

type NormalizerInput = {
  board_memo?: unknown;
  executive_summary?: unknown;
  strategic_conflict?: unknown;
  recommended_option?: unknown;
  interventions?: unknown;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\r/g, "").trim();
}

function normalizeInline(value: unknown): string {
  return normalize(value).replace(/\s+/g, " ").trim();
}

function isNoiseLine(line: string): boolean {
  return (
    !line ||
    /^\d{1,2}$/.test(line) ||
    /^(output\s*\d+|context layer|dominante these|boardroom insight|kopieer richting)$/i.test(line) ||
    /^(mechanisme|risico|onderliggende oorzaak|bestuurlijk gevolg)$/i.test(line) ||
    /^(strategic conflict|strategy simulation|decision memory|strategic pattern|scenario risks|strategy comparison|early_warning_signals)$/i.test(
      line
    )
  );
}

function sanitizeLines(text: string): string[] {
  const seen = new Set<string>();
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => !isNoiseLine(line))
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function pickFirstParagraph(text: string): string {
  const lines = sanitizeLines(text);
  return lines.slice(0, 3).join(" ").trim();
}

function hasArtifactPayload(text: string): boolean {
  const source = normalizeInline(text);
  if (!source) return false;
  return (
    !noPromptLeakage(source).pass ||
    /\b(HARD\s*-|CONFLICT_MECHANISM|PRICE_OF_CHOICE|CONFLICT_RESOLUTION|STRATEGIC_SCENARIOS|SIMULATION_RESULTS|SCENARIO_RISKS|STRATEGY_COMPARISON|DECISION_RECORD|Open vragen|Killer insight|INTERPRETATIE)\b/i.test(
      source
    )
  );
}

function toInterventionLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        const title = normalizeInline(item);
        return title ? `${index + 1}. ${title}` : "";
      }

      const record = item as Record<string, unknown>;
      const action =
        normalizeInline(record.action) ||
        normalizeInline(record.title) ||
        normalizeInline(record.interventie) ||
        normalizeInline(record.description);
      if (!action) return "";

      const owner = normalizeInline(record.owner) || normalizeInline(record.verantwoordelijke);
      const deadline = normalizeInline(record.deadline) || normalizeInline(record.termijn);
      const kpi = normalizeInline(record.KPI) || normalizeInline(record.kpi);
      const suffix = [owner && `owner ${owner}`, deadline && `deadline ${deadline}`, kpi && `KPI ${kpi}`]
        .filter(Boolean)
        .join(" • ");
      return `${index + 1}. ${action}${suffix ? ` (${suffix})` : ""}`;
    })
    .filter(Boolean)
    .slice(0, 3);
}

function extractSection(lines: string[], headings: string[]): string {
  const headingSet = new Set(headings.map((item) => item.toLowerCase()));
  const start = lines.findIndex((line) => headingSet.has(line.toLowerCase()));
  if (start === -1) return "";

  const body: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (headingSet.has(line.toLowerCase())) continue;
    if (/^(bestuurlijke hypothese|feitenbasis|besluitvoorstel|opvolging 90 dagen|kernconflict)/i.test(line)) break;
    body.push(line);
  }
  return body.join(" ").trim();
}

function buildCanonicalMemo(input: {
  hypothesis: string;
  facts: string;
  decision: string;
  followUp: string;
}): string {
  return [
    "Bestuurlijke hypothese",
    input.hypothesis,
    "",
    "Feitenbasis",
    input.facts,
    "",
    "Besluitvoorstel",
    input.decision,
    "",
    "Opvolging 90 dagen",
    input.followUp,
  ]
    .join("\n")
    .trim();
}

export function normalizeBoardMemoForContract(input: NormalizerInput): string {
  const rawMemo = normalize(input.board_memo);
  const sanitizedLines = sanitizeLines(rawMemo);
  const cleanedMemo = sanitizedLines.join("\n");

  const extractedHypothesis =
    extractSection(sanitizedLines, ["Bestuurlijke hypothese"]) ||
    extractSection(sanitizedLines, ["Executive Thesis"]) ||
    pickFirstParagraph(cleanedMemo);
  const extractedFacts =
    extractSection(sanitizedLines, ["Feitenbasis"]) ||
    extractSection(sanitizedLines, ["Kernconflict"]) ||
    "";
  const extractedDecision = extractSection(sanitizedLines, ["Besluitvoorstel"]);
  const extractedFollowUp = extractSection(sanitizedLines, ["Opvolging 90 dagen"]);

  const summary = normalizeInline(input.executive_summary);
  const conflict = normalizeInline(input.strategic_conflict);
  const recommendation = normalizeInline(input.recommended_option);
  const interventionLines = toInterventionLines(input.interventions);
  const safeHypothesis = hasArtifactPayload(extractedHypothesis) ? "" : extractedHypothesis;
  const safeFacts = hasArtifactPayload(extractedFacts) ? "" : extractedFacts;
  const safeDecision = hasArtifactPayload(extractedDecision) ? "" : extractedDecision;
  const safeFollowUp = hasArtifactPayload(extractedFollowUp) ? "" : extractedFollowUp;

  const canonical = buildCanonicalMemo({
    hypothesis: safeHypothesis || summary || "De analyse wijst op een scherpe bestuurlijke keuze die nu expliciet moet worden gemaakt.",
    facts:
      safeFacts || conflict || "De feitenbasis is beperkt reconstrueerbaar; gebruik contractdruk, capaciteit en governance als primaire toetsstenen.",
    decision:
      safeDecision ||
      [
        recommendation && `Aanbevolen optie: ${recommendation}.`,
        conflict && `Strategisch conflict: ${conflict}.`,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Aanbevolen keuze ontbreekt; bestuur moet expliciet prioriteren.",
    followUp:
      safeFollowUp ||
      (interventionLines.length
        ? interventionLines.join("\n")
        : "1. Vertaal de keuze naar eigenaar, deadline, KPI en stopregel."),
  });

  const hasLeakage = !noPromptLeakage(cleanedMemo).pass;
  const hasFragments = !noFragmentEndings(cleanedMemo).pass;
  const missingStructure = !/Bestuurlijke hypothese/i.test(cleanedMemo) || !/Besluitvoorstel/i.test(cleanedMemo);
  const hasEngineDump =
    /\b(STRATEGIC CONFLICT|STRATEGY SIMULATION|DECISION MEMORY|STRATEGIC PATTERN|CONTEXT LAYER|OUTPUT\s*\d+)\b/i.test(
      rawMemo
    ) || /\bHARD\s*-/i.test(rawMemo);

  if (!rawMemo || hasLeakage || hasFragments || missingStructure || hasEngineDump) {
    return canonical;
  }

  return cleanedMemo;
}
