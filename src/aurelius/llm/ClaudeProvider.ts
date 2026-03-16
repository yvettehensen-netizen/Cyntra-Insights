import { callAI } from "@/aurelius/engine/utils/callAI";
import type { LLMAdapter, LLMGenerateInput } from "./LLMAdapter";

export class ClaudeProvider implements LLMAdapter {
  async generate(input: LLMGenerateInput): Promise<string> {
    return callAI(input.model ?? "claude-sonnet", input.messages, input.options ?? {});
  }
}

