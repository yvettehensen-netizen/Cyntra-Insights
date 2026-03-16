import { useEffect, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

export default function BrancheAnalyseSaaSPage() {
  const api = usePlatformApiBridge();
  const [intelligence, setIntelligence] = useState<{
    sectorpatronen: Array<{ sector: string; patroon: string; waar_dit_voorkomt: number; strategische_implicatie: string }>;
    strategische_spanningen: string[];
    succesvolle_strategieen: Array<{ strategie: string; frequentie: number }>;
  }>({
    sectorpatronen: [],
    strategische_spanningen: [],
    succesvolle_strategieen: [],
  });

  useEffect(() => {
    void api.sectorIntelligence().then((rows: any) =>
      setIntelligence(rows || { sectorpatronen: [], strategische_spanningen: [], succesvolle_strategieen: [] })
    );
  }, []);

  const patterns = intelligence.sectorpatronen;

  return (
    <PageShell title="Branche-analyse" subtitle="Sectorpatronen op basis van geanonimiseerde cases uit het Cyntra Strategic Intelligence Network.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Patronen" value={patterns.length} hint="Herhaalbare sectorstructuren in het geheugen." />
        <StatCard label="Spanningen" value={intelligence.strategische_spanningen.length} hint="Terugkerende fricties over cases heen." tone="blue" />
        <StatCard label="Strategieën" value={intelligence.succesvolle_strategieen.length} hint="Patronen die vaker succesvol terugkomen." tone="green" />
      </div>
      <Panel title="Sectorpatronen">
        {!patterns.length ? <EmptyState text="Nog geen sectorpatronen beschikbaar. Er is meer data nodig." /> : (
          <div className="grid gap-4 xl:grid-cols-2">{patterns.map((pattern, idx) => (
            <SurfaceCard key={`${pattern.patroon}-${idx}`} title={pattern.patroon} eyebrow={`Sector: ${pattern.sector} • Frequentie: ${pattern.waar_dit_voorkomt}`}>
              {pattern.strategische_implicatie}
            </SurfaceCard>
          ))}</div>
        )}
      </Panel>
      <Panel title="Strategische spanningen en succesvolle strategieën">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Strategische spanningen</h3>
            {!intelligence.strategische_spanningen.length ? (
              <EmptyState text="Nog geen spanningspatronen beschikbaar." />
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-gray-200">
                {intelligence.strategische_spanningen.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Succesvolle strategieën</h3>
            {!intelligence.succesvolle_strategieen.length ? (
              <EmptyState text="Nog geen strategiepatronen beschikbaar." />
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-gray-200">
                {intelligence.succesvolle_strategieen.map((item) => (
                  <li key={item.strategie}>{item.strategie} ({item.frequentie})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
