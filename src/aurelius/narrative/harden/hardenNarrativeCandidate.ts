import { runExecutiveGateStack } from "@/aurelius/narrative/gates/executiveGateStack";
import type { RepairMode } from "@/aurelius/narrative/gates/types";

export type HardenAttemptLog = {
  attempt: number;
  mode: RepairMode | "NORMAL";
  passed: boolean;
  gateCode?: string;
  reason?: string;
};

export async function hardenNarrativeCandidate(params: {
  candidate: string;
  context: string;
  previousOutput?: string;
  regenerateFull: (input: { mode: string; directive: string; previousNarrative: string }) => Promise<string>;
  rewriteSection8: (input: { directive: string; previousNarrative: string }) => Promise<string>;
}): Promise<{
  narrative: string;
  logs: HardenAttemptLog[];
  gateSummary: ReturnType<typeof runExecutiveGateStack>;
}> {
  let current = String(params.candidate ?? "").trim();
  const logs: HardenAttemptLog[] = [];
  let summary = runExecutiveGateStack({
    narrativeText: current,
    context: params.context,
    previousOutput: params.previousOutput,
  });

  if (summary.passed) {
    logs.push({ attempt: 1, mode: "NORMAL", passed: true });
    return { narrative: current, logs, gateSummary: summary };
  }

  const plan: Array<{ mode: RepairMode; attempt: number; fullRegen: boolean }> = [
    { attempt: 2, mode: "ANCHOR_REPAIR", fullRegen: true },
    { attempt: 3, mode: "POWER_REPAIR", fullRegen: true },
    { attempt: 4, mode: "FULL_REGEN", fullRegen: true },
    { attempt: 5, mode: "SECTION8_REWRITE", fullRegen: false },
  ];

  logs.push({
    attempt: 1,
    mode: "NORMAL",
    passed: false,
    gateCode: summary.firstFailure?.code,
    reason: summary.firstFailure?.reason,
  });

  for (const step of plan) {
    const directive = summary.firstFailure?.repairDirective || "Herbouw narrative volgens alle executive gates.";

    current = step.fullRegen
      ? await params.regenerateFull({
          mode: step.mode,
          directive,
          previousNarrative: current,
        })
      : await params.rewriteSection8({
          directive,
          previousNarrative: current,
        });

    summary = runExecutiveGateStack({
      narrativeText: current,
      context: params.context,
      previousOutput: params.previousOutput,
    });

    logs.push({
      attempt: step.attempt,
      mode: step.mode,
      passed: summary.passed,
      gateCode: summary.firstFailure?.code,
      reason: summary.firstFailure?.reason,
    });

    if (summary.passed) {
      return { narrative: current, logs, gateSummary: summary };
    }
  }

  throw new Error(
    `HARDEN_FAILED: ${summary.firstFailure?.code ?? "UNKNOWN"} - ${summary.firstFailure?.reason ?? "no reason"}`
  );
}
