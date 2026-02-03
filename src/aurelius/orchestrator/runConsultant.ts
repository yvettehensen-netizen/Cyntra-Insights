// src/aurelius/orchestrator/runConsultant.ts
import type { Consultant } from "../types";

const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

export async function runConsultant(
  consultant: Consultant,
  context: string
): Promise<{ success: true; value: unknown } | { success: false }> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await llmCall({
        prompt: consultant.instructions.replace("{{CONTEXT}}", context),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let value: unknown = response;

      if (consultant.output_type === "object") {
        try {
          value = JSON.parse(response);
        } catch {
          return { success: false };
        }
      }

      return { success: true, value };
    } catch {
      clearTimeout(timeout);
      if (attempt === MAX_RETRIES) return { success: false };
    }
  }

  return { success: false };
}

async function llmCall({
  prompt,
  signal,
}: {
  prompt: string;
  signal: AbortSignal;
}): Promise<string> {
  return "Mock response";
}
