import { useMemo, useState } from "react";
import {
  AutonomousAnalysisScheduler,
  type SchedulerFrequency,
  type StrategicAutopilotOutput,
} from "@/aurelius/autopilot";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";

export default function AutopilotPage() {
  const scheduler = useMemo(() => new AutonomousAnalysisScheduler(), []);

  const [sector, setSector] = useState("Zorg/GGZ");
  const [zoekterm, setZoekterm] = useState("GGZ");
  const [maxAnalyses, setMaxAnalyses] = useState(3);
  const [frequency, setFrequency] = useState<SchedulerFrequency>("dagelijks");
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Autopilot staat uit.");
  const [result, setResult] = useState<StrategicAutopilotOutput | null>(null);

  function applySchedulerConfig(nextEnabled: boolean, nextFrequency: SchedulerFrequency) {
    const state = scheduler.configure({
      enabled: nextEnabled,
      frequency: nextFrequency,
    });
    setEnabled(state.enabled);
    setFrequency(state.frequency);
    setStatus(
      state.enabled
        ? `Autopilot actief (${state.frequency}). Volgende run: ${state.next_run_at ? new Date(state.next_run_at).toLocaleString("nl-NL") : "onbekend"}`
        : "Autopilot staat uit."
    );
  }

  async function runAutopilotNow() {
    setStatus("Autopilot analyse draait...");
    try {
      const output = await scheduler.runNow({
        sector,
        zoekterm,
        max_analyses: Math.max(1, Math.min(maxAnalyses, 10)),
      });
      setResult(output);

      const state = scheduler.getState();
      setStatus(
        `Run voltooid (${output.analyses.length} analyses). Volgende run: ${state.next_run_at ? new Date(state.next_run_at).toLocaleString("nl-NL") : "niet gepland"}`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Autopilot run mislukt.");
    }
  }

  return (
    <PageShell title="Autopilot" subtitle="Automatische strategische analyse, signaaldetectie en sectorpatroon-updates via de Strategic Autopilot Agent.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Frequentie" value={frequency} hint="Scheduler-ritme voor automatische runs." />
        <StatCard label="Actief" value={enabled ? "Ja" : "Nee"} hint="Autopilot status in de huidige sessie." tone="blue" />
        <StatCard label="Max analyses" value={maxAnalyses} hint="Begrenzing per run." tone="green" />
        <StatCard label="Laatste run" value={result?.analyses?.length || 0} hint="Aantal analyses uit de laatst uitgevoerde run." />
      </div>
      <Panel title="Autopilot besturing">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm text-gray-200">
            Sector
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={sector} onChange={(e) => setSector(e.target.value)} />
          </label>
          <label className="text-sm text-gray-200">
            Zoekterm
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={zoekterm} onChange={(e) => setZoekterm(e.target.value)} />
          </label>
          <label className="text-sm text-gray-200">
            Frequentie
            <select className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={frequency} onChange={(e) => applySchedulerConfig(enabled, e.target.value as SchedulerFrequency)}>
              <option value="dagelijks">Dagelijks</option>
              <option value="wekelijks">Wekelijks</option>
            </select>
          </label>
          <label className="text-sm text-gray-200">
            Max analyses
            <input type="number" min={1} max={10} className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={maxAnalyses} onChange={(e) => setMaxAnalyses(Number(e.target.value || 3))} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black" onClick={() => applySchedulerConfig(true, frequency)}>
            Autopilot starten
          </button>
          <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => applySchedulerConfig(false, frequency)}>
            Autopilot stoppen
          </button>
          <button className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white" onClick={() => void runAutopilotNow()}>
            Analyse nu uitvoeren
          </button>
          <span className="text-xs text-gray-300">{status}</span>
        </div>
      </Panel>

      <Panel title="Nieuwe analyses">
        {!result?.analyses?.length ? (
          <EmptyState text="Nog geen autopilot-analyses uitgevoerd." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {result.analyses.map((analysis) => (
              <SurfaceCard key={`${analysis.organisation_name}-${analysis.analyse_datum}`} title={analysis.organisation_name} eyebrow={`${analysis.sector} • ${new Date(analysis.analyse_datum).toLocaleString("nl-NL")}`}>
                {analysis.report}
              </SurfaceCard>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Strategische signalen">
          {!result?.signalen?.length ? (
            <EmptyState text="Nog geen signalen beschikbaar." />
          ) : (
            <ul className="space-y-2 text-sm text-gray-200">
              {result.signalen.map((item, idx) => (
                <li key={`${item.signaal}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <strong>{item.signaal}</strong> ({item.urgentie}) — {item.impact}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Nieuwe sectorpatronen">
          {!result?.sectorpatronen?.sectorpatronen?.length ? (
            <EmptyState text="Nog geen sectorpatronen beschikbaar." />
          ) : (
            <ul className="space-y-2 text-sm text-gray-200">
              {result.sectorpatronen.sectorpatronen.slice(0, 6).map((item, idx) => (
                <li key={`${item.patroon}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                  <strong>{item.patroon}</strong> ({item.waar_dit_voorkomt}) — {item.strategische_implicatie}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
