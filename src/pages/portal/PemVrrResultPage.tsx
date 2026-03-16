// ============================================================
// CYNTRA INSIGHTS — PEM-VRR EMPLOYABILITY RESULT
// Route: /portal/pem-vrr/result/:id
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Scale,
  Shield,
  TrendingUp,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function PemVrrResultPage() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();

  const report = useMemo(() => {
    if (state) return state as any;
    if (!id) return null;
    try {
      const raw = sessionStorage.getItem(`pem_vrr_report_${id}`);
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
            onClick={() => nav("/portal/pem-vrr-scan")}
            className="px-6 py-3 rounded-xl border border-teal-400/60 text-teal-200 hover:bg-teal-400 hover:text-black transition"
          >
            Terug naar VitalFit scan
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
    reportData?.scan_title ??
    "Cyntra VitalFit™ — Employability Scan";

  const summary =
    reportData?.summary ??
    reportData?.executive_summary ??
    reportData?.narrative ??
    "";

  const personal = reportData?.personal_relevance ?? {};
  const economic = reportData?.economic_relevance ?? {};
  const alignment = reportData?.alignment ?? {};
  const relevanceMatrix = reportData?.relevance_matrix ?? {};
  const vrr = reportData?.vrr_analysis ?? reportData?.vrr ?? {};

  const personalScore = toScore(personal?.score);
  const economicScore = toScore(economic?.score);
  const matchLevel =
    alignment?.match_level ??
    computeMatchLevel(personalScore, economicScore);

  const matrixQuadrant =
    relevanceMatrix?.quadrant ??
    computeQuadrant(personalScore, economicScore);

  const positioningSuggestions = asList(reportData?.positioning_suggestions);
  const shortTerm = asList(reportData?.short_term_actions);
  const longTerm = asList(reportData?.long_term_actions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-14">
        <button
          onClick={() => nav("/portal/pem-vrr-scan")}
          className="flex items-center gap-2 text-white/40 hover:text-teal-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Nieuwe scan
        </button>

        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-300/70">
            {title}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-teal-200">
            VitalFit™ Profiel
          </h1>
          {summary && (
            <div className="rounded-3xl border border-teal-900/40 bg-slate-900/60 p-8 text-white/80">
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
                          className="text-teal-200 hover:underline"
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
          <ScoreCard
            icon={Heart}
            title="Persoonlijke relevantie"
            score={personalScore}
            description={personal?.description}
            accents="text-teal-300"
          />
          <ScoreCard
            icon={Scale}
            title="Economische relevantie"
            score={economicScore}
            description={economic?.description}
            accents="text-teal-300"
          />
          <div className="rounded-3xl border border-teal-900/40 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-teal-300" />
              <h3 className="text-lg font-semibold text-teal-200">
                Alignment
              </h3>
            </div>
            <div className="text-3xl font-semibold text-teal-200">
              {String(matchLevel).toUpperCase()}
            </div>
            <p className="text-white/70 text-sm">
              {alignment?.tension_description ?? "Geen alignment-samenvatting beschikbaar."}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-teal-900/40 bg-slate-900/60 p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-teal-300" />
            <h2 className="text-2xl font-semibold text-teal-200">
              Relevantie ↔ Economische matrix
            </h2>
          </div>
          <p className="text-white/70">
            Quadrant: <span className="text-teal-200">{matrixQuadrant}</span>
          </p>
          <p className="text-white/70">
            {relevanceMatrix?.interpretation ?? "Geen matrix-interpretatie beschikbaar."}
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-teal-300" />
            <h2 className="text-2xl font-semibold text-teal-200">
              VRR-driehoek
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <VrrCard
              title="Kwetsbaarheid"
              level={toScore(vrr?.vulnerability?.level)}
              text={vrr?.vulnerability?.text}
              tone="text-rose-300"
              border="border-rose-700/40"
              background="from-rose-950/60"
            />
            <VrrCard
              title="Veerkracht"
              level={toScore(vrr?.resilience?.level)}
              text={vrr?.resilience?.text}
              tone="text-teal-300"
              border="border-teal-700/40"
              background="from-teal-950/60"
            />
            <VrrCard
              title="Risico"
              level={toScore(vrr?.risk?.level)}
              text={vrr?.risk?.text}
              tone="text-amber-300"
              border="border-amber-700/40"
              background="from-amber-950/60"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            {vrr?.overall_message ?? "Geen VRR-samenvatting beschikbaar."}
          </div>
        </section>

        {positioningSuggestions.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-teal-200">
              Suggesties voor betekenisvolle positionering
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {positioningSuggestions.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  className="rounded-2xl border border-teal-900/40 bg-slate-900/60 p-5 text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {(shortTerm.length > 0 || longTerm.length > 0) && (
          <section className="grid md:grid-cols-2 gap-6">
            <ActionList title="Korte termijn (0-6 maanden)" items={shortTerm} />
            <ActionList title="Lange termijn (6+ maanden)" items={longTerm} />
          </section>
        )}

        <footer className="text-xs text-white/30">
          Deze scan is een strategische reflectie, geen klinische beoordeling.
        </footer>
      </div>
    </div>
  );
}

function ScoreCard({
  icon: Icon,
  title,
  score,
  description,
  accents,
}: {
  icon: any;
  title: string;
  score: number;
  description?: string;
  accents?: string;
}) {
  return (
    <div className="rounded-3xl border border-teal-900/40 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 ${accents ?? "text-teal-300"}`} />
        <h3 className="text-lg font-semibold text-teal-200">{title}</h3>
      </div>
      <div className="text-3xl font-semibold text-teal-200">
        {score}/10
      </div>
      <p className="text-white/70 text-sm">
        {description ?? "Geen toelichting beschikbaar."}
      </p>
    </div>
  );
}

function VrrCard({
  title,
  level,
  text,
  tone,
  border,
  background,
}: {
  title: string;
  level: number;
  text?: string;
  tone: string;
  border: string;
  background: string;
}) {
  return (
    <div
      className={`rounded-3xl border ${border} bg-gradient-to-b ${background} to-slate-950 p-6 space-y-4`}
    >
      <h3 className={`text-lg font-semibold ${tone}`}>{title}</h3>
      <div className={`text-3xl font-semibold ${tone}`}>{level}/10</div>
      <p className="text-white/70 text-sm">
        {text ?? "Geen toelichting beschikbaar."}
      </p>
    </div>
  );
}

function ActionList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/50">
        {title}: Geen acties beschikbaar.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
      <h3 className="text-lg font-semibold text-teal-200">{title}</h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={`${item}-${idx}`} className="text-white/70">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function toScore(value: any): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(10, Math.round(parsed)));
}

function computeMatchLevel(personal: number, economic: number) {
  if (personal >= 7 && economic >= 7) return "hoog";
  if (personal >= 4 && economic >= 4) return "matig";
  return "laag";
}

function computeQuadrant(personal: number, economic: number) {
  const personalHigh = personal >= 7;
  const economicHigh = economic >= 7;
  if (personalHigh && economicHigh) return "Hoog/Hoog";
  if (personalHigh && !economicHigh) return "Hoog/Laag";
  if (!personalHigh && economicHigh) return "Laag/Hoog";
  return "Laag/Laag";
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
