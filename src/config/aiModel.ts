// Centralized AI model configuration
// Use Vite env var `VITE_AI_MODEL` to override; defaults to Claude Haiku 4.5
export const AI_MODEL: string = (import.meta.env.VITE_AI_MODEL as string) || "claude-haiku-4.5";
