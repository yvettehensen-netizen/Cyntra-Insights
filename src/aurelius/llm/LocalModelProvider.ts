import { callAI } from "@/aurelius/engine/utils/callAI";
import type { LLMAdapter, LLMGenerateInput } from "./LLMAdapter";

export class LocalModelProvider implements LLMAdapter {
  async generate(input: LLMGenerateInput): Promise<string> {
    return callAI(input.model ?? "local-model", input.messages, input.options ?? {});
  }
}

