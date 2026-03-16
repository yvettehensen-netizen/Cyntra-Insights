import { useEffect, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

export default function SignalenSaaSPage() {
  const api = usePlatformApiBridge();
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    void api.caseSignals().then((rows: any[]) => {
      if (rows?.length) {
        setSignals(rows);
        return;
      }
      void api.signalen().then((fallbackRows) => setSignals(fallbackRows || []));
    });
  }, []);

  return (
    <PageShell title="Signalen" subtitle="Detectie van strategische veranderingen zoals marktverandering, tariefdruk, capaciteitsdruk en regelgeving.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Signalen" value={signals.length} hint="Actieve patronen uit cases en datasets." />
        <StatCard label="Hoogste urgentie" value={signals[0]?.severity || "-"} hint="Eerste signaal in de actuele prioriteitsvolgorde." tone="blue" />
        <StatCard label="Toptype" value={signals[0]?.type || "-"} hint="Bovenliggende categorie met meeste bestuurlijke impact." tone="green" />
      </div>
      <Panel title="Strategische signalen">
        {!signals.length ? (
          <EmptyState text="Nog geen signalen beschikbaar. Start eerst analyses." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {signals.map((signal, idx) => (
              <SurfaceCard
                key={`${signal.type}-${idx}`}
                title={signal.type}
                eyebrow={`Urgentie: ${signal.severity || "onbekend"}`}
                accent="bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(110,170,201,0.05))]"
              >
                <p>{signal.bewijs}</p>
                <p className="mt-2"><strong>Strategische implicatie:</strong> {signal.implicatie}</p>
              </SurfaceCard>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
