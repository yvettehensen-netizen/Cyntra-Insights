import { BOARD_MEMO_REQUIRED_SECTIONS } from "./BoardNarrativeStructure";
import { logStabilityWarning, type StabilityWarning } from "@/aurelius/stability/OutputContractGuard";

export type NarrativeStructureGuardResult = {
  text: string;
  warnings: StabilityWarning[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function sectionIndex(source: string, section: string): number {
  return source.toLowerCase().indexOf(section.toLowerCase());
}

function countOccurrences(source: string, token: string): number {
  const matches = source.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"));
  return matches ? matches.length : 0;
}

export function enforceBoardNarrativeStructure(inputText: string): NarrativeStructureGuardResult {
  let text = String(inputText ?? "").trim();
  const warnings: StabilityWarning[] = [];

  for (const section of BOARD_MEMO_REQUIRED_SECTIONS) {
    if (!text.toLowerCase().includes(section.toLowerCase())) {
      text = `${text}\n\n${section}\n[Placeholder toegevoegd door NarrativeStructureGuard: sectie ontbreekt.]`;
      const warning: StabilityWarning = {
        guard: "NarrativeStructureGuard",
        layer: "Narrative Layer",
        message: `Ontbrekende sectie aangevuld: '${section}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  for (const section of BOARD_MEMO_REQUIRED_SECTIONS) {
    const occurrences = countOccurrences(text, section);
    if (occurrences > 1) {
      const warning: StabilityWarning = {
        guard: "NarrativeStructureGuard",
        layer: "Narrative Layer",
        message: `Dubbele sectie gedetecteerd: '${section}' (${occurrences}x).`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  let lastIndex = -1;
  for (const section of BOARD_MEMO_REQUIRED_SECTIONS) {
    const idx = sectionIndex(text, section);
    if (idx < lastIndex) {
      const warning: StabilityWarning = {
        guard: "NarrativeStructureGuard",
        layer: "Narrative Layer",
        message: `Volgordeafwijking gedetecteerd rond sectie '${section}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
    if (idx >= 0) lastIndex = idx;
  }

  return {
    text: text.trim(),
    warnings,
  };
}
