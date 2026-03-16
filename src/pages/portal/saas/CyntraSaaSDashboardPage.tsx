import { useEffect, useState } from "react";
import type { SubscriptionType } from "@/platform";
import { EmptyState, PageShell, Panel } from "./ui";
import { usePlatformApiBridge } from "./usePlatformApiBridge";
import { formatReportCode } from "./reportIdentity";
import { isSessionCompleted } from "@/platform/types";

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
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
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
  const parts = await Promise.all(
    files.map(async (file) => {
      const looksTextual =
        file.type.startsWith("text/") ||
        /\.(txt|md|csv|json|xml|html)$/i.test(file.name);
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
      const message = error instanceof Error ? error.message : "Onboarding mislukt.";
      setWizardStatus(message);
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  }

  const completed = sessions.filter((item) => isSessionCompleted(item?.status));

  return (
    <PageShell title="Cyntra Strategisch Analyseplatform" subtitle="SaaS-overzicht voor organisaties: analyses, rapporten, strategische inzichten en sectorbenchmark.">
      <div className="grid gap-4 md:grid-cols-4">
        <Panel title="Organisaties"><p className="text-2xl font-semibold text-white">{organizations.length}</p></Panel>
        <Panel title="Analyses"><p className="text-2xl font-semibold text-white">{sessions.length}</p></Panel>
        <Panel title="Rapporten"><p className="text-2xl font-semibold text-white">{completed.length}</p></Panel>
        <Panel title="Dataset records"><p className="text-2xl font-semibold text-white">{benchmark.totaal_cases || 0}</p></Panel>
      </div>

      <Panel title="Strategische inzichten">
        {!completed.length ? <EmptyState text="Nog geen voltooide analyses. Start via Strategische analyse." /> : (
          <ul className="space-y-2 text-sm text-gray-200">{completed.slice(0, 5).map((session) => <li key={session.session_id} className="rounded-lg border border-white/10 px-3 py-2"><strong>{formatReportCode(session.session_id)}</strong>: {session.executive_summary || "Samenvatting ontbreekt."}</li>)}</ul>
        )}
      </Panel>

      <Panel title="SaaS onboarding wizard">
        <ol className="space-y-4 text-sm text-gray-200">
          <li className="rounded-xl border border-white/10 bg-black/20 p-4"><strong>Stap 1: Organisatieprofiel</strong><div className="mt-2 grid gap-3 md:grid-cols-3"><input className="rounded-lg border border-white/20 bg-black/20 p-2" value={organisatieNaam} onChange={(e) => setOrganisatieNaam(e.target.value)} placeholder="Organisatienaam" /><input className="rounded-lg border border-white/20 bg-black/20 p-2" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Sector" /><input className="rounded-lg border border-white/20 bg-black/20 p-2" value={grootte} onChange={(e) => setGrootte(e.target.value)} placeholder="Organisatiegrootte" /></div></li>
          <li className="rounded-xl border border-white/10 bg-black/20 p-4"><strong>Stap 2: Abonnement</strong><div className="mt-2"><select className="rounded-lg border border-white/20 bg-black/20 p-2" value={abonnement} onChange={(e) => setAbonnement(e.target.value as SubscriptionType)}><option value="Starter">Starter (3 analyses/maand)</option><option value="Professional">Professional (10 analyses/maand)</option><option value="Enterprise">Enterprise (onbeperkt)</option></select></div></li>
          <li className="rounded-xl border border-white/10 bg-black/20 p-4">
            <strong>Stap 3: Eerste analyse starten</strong>
            <textarea className="mt-2 min-h-[120px] w-full rounded-lg border border-white/20 bg-black/20 p-2" value={analyseInput} onChange={(e) => setAnalyseInput(e.target.value)} placeholder="Beschrijf de kerncontext en strategische spanning." />
            <div className="mt-3 rounded-lg border border-dashed border-white/20 p-3">
              <p className="text-xs text-gray-300">Documenten uploaden (optioneel)</p>
              <input
                type="file"
                multiple
                className="mt-2 block w-full text-xs text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
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
              <p className="mt-2 text-xs text-gray-300">{analyseFiles.length} document{analyseFiles.length === 1 ? "" : "en"} geselecteerd</p>
              {analyseFiles.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {analyseFiles.map((file) => (
                    <li key={`${file.name}:${file.size}:${file.lastModified}`} className="flex items-center justify-between rounded border border-white/10 px-2 py-1 text-xs text-gray-200">
                      <span className="truncate pr-3">{file.name} ({formatFileSize(file.size)})</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAnalyseFiles((prev) =>
                            prev.filter((f) => `${f.name}:${f.size}:${f.lastModified}` !== `${file.name}:${file.size}:${file.lastModified}`)
                          )
                        }
                        className="rounded border border-white/20 px-2 py-0.5 text-xs text-white"
                      >
                        Verwijder
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3"><button className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black" onClick={() => void runOnboarding()}>Start onboarding + analyse</button><span className="text-xs text-gray-300">{wizardStatus}</span></div>
          </li>
        </ol>
      </Panel>

      <Panel title="SECTOR BENCHMARK">
        <p className="text-sm text-gray-200">Sector: {benchmark.sector}</p>
        <p className="mt-2 text-sm text-gray-200">Totaal cases: {benchmark.totaal_cases}</p>
        <p className="mt-2 text-sm text-gray-200">Topprobleem: {benchmark.dominante_problemen?.[0]?.probleemtype || "Nog geen data"}</p>
      </Panel>
    </PageShell>
  );
}
