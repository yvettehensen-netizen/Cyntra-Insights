// ============================================================
// CYNTRA INSIGHTS — PEM IMPOSTER & IDENTITY SCAN
// Route: /portal/pem-imposter-scan
// Engine: aurelius-analyze (mode="pem-imposter")
// ============================================================

import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  HeartPulse,
  Brain,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  adaptCanonicalToLegacyResponse,
  runCyntraAnalysis,
} from "@/cyntra/stabilization/runCyntraAnalysis";

interface ImposterContext {
  currentRole: string;
  organisation: string;
  imposterThoughts: string;
  authorityHistory: string;
  triggerContexts: string;
  recognitionMeaning: string;
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

export default function PemImposterScanPage() {
  const nav = useNavigate();

  const [ctx, setCtx] = useState<ImposterContext>({
    currentRole: "",
    organisation: "",
    imposterThoughts: "",
    authorityHistory: "",
    triggerContexts: "",
    recognitionMeaning: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => {
    return (
      ctx.currentRole.trim().length > 5 &&
      ctx.imposterThoughts.trim().length > 20 &&
      ctx.triggerContexts.trim().length > 20
    );
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
            localStorage.setItem(
              "active_org_id",
              String(membership.organisation_id)
            );
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

      const canonical = await runCyntraAnalysis(
        {
          mode: "pem-imposter",
          organisation_id: orgId,
          imposter_context: {
            ...ctx,
            organisation_id: orgId,
            documents_summary: documentsSummary,
            documents_meta: documentsMeta,
            documents_storage: documentsStorage,
          },
          meta: {
            organisation_id: orgId,
            documents_count: documentsMeta.length,
          },
        },
        {
          accessToken: token,
        }
      );

      const data = adaptCanonicalToLegacyResponse(canonical);

      if (!data?.success || !data.report) {
        throw new Error("Geen geldig PEM Imposter-rapport ontvangen.");
      }

      const reportId = crypto.randomUUID();
      try {
        sessionStorage.setItem(
          `pem_imposter_report_${reportId}`,
          JSON.stringify(data.report)
        );
      } catch (e) {
        console.warn("⚠️ PEM Imposter report not stored in sessionStorage", e);
      }

      nav(`/portal/pem-imposter/result/${reportId}`);
    } catch (err: any) {
      setError(
        err?.message ??
          "PEM Imposter scan kon niet worden uitgevoerd. Controleer Edge Function logs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-14">

        {/* HEADER */}
        <header className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-300/70">
            PEM Imposter & Identity Scan
          </p>
          <h1 className="text-5xl font-semibold text-purple-200 leading-tight">
            Van imposterism naar interne autoriteit
          </h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Deze scan ziet imposter-gevoel niet als zwakte, maar als systeemsignaal.
            Je krijgt zicht op persoonlijke én structurele bronnen van onzekerheid.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Badge icon={Brain} text="Identiteit" />
            <Badge icon={Shield} text="VRR-profiel" />
            <Badge icon={HeartPulse} text="Kwetsbaarheid" />
          </div>
        </header>

        {/* FORM */}
        <section className="rounded-3xl border border-purple-900/40 bg-slate-900/40 p-10 space-y-10">
          <Field
            label="Huidige rol / functie"
            value={ctx.currentRole}
            onChange={(v) => setCtx({ ...ctx, currentRole: v })}
            placeholder="Bijv. Product Lead, Consultant, Directeur"
          />

          <Field
            label="Organisatie / context"
            value={ctx.organisation}
            onChange={(v) => setCtx({ ...ctx, organisation: v })}
            placeholder="Bedrijf, sector, team, omgeving"
          />

          <TextareaField
            label="Herken je gedachten als 'ik hoor hier niet thuis'?"
            value={ctx.imposterThoughts}
            onChange={(v) => setCtx({ ...ctx, imposterThoughts: v })}
            placeholder="Beschrijf de terugkerende gedachten of innerlijke stem"
          />

          <TextareaField
            label="Hoe was je relatie met autoriteit of erkenning vroeger?"
            value={ctx.authorityHistory}
            onChange={(v) => setCtx({ ...ctx, authorityHistory: v })}
            placeholder="Waar voelde je oordeel, erkenning of afstand?"
          />

          <TextareaField
            label="Welke contexten versterken dit gevoel het meest?"
            value={ctx.triggerContexts}
            onChange={(v) => setCtx({ ...ctx, triggerContexts: v })}
            placeholder="Teams, situaties, feedback, systemen"
          />

          <TextareaField
            label="Wat zou erkenning voor jou nu echt betekenen?"
            value={ctx.recognitionMeaning}
            onChange={(v) => setCtx({ ...ctx, recognitionMeaning: v })}
            placeholder="Welke vorm van erkenning voelt authentiek?"
          />

          {/* DOCUMENTEN */}
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-white/80 hover:border-purple-400/60 hover:text-purple-200 transition"
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
              Tekstextractie gebeurt alleen voor tekstbestanden. Overige
              bestanden worden als metadata toegevoegd.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-300 bg-red-950/40 border border-red-500/40 p-4 rounded-2xl">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            disabled={!ready || loading}
            onClick={runScan}
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-5
                       border border-purple-400/40 text-purple-200
                       hover:bg-purple-400 hover:text-black transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "PEM Imposter analyse wordt gebouwd…" : "Genereer Imposter rapport"}
            <ArrowRight className="h-5 w-5" />
          </button>

          {!ready && (
            <p className="text-xs text-white/30 text-center">
              Vul rol, imposter-gedachten en context in (min. 3 velden)
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 border border-white/10 px-4 py-2 rounded-full">
      <Icon className="h-4 w-4 text-purple-300" />
      {text}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-white/40">
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] rounded-2xl bg-black/40 border border-white/10 px-4 py-4 text-white resize-none"
      />
    </div>
  );
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
    const body = doc.text ? doc.text : "Geen tekstextractie beschikbaar.";
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
