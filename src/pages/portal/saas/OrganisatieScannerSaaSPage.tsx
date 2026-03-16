import { useEffect, useState } from "react";
import type { SubscriptionType } from "@/platform";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode } from "./reportIdentity";

export default function OrganisatieScannerSaaSPage() {
  const api = usePlatformApiBridge();
  const [sector, setSector] = useState("Zorg/GGZ");
  const [zoekterm, setZoekterm] = useState("GGZ");
  const [gevonden, setGevonden] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [laatsteSessies, setLaatsteSessies] = useState<any[]>([]);

  async function reloadSessions() {
    const rows = await api.listSessions();
    setLaatsteSessies((rows || []).slice(0, 5));
  }

  useEffect(() => {
    void reloadSessions();
  }, []);

  async function zoekOrganisaties() {
    const rows = await api.discovery({ sector, zoekterm });
    setGevonden(rows || []);
    setSelected((rows || [])[0] ?? null);
  }

  async function runScannerAnalyse() {
    if (!selected) return;
    setBusy(true);
    setStatus("Organisatie wordt gescand en geanalyseerd...");
    try {
      const session = await api.scanAnalyze({
        organisation_name: selected.organisation_name,
        sector: selected.sector,
        organisatie_grootte: "25-120",
        abonnementstype: "Starter" as SubscriptionType,
        website: selected.website,
        location: selected.location,
      });
      setStatus(`Analyse voltooid. Rapportcode: ${formatReportCode(session.session_id)}`);
      await reloadSessions();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scanner-analyse mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Organisatie scanner" subtitle="Zoek organisaties, verzamel contextdata, voer analyse uit en genereer direct een strategisch rapport.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Matches" value={gevonden.length} hint="Resultaten uit huidige verkenning." />
        <StatCard label="Laatste scans" value={laatsteSessies.length} hint="Publiceerbare scans in het systeem." tone="blue" />
        <StatCard label="Status" value={busy ? "Draait" : "Gereed"} hint="Scannerflow gebruikt dezelfde productie-engine als analyse." tone="green" />
      </div>
      <Panel title="Scanner flow">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-gray-200">Sector<input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={sector} onChange={(e) => setSector(e.target.value)} /></label>
          <label className="text-sm text-gray-200 md:col-span-2">Zoekterm<input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={zoekterm} onChange={(e) => setZoekterm(e.target.value)} /></label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black" onClick={() => void zoekOrganisaties()}>Zoek organisatie</button>
          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-60" onClick={() => void runScannerAnalyse()} disabled={!selected || busy}>{busy ? "Analyse draait..." : "Scan + analyse uitvoeren"}</button>
        </div>

        <p className="mt-3 text-sm text-gray-300">{status}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <section className="rounded-[24px] border border-white/10 bg-black/20 p-3">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Gevonden organisaties</h3>
            {!gevonden.length ? <EmptyState text="Nog geen resultaten. Start met zoeken." /> : (
              <ul className="mt-2 space-y-2 text-sm">{gevonden.map((org) => (
                <li key={`${org.organisation_name}-${org.location}`}><button className={`w-full rounded-lg border px-3 py-2 text-left ${selected?.organisation_name === org.organisation_name ? "border-[#D4AF37] text-white" : "border-white/10 text-gray-200"}`} onClick={() => setSelected(org)}><strong>{org.organisation_name}</strong><div className="text-xs text-gray-400">{org.sector} • {org.location}</div></button></li>
              ))}</ul>
            )}
          </section>

          <section className="rounded-[24px] border border-white/10 bg-black/20 p-3">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Selectie</h3>
            {!selected ? <EmptyState text="Selecteer een organisatie." /> : (
              <div className="mt-2 space-y-1 text-sm text-gray-200"><p><strong>Naam:</strong> {selected.organisation_name}</p><p><strong>Sector:</strong> {selected.sector}</p><p><strong>Website:</strong> {selected.website}</p><p><strong>Locatie:</strong> {selected.location}</p></div>
            )}
          </section>
        </div>
      </Panel>

      <Panel title="Laatste scanner-analyses">
        {!laatsteSessies.length ? <EmptyState text="Nog geen rapporten beschikbaar." /> : (
          <div className="grid gap-4 xl:grid-cols-2">
            {laatsteSessies.map((s) => (
              <SurfaceCard
                key={s.session_id}
                title={s.organization_name || s.organization_id}
                eyebrow={`${formatReportCode(s.session_id)} • ${s.status}`}
              >
                Sector: {s.strategic_metadata?.sector || "Onbekend"}
              </SurfaceCard>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
