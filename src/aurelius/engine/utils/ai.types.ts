// ============================================================
// AI TYPES — CANONICAL (EXPORTED)
// ============================================================

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
