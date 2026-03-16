import { logStabilityWarning, type StabilityWarning } from "./OutputContractGuard";

const REQUIRED_MEMO_SECTIONS = [
  "1. Besluitvraag",
  "2. Executive Thesis",
  "3. Feitenbasis",
  "4. Strategische opties",
  "5. Aanbevolen keuze",
  "6. Niet-onderhandelbare besluitregels",
  "7. 90-dagen interventieplan",
  "8. KPI-set",
  "9. Besluittekst",
] as const;

export type NarrativeStructureGuardResult = {
  board_memo: string;
  warnings: StabilityWarning[];
};

function nowIso(): string {
  return new Date().toISOString();
}

export function runNarrativeStructureGuard(boardMemo: string): NarrativeStructureGuardResult {
  let output = String(boardMemo ?? "").trim();
  const warnings: StabilityWarning[] = [];

  for (const section of REQUIRED_MEMO_SECTIONS) {
    if (!output.toLowerCase().includes(section.toLowerCase())) {
      output = [
        output,
        "",
        section,
        "[Placeholder toegevoegd door NarrativeStructureGuard: sectie ontbreekt in bronoutput.]",
      ].join("\n").trim();

      const warning: StabilityWarning = {
        guard: "NarrativeStructureGuard",
        layer: "Narrative Layer",
        message: `Ontbrekende sectie toegevoegd als placeholder: '${section}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  return {
    board_memo: output,
    warnings,
  };
}
