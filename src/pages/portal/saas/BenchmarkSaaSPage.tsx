import { useEffect, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";

export default function BenchmarkSaaSPage() {
  const api = usePlatformApiBridge();
  const [sectorFilter, setSectorFilter] = useState("Zorg/GGZ");
  const [benchmark, setBenchmark] = useState<any>({
    sector: "",
    totaal_cases: 0,
    dominante_problemen: [],
    dominante_interventies: [],
    strategische_posities: [],
  });
  const [engineBenchmark, setEngineBenchmark] = useState<any>(null);

  useEffect(() => {
    void Promise.all([api.datasetBenchmark(sectorFilter), api.benchmarkFromCases(sectorFilter)]).then(([bench, fromCases]) => {
      setBenchmark(bench);
      setEngineBenchmark(fromCases);
    });
  }, [sectorFilter]);

  return (
    <PageShell title="Benchmark" subtitle="Vergelijk organisaties op sectorpatronen, vergelijkbare cases en strategische positie.">
      <Panel title="SECTOR BENCHMARK">
        <label className="text-sm text-gray-200">Sectorfilter<input className="cyntra-input mt-1" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} /></label>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StatCard label="Totaal cases" value={benchmark.totaal_cases} hint="Onderliggende vergelijkingsbasis binnen deze sector." />
          <div className="md:col-span-2">
            <SurfaceCard title="Strategische positie" eyebrow="Sectordominantie">
              {benchmark.strategische_posities?.[0]
                ? `${benchmark.strategische_posities[0].strategie} (${benchmark.strategische_posities[0].count} cases)`
                : "Nog geen strategische positie beschikbaar."}
            </SurfaceCard>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <StatCard label="Groei" value={engineBenchmark?.gemiddelden?.groei ?? 0} tone="green" />
          <StatCard label="Marge" value={engineBenchmark?.gemiddelden?.marge ?? 0} />
          <StatCard label="Capaciteit" value={engineBenchmark?.gemiddelden?.capaciteit ?? 0} tone="blue" />
          <StatCard label="Risico" value={engineBenchmark?.gemiddelden?.risico ?? 0} />
        </div>
        <p className="mt-3 text-sm text-gray-300">
          {engineBenchmark?.strategische_duiding || "Nog geen benchmarkduiding beschikbaar."}
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="portal-card-soft p-4">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Dominante problemen</h3>
            {!benchmark.dominante_problemen?.length ? <EmptyState text="Geen patroondata." /> : <ul className="mt-2 space-y-1 text-sm text-gray-200">{benchmark.dominante_problemen.map((item: any) => <li key={item.probleemtype}>{item.probleemtype} ({item.count})</li>)}</ul>}
          </div>
          <div className="portal-card-soft p-4">
            <h3 className="text-sm font-semibold text-[#D4AF37]">Dominante interventies</h3>
            {!benchmark.dominante_interventies?.length ? <EmptyState text="Geen vergelijkingsdata." /> : <ul className="mt-2 space-y-1 text-sm text-gray-200">{benchmark.dominante_interventies.map((item: any) => <li key={item.interventie}>{item.interventie} ({item.count})</li>)}</ul>}
          </div>
        </div>
      </Panel>
    </PageShell>
  );
}
