import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageShell, Panel, StatCard } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { useAnalysisStore } from "@/state/analysisStore";
import { formatReportCode } from "./reportIdentity";
import { isSessionCompleted } from "@/platform/types";

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isNoiseIntervention(text: string): boolean {
  const value = normalize(text);
  if (!value) return true;
  if (value.length > 140) return true;
  if (/^\d+\.\s+/.test(value)) return true;
  if (/^(besluitvraag|bestuurlijke these|feitenbasis|strategische opties|aanbevolen keuze|besluitregels|kpi monitoring|besluittekst|sector benchmark|vergelijkbare organisaties|strategische positie)/i.test(value)) return true;
  const sentenceCount = value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
  if (sentenceCount > 2) return true;
  return false;
}

function short(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}...`;
}

export default function InterventiesSaaSPage() {
  const api = usePlatformApiBridge();
  const analyses = useAnalysisStore((state) => state.getAnalyses());
  const currentSession = useAnalysisStore((state) => state.currentSession);
  const setCurrentSession = useAnalysisStore((state) => state.setCurrentSession);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dbInterventions, setDbInterventions] = useState<any[]>([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [sourceFilter, setSourceFilter] = useState("alle");

  useEffect(() => {
    void Promise.all([api.listSessions(), api.interventions()]).then(([rows, interventions]) => {
      setSessions((rows || []).filter((row: any) => isSessionCompleted(row?.status)));
      setDbInterventions(interventions || []);
    });
  }, []);

  useEffect(() => {
    if (!currentSession && analyses.length) setCurrentSession(analyses[0].id);
  }, [analyses, currentSession, setCurrentSession]);

  async function downloadLatestReportPdf() {
    setDownloadStatus("PDF-download gestart...");
    try {
      const latestSession = sessions[0]?.session_id;

      if (currentSession?.report) {
        const { exportPDF } = await import("@/services/exportService");
        exportPDF(currentSession.report);
        setDownloadStatus(`PDF gedownload: cyntra_report_${currentSession.report.session_id}.pdf`);
        return;
      }

      const response = await api.exportReport({ format: "pdf", session_id: latestSession, resource: "report" });
      if (!response.ok) {
        throw new Error(`Download mislukt (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = latestSession ? `cyntra_report_${latestSession}.pdf` : "cyntra_report.pdf";
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setDownloadStatus(`PDF gedownload: ${anchor.download}`);
    } catch (error) {
      setDownloadStatus(error instanceof Error ? error.message : "Download mislukt.");
    }
  }

  const interventions = useMemo(() => {
    const fromCurrentSession = (currentSession?.interventions || []).map((item, idx) => ({
      id: item.id || `session-${idx + 1}`,
      title: normalize(item.title || `Interventie ${idx + 1}`),
      description: normalize(item.description) || "Geen beschrijving beschikbaar.",
      owner: normalize(item.owner),
      deadline: normalize(item.deadline),
      impact: normalize(item.impact) || "onbekend",
      risk: normalize(item.risk) || "onbekend",
      confidence: Number(item.confidence ?? 0.7),
      source_case: normalize(item.source_case || currentSession?.id) || "onbekend",
      source_case_id: normalize(item.source_case_id || currentSession?.id) || "onbekend",
      created_at: normalize(item.created_at) || currentSession?.createdAt || new Date().toISOString(),
      sector: normalize(item.sector || currentSession?.sector),
      probleemtype: "",
    }));
    const fromStore = (dbInterventions || []).map((item: any, idx: number) => ({
      id: normalize(item.id || item.intervention_id) || `db-${idx + 1}`,
      title: normalize(item.title || item.interventie) || "Interventie zonder titel",
      description: normalize(item.description || item.interventie || item.impact) || "Geen beschrijving beschikbaar.",
      owner: normalize(item.owner),
      deadline: normalize(item.deadline),
      impact: normalize(item.impact || item.kpi_effect) || "onbekend",
      risk: normalize(item.risk || item.risico) || "onbekend",
      confidence: Number(item.confidence ?? item.succes_score ?? 0.7),
      source_case: normalize(item.source_case || item.source_case_id || item.session_id) || "onbekend",
      source_case_id: normalize(item.source_case_id || item.source_case || item.session_id) || "onbekend",
      created_at: normalize(item.created_at) || new Date().toISOString(),
      sector: normalize(item.sector),
      probleemtype: normalize(item.probleemtype),
    }));

    const legacy = sessions.flatMap((session) =>
      (session.strategic_metadata?.interventies ?? []).map((interventie: string, idx: number) => ({
        id: `${session.session_id}-${idx + 1}`,
        title: normalize(interventie) || `Interventie ${idx + 1}`,
        description: normalize(interventie) || "Geen beschrijving beschikbaar.",
        owner: "",
        deadline: "",
        impact: "middel",
        risk: "middel",
        confidence: 0.7,
        source_case: session.session_id,
        source_case_id: session.session_id,
        created_at: session.updated_at || session.analyse_datum || new Date().toISOString(),
        sector: normalize(session.strategic_metadata?.sector),
        probleemtype: normalize(session.strategic_metadata?.probleemtype),
      }))
    );

    const merged = [...fromCurrentSession, ...fromStore, ...legacy];
    const dedup = new Map<string, (typeof merged)[number]>();
    for (const item of merged) {
      const key = `${item.title}__${item.source_case_id}`;
      if (!dedup.has(key)) dedup.set(key, item);
    }
    return Array.from(dedup.values())
      .filter((item) => !isNoiseIntervention(item.title))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [currentSession, dbInterventions, sessions]);

  const sourceOptions = useMemo(() => {
    const values = new Set<string>();
    interventions.forEach((item) => values.add(item.source_case_id || item.source_case));
    return Array.from(values).filter(Boolean);
  }, [interventions]);

  const shownInterventions = useMemo(
    () =>
      interventions.filter((item) =>
        sourceFilter === "alle"
          ? true
          : (item.source_case_id || item.source_case) === sourceFilter
      ),
    [interventions, sourceFilter]
  );

  const interventionsBySource = useMemo(() => {
    const map = new Map<
      string,
      {
        sourceCase: string;
        items: typeof shownInterventions;
        latestAt: string;
        sessionMeta?: any;
      }
    >();
    for (const item of shownInterventions) {
      const sourceCase = item.source_case_id || item.source_case || "onbekend";
      const existing = map.get(sourceCase);
      const createdAt = item.created_at || "";
      if (!existing) {
        const sessionMeta = sessions.find((row: any) => row.session_id === sourceCase) || null;
        map.set(sourceCase, {
          sourceCase,
          items: [item],
          latestAt: createdAt,
          sessionMeta,
        });
        continue;
      }
      existing.items.push(item);
      if (createdAt > existing.latestAt) existing.latestAt = createdAt;
    }
    return Array.from(map.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
      }))
      .sort((a, b) => (a.latestAt < b.latestAt ? 1 : -1));
  }, [shownInterventions, sessions]);

  return (
    <PageShell title="Interventies" subtitle="Interventies uit analyses, inclusief impact, risico, confidence en rapportcode." showDownloadBar={false}>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Interventies" value={shownInterventions.length} hint="Binnen huidig filter en publiceerbare rapporten." />
        <StatCard label="Rapportbronnen" value={interventionsBySource.length} hint="Sessies met gekoppelde interventielogica." tone="blue" />
        <StatCard label="Database" value={dbInterventions.length} hint="Interventies uit centrale opslag." tone="green" />
        <StatCard label="Selectie" value={sourceFilter === "alle" ? "Alle" : formatReportCode(sourceFilter)} hint="Actieve rapportcodefilter." />
      </div>
      <Panel title="Downloads">
        <div className="space-y-3">
          <button
            className="portal-button-primary"
            onClick={() => void downloadLatestReportPdf()}
          >
            Download huidig rapport (.pdf)
          </button>
          <p className="text-xs text-gray-300">Alle exports zijn nu geconsolideerd naar 1 PDF-downloadpad.</p>
          <p className="text-xs text-gray-300">{downloadStatus}</p>
        </div>
      </Panel>

      <Panel title="Interventie-overzicht">
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm text-gray-200">
            Rapportcode
            <select
              className="cyntra-input mt-1"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="alle">Alle rapporten</option>
              {sourceOptions.map((value) => (
                <option key={value} value={value}>
                  {formatReportCode(value)}
                </option>
              ))}
            </select>
          </label>
          <div className="portal-card-soft p-3 text-xs text-gray-300">
            Totaal interventies: <span className="font-semibold text-white">{shownInterventions.length}</span>
          </div>
        </div>
        {!shownInterventions.length ? (
          <EmptyState text="Start eerst een strategische analyse." />
        ) : (
          <div className="space-y-4">
            {interventionsBySource.map((group) => (
              <section key={group.sourceCase} className="portal-card-soft p-4">
                <div className="mb-3 border-b border-white/10 pb-3">
                  <h3 className="text-sm font-semibold text-white">Rapportcode: {formatReportCode(group.sourceCase)}</h3>
                  <p className="mt-1 text-xs text-gray-300">
                    {group.sessionMeta?.organization_name || "Onbekende organisatie"} •
                    {" "}{group.sessionMeta?.analysis_type || "Strategische analyse"} •
                    {" "}{group.sessionMeta?.analyse_datum ? new Date(group.sessionMeta.analyse_datum).toLocaleString("nl-NL") : "Datum onbekend"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Interventies in dit rapport: {group.items.length}</p>
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <article key={item.id} className="portal-card-soft p-3">
                      <h4 className="text-sm font-semibold text-white">{short(item.title, 100)}</h4>
                      {normalize(item.description) && normalize(item.description) !== normalize(item.title) ? (
                        <p className="mt-1 text-sm text-gray-200">{short(normalize(item.description), 160)}</p>
                      ) : null}
                      <div className="mt-3 grid gap-1 text-xs text-gray-300 md:grid-cols-2">
                        <p>Impact: <span className="text-gray-100">{item.impact || "onbekend"}</span></p>
                        <p>Confidence: <span className="text-gray-100">{Number(item.confidence || 0).toFixed(2)}</span></p>
                        <p>KPI effect: <span className="text-gray-100">{short(item.impact || "onbekend", 80)}</span></p>
                        <p>Risico: <span className="text-gray-100">{item.risk || "onbekend"}</span></p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
