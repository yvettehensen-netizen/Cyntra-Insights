import { callAI } from "@/aurelius/engine/utils/callAI";
import type { LLMAdapter, LLMGenerateInput } from "./LLMAdapter";

export class OpenAIProvider implements LLMAdapter {
  async generate(input: LLMGenerateInput): Promise<string> {
    return callAI(input.model ?? "gpt-4o", input.messages, input.options ?? {});
  }
}

