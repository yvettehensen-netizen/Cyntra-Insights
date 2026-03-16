import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Heart,
  AlertTriangle,
  Download,
} from "lucide-react";
import {
  getPemScanById,
  ACCENT_STYLES,
  isCoreFit,
} from "./pem/pemScanConfig";
import {
  asList,
  sanitizeList,
  sanitizeText,
  toScore,
  usePemReport,
  useSignedDocuments,
} from "./pem/pemResultUtils";
import { downloadPemFitsReport } from "./pem/downloadPemFitsReport";

function normalizeVrrEntry(entry: any) {
  if (!entry) return { score: null, text: "" };
  if (typeof entry === "number") {
    return { score: toScore(entry), text: "" };
  }
  if (typeof entry === "string") {
    return { score: null, text: sanitizeText(entry) };
  }
  if (typeof entry === "object") {
    const score = toScore(entry.level ?? entry.score ?? entry.value ?? 0);
    const text = sanitizeText(entry.text ?? entry.description ?? entry.summary ?? "");
    return { score: score || null, text };
  }
  return { score: null, text: "" };
}

function SectionCard({ title, children }: { title: string; children: any }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
      <h3 className="text-xl font-semibold text-white/80">{title}</h3>
      {children}
    </section>
  );
}

function RenderList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2 text-white/70">
      {items.map((item, idx) => (
        <li key={`${item}-${idx}`} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PemDynamicResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const scan = getPemScanById(scanId);
  const nav = useNavigate();

  const { report } = usePemReport(scan ? scan.storageKey : "pem_report");

  const reportData = report?.report ?? report ?? {};
  const documentsStorage = Array.isArray(reportData?.documents_storage)
    ? reportData.documents_storage
    : [];
  const signedDocuments = useSignedDocuments(documentsStorage);

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-white/60">Deze scan bestaat niet.</p>
          <button
            onClick={() => nav("/portal/fits")}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition"
          >
            Terug naar Cyntra Fits
          </button>
        </div>
      </div>
    );
  }

  if (!isCoreFit(scan.id)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Cyntra Fits
          </p>
          <h1 className="text-2xl font-semibold">
            Dit resultaat is gesloten
          </h1>
          <p className="text-sm text-white/60">
            Alleen de kernsuite is toegankelijk: VitalFit™, LeaderFit™ en
            TeamFit™.
          </p>
          <button
            onClick={() => nav("/portal/fits")}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition"
          >
            Terug naar Cyntra Fits
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-white/60">
            Dit resultaat is niet meer beschikbaar (sessie verlopen).
          </p>
          <button
            onClick={() => nav(`/portal/fits/${scan.id}`)}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/10 transition"
          >
            Terug naar scan
          </button>
        </div>
      </div>
    );
  }

  const accent = ACCENT_STYLES[scan.accent];

  const documentsSummary = sanitizeText(reportData?.documents_summary ?? "");
  const hasMeaningfulDocSummary =
    documentsSummary &&
    !/geen tekstextractie beschikbaar/i.test(documentsSummary) &&
    documentsSummary.length > 60;

  async function handleDownload() {
    try {
      await downloadPemFitsReport({
        report: reportData,
        scanLabel: scan.label,
        scanTagline: scan.tagline,
        accentKey: scan.accent,
      });
    } catch (err) {
      console.error("PDF export mislukt:", err);
    }
  }

  const summary = sanitizeText(
    reportData?.summary ??
      reportData?.executive_summary ??
      reportData?.narrative ??
      ""
  );

  const primarySignal = sanitizeText(
    reportData?.primary_signal ??
      reportData?.primary_structural_failure ??
      reportData?.primary_diagnosis ??
      reportData?.primary_failure ??
      ""
  );

  const failureText = sanitizeText(
    reportData?.failure ?? reportData?.failure_reason ?? reportData?.failure_message ?? ""
  );

  const keyInsights = sanitizeList(
    asList(reportData?.key_insights ?? reportData?.key_points ?? reportData?.highlights)
  );

  const positioning = sanitizeList(
    asList(
      reportData?.positioning_suggestions ??
        reportData?.positioning ??
        reportData?.positioning_directions
    )
  );

  const priorities = sanitizeList(
    asList(reportData?.top_priorities ?? reportData?.priorities ?? reportData?.focus_areas)
  );

  const shortTerm = sanitizeList(
    asList(reportData?.short_term_actions ?? reportData?.next_actions)
  );

  const longTerm = sanitizeList(
    asList(reportData?.long_term_actions ?? reportData?.longer_term_actions)
  );

  const layered = reportData?.layered_suffering ?? reportData?.layered_tensions ?? {};
  const layeredPsych = sanitizeText(layered?.psychological ?? layered?.psych ?? "");
  const layeredExistential = sanitizeText(layered?.existential ?? "");
  const layeredSystemic = sanitizeText(layered?.systemic ?? "");

  const vrr = reportData?.vrr_analysis ?? reportData?.vrr ?? {};
  const vrrVulnerability = normalizeVrrEntry(
    vrr?.vulnerability ?? vrr?.Vulnerability
  );
  const vrrResilience = normalizeVrrEntry(
    vrr?.resilience ?? vrr?.Resilience
  );
  const vrrRisk = normalizeVrrEntry(vrr?.risk ?? vrr?.Risk);

  const sections = reportData?.sections ?? null;
  const sectionEntries = sections && typeof sections === "object"
    ? Object.entries(sections)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => nav(`/portal/fits/${scan.id}`)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Nieuwe scan
          </button>

          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 border text-sm transition ${accent.button}`}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>

        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {scan.tagline}
          </p>
          <h1 className={`text-4xl md:text-5xl font-semibold ${accent.accentTextStrong}`}>
            {scan.resultTitle}
          </h1>
          {summary && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/80">
              {summary}
            </div>
          )}
        </header>

        {failureText && (
          <SectionCard title="Bestuurlijke blokkade">
            <p className="text-white/70">{failureText}</p>
          </SectionCard>
        )}

        {primarySignal && (
          <SectionCard title="Kernsignaal">
            <p className="text-white/70 leading-relaxed">{primarySignal}</p>
          </SectionCard>
        )}

        {keyInsights.length > 0 && (
          <SectionCard title="Kerninzichten">
            <RenderList items={keyInsights} />
          </SectionCard>
        )}

        <section className="grid md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="h-4 w-4" />
              Vulnerability
            </div>
            {vrrVulnerability.score !== null && (
              <div className={`text-3xl font-semibold ${accent.accentTextStrong}`}>
                {vrrVulnerability.score}/10
              </div>
            )}
            {vrrVulnerability.text && (
              <p className="text-white/60">{vrrVulnerability.text}</p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center gap-2 text-white/70">
              <Heart className="h-4 w-4" />
              Resilience
            </div>
            {vrrResilience.score !== null && (
              <div className={`text-3xl font-semibold ${accent.accentTextStrong}`}>
                {vrrResilience.score}/10
              </div>
            )}
            {vrrResilience.text && (
              <p className="text-white/60">{vrrResilience.text}</p>
            )}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center gap-2 text-white/70">
              <AlertTriangle className="h-4 w-4" />
              Risk
            </div>
            {vrrRisk.score !== null && (
              <div className={`text-3xl font-semibold ${accent.accentTextStrong}`}>
                {vrrRisk.score}/10
              </div>
            )}
            {vrrRisk.text && (
              <p className="text-white/60">{vrrRisk.text}</p>
            )}
          </div>
        </section>

        {(layeredPsych || layeredExistential || layeredSystemic) && (
          <section className="grid md:grid-cols-3 gap-6">
            {layeredPsych && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
                <h4 className="text-sm uppercase tracking-widest text-white/50">
                  Psychologisch
                </h4>
                <p className="text-white/70">{layeredPsych}</p>
              </div>
            )}
            {layeredExistential && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
                <h4 className="text-sm uppercase tracking-widest text-white/50">
                  Existentieel
                </h4>
                <p className="text-white/70">{layeredExistential}</p>
              </div>
            )}
            {layeredSystemic && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
                <h4 className="text-sm uppercase tracking-widest text-white/50">
                  Systemisch
                </h4>
                <p className="text-white/70">{layeredSystemic}</p>
              </div>
            )}
          </section>
        )}

        {priorities.length > 0 && (
          <SectionCard title="Topprioriteiten (90 dagen)">
            <RenderList items={priorities} />
          </SectionCard>
        )}

        {positioning.length > 0 && (
          <SectionCard title="Positionering & koers">
            <RenderList items={positioning} />
          </SectionCard>
        )}

        {(shortTerm.length > 0 || longTerm.length > 0) && (
          <SectionCard title="Interventies (acties)">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-white/50 mb-3">
                  Korte termijn
                </h4>
                <RenderList items={shortTerm} />
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-widest text-white/50 mb-3">
                  Lange termijn
                </h4>
                <RenderList items={longTerm} />
              </div>
            </div>
          </SectionCard>
        )}

        {(hasMeaningfulDocSummary || documentsStorage.length > 0) && (
          <SectionCard title="Documenten">
            {hasMeaningfulDocSummary && (
              <div className="text-white/70 whitespace-pre-wrap">
                {documentsSummary}
              </div>
            )}

            {documentsStorage.length > 0 && (
              <div className={`${hasMeaningfulDocSummary ? "pt-4" : ""} space-y-2`}>
                {(signedDocuments.length ? signedDocuments : documentsStorage).map(
                  (doc: any, idx: number) => (
                    <div key={`${doc?.path ?? idx}`} className="text-sm text-white/60">
                      {doc?.signed_url ? (
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white/80 hover:underline"
                        >
                          {doc?.name ?? `Document ${idx + 1}`}
                        </a>
                      ) : (
                        <span>{doc?.name ?? `Document ${idx + 1}`}</span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </SectionCard>
        )}

        {sectionEntries.length > 0 && (
          <SectionCard title="Verdieping">
            <div className="space-y-6">
              {sectionEntries.map(([key, section]) => {
                const title = sanitizeText(
                  section?.title ?? key.replace(/_/g, " ")
                );
                const content = section?.content ?? "";
                const contentText = sanitizeText(
                  Array.isArray(content) ? content.join(" ") : String(content)
                );
                return (
                  <div key={key} className="space-y-2">
                    <h4 className="text-white/80 font-semibold">{title}</h4>
                    <p className="text-white/60 leading-relaxed">
                      {contentText}
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
