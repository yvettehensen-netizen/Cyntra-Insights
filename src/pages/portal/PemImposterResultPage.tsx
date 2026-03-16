// ============================================================
// CYNTRA INSIGHTS — PEM IMPOSTER & IDENTITY RESULT
// Route: /portal/pem-imposter/result/:id
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Brain,
  Shield,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function PemImposterResultPage() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();

  const report = useMemo(() => {
    if (state) return state as any;
    if (!id) return null;
    try {
      const raw = sessionStorage.getItem(`pem_imposter_report_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [state, id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-white/60">
            Dit resultaat is niet meer beschikbaar (sessie verlopen).
          </p>
          <button
            onClick={() => nav("/portal/pem-imposter-scan")}
            className="px-6 py-3 rounded-xl border border-purple-400/60 text-purple-200 hover:bg-purple-400 hover:text-black transition"
          >
            Terug naar Imposter scan
          </button>
        </div>
      </div>
    );
  }

  const reportData = report?.report ?? report;
  const documentsSummary = reportData?.documents_summary ?? "";
  const documentsStorage = Array.isArray(reportData?.documents_storage)
    ? reportData.documents_storage
    : [];
  const documentsList = documentsStorage;

  const [signedDocuments, setSignedDocuments] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    async function buildSignedUrls() {
      if (!documentsList.length) {
        if (active) setSignedDocuments([]);
        return;
      }

      const signed = await Promise.all(
        documentsList.map(async (doc: any) => {
          if (!doc?.bucket || !doc?.path) {
            return { ...doc, signed_url: null };
          }

          const { data, error } = await supabase.storage
            .from(doc.bucket)
            .createSignedUrl(doc.path, 60 * 60 * 24);

          return {
            ...doc,
            signed_url: error ? null : data?.signedUrl ?? null,
          };
        })
      );

      if (active) setSignedDocuments(signed);
    }

    buildSignedUrls();
    return () => {
      active = false;
    };
  }, [documentsList]);

  const title =
    reportData?.scan_title ?? "PEM Imposter & Identity Scan";

  const summary =
    reportData?.summary ??
    reportData?.executive_summary ??
    reportData?.narrative ??
    "";

  const personalSources = asList(reportData?.personal_sources);
  const systemicSources = asList(reportData?.systemic_sources);
  const identityTensions = asList(reportData?.identity_tensions);
  const copingStrategies = asList(reportData?.coping_strategies);
  const systemicIng = asList(reportData?.systemic_ingangen);
  const transitionPath = asList(reportData?.transition_path);

  const epistemicDisplacement = reportData?.epistemic_displacement ?? "";
  const recognitionReframe = reportData?.recognition_reframe ?? "";
  const genderProfile = reportData?.gender_vulnerability_profile ?? {};
  const vrr = reportData?.vrr_profile ?? reportData?.vrr ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-14">
        <button
          onClick={() => nav("/portal/pem-imposter-scan")}
          className="flex items-center gap-2 text-white/40 hover:text-purple-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Nieuwe scan
        </button>

        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-300/70">
            {title}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-purple-200">
            Imposter & Identity Profiel
          </h1>
          {summary && (
            <div className="rounded-3xl border border-purple-900/40 bg-slate-900/60 p-8 text-white/80">
              {summary}
            </div>
          )}
        </header>

        {(documentsSummary || documentsList.length > 0) && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Documenten (samenvatting)
            </p>
            {documentsSummary ? (
              <div className="text-white/70 leading-relaxed whitespace-pre-wrap">
                {documentsSummary}
              </div>
            ) : (
              <p className="text-white/50 text-sm">
                {documentsList.length} documenten gekoppeld aan deze scan.
              </p>
            )}

            {documentsList.length > 0 && (
              <div className="space-y-2 pt-2">
                {(signedDocuments.length ? signedDocuments : documentsList).map(
                  (doc: any, idx: number) => (
                    <div key={`${doc?.path ?? idx}`} className="text-sm text-white/60">
                      {doc?.signed_url ? (
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-200 hover:underline"
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
          </section>
        )}

        <section className="grid md:grid-cols-3 gap-6">
          <InfoCard icon={Brain} title="Persoonlijke bronnen" items={personalSources} />
          <InfoCard icon={AlertTriangle} title="Systemische bronnen" items={systemicSources} />
          <InfoCard icon={HeartPulse} title="Identiteitsspanning" items={identityTensions} />
        </section>

        {epistemicDisplacement && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-purple-200">
                Epistemic displacement
              </h2>
            </div>
            <p className="text-white/70">
              {epistemicDisplacement}
            </p>
          </section>
        )}

        {genderProfile && (genderProfile.description || genderProfile.signals) && (
          <section className="rounded-3xl border border-purple-900/40 bg-slate-900/60 p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-purple-200">
                Gender vulnerability profiel
              </h2>
            </div>
            {genderProfile.description && (
              <p className="text-white/70">
                {genderProfile.description}
              </p>
            )}
            {genderProfile.signals && (
              <div className="space-y-2">
                {asList(genderProfile.signals).map((item, idx) => (
                  <div key={`${item}-${idx}`} className="text-white/70">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {vrr && (vrr.vulnerability || vrr.resilience || vrr.risk) && (
          <section className="rounded-3xl border border-purple-900/40 bg-slate-900/60 p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-purple-200">
                VRR-profiel
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <VrrBlock title="Kwetsbaarheid" data={vrr?.vulnerability} />
              <VrrBlock title="Veerkracht" data={vrr?.resilience} />
              <VrrBlock title="Risico" data={vrr?.risk} />
            </div>
            {vrr?.overall_message && (
              <p className="text-white/70">{vrr.overall_message}</p>
            )}
          </section>
        )}

        <section className="grid md:grid-cols-2 gap-6">
          <InfoCard icon={Shield} title="Coping-strategieën" items={copingStrategies} />
          <InfoCard icon={Sparkles} title="Systemische ingangen" items={systemicIng} />
        </section>

        {transitionPath.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-3">
            <h2 className="text-2xl font-semibold text-purple-200">
              Transitie: van coping naar collectieve verandering
            </h2>
            <div className="space-y-2">
              {transitionPath.map((item, idx) => (
                <div key={`${item}-${idx}`} className="text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {recognitionReframe && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-purple-200">
              Erkenning herdefiniëren
            </h2>
            <p className="text-white/70 mt-3">{recognitionReframe}</p>
          </section>
        )}

        <footer className="text-xs text-white/30">
          Deze scan is een strategische reflectie, geen klinische beoordeling.
        </footer>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  items,
}: {
  icon: any;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-purple-300" />
        <h3 className="text-lg font-semibold text-purple-200">{title}</h3>
      </div>
      {items.length > 0 ? (
        items.map((item, idx) => (
          <div key={`${item}-${idx}`} className="text-white/70">
            {item}
          </div>
        ))
      ) : (
        <p className="text-white/50 text-sm">Geen data beschikbaar.</p>
      )}
    </div>
  );
}

function VrrBlock({ title, data }: { title: string; data: any }) {
  const level = toScore(data?.level);
  return (
    <div className="rounded-2xl border border-purple-900/40 bg-slate-900/70 p-4 space-y-2">
      <p className="text-xs uppercase tracking-widest text-purple-300/70">
        {title}
      </p>
      <div className="text-2xl font-semibold text-purple-200">{level}/10</div>
      <p className="text-white/70 text-sm">
        {data?.text ?? "Geen toelichting beschikbaar."}
      </p>
    </div>
  );
}

function toScore(value: any): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(10, Math.round(parsed)));
}

function asList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeText(String(v))).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => sanitizeText(line.replace(/^\s*[-*•\d.)]+\s*/, "")))
      .filter(Boolean);
  }
  if (typeof value === "object") {
    return Object.values(value)
      .flatMap((v) => asList(v))
      .filter(Boolean);
  }
  return [sanitizeText(String(value))].filter(Boolean);
}

function sanitizeText(value: string): string {
  return value
    .replace(/\*+/g, "")
    .replace(/HGBCO/gi, "")
    .replace(/primary structural failure/gi, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[•]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}
