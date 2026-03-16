import { validateBoardOutputStandard } from "@/aurelius/synthesis/boardOutputGuard";

export type RegressionCheckInput = {
  reportText: string;
  sourceText?: string;
};

export type RegressionCheckResult = {
  ok: boolean;
  checks: Array<{ check: string; ok: boolean; reason?: string }>;
};

function hasAllNineReportSections(text: string): boolean {
  const required = [
    "1. Besluitvraag",
    "2. Bestuurlijke these",
    "3. Feitenbasis",
    "4. Strategische opties",
    "5. Aanbevolen keuze",
    "6. Besluitregels",
    "7. 90-dagen interventieplan",
    "8. KPI monitoring",
    "9. Besluittekst",
  ];
  return required.every((line) => String(text ?? "").includes(line));
}

export function runRegressionTestSuite(input: RegressionCheckInput): RegressionCheckResult {
  const report = String(input.reportText ?? "");
  const checks: RegressionCheckResult["checks"] = [];

  const structureOk = hasAllNineReportSections(report);
  checks.push({
    check: "rapport_structuur_1_tot_9",
    ok: structureOk,
    reason: structureOk ? undefined : "Rapport bevat niet alle verplichte secties 1-9.",
  });

  const guard = validateBoardOutputStandard(report, {
    documentType: "analysis",
    sourceText: input.sourceText ?? report,
  });
  checks.push({
    check: "board_output_guard",
    ok: guard.ok,
    reason: guard.ok ? undefined : guard.reasons.join(" | "),
  });

  return {
    ok: checks.every((item) => item.ok),
    checks,
  };
}
