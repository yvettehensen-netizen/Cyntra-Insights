// ============================================================
// src/pages/portal/RapportenPage.tsx
// AURELIUS — HGBCO REPORT VAULT (FINAL CANON)
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

import {
  ArrowLeft,
  Target,
  ShieldAlert,
  Activity,
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

  const [items, setItems] = useState<Analysis[]>([]);
  const [active, setActive] = useState<Analysis | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    if (id) {
      const { data } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();

      setActive(data ?? null);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setItems(data ?? []);
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
      <div className="max-w-6xl space-y-20">
        {/* BACK */}
        <button
          onClick={() => navigate("/portal/rapporten")}
          className="flex items-center gap-2 text-white/30 hover:text-[#D4AF37]"
        >
          <ArrowLeft size={18} /> Terug naar vault
        </button>

        {/* HEADER */}
        <header className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Aurelius Report Vault — Boardroom Decision Output
          </p>

          <h1 className="text-5xl font-semibold text-[#D4AF37]">
            {companyName}
          </h1>

          <p className="text-white/40 max-w-3xl leading-relaxed">
            Dit is geen rapport. Dit is een bestuurlijke besluitkaart.
          </p>

          {/* ADD ONLY — OPEN IN ENGINE */}
          <button
            onClick={() =>
              navigate(
                `/portal/analysis/${
                  active.content?.analysis_type || "strategy"
                }`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 px-6 py-3 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Open analyse in engine
          </button>
        </header>

        {/* ================= HGBCO ================= */}
        {hgbco && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-10">
            <div className="flex items-center gap-3">
              <Target className="text-[#D4AF37]" />
              <h2 className="text-3xl font-semibold text-[#D4AF37]">
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
          <section className="rounded-3xl border border-[#D4AF37]/30 bg-black/60 p-10 space-y-6">
            <h2 className="text-3xl font-semibold text-[#D4AF37]">
              Bestuurlijke beslissynthese
            </h2>

            {decisionCard.executive_thesis && (
              <p className="text-white/80">
                <strong>These:</strong>{" "}
                {decisionCard.executive_thesis}
              </p>
            )}

            {decisionCard.central_tension && (
              <p className="text-white/60">
                <strong>Centrale spanning:</strong>{" "}
                {decisionCard.central_tension}
              </p>
            )}

            {typeof decisionCard.confidence_level === "number" && (
              <p className="text-white/40">
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
          <section className="rounded-3xl border border-[#D4AF37]/20 bg-black/50 p-10 space-y-8">
            <h2 className="text-3xl font-semibold text-[#D4AF37]">
              Closure-interventies
            </h2>

            {interventions.map((x: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <h3 className="text-xl font-semibold text-white">
                  {x.title ?? `Interventie ${idx + 1}`}
                </h3>
                {x.why && (
                  <p className="text-white/60 mt-2">{x.why}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ================= RAW JSON ================= */}
        <details className="rounded-2xl border border-white/10 bg-black/40 p-8 text-sm text-white/50">
          <summary className="cursor-pointer text-[#D4AF37] font-medium">
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
    <div className="max-w-7xl space-y-12">
      <h1 className="text-4xl font-bold text-[#D4AF37]">
        Rapport Vault
      </h1>

      {loading ? (
        <p className="text-white/30">Laden…</p>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map((x) => (
          <div
            key={x.id}
            onClick={() => navigate(`/portal/rapporten/${x.id}`)}
            className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-[#D4AF37]/40"
          >
            <p className="text-lg text-white">{x.company_name}</p>
            <p className="text-xs text-white/40">
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
      <p className="text-xs uppercase text-white/30">{label}</p>
      <p
        className={`text-white/70 ${
          accent === "green" ? "text-green-400" : ""
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
      <p className="text-xs uppercase text-white/30 flex gap-2 items-center">
        {icon} {label}
      </p>
      <ul className="text-white/65 space-y-1">
        {items.map((x, i) => (
          <li key={i}>• {x}</li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center text-white/40">
      Nog geen rapporten
    </div>
  );
}
