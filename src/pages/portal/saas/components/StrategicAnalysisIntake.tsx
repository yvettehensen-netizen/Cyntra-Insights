import { useEffect, useState } from "react";

import type { SubscriptionType } from "@/platform";
import type { StrategicReport } from "@/platform/types";
import type { Intervention } from "@/aurelius/interventions/types";
import { saveReport as persistReport } from "@/services/reportStorage";

import { usePlatformApiBridge } from "../usePlatformApiBridge";
import { formatReportCode } from "../reportIdentity";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function readInputValueFromDom(id: string): string {
  if (typeof document === "undefined") return "";
  const element = document.getElementById(id);
  if (!element) return "";
  if ("value" in element && typeof (element as HTMLInputElement | HTMLTextAreaElement).value === "string") {
    return (element as HTMLInputElement | HTMLTextAreaElement).value.trim();
  }
  return "";
}

async function extractDocxPreview(file: File, limit: number): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const { default: JSZip } = await import("jszip");
    const zip = await JSZip.loadAsync(buffer);
    const doc = zip.file("word/document.xml");
    if (!doc) return "";
    const xml = await doc.async("text");
    return xml
      .replace(/<w:p[^>]*>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  } catch {
    return "";
  }
}

async function buildUploadContext(files: File[]): Promise<string> {
  if (!files.length) return "";

  const lines = await Promise.all(
    files.map(async (file) => {
      const looksTextual =
        file.type.startsWith("text/") ||
        /\.(txt|md|csv|json|xml|html)$/i.test(file.name);

      let excerpt = "";
      if (looksTextual) {
        try {
          excerpt = (await file.text()).replace(/\s+/g, " ").slice(0, 1200);
        } catch {
          excerpt = "";
        }
      } else if (/\.docx$/i.test(file.name)) {
        excerpt = await extractDocxPreview(file, 1200);
      }

      return [
        `Bestand: ${file.name} (${formatFileSize(file.size)})`,
        excerpt ? `Preview: ${excerpt}` : "Preview: niet direct extraheerbaar.",
      ].join("\n");
    })
  );

  return ["[UPLOAD_CONTEXT]", ...lines].join("\n\n");
}

type Props = {
  onStatusChange?: (status: string) => void;
  onSessionCompleted?: (
    reportId: string,
    payload?: {
      sessionId: string;
      report?: StrategicReport;
      session?: any;
      organizationName: string;
      createdAt: string;
      executiveSummary: string;
      boardMemo: string;
      rawInput: string;
      sector: string;
      status: string;
      errorMessage: string;
      interventions: any[];
      analysisRuntimeMs: number;
      engineMode: string;
      qualityScore: number;
      qualityTier: string;
      qualityFlags: string[];
    }
  ) => void;
  onOrganizationsLoaded?: (rows: any[]) => void;
  buttonLabel?: string;
};

export default function StrategicAnalysisIntake({
  onStatusChange,
  onSessionCompleted,
  onOrganizationsLoaded,
  buttonLabel = "Analyse starten",
}: Props) {
  const api = usePlatformApiBridge();

  const [organisaties, setOrganisaties] = useState<any[]>([]);
  const [organisatieNaam, setOrganisatieNaam] = useState("");
  const [sector, setSector] = useState("");
  const [grootte, setGrootte] = useState("");
  const [abonnement, setAbonnement] = useState<SubscriptionType>("Starter");
  const [inputData, setInputData] = useState("");
  const [organisatieId, setOrganisatieId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [latestStrategicLevers, setLatestStrategicLevers] = useState<
    Array<{
      hefboom: string;
      mechanisme: string;
      risico: string;
      bestuurlijke_implicatie: string;
      score: number;
    }>
  >([]);

  const setCombinedStatus = (value: string) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  function safelyCompleteSession(
    reportId: string,
    payload: NonNullable<Parameters<NonNullable<Props["onSessionCompleted"]>>[1]>
  ) {
    try {
      onSessionCompleted?.(reportId, payload);
    } catch (error) {
      console.warn("Report navigation/seed skipped after successful analysis", error);
    }
  }

  async function loadOrganizations() {
    const rows = await api.listOrganizations();
    const safeRows = rows || [];
    setOrganisaties(safeRows);
    onOrganizationsLoaded?.(safeRows);
  }

  useEffect(() => {
    void loadOrganizations();
  }, []);

  async function startAnalyse() {
    const trimmedNaam = (organisatieNaam.trim() || readInputValueFromDom("analysis-organisation-name")).trim();
    const trimmedSector = (sector.trim() || readInputValueFromDom("analysis-sector")).trim();
    const trimmedGrootte = (grootte.trim() || readInputValueFromDom("analysis-organisation-size")).trim();
    const trimmedInput = (inputData.trim() || readInputValueFromDom("analysis-input")).trim();
    const hasInputContext = trimmedInput.length > 0 || files.length > 0;

    if (!trimmedNaam || !trimmedSector || !trimmedGrootte || !hasInputContext) {
      setCombinedStatus(
        "Vul organisatienaam, sector en organisatiegrootte in, plus analyse-input of minimaal 1 document."
      );
      return;
    }

    setBusy(true);
    setCombinedStatus("Analyse wordt gestart...");

    try {
      const uploadContext = await buildUploadContext(files);
      const combinedInput = [trimmedInput, uploadContext].filter(Boolean).join("\n\n");

      const analysis = await api.runAnalysis({
        organization_id: organisatieId || trimmedNaam,
        input_data: combinedInput || trimmedInput,
        analysis_type: "Strategische analyse",
        organization_name: trimmedNaam,
        sector: trimmedSector,
        organisatie_grootte: trimmedGrootte,
        abonnementstype: abonnement,
      });

      const session = analysis?.session;
      const sessionId = String(session?.session_id ?? analysis?.sessionId ?? "").trim();
      const reportId = String(analysis?.reportId ?? sessionId).trim();
      if (!sessionId) throw new Error("Analyse gestart, maar rapportcode ontbreekt.");

      const report: StrategicReport | undefined =
        session?.strategic_report ||
        (session?.board_report
          ? {
              report_id: `report-${sessionId}`,
              session_id: sessionId,
              organization_id: organisatieId || trimmedNaam,
              title: `Cyntra Executive Dossier — ${trimmedNaam} — ${sessionId}`,
              sections: [],
              generated_at: session?.updated_at || new Date().toISOString(),
              report_body: session.board_report,
            }
          : undefined);

      const interventions: Intervention[] = (session?.intervention_predictions || []).map(
        (item: any, idx: number) => ({
          id: `${sessionId}-${idx + 1}`,
          title: String(item?.interventie || `Interventie ${idx + 1}`),
          description: String(item?.impact || item?.kpi_effect || "Geen beschrijving beschikbaar."),
          impact: String(item?.impact || "onbekend"),
          risk: String(item?.risico || "onbekend"),
          confidence:
            item?.confidence === "hoog"
              ? 0.85
              : item?.confidence === "laag"
                ? 0.45
                : 0.65,
          source_case_id: sessionId,
          source_case: sessionId,
          created_at: session?.updated_at || new Date().toISOString(),
        })
      );

      const runtimeSeconds =
        Number(session?.analysis_runtime_ms || 0) > 0
          ? Math.round(Number(session.analysis_runtime_ms) / 1000)
          : null;
      const engineMode = String(session?.engine_mode || "onbekend");
      const reportCode = formatReportCode(String(session.session_id || sessionId));

      if (String(session?.status || "").toLowerCase() === "fout") {
        const failureMessage =
          String(session?.error_message || "").trim() || "Analyse is geblokkeerd of mislukt.";
        setCombinedStatus(`Analyse afgerond met blokkade. Rapportcode: ${reportCode}. ${failureMessage}`);
        if (report) {
          persistReport(sessionId, report, {
            organizationName: trimmedNaam,
            result: session?.output,
          });
        }
        safelyCompleteSession(reportId || sessionId, {
          sessionId,
          report,
          session,
          organizationName: trimmedNaam,
          createdAt: String(session?.updated_at || session?.analyse_datum || new Date().toISOString()),
          executiveSummary: String(session?.executive_summary || ""),
          boardMemo: String(session?.board_memo || ""),
          rawInput: combinedInput || trimmedInput,
          sector: trimmedSector,
          status: String(session?.status || "fout"),
          errorMessage: failureMessage,
          interventions: Array.isArray(session?.intervention_predictions) ? session.intervention_predictions : [],
          analysisRuntimeMs: Number(session?.analysis_runtime_ms || 0),
          engineMode: String(session?.engine_mode || ""),
          qualityScore: Number(session?.quality_score || 0),
          qualityTier: String(session?.quality_tier || ""),
          qualityFlags: Array.isArray(session?.quality_flags) ? session.quality_flags.map((item: unknown) => String(item)) : [],
        });
        void loadOrganizations();
        return;
      }

      setCombinedStatus(
        `Analyse voltooid. Rapportcode: ${reportCode}. Status: ${session.status}. Engine: ${engineMode}${
          runtimeSeconds != null ? ` (${runtimeSeconds}s)` : ""
        }`
      );
      setLatestStrategicLevers(session?.strategic_metadata?.strategic_hefbomen || []);

      if (report) {
        persistReport(sessionId, report, {
          organizationName: trimmedNaam,
          result: session?.output,
        });
      }
      safelyCompleteSession(reportId || sessionId, {
        sessionId,
        report,
        session,
        organizationName: trimmedNaam,
        createdAt: String(session?.updated_at || session?.analyse_datum || new Date().toISOString()),
        executiveSummary: String(session?.executive_summary || ""),
        boardMemo: String(session?.board_memo || ""),
        rawInput: combinedInput || trimmedInput,
        sector: trimmedSector,
        status: String(session?.status || "voltooid"),
        errorMessage: String(session?.error_message || ""),
        interventions: Array.isArray(session?.intervention_predictions) ? session.intervention_predictions : [],
        analysisRuntimeMs: Number(session?.analysis_runtime_ms || 0),
        engineMode: String(session?.engine_mode || ""),
        qualityScore: Number(session?.quality_score || 0),
        qualityTier: String(session?.quality_tier || ""),
        qualityFlags: Array.isArray(session?.quality_flags) ? session.quality_flags.map((item: unknown) => String(item)) : [],
      });
      void loadOrganizations();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analyse mislukt.";
      setCombinedStatus(message);
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="portal-card-soft grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="portal-kicker">Board Intake</p>
          <p className="mt-2 text-sm text-gray-300">
            Leg de context vast zoals een bestuurder hem wil lezen: expliciet, compact en gericht op kernconflict.
          </p>
        </div>
        <label className="text-sm text-gray-200">
          Organisatienaam
          <input
            id="analysis-organisation-name"
            name="organisation_name"
            className="cyntra-input mt-1"
            value={organisatieNaam}
            onChange={(e) => setOrganisatieNaam(e.target.value)}
            placeholder="Organisatienaam"
            autoComplete="organization"
          />
        </label>
        <label className="text-sm text-gray-200">
          Sector
          <input
            id="analysis-sector"
            name="sector"
            className="cyntra-input mt-1"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Sector"
          />
        </label>
        <label className="text-sm text-gray-200">
          Organisatiegrootte
          <input
            id="analysis-organisation-size"
            name="organisation_size"
            className="cyntra-input mt-1"
            value={grootte}
            onChange={(e) => setGrootte(e.target.value)}
            placeholder="Organisatiegrootte"
          />
        </label>
        <label className="text-sm text-gray-200">
          Abonnement
          <select
            id="analysis-subscription"
            name="subscription_type"
            className="cyntra-input mt-1"
            value={abonnement}
            onChange={(e) => setAbonnement(e.target.value as SubscriptionType)}
          >
            <option value="Starter">Starter (3 analyses/maand)</option>
            <option value="Professional">Professional (10 analyses/maand)</option>
            <option value="Enterprise">Enterprise (onbeperkt)</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm text-gray-200">
        <div className="portal-card-soft p-5">
          <p className="portal-kicker">Strategische Context</p>
          <p className="mt-2 text-sm text-gray-300">
            Beschrijf spanning, mandaat, blokkade of keuzeconflict. Niet de symptoms, maar het bestuurlijke probleem.
          </p>
          <textarea
            id="analysis-input"
            name="analysis_input"
            className="cyntra-input mt-4 min-h-[180px] p-3"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Beschrijf hier de strategische context, spanning en gewenste analyse."
          />
        </div>
      </label>

      <div className="portal-card-soft mt-4 border-dashed p-4">
        <p className="text-sm font-semibold text-white">Documenten uploaden</p>
        <p className="mt-1 text-xs text-gray-300">Upload documenten als extra context voor de analyse.</p>

        <input
          id="analysis-files"
          name="analysis_files"
          type="file"
          multiple
          className="mt-3 block w-full text-sm text-gray-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#D4AF37] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            if (!selected.length) return;

            setFiles((prev) => {
              const known = new Set(prev.map((f) => `${f.name}:${f.size}:${f.lastModified}`));
              const merged = [...prev];

              selected.forEach((file) => {
                const key = `${file.name}:${file.size}:${file.lastModified}`;
                if (!known.has(key)) {
                  known.add(key);
                  merged.push(file);
                }
              });

              return merged;
            });

            e.target.value = "";
          }}
        />

        <div className="mt-2 text-xs text-gray-300">
          {files.length} document{files.length === 1 ? "" : "en"} geselecteerd
        </div>

        {files.length > 0 && (
          <>
            <ul className="mt-3 space-y-2">
              {files.map((file) => (
                <li
                  key={`${file.name}:${file.size}:${file.lastModified}`}
                  className="portal-card-soft flex items-center justify-between px-3 py-2 text-xs text-gray-200"
                >
                  <span className="truncate pr-3">
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.filter(
                          (f) =>
                            `${f.name}:${f.size}:${f.lastModified}` !==
                            `${file.name}:${file.size}:${file.lastModified}`
                        )
                      )
                    }
                    className="rounded border border-white/20 px-2 py-1 text-xs text-white"
                  >
                    Verwijder
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setFiles([])}
              className="portal-button-secondary mt-3 px-3 py-1 text-xs"
            >
              Wis alles
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => void startAnalyse()}
          disabled={busy}
          className="portal-button-primary disabled:opacity-60"
        >
          {busy ? "Bezig..." : buttonLabel}
        </button>
        <span className="text-sm text-gray-300">{status}</span>
      </div>

      {latestStrategicLevers.length ? (
        <div className="portal-card mt-4 p-4">
          <p className="text-sm font-semibold text-white">Gedetecteerde strategische hefbomen</p>
          <div className="mt-3 grid gap-3 xl:grid-cols-3">
            {latestStrategicLevers.slice(0, 3).map((item) => (
              <article key={item.hefboom} className="portal-card-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">{item.hefboom}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gray-400">Mechanisme</p>
                <p className="mt-1 text-sm text-gray-200">{item.mechanisme}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gray-400">Risico</p>
                <p className="mt-1 text-sm text-gray-200">{item.risico}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-gray-400">Bestuurlijke implicatie</p>
                <p className="mt-1 text-sm text-gray-200">{item.bestuurlijke_implicatie}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
