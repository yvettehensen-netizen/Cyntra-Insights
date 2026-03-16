import { useEffect, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard, SurfaceCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode } from "./reportIdentity";
import { isSessionCompleted } from "@/platform/types";

function fmtDate(value?: string) {
  if (!value) return "Onbekend";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Onbekend" : date.toLocaleString("nl-NL");
}

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function compact(text: unknown, max = 180): string {
  const value = normalize(text);
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}

function cleanInput(value: unknown): string {
  return normalize(value).replace(/\[UPLOAD_CONTEXT\][\s\S]*$/i, "").trim();
}

function isNoiseIntervention(text: string): boolean {
  const value = normalize(text);
  if (!value) return true;
  if (value.length > 120) return true;
  if (/^\d+\.\s+/.test(value)) return true;
  if (/^(besluitvraag|bestuurlijke these|feitenbasis|strategische opties|aanbevolen keuze|besluitregels|kpi monitoring|besluittekst|sector benchmark|vergelijkbare organisaties|strategische positie)/i.test(value)) return true;
  return false;
}

export default function HistorischeCasesSaaSPage() {
  const api = usePlatformApiBridge();
  const [cases, setCases] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sectorFilter, setSectorFilter] = useState("Alle sectoren");
  const [probleemFilter, setProbleemFilter] = useState("Alle probleemtypen");
  const [confidenceFilter, setConfidenceFilter] = useState("Alle confidence");

  useEffect(() => {
    void Promise.all([api.cases(), api.listSessions()]).then(([apiCaseRows, sessionRows]) => {
      setCases(apiCaseRows || []);
      setSessions((sessionRows || []).filter((row: any) => isSessionCompleted(row?.status)));
    });
  }, []);

  const sectors = Array.from(
    new Set([
      ...cases.map((item) => item.sector).filter(Boolean),
      ...sessions.map((item) => item.strategic_metadata?.sector).filter(Boolean),
    ])
  );
  const problemen = Array.from(
    new Set([
      ...cases.map((item) => item.probleemtype).filter(Boolean),
      ...sessions.map((item) => item.strategic_metadata?.probleemtype).filter(Boolean),
    ])
  );
  const confidences = Array.from(
    new Set(
      sessions
        .flatMap((item) => item.intervention_predictions || [])
        .map((item: any) => item.confidence)
        .filter(Boolean)
    )
  );

  const filteredCases = cases.filter((item) => {
    if (sectorFilter !== "Alle sectoren" && item.sector !== sectorFilter) return false;
    if (
      probleemFilter !== "Alle probleemtypen" &&
      item.probleemtype !== probleemFilter &&
      !(String(item.report || "").toLowerCase().includes(probleemFilter.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const filteredSessions = sessions.filter((session) => {
    if (sectorFilter !== "Alle sectoren" && session.strategic_metadata?.sector !== sectorFilter) return false;
    if (probleemFilter !== "Alle probleemtypen" && session.strategic_metadata?.probleemtype !== probleemFilter) return false;
    if (confidenceFilter !== "Alle confidence") {
      const hasConfidence = (session.intervention_predictions || []).some(
        (row: any) => row.confidence === confidenceFilter
      );
      if (!hasConfidence) return false;
    }
    return true;
  });

  return (
    <PageShell title="Historische cases" subtitle="Eerdere analyses als strategische case-historie voor leren, vergelijking en besluitondersteuning." showDownloadBar={false}>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Cases" value={filteredCases.length} hint="Direct vergelijkbaar binnen huidige filters." />
        <StatCard label="Sessies" value={filteredSessions.length} hint="Gepubliceerde analyses in deze selectie." tone="blue" />
        <StatCard label="Sectoren" value={sectors.length} hint="Beschikbare domeinen in het geheugen." tone="green" />
        <StatCard label="Probleemtypen" value={problemen.length} hint="Terugkerende fricties over cases heen." />
      </div>
      <Panel title="Filters">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-gray-200">
            Sector
            <select className="cyntra-input mt-1" value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
              <option>Alle sectoren</option>
              {sectors.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm text-gray-200">
            Probleemtype
            <select className="cyntra-input mt-1" value={probleemFilter} onChange={(e) => setProbleemFilter(e.target.value)}>
              <option>Alle probleemtypen</option>
              {problemen.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm text-gray-200">
            Confidence
            <select className="cyntra-input mt-1" value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value)}>
              <option>Alle confidence</option>
              {confidences.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
      </Panel>
      <Panel title="Case-overzicht">
        {!filteredCases.length ? <EmptyState text="Geen cases voor de gekozen filters." /> : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredCases.map((item) => (
              <SurfaceCard key={item.case_id} title={item.organisation_name || "Onbekende organisatie"} eyebrow={`${item.case_id} • ${item.sector || "Onbekende sector"}`}>
                <p><strong>Input:</strong> {compact(cleanInput(item.analyse_input) || "Niet beschikbaar", 220)}</p>
                <p className="mt-2"><strong>Confidence:</strong> {item.confidence ?? "Onbekend"}</p>
                <p className="mt-2">
                  <strong>Interventies:</strong>{" "}
                  {(() => {
                    const list = Array.from(
                      new Set(
                        (item.interventions || [])
                          .map((row: any) => normalize(row.title))
                          .filter(Boolean)
                          .filter((label: string) => !isNoiseIntervention(label))
                      )
                    );
                    if (!list.length) return "Geen interventies";
                    const preview = list.slice(0, 3).join(", ");
                    return list.length > 3 ? `${preview} (+${list.length - 3})` : preview;
                  })()}
                </p>
                <p className="mt-3 text-xs text-gray-400">{compact(item.report || "Geen rapport beschikbaar", 260)}</p>
              </SurfaceCard>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Agent & interventiehistoriek">
        {!filteredSessions.length ? <EmptyState text="Geen agenthistoriek voor de gekozen filters." /> : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <article key={session.session_id} className="portal-card-soft p-4">
                <h3 className="text-sm font-semibold text-white">{formatReportCode(session.session_id)}</h3>
                <p className="mt-1 text-xs text-gray-300">{fmtDate(session.analyse_datum)}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <section className="portal-card-soft p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-200">Interventievoorspelling</h4>
                    {(session.intervention_predictions || []).length ? (
                      <div className="mt-2 space-y-2 text-xs text-gray-300">
                        {session.intervention_predictions.slice(0, 3).map((row: any, idx: number) => (
                          <div key={`${session.session_id}-prediction-${idx}`} className="portal-card-soft rounded-md p-2">
                            <p className="font-medium text-gray-100">{row.interventie || "Onbekende interventie"}</p>
                            <p><span className="text-gray-400">Impact:</span> {row.impact || "Onbekend"}</p>
                            <p><span className="text-gray-400">Risico:</span> {row.risico || "Onbekend"}</p>
                            <p><span className="text-gray-400">KPI-effect:</span> {row.kpi_effect || "Onbekend"}</p>
                            <p><span className="text-gray-400">Confidence:</span> {row.confidence || "Onbekend"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400">Nog geen interventievoorspellingen beschikbaar.</p>
                    )}
                  </section>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
