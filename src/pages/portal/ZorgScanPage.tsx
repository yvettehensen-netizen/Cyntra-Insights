// ============================================================
// ✅ BESLUITVORMINGSSCAN ZORG™ — BOARDROOM FINAL (UPGRADED)
// Route: /portal/zorg-scan
// Engine: aurelius-analyze (mode="zorgscan")
// Fixes:
// ✅ Supabase token injection → prevents Failed to fetch
// ✅ Error clarity + logs
// ✅ Production-safe invoke
// ============================================================

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldAlert,
  Loader2,
  Crown,
  Eye,
  Siren,
  AlertCircle,
  DollarSign,
  GitBranch,
  Clock,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface CompanyContext {
  name: string;
  decision: string;
  decisionType: "strategic" | "financial" | "governance" | "operational";
  decisionHorizon: "0-3m" | "3-12m" | "12m+";
  irreversibility: "laag" | "middel" | "hoog";
  financials?: string;
  tensions?: string;
}

export default function ZorgScanPage() {
  const nav = useNavigate();

  const [ctx, setCtx] = useState<CompanyContext>({
    name: "",
    decision: "",
    decisionType: "strategic",
    decisionHorizon: "3-12m",
    irreversibility: "middel",
    financials: "",
    tensions: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================================================
     ✅ READINESS — BOARDROOM THRESHOLD
  ============================================================ */
  const ready = useMemo(() => {
    return ctx.name.trim().length > 2 && ctx.decision.trim().length > 40;
  }, [ctx]);

  /* ============================================================
     ✅ RUN ZORGSCAN — TOKEN SAFE INVOKE (FIXED)
     Prevents: Failed to fetch / Unauthorized / Missing Auth
  ============================================================ */
  async function runScan() {
    if (!ready || loading) return;

    setLoading(true);
    setError(null);

    try {
      /* ============================================================
         ✅ ADD ONLY — SESSION TOKEN INJECTION
      ============================================================ */
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error("Geen actieve sessie gevonden. Log opnieuw in.");
      }

      console.log("✅ ZorgScan token OK:", token.slice(0, 15), "...");

      /* ============================================================
         ✅ SUPABASE EDGE FUNCTION CALL (AUTH FIXED)
      ============================================================ */
      const { data, error } = await supabase.functions.invoke(
        "aurelius-analyze",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIX
          },
          body: {
            mode: "zorgscan",
            organisation: ctx.name,
            company_context: ctx,
          },
        }
      );

      console.log("✅ ZorgScan response:", data);

      if (error) {
        console.error("❌ Function invoke error:", error);
        throw error;
      }

      if (!data?.success || !data.report) {
        throw new Error("Geen geldig ZorgScan rapport ontvangen.");
      }

      /* ============================================================
         ✅ NAVIGATE TO RESULT PAGE
      ============================================================ */
      nav(`/portal/zorg-scan/result/${crypto.randomUUID()}`, {
        state: data.report,
      });
    } catch (err: any) {
      console.error("❌ ZorgScan runScan failed:", err);

      /* ============================================================
         ✅ USER FRIENDLY ERROR
      ============================================================ */
      setError(
        err?.message ??
          "ZorgScan kon niet worden uitgevoerd. Controleer Edge Function logs."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     ✅ UI — BOARDROOM INPUT LAYER
  ============================================================ */
  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl space-y-16">

        {/* HEADER */}
        <header className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/25">
            BesluitvormingsScan Zorg™ — Boardroom Besluitarchitectuur
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            Waar besluiten blijven circuleren
            <br />
            zonder ooit te landen.
          </h1>

          <p className="text-white/50 max-w-3xl text-lg">
            Deze scan analyseert geen cultuur en geen performance —
            <span className="text-[#d4af37] font-medium">
              maar de structuur waarin besluiten verdampen.
            </span>
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Badge icon={Eye} text="Onderstroom detectie" />
            <Badge icon={Crown} text="Boardroom niveau" />
            <Badge icon={Siren} text="Irreversibility risico" />
          </div>
        </header>

        {/* INPUT CARD */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-10">

          <Field
            label="Organisatie / Bestuurseenheid"
            value={ctx.name}
            onChange={(v) => setCtx({ ...ctx, name: v })}
            icon={Crown}
            placeholder="Ziekenhuis, UMC, VVT-groep…"
          />

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Vastlopend besluit
            </p>
            <textarea
              rows={6}
              value={ctx.decision}
              onChange={(e) =>
                setCtx({ ...ctx, decision: e.target.value })
              }
              placeholder="Beschrijf één besluit dat structureel terugkomt maar nooit sluit."
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-5 text-white resize-none"
            />
          </div>

          {/* DECISION STRUCTURE */}
          <div className="grid md:grid-cols-3 gap-6">
            <Select
              label="Besluittype"
              value={ctx.decisionType}
              onChange={(v) =>
                setCtx({ ...ctx, decisionType: v as any })
              }
              options={[
                ["strategic", "Strategisch"],
                ["financial", "Financieel"],
                ["governance", "Governance"],
                ["operational", "Operationeel"],
              ]}
              icon={GitBranch}
            />

            <Select
              label="Besluithorizon"
              value={ctx.decisionHorizon}
              onChange={(v) =>
                setCtx({ ...ctx, decisionHorizon: v as any })
              }
              options={[
                ["0-3m", "0–3 maanden"],
                ["3-12m", "3–12 maanden"],
                ["12m+", "12+ maanden"],
              ]}
              icon={Clock}
            />

            <Select
              label="Irreversibility"
              value={ctx.irreversibility}
              onChange={(v) =>
                setCtx({ ...ctx, irreversibility: v as any })
              }
              options={[
                ["laag", "Laag"],
                ["middel", "Middel"],
                ["hoog", "Hoog"],
              ]}
              icon={ShieldAlert}
            />
          </div>

          <Field
            label="Financiële context (optioneel)"
            value={ctx.financials ?? ""}
            onChange={(v) => setCtx({ ...ctx, financials: v })}
            icon={DollarSign}
            placeholder="Budgetdruk, investeringskaders, ROI-eisen…"
          />

          <Field
            label="Specifieke spanningen (optioneel)"
            value={ctx.tensions ?? ""}
            onChange={(v) => setCtx({ ...ctx, tensions: v })}
            icon={AlertCircle}
            placeholder="Bijv. kwaliteit vs kosten, autonomie vs regie…"
          />

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-500/30 p-4 rounded-2xl">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!ready || loading}
            onClick={runScan}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-5
                       border border-[#d4af37]/50 text-[#d4af37]
                       hover:bg-[#d4af37] hover:text-black transition
                       disabled:opacity-30"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
            {loading
              ? "Boardroom analyse wordt gebouwd…"
              : "Genereer Besluitvormingskaart"}
            <ArrowRight className="h-5 w-5" />
          </button>

          {!ready && (
            <p className="text-xs text-white/30 text-center">
              Vul organisatie + besluit in (min. 40 tekens)
            </p>
          )}
        </section>

        <footer className="text-xs text-white/30 max-w-2xl">
          BesluitvormingsScan Zorg™ is een decision architecture audit.
          Volledige governance-roadmap via Aurelius Portal.
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function Badge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 border border-white/10 px-4 py-2 rounded-full">
      <Icon className="h-4 w-4 text-[#d4af37]" />
      {text}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: any;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white"
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  icon?: any;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl bg-black/40 border border-white/10 pl-12 pr-4 py-4 text-white"
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
