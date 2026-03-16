import type { AIMessage } from "@/aurelius/engine/utils/ai.types";

export type LLMGenerateInput = {
  messages: AIMessage[];
  model?: string;
  options?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    signal?: AbortSignal | null;
  };
};

export interface LLMAdapter {
  generate(input: LLMGenerateInput): Promise<string>;
}

