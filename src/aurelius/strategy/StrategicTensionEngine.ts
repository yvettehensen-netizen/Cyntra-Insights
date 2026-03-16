export type StrategicTensionInput = {
  contextText: string;
  diagnosisText: string;
  mechanismText: string;
};

export type StrategicTensionResult = {
  tension: string[];
  block: string;
};

function hasSignal(text: string, pattern: RegExp): boolean {
  return pattern.test(String(text ?? ""));
}

export function runStrategicTensionEngine(
  input: StrategicTensionInput
): StrategicTensionResult {
  const source = `${input.contextText}\n${input.diagnosisText}\n${input.mechanismText}`;
  const tension: string[] = [];

  const externalCoordinationSignalCount = [
    /\bconsortium\b/i,
    /\bgemeent/i,
    /\btriage\b/i,
    /\bcontract/i,
    /\bbudget/i,
  ].reduce((count, pattern) => (pattern.test(source) ? count + 1 : count), 0);

  if (externalCoordinationSignalCount >= 3) {
    tension.push("regionale contractsturing en triage");
  }
  if (
    hasSignal(source, /\b(ambulant|ambulante|specialist|specialisatie|niche|positionering)\b/i)
  ) {
    tension.push("brede ambulante positionering versus specialisatie");
  }
  if (
    hasSignal(source, /\b(zzp|loondienst|vaste medewerkers|flexibele schil|capaciteitsflexibiliteit)\b/i)
  ) {
    tension.push("capaciteitsflexibiliteit binnen budgetgrenzen");
  }

  if (hasSignal(source, /\b(kwaliteit|behandelcontinu[iï]teit|uitkomst|cliënt)\b/i)) {
    tension.push("kwaliteit van zorg");
  }
  if (hasSignal(source, /\b(marge|liquiditeit|tarief|kostprijs|contract|plafond)\b/i)) {
    tension.push("financiële stabiliteit");
  }
  if (hasSignal(source, /\b(verbreding|initiatief|groei|portfolio|opschalen)\b/i)) {
    tension.push("strategische verbreding");
  }

  if (!tension.length) {
    tension.push("kwaliteit van zorg", "financiële stabiliteit", "strategische verbreding");
  }

  return {
    tension,
    block: [
      "STRATEGISCHE KERNSPANNING",
      `tension: [${tension.map((item) => `"${item}"`).join(", ")}]`,
    ].join("\n"),
  };
}
