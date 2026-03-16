// ============================================================
// src/aurelius/engine/utils/ai.messages.ts
// SAFE HELPERS — STRICT TYPES (NO TYPOS • NO CIRCLES)
// ============================================================

import type { AIMessage } from "./ai.types";

export const systemMessage = (content: string): AIMessage => ({
  role: "system",
  content,
});

export const userMessage = (content: string): AIMessage => ({
  role: "user",
  content,
});

export const assistantMessage = (content: string): AIMessage => ({
  role: "assistant",
  content,
});
