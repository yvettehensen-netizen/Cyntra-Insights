import { runCyntraStrategicAgent } from "@/aurelius/agent";
import type { AnalysisContext } from "@/aurelius/engine/types";

export const AureliusEngine = {
  run: (input: { context: AnalysisContext; narrativeMode?: "deterministic" | "adaptive" }) =>
    runCyntraStrategicAgent(input),
};
