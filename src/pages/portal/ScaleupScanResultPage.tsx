// ============================================================
// CYNTRA SCALE-UP BESLUITVORMINGSSCAN™ — RESULTAAT
// Route: /portal/scaleup-scan/result/:id
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  Target,
  Activity,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  CANONICAL_SECTION_ORDER,
  type AureliusAnalysisResult,
} from "../../aurelius/utils/parseAureliusReport";
import { generateAureliusPDF } from "../../aurelius/utils/generateAureliusPDF";
import type { DecisionContract } from "@/cyntra/decision/DecisionContractTypes";

export default function ScaleupScanResultPage() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();

  const report = useMemo(() => {
    if (state) return state as AureliusAnalysisResult & Record<string, unknown>;
    if (!id) return null;
    try {
      const raw = sessionStorage.getItem(`scaleupscan_report_${id}`);
      return raw ? (JSON.parse(raw) as AureliusAnalysisResult & Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }, [state, id]);

  if (!report) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-white/60">
            Dit resultaat is niet meer beschikbaar (sessie verlopen).
          </p>
          <button
            onClick={() => nav("/portal/scaleup-scan")}
            className="px-6 py-3 rounded-xl border border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition"
          >
            Terug naar Scale-up scan
          </button>
        </div>
      </div>
    );
  }

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [signedDocuments, setSignedDocuments] = useState<any[]>([]);

  const organisationName =
    (report as any)?.organisation ||
    (report as any)?.organisatie ||
    (report as any)?.company ||
    (report as any)?.company_name ||
    "Onbekende organisatie";

  const documentsSummary =
    (report as any)?.documents_summary ||
    (report as any)?.report?.documents_summary ||
    "";

  const documentsStorage =
    (report as any)?.documents_storage ||
    (report as any)?.report?.documents_storage ||
    [];

  const documentsList = Array.isArray(documentsStorage) ? documentsStorage : [];

  const decisionFailureText =
    (report as any)?.decision_failure_text ||
    (report as any)?.report?.decision_failure_text ||
    null;

  const decisionContract =
    (report as any)?.decision_contract ||
    (report as any)?.report?.decision_contract ||
    null;

  const decisionGate =
    (report as any)?.decision_gate ||
    (report as any)?.report?.decision_gate ||
    null;

  const sections = report.sections ?? {};

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

  async function handlePdfDownload() {
    if (pdfLoading) return;
    setPdfLoading(true);
    setPdfError(null);

    try {
      generateAureliusPDF(
        report.title || "Scale-up Besluitvormingsscan",
        {
          title: report.title,
          executive_summary: report.executive_summary,
          sections: report.sections,
          interventions: (report as any)?.interventions,
        },
        organisationName,
        { confidence: 0.82 }
      );
    } catch (err: any) {
      setPdfError(
        err?.message ??
          "PDF export mislukt. Probeer het opnieuw of controleer je data."
      );
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-10 py-24">
      <div className="mx-auto max-w-6xl space-y-24">
        <button
          onClick={() => nav("/portal/scaleup-scan")}
          className="flex items-center gap-2 text-white/30 hover:text-[#d4af37] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Nieuwe scan
        </button>

        <header className="space-y-7">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/20">
            Cyntra Scale-up Besluitvormingsscan — Boardroom Output
          </p>

          <h1 className="text-5xl font-semibold text-[#d4af37] leading-tight">
            {sanitizeTitle(String(organisationName))}
          </h1>

          {decisionFailureText && (
            <div className="rounded-3xl border border-red-500/30 bg-red-950/40 p-9">
              <p className="text-xs uppercase tracking-widest text-red-300/80 mb-4">
                Besluit blokkade
              </p>
              <p className="text-lg text-red-200 leading-relaxed">
                {sanitizeText(decisionFailureText)}
              </p>
            </div>
          )}

          {!decisionFailureText && report.executive_summary && (
            <div className="rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-9">
              <p className="text-xs uppercase tracking-widest text-[#d4af37]/70 mb-4">
                Korte samenvatting
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                {sanitizeText(report.executive_summary)}
              </p>
            </div>
          )}
        </header>

        {(documentsSummary || documentsList.length > 0) && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-4">
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
                          className="text-[#d4af37] hover:underline"
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

        {decisionContract && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-[#d4af37]" />
              <h2 className="text-2xl font-semibold text-[#d4af37]">
                Besluitcontract (Scale-up)
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-6">
              <div className="text-sm text-white/40">
                Score: {decisionGate?.score?.total ?? "onbekend"} / 100
              </div>
              {renderDecisionContract(decisionContract as DecisionContract)}
            </div>
          </section>
        )}

        <section className="space-y-12">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-[#d4af37]" />
            <h2 className="text-2xl font-semibold text-[#d4af37]">
              Strategische Analyse
            </h2>
          </div>

          {(report.canonical_sections_present
            ? CANONICAL_SECTION_ORDER
            : Object.keys(sections))
            .filter((key) => key in sections)
            .map((key) => {
              const section = sections[key];
              if (!section) return null;
              return (
                <div
                  key={key}
                  className="rounded-3xl border border-white/10 bg-white/5 p-10 space-y-4"
                >
                  <p className="text-xs uppercase tracking-widest text-white/40">
                    {sanitizeTitle(section.title)}
                  </p>
                  <div className="text-white/75 leading-relaxed whitespace-pre-wrap">
                    {normalizeSectionContent(section.content)}
                  </div>
                </div>
              );
            })}
        </section>

        <section className="rounded-3xl border border-blue-500/20 bg-white/5 p-10 space-y-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-[#d4af37]">
              Volgende closure interventie
            </h3>
          </div>

          <p className="text-white/65 leading-relaxed">
            De schaal doorbraak ontstaat wanneer één owner expliciet mandaat
            krijgt om focus te forceren en runway-besluitvorming te sluiten.
          </p>
        </section>

        <section className="pt-6 flex flex-col gap-5">
          <button
            onClick={handlePdfDownload}
            disabled={pdfLoading}
            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl
                       border border-[#d4af37]/60 text-[#d4af37]
                       hover:bg-[#d4af37] hover:text-black transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-5 w-5" />
            {pdfLoading
              ? "PDF wordt opgebouwd…"
              : "Download Scale-up Besluitrapport"}
          </button>

          {pdfError && <p className="text-sm text-red-400">{pdfError}</p>}

          <p className="text-xs text-white/20 max-w-2xl leading-relaxed">
            Cyntra output is geen advies.
            Dit is een besluitdiagnose: waar closure ontbreekt,
            blijft besluitvorming circulair.
            Outcome ontstaat pas na ownership en mandaat.
          </p>
        </section>

        <p className="text-[11px] uppercase tracking-[0.4em] text-white/15 pt-10">
          Analyse zonder closure is ruis.
        </p>
      </div>
    </div>
  );
}

function renderDecisionContract(contract: DecisionContract) {
  return (
    <div className="space-y-3 text-white/80">
      <p>
        <span className="text-white/50">Besluit:</span> {contract.decision_statement}
      </p>
      <p>
        <span className="text-white/50">Owner:</span> {contract.owner}
      </p>
      <p>
        <span className="text-white/50">Scope:</span> {contract.scope}
      </p>
      <p>
        <span className="text-white/50">Onomkeerbaar:</span> {contract.irreversible_action}
      </p>
      <p>
        <span className="text-white/50">Consequence:</span> {contract.consequence_if_not_executed}
      </p>
      <p>
        <span className="text-white/50">Window (dagen):</span> {contract.execution_window_days}
      </p>
      <p>
        <span className="text-white/50">Eerste signaal:</span> {contract.first_execution_signal}
      </p>
      <p>
        <span className="text-white/50">Failure mode:</span> {contract.failure_mode_if_ignored}
      </p>
    </div>
  );
}

function sanitizeTitle(value: string): string {
  return sanitizeText(value.replace(/HGBCO/gi, "Besluitkaart"));
}

function sanitizeText(value: string): string {
  return value
    .replace(/\*+/g, "")
    .replace(/HGBCO/gi, "Besluitkaart")
    .replace(/primary structural failure/gi, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[•]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function normalizeSectionContent(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return sanitizeText(content);
  if (Array.isArray(content)) {
    return content.map((item) => sanitizeText(String(item))).join("\n\n");
  }
  if (typeof content === "object") {
    return Object.values(content)
      .flatMap((value) => {
        if (Array.isArray(value)) return value.map(String);
        return [String(value)];
      })
      .map((value) => sanitizeText(value))
      .join("\n\n");
  }
  return sanitizeText(String(content));
}
