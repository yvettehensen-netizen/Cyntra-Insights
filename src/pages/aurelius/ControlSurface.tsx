import { Loader2, AlertTriangle, ShieldAlert, Zap } from "lucide-react";
import useIntelligenceData from "@/hooks/useIntelligenceData";
import { UnifiedSurface } from "@/components/aurelius/control-surface";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type IntelligenceData = ReturnType<typeof useIntelligenceData>;
type GovernanceData = NonNullable<IntelligenceData["governance"]>;
type SriData = NonNullable<IntelligenceData["sri"]>;
type RiskData = IntelligenceData["risk"];
type SignalsData = IntelligenceData["signals"];
type PerformanceData = IntelligenceData["performance"];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFreeze(gov: GovernanceData): boolean {
  return (
    gov.actieve_freeze_flags.length > 0 ||
    gov.escalation_ladder.some((item) =>
      String(item.actie).toLowerCase().includes("freeze")
    )
  );
}

function sriDrop24h(sri: SriData): number {
  if (sri.sri_trend.length < 2) return 0;
  const last = sri.sri_trend.at(-1)?.sri ?? 0;
  const prev = sri.sri_trend.at(-2)?.sri ?? last;
  return Number((prev - last).toFixed(2));
}

function computeMomentum(performance: PerformanceData): number {
  if (!performance) return 0;

  const dsi = performance.dsi?.current_dsi ?? 0;
  const velocity = performance.evolution?.improvement_velocity ?? 0;
  const expectedLift = performance.expected_dsi_lift ?? 0;

  return Number((dsi * 0.7 + velocity * 20 + expectedLift * 10).toFixed(2));
}

function computeConfidence(risk: RiskData, signals: SignalsData): number {
  const governanceConfidenceRaw = signals?.governance_state?.confidence ?? 0;
  const governanceConfidence =
    governanceConfidenceRaw <= 1
      ? governanceConfidenceRaw * 100
      : governanceConfidenceRaw;
  const projectedRisk = signals?.risk?.projected_risk_90d ?? 0;
  const riskAcceleration = risk?.risico_acceleratie_vector?.huidig ?? 0;

  const confidence = clamp(
    governanceConfidence * 0.7 +
      (100 - projectedRisk) * 0.3 -
      riskAcceleration * 10,
    0,
    100
  );

  return Number(confidence.toFixed(1));
}

export default function ControlSurface() {
  const navigate = useNavigate();
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

  const hasCoreData =
    sri && drift && risk && governance && signals && performance;

  const freezeMode = useMemo(
    () => (governance ? isFreeze(governance) : false),
    [governance]
  );
  const drop = useMemo(() => (sri ? sriDrop24h(sri) : 0), [sri]);
  const pulse = drop > 5;
  const momentum = useMemo(() => computeMomentum(performance), [performance]);
  const confidence = useMemo(
    () => computeConfidence(risk, signals),
    [risk, signals]
  );
  const crisisMode = freezeMode || pulse || confidence < 40;
  const handleNewAnalysis = () => navigate("/portal/aurelius/intake/strategy");

  if (loading && !hasCoreData) {
    return (
      <div className="mx-auto max-w-[1380px] px-4 pb-10 md:px-8">
        <div className="flex h-[55vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0f141c] px-5 py-3 text-sm text-white/80 shadow-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Bestuurlijke controlelaag initialiseert…
          </div>
        </div>
      </div>
    );
  }

  if (!hasCoreData) {
    return (
      <div className="mx-auto max-w-[980px] px-4 pb-10 md:px-8">
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-sm text-red-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error || "Kritieke intelligentiedata ontbreekt."}
            </div>
            <Button onClick={handleNewAnalysis} variant="secondary">
              Nieuwe Analyse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-4 rounded-2xl border border-[#D4AF37]/40 bg-[#14100a] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[#f5d88d]">
            <Zap className="h-4 w-4" />
            Analyseflow beschikbaar vanuit de controlelaag.
          </div>
          <Button onClick={handleNewAnalysis}>
            Nieuwe Analyse
          </Button>
        </div>
      </div>

      {crisisMode && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-900/40 px-5 py-3 text-sm text-red-100 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Crisisdetectie actief — besluitvorming vereist onmiddellijke aandacht.
          </div>
        </div>
      )}

      <UnifiedSurface
        sri={sri}
        governance={governance}
        signals={signals}
        performance={performance}
        freezeMode={freezeMode}
        pulse={pulse}
        momentum={momentum}
        confidence={confidence}
        crisisMode={crisisMode}
      />
    </div>
  );
}
