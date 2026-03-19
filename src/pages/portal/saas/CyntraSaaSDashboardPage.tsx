import { useEffect, useMemo, useState } from "react";
import type { SubscriptionType } from "@/platform";
import { EmptyState, PageShell, Panel } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode } from "./reportIdentity";
import { isSessionCompleted } from "@/platform/types";
import DecisionPressureGauge from "@/components/reports/DecisionPressureGauge";
import StrategicLandscapeMap from "@/components/reports/StrategicLandscapeMap";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
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
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  } catch {
    return "";
  }
}

async function buildUploadContext(files: File[]): Promise<string> {
  if (!files.length) return "";
  const parts = await Promise.all(
    files.map(async (file) => {
      const looksTextual = file.type.startsWith("text/") || /\.(txt|md|csv|json|xml|html)$/i.test(file.name);
      let preview = "";
      if (looksTextual) {
        try {
          preview = (await file.text()).replace(/\s+/g, " ").slice(0, 900);
        } catch {
          preview = "";
        }
      } else if (/\.docx$/i.test(file.name)) {
        preview = await extractDocxPreview(file, 900);
      }
      return `Bestand: ${file.name} (${formatFileSize(file.size)})\nPreview: ${preview || "niet direct extraheerbaar."}`;
    })
  );
  return ["[UPLOAD_CONTEXT]", ...parts].join("\n\n");
}

function pressureLevel(text: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const source = String(text || "").toLowerCase();
  if (/kritiek|critical|caseload|wachttijd|hoog risico|verlies|druk loopt/i.test(source)) return "HIGH";
  if (/marge|vertrag|alert|kwetsbaar|contractdruk/i.test(source)) return "MEDIUM";
  return "LOW";
}

export default function CyntraSaaSDashboardPage() {
  const api = usePlatformApiBridge();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<any>({ sector: "", totaal_cases: 0, dominante_problemen: [] });
  const [organisatieNaam, setOrganisatieNaam] = useState("");
  const [sector, setSector] = useState("");
  const [grootte, setGrootte] = useState("");
  const [abonnement, setAbonnement] = useState<SubscriptionType>("Starter");
  const [analyseInput, setAnalyseInput] = useState("");
  const [analyseFiles, setAnalyseFiles] = useState<File[]>([]);
  const [wizardStatus, setWizardStatus] = useState("");

  async function reload() {
    const [orgs, sess, bench] = await Promise.all([
      api.listOrganizations(),
      api.listSessions(),
      api.datasetBenchmark("Zorg/GGZ"),
    ]);
    setOrganizations(orgs || []);
    setSessions(sess || []);
    setBenchmark(bench || { sector: "", totaal_cases: 0, dominante_problemen: [] });
  }

  useEffect(() => {
    void reload();
  }, []);

  async function runOnboarding() {
    const trimmedNaam = organisatieNaam.trim();
    const trimmedSector = sector.trim();
    const trimmedGrootte = grootte.trim();
    const trimmedInput = analyseInput.trim();
    if (!trimmedNaam || !trimmedSector || !trimmedGrootte || !trimmedInput) {
      setWizardStatus("Vul eerst organisatienaam, sector, organisatiegrootte en analyse-input in.");
      return;
    }

    setWizardStatus("Onboarding gestart...");
    try {
      const org = await api.upsertOrganization({
        organisatie_naam: trimmedNaam,
        sector: trimmedSector,
        organisatie_grootte: trimmedGrootte,
        abonnementstype: abonnement,
      });

      const analysis = await api.runAnalysis({
        organization_id: org.organization_id,
        input_data: [trimmedInput, await buildUploadContext(analyseFiles)].filter(Boolean).join("\n\n"),
        analysis_type: "Onboarding analyse",
        organization_name: String(org.organisatie_naam || trimmedNaam),
        sector: trimmedSector,
        organisatie_grootte: trimmedGrootte,
        abonnementstype: abonnement,
      });

      setWizardStatus(`Onboarding voltooid. Eerste rapport: ${formatReportCode(analysis.reportId)}`);
      await reload();
    } catch (error) {
      setWizardStatus(error instanceof Error ? error.message : "Onboarding mislukt.");
    }
  }

  const completed = sessions.filter((item) => isSessionCompleted(item?.status));
  const recentAnalyses = completed.slice(0, 4);
  const strategicAlerts = recentAnalyses.map((session) => ({
    id: session.session_id,
    title: session.organization_name || formatReportCode(session.session_id),
    summary: session.executive_summary || "Bestuurlijke samenvatting ontbreekt.",
    pressure: pressureLevel(session.executive_summary || session.board_memo || ""),
  }));
  const landscapePoints = useMemo(
    () =>
      recentAnalyses.slice(0, 3).map((session, index) => ({
        label: session.organization_name || `Analyse ${index + 1}`,
        x: 35 + index * 18,
        y: 38 + index * 12,
      })),
    [recentAnalyses]
  );

  return (
    <PageShell
      title="Strategic Decision Dashboard"
      subtitle="Boardroom command center voor strategische druk, besluiten, recente analyses en organisatie-overzicht."
    >
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7 space-y-6">
          <Panel title="Strategic Alerts">
            {!strategicAlerts.length ? (
              <EmptyState text="Nog geen strategische alerts beschikbaar. Start een analyse om boardroom-druk zichtbaar te maken." />
            ) : (
              <div className="space-y-4">
                {strategicAlerts.map((alert) => (
                  <article key={alert.id} className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-[18px] font-semibold text-white">{alert.title}</h3>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C9BFF]">
                        {alert.pressure}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">{alert.summary}</p>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Recent analyses">
            {!recentAnalyses.length ? (
              <EmptyState text="Nog geen voltooide analyses." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recentAnalyses.map((session) => (
                  <article key={session.session_id} className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{formatReportCode(session.session_id)}</p>
                    <h3 className="mt-2 text-[18px] font-semibold text-white">
                      {session.organization_name || "Onbekende organisatie"}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">
                      {session.executive_summary || "Samenvatting ontbreekt."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Panel title="Decision pressure">
            <div className="space-y-4">
              <DecisionPressureGauge
                label="Board pressure"
                level={pressureLevel(recentAnalyses[0]?.executive_summary || "")}
                hint={recentAnalyses[0]?.executive_summary || "Nog geen actuele board pressure beschikbaar."}
              />
              <DecisionPressureGauge
                label="Contractdruk"
                level={benchmark.dominante_problemen?.[0]?.probleemtype ? "MEDIUM" : "LOW"}
                hint={benchmark.dominante_problemen?.[0]?.probleemtype || "Nog geen benchmarksignaal beschikbaar."}
              />
            </div>
          </Panel>

          <StrategicLandscapeMap points={landscapePoints.length ? landscapePoints : [{ label: "Geen cases", x: 50, y: 50 }]} />

          <Panel title="Organisation overview">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Organisaties</p>
                <p className="mt-2 text-[28px] font-semibold text-white">{organizations.length}</p>
              </article>
              <article className="rounded-[12px] border border-white/[0.06] bg-[rgba(255,255,255,0.02)] p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Rapporten</p>
                <p className="mt-2 text-[28px] font-semibold text-white">{completed.length}</p>
              </article>
            </div>
          </Panel>
        </div>
      </section>

      <Panel title="Nieuwe analyse starten">
        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white" value={organisatieNaam} onChange={(e) => setOrganisatieNaam(e.target.value)} placeholder="Organisatienaam" />
          <input className="rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Sector" />
          <input className="rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white" value={grootte} onChange={(e) => setGrootte(e.target.value)} placeholder="Organisatiegrootte" />
        </div>
        <div className="mt-4">
          <select className="rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-white" value={abonnement} onChange={(e) => setAbonnement(e.target.value as SubscriptionType)}>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
        <textarea className="mt-4 min-h-[140px] w-full rounded-[12px] border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white" value={analyseInput} onChange={(e) => setAnalyseInput(e.target.value)} placeholder="Beschrijf de kerncontext, spanning en gewenste besluitvraag." />
        <div className="mt-4 rounded-[12px] border border-dashed border-white/[0.12] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Documenten uploaden</p>
          <input
            type="file"
            multiple
            className="mt-3 block w-full text-xs text-gray-200 file:mr-3 file:rounded-[12px] file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black"
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              if (!selected.length) return;
              setAnalyseFiles((prev) => {
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
          <p className="mt-2 text-xs text-slate-400">{analyseFiles.length} document(en) geselecteerd</p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="rounded-[12px] bg-white px-4 py-2 text-sm font-semibold text-black" onClick={() => void runOnboarding()}>
            Start onboarding + analyse
          </button>
          <span className="text-sm text-slate-400">{wizardStatus}</span>
        </div>
      </Panel>
    </PageShell>
  );
}
