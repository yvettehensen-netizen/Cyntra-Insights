import { useEffect, useMemo, useState } from "react";
import { StrategicDatasetCollector } from "@/platform";
import { StrategicCaseIntelligenceStore, InterventionStore } from "@/aurelius/data";
import { StrategicSignalEngine } from "@/aurelius/network";
import {
  StrategicRelationshipEngine,
  StrategicInsightGraphQuery,
  type StrategicKnowledgeGraphState,
  type StrategicPattern,
} from "@/aurelius/knowledge";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";

function toCountMap(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) {
    const key = String(value ?? "").trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );
  const header = keys.join(",");
  const body = rows
    .map((row) =>
      keys
        .map((key) => {
          const text = String(row[key] ?? "");
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function downloadText(filename: string, content: string, mime = "text/plain") {
  const href = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

export default function StrategischeKennisPage() {
  const collector = useMemo(() => new StrategicDatasetCollector(), []);
  const caseStore = useMemo(() => new StrategicCaseIntelligenceStore(), []);
  const interventionStore = useMemo(() => new InterventionStore(), []);
  const signalEngine = useMemo(() => new StrategicSignalEngine(), []);
  const relationship = useMemo(() => new StrategicRelationshipEngine(), []);
  const graphQuery = useMemo(() => new StrategicInsightGraphQuery(), []);

  const [graph, setGraph] = useState<StrategicKnowledgeGraphState | null>(null);
  const [patterns, setPatterns] = useState<StrategicPattern[]>([]);
  const [sectorFilter, setSectorFilter] = useState("Zorg/GGZ");
  const [probleemFilter, setProbleemFilter] = useState("financiele druk");

  useEffect(() => {
    const records = collector.listRecords();
    const cases = caseStore.list();
    const interventions = interventionStore.list();
    const signals = signalEngine
      .detect(
        records.map((item) => ({
          dataset_id: item.record_id,
          sector: item.sector,
          probleemtype: item.probleemtype,
          mechanismen: item.mechanismen,
          interventies: item.interventies,
          outcomes: [],
          created_at: item.created_at,
        }))
      )
      .map((item) => ({
        sector: "Multi-sector",
        signaal: item.type,
        impact: item.implicatie,
        urgentie: item.severity,
      }));

    const connected = relationship.connect({
      records,
      cases,
      interventions,
      signals,
    });
    setGraph(connected.graph);
    setPatterns(connected.patterns);
  }, []);

  const sectorPatterns = patterns.filter(
    (item) => item.sector.toLowerCase() === sectorFilter.toLowerCase()
  );
  const strategyRatio = toCountMap(patterns.map((item) => item.strategie)).slice(0, 8);
  const interventionRatio = toCountMap(patterns.map((item) => item.interventie)).slice(0, 8);
  const problemFrequency = toCountMap(patterns.map((item) => item.probleemtype)).slice(0, 8);

  const topForSector = graphQuery.strategyForSector(patterns, sectorFilter);
  const topForProblem = graphQuery.interventionForProblem(patterns, probleemFilter);
  const failing = graphQuery.failingCombinations(patterns);

  function printKennisRapport() {
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!popup) return;
    const summary = [
      `Strategische kennisrapportage`,
      `Datum: ${new Date().toLocaleString("nl-NL")}`,
      "",
      `Nodes: ${graph?.nodes.length ?? 0}`,
      `Edges: ${graph?.edges.length ?? 0}`,
      `Patronen: ${patterns.length}`,
      "",
      `Top strategieen in sector ${sectorFilter}:`,
      ...topForSector.slice(0, 8).map((item) => `- ${item.strategie} (${item.succesratio})`),
      "",
      `Top interventies voor probleem ${probleemFilter}:`,
      ...topForProblem.slice(0, 8).map((item) => `- ${item.interventie} (${item.succesratio})`),
    ].join("\n");
    popup.document.write(
      `<!doctype html><html><head><title>Strategische kennisrapportage</title><style>body{font-family:Arial,sans-serif;padding:24px}pre{white-space:pre-wrap;font:14px/1.5 Arial,sans-serif}</style></head><body><pre>${summary.replace(/</g, "&lt;")}</pre></body></html>`
    );
    popup.document.close();
    popup.focus();
    popup.print();
  }

  return (
    <PageShell
      title="Strategische kennis"
      subtitle="Strategic Knowledge Graph die organisaties, sectoren, problemen, strategieën, interventies en resultaten verbindt."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Nodes" value={graph?.nodes.length ?? 0} hint="Kennisobjecten in de graph." />
        <StatCard label="Edges" value={graph?.edges.length ?? 0} hint="Relaties tussen problemen, strategieën en interventies." tone="blue" />
        <StatCard label="Patronen" value={patterns.length} hint="Afgeleide structuurpatronen in kennislaag." tone="green" />
        <StatCard label="Filtersector" value={sectorFilter} hint="Actieve vraagrichting in de knowledge query." />
      </div>
      <Panel title="Graph overzicht">
        {!graph ? (
          <EmptyState text="Knowledge graph wordt opgebouwd..." />
        ) : (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-gray-400">Nodes</p><p className="text-xl font-semibold text-white">{graph.nodes.length}</p></div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-gray-400">Edges</p><p className="text-xl font-semibold text-white">{graph.edges.length}</p></div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-gray-400">Patronen</p><p className="text-xl font-semibold text-white">{patterns.length}</p></div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3"><p className="text-xs text-gray-400">Laatste update</p><p className="text-sm font-semibold text-white">{new Date(graph.updated_at).toLocaleString("nl-NL")}</p></div>
          </div>
        )}
      </Panel>

      <Panel title="Kennisquery">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-gray-200">
            Sector (Welke strategie werkt in sector X?)
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} />
          </label>
          <label className="text-sm text-gray-200">
            Probleem (Welke interventie werkt bij probleem Y?)
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/20 p-2" value={probleemFilter} onChange={(e) => setProbleemFilter(e.target.value)} />
          </label>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <SurfaceCard title="Strategieën in sector">
            {!topForSector.length ? <EmptyState text="Geen data." /> : <ul className="mt-2 space-y-1 text-xs text-gray-200">{topForSector.map((item, idx) => <li key={`${item.strategie}-${idx}`}>{item.strategie} ({item.succesratio})</li>)}</ul>}
          </SurfaceCard>
          <SurfaceCard title="Interventies bij probleem">
            {!topForProblem.length ? <EmptyState text="Geen data." /> : <ul className="mt-2 space-y-1 text-xs text-gray-200">{topForProblem.map((item, idx) => <li key={`${item.interventie}-${idx}`}>{item.interventie} ({item.succesratio})</li>)}</ul>}
          </SurfaceCard>
          <SurfaceCard title="Faalcombinaties">
            {!failing.length ? <EmptyState text="Geen duidelijke faalcombinaties." /> : <ul className="mt-2 space-y-1 text-xs text-gray-200">{failing.map((item, idx) => <li key={`${item.strategie}-${item.interventie}-${idx}`}>{item.strategie} + {item.interventie} ({item.succesratio})</li>)}</ul>}
          </SurfaceCard>
        </div>
      </Panel>

      <Panel title="Kennisrapport export">
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white"
            onClick={() =>
              downloadText(
                "strategische-kennis.json",
                JSON.stringify(
                  {
                    generated_at: new Date().toISOString(),
                    graph,
                    patterns,
                    top_for_sector: topForSector,
                    top_for_problem: topForProblem,
                    failing_combinations: failing,
                  },
                  null,
                  2
                ),
                "application/json"
              )
            }
          >
            Download JSON
          </button>
          <button
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white"
            onClick={() =>
              downloadText(
                "strategische-kennis-patronen.csv",
                toCsv(
                  patterns.map((item) => ({
                    sector: item.sector,
                    probleemtype: item.probleemtype,
                    strategie: item.strategie,
                    interventie: item.interventie,
                    succesratio: item.succesratio,
                  }))
                ),
                "text/csv"
              )
            }
          >
            Download CSV
          </button>
          <button
            className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black"
            onClick={printKennisRapport}
          >
            Print rapport
          </button>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Sector patronen">
          {!sectorPatterns.length ? (
            <EmptyState text="Geen sectorpatronen voor deze filter." />
          ) : (
            <ul className="space-y-1 text-sm text-gray-200">
              {sectorPatterns.slice(0, 10).map((item, idx) => (
                <li key={`${item.sector}-${item.probleemtype}-${idx}`}>
                  {item.probleemtype}
                  {" → "}
                  {item.strategie}
                  {" → "}
                  {item.interventie} ({item.succesratio})
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Succesratio en frequentie">
          <div className="space-y-3 text-sm text-gray-200">
            <div>
              <h4 className="font-semibold text-white">Strategie succesratio (frequentie)</h4>
              <ul className="mt-1 space-y-1 text-xs">{strategyRatio.map((item) => <li key={item.label}>{item.label}: {item.count}</li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Interventie succesratio (frequentie)</h4>
              <ul className="mt-1 space-y-1 text-xs">{interventionRatio.map((item) => <li key={item.label}>{item.label}: {item.count}</li>)}</ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Probleem frequentie</h4>
              <ul className="mt-1 space-y-1 text-xs">{problemFrequency.map((item) => <li key={item.label}>{item.label}: {item.count}</li>)}</ul>
            </div>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
