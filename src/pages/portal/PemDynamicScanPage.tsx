import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  adaptCanonicalToLegacyResponse,
  runCyntraAnalysis,
} from "@/cyntra/stabilization/runCyntraAnalysis";
import {
  ACCENT_STYLES,
  getPemScanById,
  isCoreFit,
  type PemFieldDefinition,
} from "./pem/pemScanConfig";
import {
  PemBadge,
  PemField,
  PemTextarea,
  PemSelect,
  PemNumber,
  PemDocumentUpload,
  PemError,
} from "./pem/pemUI";
import {
  buildDocumentPayload,
  buildDocumentsSummary,
  uploadDocuments,
  resolveOrganisationId,
} from "./pem/pemScanUtils";

function buildInitialContext(fields: PemFieldDefinition[]) {
  const ctx: Record<string, any> = {};
  fields.forEach((field) => {
    if (field.type === "number") {
      ctx[field.key] = typeof field.min === "number" ? field.min : 5;
    } else {
      ctx[field.key] = "";
    }
  });
  return ctx;
}

function isFieldReady(field: PemFieldDefinition, value: any) {
  if (!field.required && !field.minLength) return true;
  if (field.type === "number") {
    return Number.isFinite(value);
  }
  const text = String(value ?? "").trim();
  const min = field.minLength ?? 1;
  return text.length >= min;
}

export default function PemDynamicScanPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const scan = getPemScanById(scanId);
  const nav = useNavigate();

  const [ctx, setCtx] = useState<Record<string, any>>(() =>
    scan ? buildInitialContext(scan.fields) : {}
  );
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scan) {
      setCtx(buildInitialContext(scan.fields));
      setFiles([]);
      setError(null);
    }
  }, [scan?.id]);

  const ready = useMemo(() => {
    if (!scan) return false;
    return scan.fields.every((field) => isFieldReady(field, ctx[field.key]));
  }, [scan, ctx]);

  async function runScan() {
    if (!scan || !ready || loading) return;

    setLoading(true);
    setError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      if (!token) {
        throw new Error("Geen actieve sessie gevonden. Log opnieuw in.");
      }

      const organisationId = await resolveOrganisationId(sessionRes);
      if (!organisationId) {
        throw new Error("Geen organisation_id geselecteerd.");
      }

      const documents = await buildDocumentPayload(files);
      const documentsSummary = buildDocumentsSummary(documents);
      const documentsMeta = documents.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
      }));
      const documentsStorage = files.length
        ? await uploadDocuments(
            files,
            organisationId,
            sessionRes.data.session?.user?.id
          )
        : [];

      const payload: Record<string, any> = {
        mode: scan.mode,
        organisation_id: organisationId,
        meta: {
          organisation_id: organisationId,
          documents_count: documentsMeta.length,
          scan_id: scan.id,
          scan_label: scan.label,
        },
      };

      payload[scan.contextKey] = {
        ...ctx,
        organisation_id: organisationId,
        documents_summary: documentsSummary,
        documents_meta: documentsMeta,
        documents_storage: documentsStorage,
        scan_id: scan.id,
        scan_label: scan.label,
        scan_tagline: scan.tagline,
      };

      const canonical = await runCyntraAnalysis(payload, {
        accessToken: token,
      });
      const data = adaptCanonicalToLegacyResponse(canonical);

      if (!data?.success || !data.report) {
        throw new Error("Geen geldig Fit-rapport ontvangen.");
      }

      const reportId = crypto.randomUUID();
      try {
        sessionStorage.setItem(
          `${scan.storageKey}_${reportId}`,
          JSON.stringify(data.report)
        );
      } catch (e) {
        console.warn("⚠️ PEM report not stored in sessionStorage", e);
      }

      nav(`/portal/fits/${scan.id}/result/${reportId}`);
    } catch (err: any) {
      setError(
        err?.message ??
          "Scan kon niet worden uitgevoerd. Controleer Edge Function logs."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-white/60">
            Deze scan bestaat niet. Ga terug naar Cyntra Fits.
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

  if (!isCoreFit(scan.id)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Cyntra Fits
          </p>
          <h1 className="text-2xl font-semibold">
            Deze scan is tijdelijk gesloten
          </h1>
          <p className="text-sm text-white/60">
            De portal toont alleen de kernsuite: VitalFit™, LeaderFit™ en
            TeamFit™. Dit is een bewuste productkeuze.
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

  const accent = ACCENT_STYLES[scan.accent];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-14">
        <header className="space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {scan.tagline}
          </p>
          <h1 className={`text-5xl font-semibold ${accent.accentTextStrong}`}>
            {scan.headline}
          </h1>
          <p className="text-lg text-white/70 max-w-3xl">
            {scan.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {scan.badges.map((badge) => (
              <PemBadge
                key={badge.text}
                icon={badge.icon}
                text={badge.text}
                accentClass={accent.accentText}
              />
            ))}
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-10">
          {scan.fields.map((field) => {
            const value = ctx[field.key];
            const update = (val: any) =>
              setCtx((prev) => ({ ...prev, [field.key]: val }));

            if (field.type === "text") {
              return (
                <PemField
                  key={field.key}
                  label={field.label}
                  value={value}
                  onChange={update}
                  placeholder={field.placeholder}
                />
              );
            }

            if (field.type === "textarea") {
              return (
                <PemTextarea
                  key={field.key}
                  label={field.label}
                  value={value}
                  onChange={update}
                  placeholder={field.placeholder}
                  rows={field.rows}
                />
              );
            }

            if (field.type === "select") {
              return (
                <PemSelect
                  key={field.key}
                  label={field.label}
                  value={value}
                  onChange={update}
                  options={field.options ?? []}
                />
              );
            }

            if (field.type === "number") {
              return (
                <PemNumber
                  key={field.key}
                  label={field.label}
                  value={Number(value)}
                  onChange={update}
                  min={field.min}
                  max={field.max}
                />
              );
            }

            return null;
          })}

          <PemDocumentUpload
            files={files}
            setFiles={setFiles}
            accentText={accent.accentText}
            accentBorder={accent.accentBorder}
            helperText="Tekstextractie gebeurt alleen voor tekstbestanden. Overige bestanden worden als metadata toegevoegd."
          />

          {error && <PemError message={error} />}

          <button
            disabled={!ready || loading}
            onClick={runScan}
            className={`w-full flex items-center justify-center gap-3 rounded-2xl py-5 transition disabled:opacity-40 disabled:cursor-not-allowed ${accent.button}`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? scan.ctaLoading : scan.ctaIdle}
            <ArrowRight className="h-5 w-5" />
          </button>

          {!ready && (
            <p className="text-xs text-white/30 text-center">
              Vul alle verplichte velden in om de scan te starten.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
