import type { StrategicAnalysisMap } from "@/aurelius/analysis/StrategicAnalysisMap";
import { noPromptLeakage } from "@/aurelius/validators/no_prompt_leakage";
import { noFragmentEndings } from "@/aurelius/validators/no_fragment_endings";
import { metadataConsistencyCheck } from "@/aurelius/validators/metadata_consistency_check";
import { scenarioDistinctnessCheck } from "@/aurelius/validators/scenario_distinctness_check";
import { stopruleMeasurabilityCheck } from "@/aurelius/validators/stoprule_measurability_check";
import { sectionCompletenessCheck } from "@/aurelius/validators/section_completeness_check";
import { symptomWithoutMechanismCheck } from "@/aurelius/validators/SymptomWithoutMechanismCheck";

export type BoardReportValidationIssue = {
  code:
    | "forbidden_artifact"
    | "incomplete_sentence"
    | "duplicate_core_line"
    | "metadata_conflict"
    | "generic_scenario"
    | "why_not_choice_leak"
    | "incomplete_section"
    | "symptom_without_mechanism";
  message: string;
  fragment?: string;
};

export type BoardReportValidationResult = {
  sanitizedText: string;
  issues: BoardReportValidationIssue[];
};

const FORBIDDEN_LINE_PATTERNS: Array<{ re: RegExp; replacement?: string }> = [
  { re: /^\s*Keuzedruk\s+\d+\s*$/gim },
  { re: /^\s*Kopieer richting\s*$/gim },
  { re: /^\s*bron:\s*.*$/gim },
  { re: /^\s*HARD\s*-\s*/gim, replacement: "" },
  { re: /^\s*Mechanisme zonder inhoud\s*$/gim },
];

const FORBIDDEN_INLINE_PATTERNS = [
  /\bKeuzedruk\s+\d+\b/gi,
  /\bKopieer richting\b/gi,
  /\bMechanisme zonder inhoud\b/gi,
];

const FINAL_OUTPUT_LEAKAGE_PATTERNS = [
  /\bHISTORISCH LEERSIGNAAL\b/gi,
  /\bPattern match\b/gi,
];

const RAW_SOURCE_SECTION_PATTERNS = [
  /^\s*Samenvatting gesprekverslag(?:\s+\w+)?\s*:?\s*$/i,
  /^\s*🔴\s*ACTION ITEMS.*$/i,
  /^\s*Action items\s*$/i,
  /^\s*🟢\s*FYI.*$/i,
  /^\s*⛔\s*BLOCKERS.*$/i,
  /^\s*Notes\s*$/i,
  /^\s*OPEN VRAGEN.*$/i,
];

const BANNED_GENERIC_SCENARIOS = [
  /\bScenario\s+A\s+[—-]\s+Volumegroei(?:\s+via\s+extra\s+capaciteit)?\b/i,
  /\bScenario\s+[ABC]\s+[—-]\s+Status quo\b/i,
  /\bScenario\s+[ABC]\s+[—-]\s+Hybride\b/i,
  /\bScenario\s+[ABC]\s+[—-]\s+Volumegroei\b/i,
];

function normalize(text: string): string {
  return String(text ?? "").replace(/\r\n/g, "\n");
}

function normalizeComparable(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksIncompleteLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(#{1,6}|\d+[.)]|[-*•])\s+/.test(trimmed)) return false;
  if (/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s'-]+:\s*.+$/.test(trimmed)) return false;
  if (/^(SCENARIO'?S|INTERVENTIES|KERNPROBLEEM|KERNSTELLING|AANBEVOLEN KEUZE)$/i.test(trimmed)) {
    return false;
  }
  if (/^Scenario\s+[A-Z]\s+[—-]\s+.+$/i.test(trimmed)) return false;
  if (/^Red flag\s+\d+\s+[—-]\s+.+$/i.test(trimmed)) return false;
  if (/^[A-Z][A-Za-z0-9&' -]{3,}$/.test(trimmed) && !/[.!?:]$/.test(trimmed)) return false;
  if (/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s'-]+$/.test(trimmed) && trimmed === trimmed.toUpperCase()) return false;
  if (/^[A-ZÀ-ÿ][A-Za-zÀ-ÿ\s/'-]{12,}$/.test(trimmed) && !/[.!?:]$/.test(trimmed)) return false;
  if (/^(Sector|Analyse datum):\s*.+$/i.test(trimmed)) return false;
  if (/^STOPREGEL\s+\d+$/i.test(trimmed)) return false;
  if (/^(Sector|Analyse datum|Kernprobleem|Kernstelling|Aanbevolen keuze|Waarom deze keuze|Grootste risico bij uitstel|Stopregel)\s*$/i.test(trimmed)) {
    return false;
  }
  if (/\b(en|maar|of|omdat|waardoor|terwijl|zodat|plus|zonder)\s*$/i.test(trimmed)) return true;
  if (/^(De spanning zit tussen a\.|Herzie direct als De spanning zit tussen a\.)$/i.test(trimmed)) return true;
  if (/^(Omdat c\.\s*optie a)/i.test(trimmed)) return true;
  if (/^[A-Za-zÀ-ÿ].{0,80}$/.test(trimmed) && !/[.!?:]$/.test(trimmed)) {
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= 8) return true;
  }
  return false;
}

function dropForbiddenArtifacts(text: string, issues: BoardReportValidationIssue[]): string {
  let output = normalize(text);
  for (const { re, replacement } of FORBIDDEN_LINE_PATTERNS) {
    output = output.replace(re, (match) => {
      issues.push({
        code: "forbidden_artifact",
        message: "Verboden artefact uit board report verwijderd.",
        fragment: match.trim(),
      });
      return replacement ?? "";
    });
  }

  output = output
    .split("\n")
    .filter((line) => {
      const forbidden = [...FORBIDDEN_INLINE_PATTERNS, ...FINAL_OUTPUT_LEAKAGE_PATTERNS].find((pattern) => pattern.test(line));
      if (!forbidden) return true;
      issues.push({
        code: "forbidden_artifact",
        message: "Verboden artefactregel uit board report verwijderd.",
        fragment: line.trim(),
      });
      return false;
    })
    .join("\n");

  return output.replace(/\n{3,}/g, "\n\n").trim();
}

function stripRawSourceBlocks(text: string, issues: BoardReportValidationIssue[]): string {
  const lines = normalize(text).split("\n");
  const kept: string[] = [];
  let skippingRawBlock = false;

  for (const line of lines) {
    let trimmed = line.trim();
    const inlineLeak = trimmed.match(/^(.*?)(?:\s+Bronnen?\s*:|\s+Notes\b|\s+Action items\b)[\s\S]*$/i);
    if (inlineLeak) {
      issues.push({
        code: "forbidden_artifact",
        message: "Inline bron- of notitieblok uit hoofdrapport verwijderd.",
        fragment: trimmed,
      });
      trimmed = String(inlineLeak[1] ?? "").trim();
      if (!trimmed) continue;
    }
    const startsRawBlock = RAW_SOURCE_SECTION_PATTERNS.some((pattern) => pattern.test(trimmed));
    const rawSourceLine =
      /\[Bron:\s*[^\]]+\]/i.test(trimmed) ||
      /\bFireflies\b/i.test(trimmed) ||
      (/^\s*[•*-]\s+/.test(line) && /\[Bron:\s*[^\]]+\]/i.test(line));

    if (startsRawBlock) {
      skippingRawBlock = true;
      issues.push({
        code: "forbidden_artifact",
        message: "Ruw bronblok uit hoofdrapport verwijderd.",
        fragment: trimmed,
      });
      continue;
    }

    if (skippingRawBlock) {
      if (!trimmed) {
        continue;
      }
      const looksNewSection =
        /^\d+\s*$/.test(trimmed) ||
        /^(Bestuurlijke kernsamenvatting|Besluitvraag|Kernstelling van het rapport|Feitenbasis|Keuzerichtingen|Aanbevolen keuze|Doorbraakinzichten|Bestuurlijk actieplan|Bestuurlijke stresstest|Bestuurlijke blinde vlekken|Vroegsignalering|Mogelijke ontwikkelingen|Besluitgevolgen|Open strategische vragen)\b/i.test(
          trimmed
        );
      if (looksNewSection) {
        skippingRawBlock = false;
      } else {
        issues.push({
          code: "forbidden_artifact",
          message: "Ruwe bronregel uit hoofdrapport verwijderd.",
          fragment: trimmed,
        });
        continue;
      }
    }

    if (rawSourceLine) {
      issues.push({
        code: "forbidden_artifact",
        message: "Bronregel met transcriptverwijzing verwijderd.",
        fragment: trimmed,
      });
      continue;
    }

    kept.push(trimmed === line.trim() ? line : trimmed);
  }

  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeBoardDecisionLines(text: string, issues: BoardReportValidationIssue[]): string {
  const lines = normalize(text).split("\n");
  const rewritten = lines.map((line) => {
    if (/^\s*BESTUURLIJK BESLUIT\s*[—:-]\s*Laat het bestuur besluiten hoe\b/i.test(line)) {
      issues.push({
        code: "forbidden_artifact",
        message: "Placeholder-besluittaal genormaliseerd naar bestuurlijke besluitzin.",
        fragment: line.trim(),
      });
      return line.replace(
        /Laat het bestuur besluiten hoe\s+.+?\s+bestuurlijk borgt\.?/i,
        "Het bestuur besluit deze interventie vast te stellen, te beleggen en op voortgang te toetsen."
      );
    }
    return line;
  });
  return rewritten.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function repairIncompleteLines(text: string, issues: BoardReportValidationIssue[]): string {
  const kept: string[] = [];
  for (const line of normalize(text).split("\n")) {
    if (!looksIncompleteLine(line)) {
      kept.push(line);
      continue;
    }
    issues.push({
      code: "incomplete_sentence",
      message: "Onvolledige of semantisch kapotte regel verwijderd.",
      fragment: line.trim(),
    });
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function removeDuplicateCoreLines(text: string, issues: BoardReportValidationIssue[]): string {
  const seen = new Set<string>();
  const lines = normalize(text).split("\n");
  const output: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      output.push(line);
      continue;
    }

    const isCoreLine =
      /^(KERNINZICHT|ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|OPERATIONEEL GEVOLG|FINANCIEEL GEVOLG|ORGANISATORISCH GEVOLG)\s*(?:-|—|:)/i.test(
        trimmed
      ) || /^Bestuurlijke stilstand vergroot de schade sneller dan extra activiteit haar compenseert\.?$/i.test(trimmed);

    const key = normalizeComparable(trimmed);
    if (isCoreLine && seen.has(key)) {
      issues.push({
        code: "duplicate_core_line",
        message: "Dubbele kernregel verwijderd.",
        fragment: trimmed,
      });
      continue;
    }

    if (isCoreLine) seen.add(key);
    output.push(line);
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function detectMetadataConflicts(text: string, issues: BoardReportValidationIssue[]): void {
  const sectors = [...normalize(text).matchAll(/^\s*Sector\s*:?\s*(.+)\s*$/gim)]
    .map((match) => String(match[1] ?? "").trim())
    .filter(Boolean);
  const unique = Array.from(new Set(sectors.map((sector) => sector.toLowerCase())));
  if (unique.length > 1) {
    issues.push({
      code: "metadata_conflict",
      message: `Conflicterende sectorlabels gedetecteerd: ${sectors.join(" / ")}`,
    });
  }
}

function detectScenarioGenericness(text: string, issues: BoardReportValidationIssue[]): void {
  for (const pattern of BANNED_GENERIC_SCENARIOS) {
    const match = text.match(pattern);
    if (!match) continue;
    issues.push({
      code: "generic_scenario",
      message: "Generieke scenariolabels gedetecteerd; scenario's moeten brongebonden zijn.",
      fragment: match[0],
    });
  }
}

function detectWhyNotChoiceLeak(text: string, issues: BoardReportValidationIssue[]): void {
  const directLeak = text.match(
    /Waarom niet optie\s*[BC]\?[\s\S]{0,240}?(optie a|kies de richting met de hoogste bestuurlijke beheersbaarheid)/i
  );
  if (directLeak) {
    issues.push({
      code: "why_not_choice_leak",
      message: "Waarom-niet-sectie lekt aanbevolen keuze in plaats van contrasterende logica.",
      fragment: directLeak[0],
    });
    return;
  }

  const recommended =
    text.match(/(?:AANBEVOLEN KEUZE|Aanbevolen keuze)\s*\n(?:[A-Z]\.\s*)?(.+)/i)?.[1]?.trim() ?? "";
  if (!recommended) return;

  const whyNotBlocks = [...text.matchAll(/Waarom niet optie\s*[BC]\?\s*\n([\s\S]*?)(?=\n(?:Waarom niet optie|Besluitgevolgen|$))/gi)];
  for (const block of whyNotBlocks) {
    const body = String(block[1] ?? "").trim();
    if (!body) continue;
    const normalizedBody = normalizeComparable(body);
    const normalizedRecommended = normalizeComparable(recommended);
    if (
      normalizedBody.includes(normalizedRecommended.slice(0, 24)) ||
      /\boptie a\b/i.test(body) ||
      /\bkies de richting met de hoogste bestuurlijke beheersbaarheid\b/i.test(body)
    ) {
      issues.push({
        code: "why_not_choice_leak",
        message: "Waarom-niet-sectie lekt aanbevolen keuze in plaats van contrasterende logica.",
        fragment: body,
      });
    }
  }
}

export function validateBoardReport(
  text: string,
  analysisMap?: StrategicAnalysisMap
): BoardReportValidationResult {
  const issues: BoardReportValidationIssue[] = [];
  const originalText = normalize(text);
  let sanitizedText = originalText;
  const promptLeakage = noPromptLeakage(originalText);
  promptLeakage.matches.forEach((match) =>
    issues.push({
      code: "forbidden_artifact",
      message: "Prompt-lekkage gedetecteerd.",
      fragment: match,
    })
  );
  const fragmentEndings = noFragmentEndings(originalText);
  fragmentEndings.matches.forEach((match) =>
    issues.push({
      code: "incomplete_sentence",
      message: "Fragmenteinde gedetecteerd.",
      fragment: match,
    })
  );
  detectScenarioGenericness(originalText, issues);
  detectWhyNotChoiceLeak(originalText, issues);
  detectMetadataConflicts(originalText, issues);
  sanitizedText = dropForbiddenArtifacts(sanitizedText, issues);
  sanitizedText = stripRawSourceBlocks(sanitizedText, issues);
  sanitizedText = repairIncompleteLines(sanitizedText, issues);
  sanitizedText = removeDuplicateCoreLines(sanitizedText, issues);
  sanitizedText = normalizeBoardDecisionLines(sanitizedText, issues);
  const metadataCheck = metadataConsistencyCheck(originalText, analysisMap);
  metadataCheck.mismatches.forEach((mismatch) =>
    issues.push({
      code: "metadata_conflict",
      message: "Metadata ontbreekt of is inconsistent met de analysekaart.",
      fragment: mismatch,
    })
  );
  const scenarioCheck = scenarioDistinctnessCheck(analysisMap);
  scenarioCheck.issues.forEach((issue) =>
    issues.push({
      code: "generic_scenario",
      message: issue,
    })
  );
  const stopRuleCheck = stopruleMeasurabilityCheck(analysisMap);
  stopRuleCheck.issues.forEach((issue) =>
    issues.push({
      code: "incomplete_sentence",
      message: issue,
    })
  );
  const completenessCheck = sectionCompletenessCheck(sanitizedText, analysisMap);
  completenessCheck.issues.forEach((issue) =>
    issues.push({
      code: "incomplete_section",
      message: issue,
    })
  );
  const symptomCheck = symptomWithoutMechanismCheck(sanitizedText, analysisMap);
  symptomCheck.issues.forEach((issue) =>
    issues.push({
      code: "symptom_without_mechanism",
      message: issue,
    })
  );

  return {
    sanitizedText: sanitizedText.replace(/\n{3,}/g, "\n\n").trim(),
    issues,
  };
}
