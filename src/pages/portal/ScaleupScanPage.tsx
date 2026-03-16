// ============================================================
// CYNTRA SCALE-UP BESLUITVORMINGSSCAN™ — BOARDROOM INTAKE
// Route: /portal/scaleup-scan
// Engine: generateBoardroomNarrative (arena="scaleup")
// ============================================================

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldAlert,
  Loader2,
  Rocket,
  Target,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Users,
  Gauge,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  generateBoardroomNarrative,
} from "../../aurelius/narrative/generateBoardroomNarrative";
import {
  parseAureliusReport,
  type AureliusAnalysisResult,
} from "../../aurelius/utils/parseAureliusReport";

interface ScaleupContext {
  name: string;
  stage: "pre-seed" | "seed" | "series-a" | "series-b" | "growth";
  decision: string;
  decisionType: "strategic" | "financial" | "governance" | "operational";
  decisionHorizon: "0-3m" | "3-12m" | "12m+";
  irreversibility: "laag" | "middel" | "hoog";
  runway: string;
  growthBottleneck: string;
  marketSignal: string;
  focusTradeoff: string;
  teamTension: string;
  fundingPlan: string;
}

type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  text: string;
};

const MAX_DOC_TEXT_CHARS = 6000;
const MAX_SUMMARY_CHARS = 14000;
const UPLOAD_BUCKET = "cyntra-uploads";
const TEXT_MIME_TYPES = new Set([
  "application/json",
  "application/xml",
  "application/csv",
  "application/x-csv",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/xml",
]);

const TEXT_EXTENSIONS = [
  ".txt",
  ".md",
  ".markdown",
  ".csv",
  ".json",
  ".xml",
  ".log",
];

function fileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function ScaleupScanPage() {
  const nav = useNavigate();

  const [ctx, setCtx] = useState<ScaleupContext>({
    name: "",
    stage: "seed",
    decision: "",
    decisionType: "strategic",
    decisionHorizon: "3-12m",
    irreversibility: "middel",
    runway: "",
    growthBottleneck: "",
    marketSignal: "",
    focusTradeoff: "",
    teamTension: "",
    fundingPlan: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => {
    return ctx.name.trim().length > 2 && ctx.decision.trim().length > 40;
  }, [ctx]);

  async function runScan() {
    if (!ready || loading) return;

    setLoading(true);
    setError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      let organisationId = localStorage.getItem("active_org_id");

      if (!token) {
        throw new Error("Geen actieve sessie gevonden. Log opnieuw in.");
      }

      if (!organisationId) {
        const userId = sessionRes.data.session?.user?.id ?? null;
        if (userId) {
          const { data: membership, error: orgErr } = await supabase
            .from("organisation_memberships")
            .select("organisation_id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!orgErr && membership?.organisation_id) {
            organisationId = membership.organisation_id;
            localStorage.setItem("active_org_id", String(membership.organisation_id));
          }
        }
      }

      if (!organisationId) {
        throw new Error("Geen organisation_id geselecteerd.");
      }

      const orgId = String(organisationId);

      const documents = await buildDocumentPayload(files);
      const documentsSummary = buildDocumentsSummary(documents);
      const documentsMeta = documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
      }));
      const documentsStorage = files.length
        ? await uploadDocuments(files, orgId, sessionRes.data.session?.user?.id)
        : [];

      const scaleupContext = buildScaleupContext(ctx, documentsSummary);

      const narrative = await generateBoardroomNarrative({
        analysis_id: crypto.randomUUID(),
        company_name: ctx.name,
        company_context: scaleupContext,
        documents: documents.map((doc) => ({
          id: doc.id,
          filename: doc.name,
          content: doc.text,
        })),
        meta: {
          arena: "scaleup",
          minWords: 3200,
          minExecutionWords: 2200,
        },
      });

      const parsed = parseAureliusReport(narrative.text, "strategy");

      const enriched: AureliusAnalysisResult & Record<string, unknown> = {
        ...parsed,
        organisation: ctx.name,
        documents_summary: documentsSummary,
        documents_meta: documentsMeta,
        documents_storage: documentsStorage,
        decision_contract: narrative.decision_contract ?? null,
        decision_gate: narrative.decision_gate ?? null,
        decision_failure_text: narrative.decision_failure_text ?? null,
        decision_iterations: narrative.decision_iterations ?? null,
      };

      if (documentsSummary) {
        enriched.sections = {
          ...enriched.sections,
          documenten_samenvatting: {
            title: "Documenten (samenvatting)",
            content: documentsSummary,
          },
        };
      }

      const reportId = crypto.randomUUID();
      try {
        sessionStorage.setItem(
          `scaleupscan_report_${reportId}`,
          JSON.stringify(enriched)
        );
      } catch (e) {
        console.warn("⚠️ Scale-up scan report not stored in sessionStorage", e);
      }

      nav(`/portal/scaleup-scan/result/${reportId}`);
    } catch (err: any) {
      console.error("❌ Scale-up scan failed:", err);
      setError(
        err?.message ??
          "Scale-up scan kon niet worden uitgevoerd. Controleer Edge Function logs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl space-y-16">
        <header className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/25">
            Scale-up Besluitvormingsscan™ — Boardroom Intake
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            Focus wint. Uitstel brandt runway.
          </h1>

          <p className="text-white/50 max-w-3xl text-lg">
            Deze scan dwingt één schaalbesluit af: wat je stopt, wat je versnelt,
            en wie het eigenaarschap draagt.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Badge icon={Rocket} text="Runway druk" />
            <Badge icon={Target} text="Focus besluit" />
            <Badge icon={Gauge} text="Executiekracht" />
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-10">
          <Field
            label="Scale-up / portfolio"
            value={ctx.name}
            onChange={(v) => setCtx({ ...ctx, name: v })}
            icon={Rocket}
            placeholder="Organisatie of venture naam"
          />

          <Select
            label="Fase"
            value={ctx.stage}
            onChange={(v) => setCtx({ ...ctx, stage: v as any })}
            options={[
              ["pre-seed", "Pre-seed"],
              ["seed", "Seed"],
              ["series-a", "Series A"],
              ["series-b", "Series B"],
              ["growth", "Growth"],
            ]}
            icon={TrendingUp}
          />

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Kernbesluit dat blijft hangen
            </p>
            <textarea
              rows={6}
              value={ctx.decision}
              onChange={(e) => setCtx({ ...ctx, decision: e.target.value })}
              placeholder="Omschrijf één besluit dat de schaal bepaalt (bijv. stoppen productlijn, focus op kernkanaal, runway-reductie)."
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-5 text-white resize-none"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Select
              label="Besluittype"
              value={ctx.decisionType}
              onChange={(v) => setCtx({ ...ctx, decisionType: v as any })}
              options={[
                ["strategic", "Strategisch"],
                ["financial", "Financieel"],
                ["governance", "Governance"],
                ["operational", "Operationeel"],
              ]}
              icon={Target}
            />

            <Select
              label="Besluithorizon"
              value={ctx.decisionHorizon}
              onChange={(v) => setCtx({ ...ctx, decisionHorizon: v as any })}
              options={[
                ["0-3m", "0–3 maanden"],
                ["3-12m", "3–12 maanden"],
                ["12m+", "12+ maanden"],
              ]}
              icon={TrendingUp}
            />

            <Select
              label="Irreversibility"
              value={ctx.irreversibility}
              onChange={(v) => setCtx({ ...ctx, irreversibility: v as any })}
              options={[
                ["laag", "Laag"],
                ["middel", "Middel"],
                ["hoog", "Hoog"],
              ]}
              icon={ShieldAlert}
            />
          </div>

          <Field
            label="Runway / cash-situatie"
            value={ctx.runway}
            onChange={(v) => setCtx({ ...ctx, runway: v })}
            icon={DollarSign}
            placeholder="Bijv. 8 maanden runway, burn €180k/maand"
          />

          <Field
            label="Grootste groeibottleneck"
            value={ctx.growthBottleneck}
            onChange={(v) => setCtx({ ...ctx, growthBottleneck: v })}
            icon={Gauge}
            placeholder="Bijv. activatie, sales-cyclus, onboarding, CAC"
          />

          <Field
            label="Marktsignaal (churn / retentie / product-market fit)"
            value={ctx.marketSignal}
            onChange={(v) => setCtx({ ...ctx, marketSignal: v })}
            icon={AlertCircle}
            placeholder="Bijv. churn stijgt, NRR daalt, PMF twijfel"
          />

          <Field
            label="Focus keuzeconflict"
            value={ctx.focusTradeoff}
            onChange={(v) => setCtx({ ...ctx, focusTradeoff: v })}
            icon={Target}
            placeholder="Bijv. core product vs experimenten, B2B vs B2C"
          />

          <Field
            label="Team / ownership frictie"
            value={ctx.teamTension}
            onChange={(v) => setCtx({ ...ctx, teamTension: v })}
            icon={Users}
            placeholder="Bijv. founder-ownership diffuus, MT trekt verschillende richtingen"
          />

          <Field
            label="Funding of investeringsplan"
            value={ctx.fundingPlan}
            onChange={(v) => setCtx({ ...ctx, fundingPlan: v })}
            icon={DollarSign}
            placeholder="Bijv. bridge ronde nodig, runway verlengen, cap table druk"
          />

          {/* DOCUMENT UPLOAD */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/40">
              Documenten (optioneel)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const incoming = e.target.files
                  ? Array.from(e.target.files)
                  : [];
                setFiles((prev) => {
                  const merged = [...prev, ...incoming];
                  const unique = new Map<string, File>();
                  for (const f of merged) {
                    unique.set(`${f.name}-${f.size}-${f.lastModified}`, f);
                  }
                  return Array.from(unique.values()).slice(0, 20);
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition"
              >
                <Upload className="h-4 w-4" />
                Documenten uploaden
              </button>

              {files.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-white/50 hover:text-white transition"
                >
                  Leegmaken
                </button>
              )}
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={fileFingerprint(file)}
                    className="flex items-center gap-2 text-sm text-white/60"
                  >
                    <FileText className="h-4 w-4 text-white/40" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-white/30">
                      ({formatBytes(file.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const targetKey = fileFingerprint(file);
                        setFiles((prev) =>
                          prev.filter((f) => fileFingerprint(f) !== targetKey)
                        );
                      }}
                      className="p-1 text-red-300 hover:text-red-200 transition"
                      aria-label={`Verwijder ${file.name}`}
                      title={`Verwijder ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-white/30">
              Alle bestandstypen toegestaan. Tekstextractie gebeurt alleen
              voor tekstbestanden; overige bestanden worden als metadata
              toegevoegd.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-500/30 p-4 rounded-2xl">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

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
              ? "Scale-up analyse wordt gebouwd…"
              : "Genereer Scale-up Besluitkaart"}
            <ArrowRight className="h-5 w-5" />
          </button>

          {!ready && (
            <p className="text-xs text-white/30 text-center">
              Vul organisatie + kernbesluit in (min. 40 tekens)
            </p>
          )}
        </section>

        <footer className="text-xs text-white/30 max-w-2xl">
          Scale-up Besluitvormingsscan™ is een focus- en eigenaarschapstest.
          Geen advies, wel onomkeerbare besluitdruk.
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

function buildScaleupContext(ctx: ScaleupContext, documentsSummary: string) {
  return [
    "SCALE-UP BESLUITVORMINGSCONTEXT",
    `Organisatie: ${ctx.name}`,
    `Fase: ${ctx.stage}`,
    `Kernbesluit: ${ctx.decision}`,
    `Besluittype: ${ctx.decisionType}`,
    `Besluithorizon: ${ctx.decisionHorizon}`,
    `Irreversibility: ${ctx.irreversibility}`,
    `Runway / cash: ${ctx.runway || "Niet gespecificeerd"}`,
    `Groeibottleneck: ${ctx.growthBottleneck || "Niet gespecificeerd"}`,
    `Marktsignaal: ${ctx.marketSignal || "Niet gespecificeerd"}`,
    `Focus keuzeconflict: ${ctx.focusTradeoff || "Niet gespecificeerd"}`,
    `Team/ownership frictie: ${ctx.teamTension || "Niet gespecificeerd"}`,
    `Funding / investeringsplan: ${ctx.fundingPlan || "Niet gespecificeerd"}`,
    documentsSummary
      ? `DOCUMENTEN (SAMENVATTING):\n${documentsSummary}`
      : "DOCUMENTEN: geen samenvatting beschikbaar",
  ].join("\n");
}

function isTextLike(file: File) {
  if (file.type && file.type.startsWith("text/")) return true;
  if (file.type && TEXT_MIME_TYPES.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function truncateText(value: string, max: number) {
  if (!value) return "";
  if (value.length <= max) return value.trim();
  return `${value.slice(0, max).trim()}…`;
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

async function readFileText(file: File) {
  if (!isTextLike(file)) return "";
  const raw = await file.text();
  return truncateText(compactWhitespace(raw), MAX_DOC_TEXT_CHARS);
}

async function buildDocumentPayload(files: File[]): Promise<UploadedDocument[]> {
  const docs = await Promise.all(
    files.map(async (file, idx) => {
      let text = "";
      try {
        text = await readFileText(file);
      } catch {
        text = "";
      }

      return {
        id: `${idx}-${file.name}`,
        name: file.name,
        type: file.type || "onbekend",
        size: file.size,
        text,
      };
    })
  );

  return docs;
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "_").replace(/_+/g, "_");
}

async function uploadDocuments(
  files: File[],
  organisationId: string,
  userId?: string | null
) {
  const uid = userId ?? "anonymous";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const prefix = `${organisationId}/${uid}/${timestamp}`;

  const uploads = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const safeName = safeFileName(file.name);
    const path = `${prefix}/${i}-${safeName}`;
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      throw new Error(
        `Upload mislukt voor ${file.name}: ${error.message}. Controleer of bucket '${UPLOAD_BUCKET}' bestaat.`
      );
    }

    uploads.push({
      bucket: UPLOAD_BUCKET,
      path,
      name: file.name,
      type: file.type || "onbekend",
      size: file.size,
      public_url: null,
    });
  }

  return uploads;
}

function buildDocumentsSummary(docs: UploadedDocument[]) {
  if (!docs.length) return "";

  const blocks = docs.map((doc, idx) => {
    const header = `DOC ${idx + 1}: ${doc.name} (${doc.type}, ${formatBytes(
      doc.size
    )})`;
    const body = doc.text
      ? doc.text
      : "Geen tekstextractie beschikbaar.";
    return `${header}\n${body}`;
  });

  return truncateText(blocks.join("\n\n"), MAX_SUMMARY_CHARS);
}

function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}
