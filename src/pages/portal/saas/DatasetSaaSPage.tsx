import { useEffect, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

export default function DatasetSaaSPage() {
  const api = usePlatformApiBridge();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    void api.datasetRecords().then((rows) => setRecords(rows || []));
  }, []);

  return (
    <PageShell title="Dataset" subtitle="Strategische kennisdatabase met geanonimiseerde cases voor patroonherkenning en learning loops.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Records" value={records.length} hint="Actieve kennisbasis voor signalen en benchmark." />
        <StatCard label="Sectoren" value={new Set(records.map((record) => record.sector).filter(Boolean)).size} hint="Domeinen in de huidige dataset." tone="blue" />
        <StatCard label="Probleemtypen" value={new Set(records.map((record) => record.probleemtype).filter(Boolean)).size} hint="Unieke frictiepatronen in opslag." tone="green" />
      </div>
      <Panel title="Strategic dataset records">
        {!records.length ? <EmptyState text="Nog geen datasetrecords beschikbaar." /> : (
          <div className="grid gap-4 xl:grid-cols-2">{records.map((record) => (
            <SurfaceCard
              key={record.record_id}
              title={record.probleemtype || "Onbekend probleemtype"}
              eyebrow={record.record_id}
              accent="bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(207,177,112,0.04))]"
            >
              <p><strong>Sector:</strong> {record.sector}</p>
              <p className="mt-2"><strong>Mechanismen:</strong> {(record.mechanismen || []).join(", ") || "-"}</p>
              <p className="mt-2"><strong>Interventies:</strong> {(record.interventies || []).join(", ") || "-"}</p>
            </SurfaceCard>
          ))}</div>
        )}
      </Panel>
    </PageShell>
  );
}
