"use client";

import { DecisionCycleProvider } from "@/components/providers/DecisionCycleProvider";
import { DsiProvider } from "@/components/providers/DsiProvider";
import DecisionCycleView from "@/components/decision-cycle/DecisionCycleView";

export default function DecisionCycleWorkspace({
  decisionCycleId,
}: {
  decisionCycleId: string;
}) {
  return (
    <DecisionCycleProvider decisionCycleId={decisionCycleId}>
      <DsiProvider>
        <DecisionCycleView />
      </DsiProvider>
    </DecisionCycleProvider>
  );
}
