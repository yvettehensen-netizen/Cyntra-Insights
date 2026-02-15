import type { GovernanceResponse } from "@/dashboard/executive/api/types";
import type {
  GovernanceResolutionOutput,
  RiskEvolutionIntelligenceSignal,
} from "@/cyntra/intelligence/types";

interface GovernanceStatePanelProps {
  governance: GovernanceResponse;
  state: GovernanceResolutionOutput;
  riskEvolution: RiskEvolutionIntelligenceSignal;
}

function stateBadgeKleur(state: string): string {
  if (state === "Gefragmenteerd") return "text-red-300 border-red-400/60 bg-red-950/35";
  if (state === "Reactief") return "text-orange-300 border-orange-400/60 bg-orange-950/35";
  if (state === "Gecontroleerd") return "text-amber-300 border-amber-400/60 bg-amber-950/30";
  if (state === "Geinstitutionaliseerd") return "text-emerald-300 border-emerald-400/60 bg-emerald-950/30";
  return "text-emerald-200 border-emerald-300/65 bg-emerald-900/25";
}

export default function GovernanceStatePanel({
  governance,
  state,
  riskEvolution,
}: GovernanceStatePanelProps) {
  const alerts = governance.escalation_ladder.slice(0, 4);

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-5" aria-label="Bestuurlijke status">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Bestuurlijke status</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Bestuurlijke maturiteit</h2>
        </div>
        <div className={`rounded-lg border px-3 py-1 text-sm font-semibold ${stateBadgeKleur(state.state)}`}>
          {state.state}
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[220px_1fr]">
        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Betrouwbaarheid</p>
          <p className="mt-2 text-3xl font-semibold text-white">{state.confidence.toFixed(1)}%</p>
          <p className="mt-2 text-xs text-white/60">
            Freeze-flags: {governance.actieve_freeze_flags.length}
          </p>
          <p className="mt-1 text-xs text-white/60">
            Governance-verval: {riskEvolution.governance_decay.toFixed(1)}
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/55">Actieve governance alerts</p>
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-white/70">Geen actieve alerts.</p>
            ) : (
              alerts.map((alert) => (
                <div key={`${alert.tijdstip}-${alert.actie}`} className="rounded-lg border border-white/10 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{alert.actie}</p>
                  <p className="text-xs text-white/65">{alert.reden}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {riskEvolution.drift_alarm ? (
        <div className="mt-3 rounded-xl border border-red-400/40 bg-red-950/30 px-3 py-2 text-xs text-red-100">
          Escalatieadvies: drift alarm actief, governance-override review aanbevolen.
        </div>
      ) : null}
    </section>
  );
}
