// ============================================================
// ✅ CYNTRA ZORGKAART™ — PORTAL VIEW (ADD ONLY)
// Route: /portal/zorgkaart/:id
// Purpose: Sector Lens on existing Aurelius analysis output (Health)
// Crash-proof: tries multiple payload fields
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldAlert, FileText, AlertCircle } from "lucide-react";

import { supabase } from "../../lib/supabaseClient";

type AnalysisRow = {
  id: string;
  analysis_type?: string | null;
  created_at?: string | null;
  risk_score?: number | null;

  // payload fields can differ per project — we try all safely
  result?: any;
  report?: any;
  output?: any;
  payload?: any;
  data?: any;
};

function pickPayload(row: AnalysisRow): any | null {
  // Prefer most likely shapes first
  const candidates = [
    row.result,
    row.report,
    row.output,
    row.payload,
    row.data,
  ];

  for (const c of candidates) {
    if (!c) continue;
    // if it's a string JSON, try parse
    if (typeof c === "string") {
      try {
        const parsed = JSON.parse(c);
        if (parsed) return parsed;
      } catch {
        // if it is a long text report, return as-is
        if (c.trim().length > 0) return { text: c };
      }
    }
    return c;
  }
  return null;
}

// Try to extract "sections" regardless of exact schema
function normalizeSections(payload: any): Array<{ title: string; content: string }> {
  if (!payload) return [];

  // Common formats:
  // 1) { sections: { key: {title, content}} }
  // 2) { sections: [{title, content}] }
  // 3) { text: "..." } (fallback)
  const s = payload.sections;

  if (Array.isArray(s)) {
    return s
      .map((x: any) => ({
        title: String(x?.title ?? "Sectie"),
        content: String(x?.content ?? x?.text ?? ""),
      }))
      .filter((x) => x.content.trim().length > 0);
  }

  if (s && typeof s === "object") {
    return Object.values(s)
      .map((x: any) => ({
        title: String(x?.title ?? "Sectie"),
        content: String(x?.content ?? x?.text ?? ""),
      }))
      .filter((x) => x.content.trim().length > 0);
  }

  if (typeof payload.text === "string" && payload.text.trim().length > 0) {
    return [{ title: "Boardroom Output", content: payload.text }];
  }

  return [];
}

/**
 * Zorgkaart Lens:
 * We tonen (1) besluitfrictie, (2) governance risico, (3) spanningen/onderstroom.
 * Omdat schema's verschillen, filteren we op keywords in sections/content.
 */
function isHealthcareRelevant(text: string) {
  const t = text.toLowerCase();
  const keywords = [
    "zorg",
    "ziekenhuis",
    "ggz",
    "verpleeg",
    "artsen",
    "medisch",
    "patiënt",
    "kwaliteit",
    "inspectie",
    "nza",
    "verzekeraar",
  ];
  return keywords.some((k) => t.includes(k));
}

function scoreSectionForZorgLens(title: string, content: string) {
  const t = (title + "\n" + content).toLowerCase();

  const signals = [
    { k: ["governance", "bestuur", "rvc", "toezicht"], w: 4 },
    { k: ["besluit", "decision", "mandaat", "eigenaarschap", "ownership"], w: 4 },
    { k: ["onderstroom", "spann", "frictie", "conflict", "politiek"], w: 3 },
    { k: ["risico", "risk", "compliance", "audit"], w: 3 },
    { k: ["proces", "overdracht", "triage", "capaciteit"], w: 2 },
    { k: ["kwaliteit", "veiligheid", "incident"], w: 2 },
    { k: ["kosten", "budget", "bezetting", "productie"], w: 2 },
  ];

  let score = 0;
  for (const s of signals) {
    if (s.k.some((x) => t.includes(x))) score += s.w;
  }
  if (isHealthcareRelevant(t)) score += 2;

  return score;
}

export default function ZorgKaartPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const [row, setRow] = useState<AnalysisRow | null>(null);
  const [payload, setPayload] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setErr(null);

      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*")
          .eq("id", id)
          .single<AnalysisRow>();

        if (error) throw error;
        if (!data) throw new Error("Analyse niet gevonden.");

        const p = pickPayload(data);
        if (!p) throw new Error("Geen analyse-output gevonden (payload leeg).");

        setRow(data);
        setPayload(p);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Kon Zorgkaart niet laden.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!id) return <Navigate to="/portal/dashboard" replace />;

  const sections = useMemo(() => normalizeSections(payload), [payload]);

  const zorgSections = useMemo(() => {
    if (sections.length === 0) return [];

    // pick the highest-scoring sections for a Zorgkaart lens
    const scored = sections
      .map((s) => ({
        ...s,
        _score: scoreSectionForZorgLens(s.title, s.content),
      }))
      .sort((a, b) => b._score - a._score);

    // If nothing matches, still show something (never empty screen)
    const top = scored.filter((x) => x._score > 0).slice(0, 8);
    return top.length > 0 ? top : scored.slice(0, 6);
  }, [sections]);

  const title = useMemo(() => {
    const pTitle =
      payload?.title ??
      payload?.report_title ??
      payload?.name ??
      "Zorgkaart™ — Besluitstructuur Diagnose";
    return String(pTitle);
  }, [payload]);

  const executive = useMemo(() => {
    const v =
      payload?.executive_snapshot ??
      payload?.executive_summary ??
      payload?.executiveSummary ??
      payload?.summary ??
      "";
    return String(v);
  }, [payload]);

  const createdAt = row?.created_at
    ? new Date(row.created_at).toLocaleString("nl-NL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-black text-white px-10 py-24">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* BACK */}
        <button
          onClick={() => nav("/portal/dashboard")}
          className="flex items-center gap-2 text-white/30 hover:text-[#d4af37] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </button>

        {/* HEADER */}
        <header className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Cyntra Zorgkaart™ — Portal Lens (Zorg)
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-[#d4af37] leading-tight">
            {title}
          </h1>

          {createdAt && (
            <p className="text-xs uppercase tracking-widest text-white/25">
              gegenereerd: {createdAt}
              {row?.analysis_type ? ` • type: ${row.analysis_type}` : ""}
              {typeof row?.risk_score === "number"
                ? ` • risk: ${row.risk_score}%`
                : ""}
            </p>
          )}

          {executive && executive.trim().length > 0 && (
            <p className="text-white/55 max-w-4xl leading-relaxed text-lg">
              {executive}
            </p>
          )}
        </header>

        {/* STATE */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-white/40">
            Laden…
          </div>
        )}

        {err && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10">
            <div className="flex items-center gap-3 text-red-300">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm uppercase tracking-widest">{err}</p>
            </div>

            <p className="mt-6 text-white/40 text-sm">
              Tip: controleer of jouw <code>analyses</code>-tabel een kolom bevat
              zoals <code>result</code> / <code>report</code> /{" "}
              <code>output</code>. Deze pagina probeert meerdere velden.
            </p>
          </div>
        )}

        {/* CORE */}
        {!loading && !err && (
          <>
            {/* LENS BADGES */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <ShieldAlert className="h-6 w-6 text-[#d4af37]" />
                <p className="mt-4 text-xs uppercase tracking-widest text-white/25">
                  Besluitfrictie
                </p>
                <p className="mt-2 text-white/50 text-sm leading-relaxed">
                  Waar besluiten stagneren tussen bestuur, MT en uitvoering.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <FileText className="h-6 w-6 text-[#d4af37]" />
                <p className="mt-4 text-xs uppercase tracking-widest text-white/25">
                  Governance-risico
                </p>
                <p className="mt-2 text-white/50 text-sm leading-relaxed">
                  Waar eigenaarschap verdampt en beslissingen onomkeerbaar worden.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <ShieldAlert className="h-6 w-6 text-[#d4af37]" />
                <p className="mt-4 text-xs uppercase tracking-widest text-white/25">
                  Onderstroom & spanning
                </p>
                <p className="mt-2 text-white/50 text-sm leading-relaxed">
                  Spanningen die zorg-specifieke besluitvorming blokkeren.
                </p>
              </div>
            </section>

            {/* SECTIONS */}
            <section className="space-y-10 pt-6">
              <h2 className="text-xs uppercase tracking-[0.35em] text-white/25">
                Zorgkaart Output (Lens)
              </h2>

              {zorgSections.map((s, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/5 p-10"
                >
                  <h3 className="text-sm uppercase tracking-widest text-[#d4af37]">
                    {s.title}
                  </h3>

                  <div className="mt-6 whitespace-pre-line text-white/70 leading-relaxed max-w-5xl">
                    {s.content}
                  </div>
                </div>
              ))}
            </section>

            {/* OPTIONAL: show full raw output fallback */}
            {payload?.text && (
              <section className="pt-12 border-t border-white/10">
                <details className="rounded-3xl border border-white/10 bg-black/40 p-8">
                  <summary className="cursor-pointer text-xs uppercase tracking-widest text-white/30">
                    Toon volledige ruwe output
                  </summary>
                  <div className="mt-6 whitespace-pre-line text-white/60 leading-relaxed">
                    {String(payload.text)}
                  </div>
                </details>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
