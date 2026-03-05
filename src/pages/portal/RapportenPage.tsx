// ============================================================
// src/pages/portal/RapportenPage.tsx
// AURELIUS — HGBCO REPORT VAULT (FINAL CANON)
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import BackToDashboard from "@/components/navigation/BackToDashboard";
import {
  getReports as getStoredReports,
} from "@/aurelius/storage/ReportRepository";
import type { StoredReport } from "@/aurelius/models/StoredReport";
import { usePlatformApiBridge } from "./saas/usePlatformApiBridge";

import {
  ArrowLeft,
  Target,
  ShieldAlert,
  Activity,
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";

/* =====================
   TYPES
===================== */

interface Analysis {
  id: string;
  company_name?: string;
  created_at: string;
  status: string;
  summary?: string;

  /** Full report JSON */
  content?: any;
}

/* =====================
   COMPONENT
===================== */

export default function RapportenPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const api = usePlatformApiBridge();

  const [items, setItems] = useState<Analysis[]>([]);
  const [storedReports, setStoredReports] = useState<StoredReport[]>([]);
  const [platformSessions, setPlatformSessions] = useState<any[]>([]);
  const [active, setActive] = useState<Analysis | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const [stored, sessions] = await Promise.all([
      getStoredReports(),
      api.listSessions().catch(() => []),
    ]);
    setStoredReports(stored);
    setPlatformSessions((sessions || []).filter((row: any) => row?.status === "voltooid"));

    if (id) {
      const { data } = await supabase.from("analyses").select("*").eq("id", id).single();
      setActive(data ?? null);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data ?? []);
    } catch {
      setItems([]);
    }

    setActive(null);
    setLoading(false);
  }

  /* ============================================================
     DETAIL VIEW — HGBCO + DECISION SYNTHESIS
  ============================================================ */

  if (id && active) {
    const hgbco = active.content?.hgbco ?? null;

    const interventions = Array.isArray(active.content?.interventions)
      ? active.content.interventions
      : [];

    const decisionCard =
      active.content?.decision_card ||
      active.content?.decisionCard ||
      active.content?.decision_synthesis ||
      null;

    const companyName =
      active.company_name ||
      active.content?.company ||
      active.content?.organisation ||
      active.content?.organisatie ||
      "Onbenoemde organisatie";

    const asText = (v: unknown): string =>
      typeof v === "string" ? v : JSON.stringify(v ?? "", null, 2);

    return (
      <div className="cyntra-shell max-w-6xl rounded-3xl p-8 space-y-14">
        <BackToDashboard />
        {/* BACK */}
        <button
          onClick={() => navigate("/portal/rapporten")}
          className="flex items-center gap-2 text-cyntra-secondary hover:text-cyntra-gold"
        >
          <ArrowLeft size={18} /> Terug naar vault
        </button>

        {/* HEADER */}
        <header className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.45em] text-cyntra-secondary">
            Aurelius Report Vault — Boardroom Decision Output
          </p>

          <h1 className="text-5xl font-semibold text-cyntra-gold">
            {companyName}
          </h1>

          <p className="text-cyntra-secondary max-w-3xl leading-relaxed">
            Dit is geen rapport. Dit is een bestuurlijke besluitkaart.
          </p>

          {/* ADD ONLY — OPEN IN ENGINE */}
          <button
            onClick={() =>
              navigate(
                `/portal/analyse/${
                  active.content?.analysis_type || "strategy"
                }`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 px-6 py-3 text-cyntra-gold hover:bg-[#D4AF37]/10"
          >
            Open analyse in engine
          </button>
        </header>

        {/* ================= HGBCO ================= */}
        {hgbco && (
          <section className="cyntra-panel rounded-3xl p-10 space-y-10">
            <div className="flex items-center gap-3">
              <Target className="text-[#D4AF37]" />
              <h2 className="text-3xl font-semibold text-cyntra-gold normal-case">
                HGBCO Besluitkaart
              </h2>
            </div>

            <HGBCOBlock label="H — Huidige realiteit" value={asText(hgbco.H)} />
            <HGBCOBlock label="G — Governance failure" value={asText(hgbco.G)} />

            <HGBCOList
              label="B — Structurele belemmeringen"
              items={Array.isArray(hgbco.B) ? hgbco.B : []}
              icon={<ShieldAlert className="h-4 w-4 text-red-400" />}
            />

            <HGBCOList
              label="C — Closure-interventies"
              items={Array.isArray(hgbco.C) ? hgbco.C : []}
              icon={<Activity className="h-4 w-4 text-blue-400" />}
            />

            <HGBCOBlock
              label="O — Outcome na closure"
              value={asText(hgbco.O)}
              accent="green"
            />
          </section>
        )}

        {/* ================= DECISION SYNTHESIS ================= */}
        {decisionCard && (
          <section className="cyntra-panel rounded-3xl p-10 space-y-6">
            <h2 className="text-3xl font-semibold text-cyntra-gold normal-case">
              Bestuurlijke beslissynthese
            </h2>

            {decisionCard.executive_thesis && (
              <p className="text-cyntra-primary">
                <strong>These:</strong>{" "}
                {decisionCard.executive_thesis}
              </p>
            )}

            {decisionCard.central_tension && (
              <p className="text-cyntra-secondary">
                <strong>Centrale spanning:</strong>{" "}
                {decisionCard.central_tension}
              </p>
            )}

            {typeof decisionCard.confidence_level === "number" && (
              <p className="text-cyntra-secondary">
                Besluitzekerheid: {decisionCard.confidence_level}%
              </p>
            )}

            {decisionCard.irreversibility_deadline && (
              <p className="text-red-400">
                Onomkeerbaar na:{" "}
                {decisionCard.irreversibility_deadline}
              </p>
            )}
          </section>
        )}

        {/* ================= INTERVENTIES ================= */}
        {interventions.length > 0 && (
          <section className="cyntra-panel rounded-3xl p-10 space-y-8">
            <h2 className="text-3xl font-semibold text-cyntra-gold normal-case">
              Closure-interventies
            </h2>

            {interventions.map((x: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border divider-cyntra bg-cyntra-card p-8"
              >
                <h3 className="text-xl font-semibold text-cyntra-primary normal-case">
                  {x.title ?? `Interventie ${idx + 1}`}
                </h3>
                {x.why && (
                  <p className="text-cyntra-secondary mt-2">{x.why}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ================= RAW JSON ================= */}
        <details className="rounded-2xl border divider-cyntra bg-cyntra-card p-8 text-sm text-cyntra-secondary">
          <summary className="cursor-pointer text-cyntra-gold font-medium">
            Toon ruwe engine output (debug)
          </summary>
          <pre className="mt-6 whitespace-pre-wrap">
            {JSON.stringify(active.content, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  /* ============================================================
     LIST VIEW
  ============================================================ */

  const filtered = items.filter(
    (x) =>
      !search ||
      x.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cyntra-shell max-w-7xl rounded-3xl p-8 space-y-12">
      <BackToDashboard />
      <h1 className="text-4xl font-semibold text-cyntra-gold">
        Rapport Vault
      </h1>

      {!!storedReports.length && (
        <section className="rounded-2xl border divider-cyntra bg-cyntra-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold text-cyntra-primary normal-case">
            Opgeslagen rapporten
          </h2>
          <div className="space-y-3">
            {storedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border divider-cyntra bg-cyntra-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-cyntra-primary font-semibold">{report.title}</p>
                    <p className="text-xs text-cyntra-secondary">
                      {new Date(report.date).toLocaleString("nl-NL")} · BALI {report.baliScore.toFixed(2)} · Betrouwbaarheid {report.betrouwbaarheid.toFixed(1)}
                    </p>
                    <p className="text-xs text-cyntra-secondary">
                      Status: {report.interventionStatus}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (report.analysisId) {
                          navigate(`/portal/rapporten/${encodeURIComponent(report.analysisId)}`);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border divider-cyntra px-3 py-2 text-xs text-cyntra-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Bekijk
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (report.pdfUrl) window.open(report.pdfUrl, "_blank", "noopener,noreferrer");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D4AF37]/40 px-3 py-2 text-xs text-cyntra-gold"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          report.analysisRoute ||
                            `/portal/analyse/${encodeURIComponent(report.analysisId || "strategy")}`
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border divider-cyntra px-3 py-2 text-xs text-cyntra-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ga naar analyse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!platformSessions.length && (
        <section className="rounded-2xl border divider-cyntra bg-cyntra-surface p-6 space-y-4">
          <h2 className="text-xl font-semibold text-cyntra-primary normal-case">
            Strategische sessierapporten
          </h2>
          <div className="space-y-3">
            {platformSessions.map((session: any) => (
              <div key={session.session_id} className="rounded-xl border divider-cyntra bg-cyntra-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-cyntra-primary font-semibold">{session.analysis_type || "Strategische analyse"}</p>
                    <p className="text-xs text-cyntra-secondary">
                      {session.session_id} · {new Date(session.analyse_datum || session.updated_at || Date.now()).toLocaleString("nl-NL")}
                    </p>
                    <p className="text-xs text-cyntra-secondary">
                      {session.executive_summary || "Samenvatting volgt via sessierapport."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/portal/rapporten/${encodeURIComponent(session.session_id)}`)}
                      className="inline-flex items-center gap-1 rounded-lg border divider-cyntra px-3 py-2 text-xs text-cyntra-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Bekijk
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/portal/saas/rapporten")}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D4AF37]/40 px-3 py-2 text-xs text-cyntra-gold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open bibliotheek
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-cyntra-secondary">Laden…</p>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map((x) => (
          <div
            key={x.id}
            onClick={() => navigate(`/portal/rapporten/${x.id}`)}
            className="cursor-pointer rounded-2xl border divider-cyntra bg-cyntra-surface p-6 hover:border-[#D4AF37]/40"
          >
            <p className="text-lg text-cyntra-primary">{x.company_name}</p>
            <p className="text-xs text-cyntra-secondary">
              {new Date(x.created_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= SUBS ================= */

function HGBCOBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green";
}) {
  return (
    <div>
      <p className="text-xs uppercase text-cyntra-secondary">{label}</p>
      <p
        className={`${
          accent === "green" ? "text-green-400" : "text-cyntra-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function HGBCOList({
  label,
  items,
  icon,
}: {
  label: string;
  items: string[];
  icon: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-cyntra-secondary flex gap-2 items-center">
        {icon} {label}
      </p>
      <ul className="text-cyntra-primary space-y-1">
        {items.map((x, i) => (
          <li key={i}>• {x}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center text-cyntra-secondary">
      Nog geen rapporten
    </div>
  );
}
