// src/aurelius/engine/llm/llmRouter.ts

export type LLMRole =
  | "ingest"
  | "extract"
  | "synthesis"
  | "governance"
  | "polish";

export function resolveModel(role: LLMRole): string {
  switch (role) {
    case "ingest":
      return "gpt-4o-mini";
    case "extract":
      return "gpt-4.1-mini";
    case "synthesis":
      return "gpt-4o";
    case "governance":
      return "gpt-4.1";
    case "polish":
      return "gpt-4.1";
    default:
      return "gpt-4o";
  }
}
