import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Activity,
  Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  adaptCanonicalToLegacyResponse,
  runCyntraAnalysis,
} from "@/cyntra/stabilization/runCyntraAnalysis";
import { ACCENT_STYLES } from "./pem/pemScanConfig";
import {
  PemBadge,
  PemField,
  PemTextarea,
  PemDocumentUpload,
  PemError,
} from "./pem/pemUI";
import {
  buildDocumentPayload,
  buildDocumentsSummary,
  uploadDocuments,
  resolveOrganisationId,
} from "./pem/pemScanUtils";

type BoardTensionContext = {
  organisation: string;
  board_context: string;
  recurring_patterns: string;
  decision_pressure: string;
  governance_friction: string;
};

export default function BoardTensionScanPage() {
  const nav = useNavigate();
  const accent = ACCENT_STYLES.amber;

  const [ctx, setCtx] = useState<BoardTensionContext>({
    organisation: "",
    board_context: "",
    recurring_patterns: "",
    decision_pressure: "",
    governance_friction: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = useMemo(() => {
    return (
      ctx.organisation.trim().length > 2 &&
      ctx.board_context.trim().length > 40 &&
      ctx.recurring_patterns.trim().length > 20
    );
  }, [ctx]);

  async function runScan() {
    if (!ready || loading) return;
    setLoading(true);
    setError(null);

    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("Geen actieve sessie gevonden. Log opnieuw in.");

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

      const canonical = await runCyntraAnalysis(
        {
          mode: "board_tension",
          organisation_id: organisationId,
          board_tension_context: {
            ...ctx,
            organisation_id: organisationId,
            documents_summary: documentsSummary,
            documents_meta: documentsMeta,
            documents_storage: documentsStorage,
            scan_label: "Bestuurlijke Spanningsscan",
            scan_tagline: "Cyntra Board Tension Scan",
          },
          meta: {
            organisation_id: organisationId,
            documents_count: documentsMeta.length,
            scan_id: "board_tension",
            scan_label: "Bestuurlijke Spanningsscan",
          },
        },
        {
          accessToken: token,
        }
      );

      const data = adaptCanonicalToLegacyResponse(canonical);

      if (!data?.success || !data.report) {
        throw new Error("Geen geldig Board Tension Scan rapport ontvangen.");
      }

      const reportId = crypto.randomUUID();
      sessionStorage.setItem(
        `board_tension_report_${reportId}`,
        JSON.stringify(data.report)
      );
      nav(`/portal/board-tension-scan/result/${reportId}`);
    } catch (err: any) {
      setError(
        err?.message ??
          "Board Tension Scan kon niet worden uitgevoerd. Controleer logs."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex items-center gap-4 text-sm text-white/40">
          <button
            onClick={() => nav("/portal/dashboard")}
            className="flex items-center gap-2 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar dashboard
          </button>
        </div>

        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Bestuurlijke Spanningsscan
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-white">
            Waar besluitvorming structureel blijft hangen
          </h1>
          <p className="text-lg text-white/60 max-w-3xl">
            Deze scan maakt zichtbaar welke spanningspatronen in bestuur en
            directie blijven terugkeren — ongeacht besluiten of intentie.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <PemBadge
              icon={ShieldAlert}
              text="Governance-spanning"
              accentClass={accent.accentText}
            />
            <PemBadge
              icon={Activity}
              text="Persistente patronen"
              accentClass={accent.accentText}
            />
            <PemBadge
              icon={Layers}
              text="Besluitlogica"
              accentClass={accent.accentText}
            />
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-8">
          <PemField
            label="Organisatie"
            value={ctx.organisation}
            onChange={(v) => setCtx({ ...ctx, organisation: v })}
            placeholder="Naam van de organisatie"
          />

          <PemTextarea
            label="Bestuurlijke context (situatie & druk)"
            value={ctx.board_context}
            onChange={(v) => setCtx({ ...ctx, board_context: v })}
            placeholder="Welke bestuurlijke context of druk speelt er nu? Benoem deadlines, externe druk, stakeholders."
            rows={5}
          />

          <PemTextarea
            label="Terugkerende spanningen of patronen"
            value={ctx.recurring_patterns}
            onChange={(v) => setCtx({ ...ctx, recurring_patterns: v })}
            placeholder="Welke patronen blijven terugkomen, ondanks besluiten?"
            rows={4}
          />

          <PemTextarea
            label="Besluitdruk en escalaties"
            value={ctx.decision_pressure}
            onChange={(v) => setCtx({ ...ctx, decision_pressure: v })}
            placeholder="Waar ontstaan escalaties, vertraging of besluitbreuk?"
            rows={4}
          />

          <PemTextarea
            label="Governance-frictie (mandaat, eigenaarschap, rolconflict)"
            value={ctx.governance_friction}
            onChange={(v) => setCtx({ ...ctx, governance_friction: v })}
            placeholder="Waar schuurt het tussen formele rollen en echte besluiten?"
            rows={4}
          />

          <PemDocumentUpload
            files={files}
            setFiles={setFiles}
            accentText={accent.accentText}
            accentBorder={accent.accentBorder}
            helperText="Upload documenten die bestuurlijke spanning of besluitvertraging illustreren. Maximaal 20 bestanden."
          />

          {error && <PemError message={error} />}

          <button
            disabled={!ready || loading}
            onClick={runScan}
            className={`w-full rounded-2xl px-6 py-4 text-lg font-semibold transition ${
              ready && !loading
                ? "bg-amber-400 text-black hover:bg-amber-300"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Scan wordt opgebouwd…
              </span>
            ) : (
              "Genereer Bestuurlijke Spanningsscan"
            )}
          </button>

          {!ready && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <AlertCircle className="h-4 w-4" />
              Vul minimaal de organisatie en kerncontext in.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
