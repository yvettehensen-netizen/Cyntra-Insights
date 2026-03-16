import { logStabilityWarning, type StabilityWarning } from "./OutputContractGuard";

export type PromptConsistencyInput = {
  layer: string;
  text: string;
  requiredSections?: string[];
  maxLength?: number;
};

export type PromptConsistencyResult = {
  warnings: StabilityWarning[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function sentenceDuplicates(text: string): string[] {
  const sentences = String(text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 30);

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();
    if (seen.has(normalized)) {
      duplicates.add(sentence);
    } else {
      seen.add(normalized);
    }
  }
  return Array.from(duplicates).slice(0, 5);
}

export function runPromptConsistencyGuard(
  input: PromptConsistencyInput
): PromptConsistencyResult {
  const text = String(input.text ?? "");
  const maxLength = Math.max(500, Number(input.maxLength ?? 30000));
  const requiredSections = input.requiredSections ?? [];
  const warnings: StabilityWarning[] = [];

  if (text.length > maxLength) {
    const warning: StabilityWarning = {
      guard: "PromptConsistencyGuard",
      layer: input.layer,
      message: `Lengte overschrijding: ${text.length} chars > max ${maxLength}.`,
      timestamp: nowIso(),
    };
    warnings.push(warning);
    logStabilityWarning(warning);
  }

  for (const section of requiredSections) {
    if (!text.toLowerCase().includes(section.toLowerCase())) {
      const warning: StabilityWarning = {
        guard: "PromptConsistencyGuard",
        layer: input.layer,
        message: `Verplichte sectie ontbreekt: '${section}'.`,
        timestamp: nowIso(),
      };
      warnings.push(warning);
      logStabilityWarning(warning);
    }
  }

  const duplicates = sentenceDuplicates(text);
  if (duplicates.length > 0) {
    const warning: StabilityWarning = {
      guard: "PromptConsistencyGuard",
      layer: input.layer,
      message: `Duplicatie gedetecteerd: ${duplicates.length} herhaalde zinnen.`,
      timestamp: nowIso(),
    };
    warnings.push(warning);
    logStabilityWarning(warning);
  }

  return { warnings };
}
