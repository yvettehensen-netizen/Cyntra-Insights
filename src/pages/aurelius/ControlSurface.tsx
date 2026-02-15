import { Loader2 } from "lucide-react";
import useIntelligenceData from "@/hooks/useIntelligenceData";
import { UnifiedSurface } from "@/components/aurelius/control-surface";

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
    performance,
    loading,
    error,
  } = useIntelligenceData();

  if (loading && (!sri || !drift || !risk || !governance || !signals || !performance)) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 pb-10 md:px-8">
        <div className="flex h-[55vh] items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#0f141c] px-4 py-2 text-sm text-white/80">
            <Loader2 className="h-4 w-4 animate-spin" />
            Geünificeerde controlelaag wordt geladen
          </div>
        </div>
      </div>
    );
  }

  if (!sri || !drift || !risk || !governance || !signals || !performance) {
    return (
      <div className="mx-auto max-w-[980px] px-4 pb-10 md:px-8">
        <div className="rounded-2xl border border-red-500/40 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {error || "Intelligentiedata niet beschikbaar."}
        </div>
      </div>
    );
  }

  const freezeMode = isFreeze(governance);
  const drop = sriDrop24h(sri);
  const pulse = drop > 5;

  return (
    <UnifiedSurface
      sri={sri}
      governance={governance}
      signals={signals}
      performance={performance}
      freezeMode={freezeMode}
      pulse={pulse}
    />
  );
}
