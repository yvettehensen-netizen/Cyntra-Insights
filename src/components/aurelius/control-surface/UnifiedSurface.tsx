import { AlertTriangle } from "lucide-react";
import type { GovernanceResponse, SriResponse } from "@/dashboard/executive/api/types";
import type { AggregatedSignals } from "@/cyntra/intelligence/types";
import DriftMatrix from "./DriftMatrix";
import ExecutiveDecisionCard from "./ExecutiveDecisionCard";
import GovernanceStatePanel from "./GovernanceStatePanel";
import GovernanceStatusLayer from "./GovernanceStatusLayer";
import RiskTrajectory from "./RiskTrajectory";
import StrategicHealthIndex from "./StrategicHealthIndex";

interface UnifiedSurfaceProps {
  sri: SriResponse;
  governance: GovernanceResponse;
  signals: AggregatedSignals;
  freezeMode: boolean;
  pulse: boolean;
}

export default function UnifiedSurface({
  sri,
  governance,
  signals,
  freezeMode,
  pulse,
}: UnifiedSurfaceProps) {
  return (
    <div className="mx-auto max-w-[1380px] space-y-4 px-4 pb-10 md:px-8">
      {freezeMode ? (
        <div className="rounded-2xl border border-slate-300/40 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100">
          Bestuurlijke freeze-modus actief: uitvoering uitsluitend onder formele escalatieroute.
        </div>
      ) : null}

      {pulse ? (
        <div className="rounded-2xl border border-red-400/75 bg-red-950/35 px-4 py-3 text-sm font-semibold text-red-100 animate-pulse">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            SRI-daling &gt; 5 punten binnen 24 uur: versnelde bestuursreview vereist.
          </span>
        </div>
      ) : null}

      <div style={freezeMode ? { filter: "grayscale(0.2)" } : undefined} className="space-y-4 transition">
        <GovernanceStatusLayer governanceControl={signals.governance_control} />
        <StrategicHealthIndex
          sri={sri}
          health={signals.strategic_health}
          decision={signals.decision_intelligence}
        />
        <DriftMatrix drift={signals.drift} pattern={signals.pattern_learning} />
        <RiskTrajectory trajectory={signals.risk} evolution={signals.risk_evolution} />
        <GovernanceStatePanel
          governance={governance}
          state={signals.governance_state}
          riskEvolution={signals.risk_evolution}
        />
        <ExecutiveDecisionCard
          card={signals.executive_decision}
          decision={signals.decision_intelligence}
          pattern={signals.pattern_learning}
        />
      </div>
    </div>
  );
}
