import { AlertTriangle, Loader2 } from "lucide-react";
import useIntelligenceData from "@/hooks/useIntelligenceData";
import {
  DriftMatrix,
  ExecutiveDecisionCard,
  GovernanceStatePanel,
  RiskTrajectory,
  StrategicHealthIndex,
} from "@/components/aurelius/control-surface";

function isFreeze(gov: NonNullable<ReturnType<typeof useIntelligenceData>["governance"]>): boolean {
  return (
    gov.actieve_freeze_flags.length > 0 ||
    gov.escalation_ladder.some((item) =>
      String(item.actie).toLowerCase().includes("freeze")
    )
  );
}

function sriDrop24h(sri: NonNullable<ReturnType<typeof useIntelligenceData>["sri"]>): number {
  if (sri.sri_trend.length < 2) return 0;
  const last = sri.sri_trend[sri.sri_trend.length - 1]?.sri ?? 0;
  const prev = sri.sri_trend[sri.sri_trend.length - 2]?.sri ?? last;
  return Number((prev - last).toFixed(2));
}

export default function ControlSurface() {
  const {
    sri,
    drift,
    risk,
    governance,
    signals,
    loading,
    error,
  } = useIntelligenceData();

  if (loading && (!sri || !drift || !risk || !governance || !signals)) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 pb-10 md:px-8">
        <div className="flex h-[55vh] items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f141c] px-4 py-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" />
            Unified surface wordt geladen
          </div>
        </div>
      </div>
    );
  }

  if (!sri || !drift || !risk || !governance || !signals) {
    return (
      <div className="mx-auto max-w-[980px] px-4 pb-10 md:px-8">
        <div className="rounded-2xl border border-red-500/40 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {error || "Intelligence data niet beschikbaar."}
        </div>
      </div>
    );
  }

  const freezeMode = isFreeze(governance);
  const drop = sriDrop24h(sri);
  const pulse = drop > 5;

  return (
    <div className="mx-auto max-w-[1380px] space-y-4 px-4 pb-10 md:px-8">
      {freezeMode ? (
        <div className="rounded-2xl border border-slate-300/40 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100">
          Governance Freeze Mode Active
        </div>
      ) : null}

      {pulse ? (
        <div className="rounded-2xl border border-red-400/75 bg-red-950/35 px-4 py-3 text-sm font-semibold text-red-100 animate-pulse">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            SRI daalde meer dan 5 punten in 24 uur.
          </span>
        </div>
      ) : null}

      <div style={freezeMode ? { filter: "grayscale(0.2)" } : undefined} className="space-y-4 transition">
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
