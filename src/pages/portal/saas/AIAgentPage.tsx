import { useMemo, useState } from "react";
import { StrategicAgent, type StrategicAgentOutput } from "@/aurelius/agent";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";

export default function AIAgentPage() {
  const agent = useMemo(() => new StrategicAgent(), []);

  const [sector, setSector] = useState("Zorg/GGZ");
  const [zoekterm, setZoekterm] = useState("GGZ");
  const [maxOrganisaties, setMaxOrganisaties] = useState(6);
  const [maxAnalyses, setMaxAnalyses] = useState(3);
  const [status, setStatus] = useState("AI Agent inactief.");
  const [result, setResult] = useState<StrategicAgentOutput | null>(null);

  async function runAgent() {
    setStatus("AI Agent pipeline draait...");
    try {
      const output = await agent.run({
        sector,
        zoekterm,
        max_organisations: Math.max(1, Math.min(maxOrganisaties, 20)),
        max_analyses: Math.max(1, Math.min(maxAnalyses, 10)),
      });
      setResult(output);
      setStatus(
        `AI Agent voltooid: ${output.discovered_organisations.length} ontdekt, ${output.new_cases.length} nieuwe cases.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "AI Agent pipeline mislukt.");
    }
  }

  return (
    <PageShell title="AI Agent" subtitle="Self-Learning Strategic AI Agent voor discovery, analyse, case-opslag, monitoring en sectorleren.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Sector" value={sector} hint="Discovery-domein voor de agentrun." />
        <StatCard label="Max orgs" value={maxOrganisaties} hint="Discovery-omvang per run." tone="blue" />
        <StatCard label="Max analyses" value={maxAnalyses} hint="Analysevolume per pipeline-run." tone="green" />
        <StatCard label="Status" value={status} hint="Agentstatus van de huidige sessie." />
      </div>
      <Panel title="AI Agent besturing">
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
            Max organisaties
            <input type="number" min={1} max={20} className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={maxOrganisaties} onChange={(e) => setMaxOrganisaties(Number(e.target.value || 6))} />
          </label>
          <label className="text-sm text-gray-200">
            Max analyses
            <input type="number" min={1} max={10} className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={maxAnalyses} onChange={(e) => setMaxAnalyses(Number(e.target.value || 3))} />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black" onClick={() => void runAgent()}>
            Agent pipeline starten
          </button>
          <span className="text-xs text-gray-300">{status}</span>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Ontdekte organisaties">
          {!result?.discovered_organisations?.length ? (
            <EmptyState text="Nog geen organisaties ontdekt." />
          ) : (
            <div className="space-y-3 text-sm text-gray-200">
              {result.discovered_organisations.map((org) => (
                <SurfaceCard key={`${org.organisation_name}-${org.website}`} title={org.organisation_name} eyebrow={org.sector}>
                  {org.mogelijke_strategische_spanning}
                </SurfaceCard>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Nieuwe cases">
          {!result?.new_cases?.length ? (
            <EmptyState text="Nog geen nieuwe cases." />
          ) : (
            <div className="space-y-3 text-sm text-gray-200">
              {result.new_cases.map((item) => (
                <SurfaceCard key={item.session_id} title={item.organisation_name} eyebrow={item.sector}>
                  {item.executive_summary}
                </SurfaceCard>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Sectorpatronen">
          {!result?.sector_patterns?.length ? (
            <EmptyState text="Nog geen sectorpatronen." />
          ) : (
            <ul className="space-y-1 text-xs text-gray-200">
              {result.sector_patterns.slice(0, 12).map((item, idx) => (
                <li key={`${item.sector}-${item.strategie}-${idx}`}>
                  {item.sector}: {item.probleemtype}
                  {" → "}
                  {item.strategie}
                  {" → "}
                  {item.interventie} ({item.succesratio})
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Agent activiteit">
          {!result?.agent_activity?.length ? (
            <EmptyState text="Nog geen activiteit." />
          ) : (
            <ul className="space-y-1 text-xs text-gray-200">
              {result.agent_activity.map((line, idx) => (
                <li key={`${line}-${idx}`}>{line}</li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
