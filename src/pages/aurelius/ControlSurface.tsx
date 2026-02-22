import { Loader2, AlertTriangle, ShieldAlert, Zap } from "lucide-react";
import useIntelligenceData from "@/hooks/useIntelligenceData";
import { UnifiedSurface } from "@/components/aurelius/control-surface";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type IntelligenceData = ReturnType<typeof useIntelligenceData>;
type GovernanceData = NonNullable<IntelligenceData["governance"]>;
type SriData = NonNullable<IntelligenceData["sri"]>;
type RiskData = NonNullable<IntelligenceData["risk"]>;
type SignalsData = NonNullable<IntelligenceData["signals"]>;
type PerformanceData = NonNullable<IntelligenceData["performance"]>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFreeze(gov: GovernanceData | null): boolean {
  if (!gov) return false;
  return (
    gov.actieve_freeze_flags.length > 0 ||
    gov.escalation_ladder.some((item) =>
      String(item.actie).toLowerCase().includes("freeze")
    )
  );
}

function sriDrop24h(sri: SriData | null): number {
  if (!sri) return 0;
  if (!sri.sri_trend || sri.sri_trend.length < 2) return 0;
  const last = sri.sri_trend.at(-1)?.sri ?? 0;
  const prev = sri.sri_trend.at(-2)?.sri ?? last;
  return Number((prev - last).toFixed(2));
}

function computeMomentum(performance: PerformanceData | null): number {
  if (!performance) return 0;
  const dsi = performance.dsi?.current_dsi ?? 0;
  const velocity = performance.evolution?.improvement_velocity ?? 0;
  const expectedLift = performance.expected_dsi_lift ?? 0;

  return Number((dsi * 0.7 + velocity * 20 + expectedLift * 10).toFixed(2));
}

function computeConfidence(
  risk: RiskData | null,
  signals: SignalsData | null
): number {
  if (!risk || !signals) return 0;
  const governanceConfidenceRaw =
    signals.governance_state?.confidence ?? 0;

  const governanceConfidence =
    governanceConfidenceRaw <= 1
      ? governanceConfidenceRaw * 100
      : governanceConfidenceRaw;

  const projectedRisk = signals.risk?.projected_risk_90d ?? 0;
  const riskAcceleration =
    risk.risico_acceleratie_vector?.huidig ?? 0;

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

  const handleNewAnalysis = () =>
    navigate("/portal/aurelius/intake/strategy");

  const hasCriticalData = Boolean(
    sri && drift && risk && governance && signals && performance
  );
  const hasFallbackInput = Boolean(
    sri || drift || risk || governance || signals || performance
  );

  const freezeMode = useMemo(() => isFreeze(governance), [governance]);

  const drop = useMemo(() => sriDrop24h(sri), [sri]);
  const pulse = drop > 5;

  const momentum = useMemo(() => computeMomentum(performance), [performance]);

  const confidence = useMemo(() => computeConfidence(risk, signals), [risk, signals]);

  const crisisMode = freezeMode || pulse || confidence < 40;

  const fallbackSections = useMemo(
    () => [
      {
        title: "1. Dominante Bestuurlijke These",
        content:
          signals?.executive_decision?.dominant_thesis ??
          "Fallback actief: deze these wordt definitief zodra alle control-data synchroon is.",
      },
      {
        title: "2. Kernconflict",
        content:
          signals?.executive_decision?.central_tension ??
          "Kernconflict wordt afgeleid uit ontbrekende governance- en driftsignalen.",
      },
      {
        title: "3. Expliciete Trade-offs",
        content:
          signals?.pattern_learning?.decision_type_cluster?.join(" | ") ||
          "Trade-offs tijdelijk op fallback: focus op snelheid versus bestuurbaarheid.",
      },
      {
        title: "4. Opportunity Cost",
        content:
          typeof signals?.risk?.projected_risk_90d === "number"
            ? `Verwachte risicoscore over 90 dagen: ${signals.risk.projected_risk_90d.toFixed(1)}.`
            : "Opportunity cost volgt zodra risicoprojectie compleet is.",
      },
      {
        title: "5. Governance Impact",
        content:
          governance?.governance_state?.status
            ? `Governance-status: ${governance.governance_state.status}.`
            : "Governance-impact draait in fallbackmodus met beperkte detaildekking.",
      },
      {
        title: "6. Machtsdynamiek & Onderstroom",
        content:
          drift?.drift_clusters?.[0]
            ? `Dominant driftcluster: ${drift.drift_clusters[0].cluster}.`
            : "Machtsdynamiek volgt na complete drift-clusterdata.",
      },
      {
        title: "7. Executierisico",
        content:
          risk?.risico_acceleratie_vector?.richting
            ? `Risico-acceleratie: ${risk.risico_acceleratie_vector.richting}.`
            : "Executierisico wordt voorlopig defensief geclassificeerd.",
      },
      {
        title: "8. 90-Dagen Interventieplan",
        content:
          performance?.key_intervention ??
          "Interventieplan fallback: voer 1 besluitspoor tegelijk uit met wekelijkse escalatie-review.",
      },
    ],
    [drift, governance, performance, risk, signals]
  );

  // Loader
  if (loading && !hasCriticalData) {
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

  if (!hasCriticalData) {
    const fallbackReady = hasFallbackInput || fallbackSections.length > 0;
    return (
      <div className="mx-auto max-w-[980px] px-4 pb-10 md:px-8">
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-950/40 px-5 py-4 text-sm text-amber-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fallback control surface actief: beperkte intelligentiedata gedetecteerd.
            </div>
            <span className="rounded-md border border-emerald-400/50 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-100">
              {fallbackReady ? "Download gereed (fallback)" : "Download in opbouw"}
            </span>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-sm text-red-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {fallbackSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-[#0f141c] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-[#f5d88d]">
                {section.title}
              </p>
              <p className="mt-2 text-sm text-white/85">{section.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-5">
          <Button onClick={handleNewAnalysis} variant="outline">
            Nieuwe Analyse
          </Button>
        </div>
      </div>
    );
  }

  // Data is non-null na de guard hierboven.
  const sriData = sri as SriData;
  const governanceData = governance as GovernanceData;
  const signalsData = signals as SignalsData;
  const performanceData = performance as PerformanceData;

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
        sri={sriData}
        governance={governanceData}
        signals={signalsData}
        performance={performanceData}
        freezeMode={freezeMode}
        pulse={pulse}
        momentum={momentum}
        confidence={confidence}
        crisisMode={crisisMode}
      />
    </div>
  );
}
