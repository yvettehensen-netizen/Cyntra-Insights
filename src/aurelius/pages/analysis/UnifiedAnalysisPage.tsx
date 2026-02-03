// ============================================================
// src/aurelius/pages/analysis/UnifiedAnalysisPage.tsx
// UNIFIED WORLD — PRE + POST LOGIN — SINGLE ORCHESTRATOR ENTRY
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { ANALYSES } from "../../config/analyses.config";
import { useCyntraAnalysis } from "../../hooks/useCyntraAnalysis";

import {
  parseAureliusReport,
  type AureliusAnalysisResult,
  CANONICAL_SECTION_ORDER,
} from "../../utils/parseAureliusReport";

import { generateBoardroomNarrative } from "../../narrative/generateBoardroomNarrative";
import {
  generateAureliusPDF,
  type AnalysisResult as PDFAnalysisResult,
} from "../../utils/generateAureliusPDF";

import type { AnalysisType as AureliusAnalysisType } from "../../types";

import CyntraAnalysisLayout from "../../layouts/CyntraAnalysisLayout";
import Watermark from "../../components/Watermark";

import {
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  X,
  Printer,
} from "lucide-react";

import type { LinguisticSignalBundle } from "../../engine/linguisticSignals";
import InterventiePlan from "../../components/report/InterventiePlan";

/* ============================================================
   ADD ONLY — EXECUTION PLAN
============================================================ */
import { buildExecutionPlanFromReport } from "../../execution/buildExecutionPlanFromReport";
import ExecutionPlan90D from "../../components/report/ExecutionPlan90D";

/* ============================================================
   CONSTANTS
============================================================ */

const MIN_NARRATIVE_WORDS = 3500;

/* ============================================================
   PDF BRIDGE
============================================================ */

const toPDFReport = (r: AureliusAnalysisResult): PDFAnalysisResult =>
  ({
    title: r.title,
    executive_summary: r.executive_summary,
    sections: r.sections,
    interventions: (r as any)?.interventions,
    hgbco: (r as any)?.hgbco,
  } as PDFAnalysisResult);

/* ============================================================
   PAGE
============================================================ */

export default function UnifiedAnalysisPage() {
  const { slug } = useParams<{ slug?: string }>();

  const normalizedSlug = slug?.replace(/-/g, "_");
  const analysis =
    (normalizedSlug &&
      ANALYSES[normalizedSlug as keyof typeof ANALYSES]) ||
    ANALYSES.strategy;

  const analysisType =
    (analysis.analysisType as AureliusAnalysisType) || "strategy";

  const { runCyntraAnalysis, loading, error, reset: resetEngine } =
    useCyntraAnalysis();

  /* ================= STATE ================= */

  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]); // ✅ MULTI FILE
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [clientName, setClientName] = useState("");

  const [linguisticSignals, setLinguisticSignals] =
    useState<LinguisticSignalBundle | null>(null);

  // 5 intakevragen — blijven bestaan
  const [intakeAnswers, setIntakeAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= DERIVED ================= */

  const executionPlan =
    report ? buildExecutionPlanFromReport(report as any) : null;

  /* ================= HELPERS ================= */

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  /* ================= EXECUTION ================= */

  const startAnalysis = async () => {
    if (loading || isBuilding) return;

    setLocalError(null);
    setIsBuilding(true);

    try {
      /* ========= DOCUMENTEN ========= */

      const documents = await Promise.all(
        files.map(async (file, idx) => ({
          id: `${idx}-${file.name}`,
          filename: file.name,
          content: await readFileAsBase64(file),
        }))
      );

      const safeContext =
        context.trim() ||
        "Geen expliciete context aangeleverd. Analyseer structureel.";

      /* ========= ENGINE ========= */

      const intelligence = await runCyntraAnalysis({
        analysis_type: analysisType,
        company_context: safeContext,
      });

      if (!intelligence?.report) {
        throw new Error("Geen analyse-output ontvangen");
      }

      if ((intelligence as any)?.linguistic_signals) {
        setLinguisticSignals(
          (intelligence as any).linguistic_signals as LinguisticSignalBundle
        );
      }

      const reportText = String(intelligence.report);

      /* ============================================================
         🔑 CORRECT CONTRACT → BoardroomInput
      ============================================================ */

      const narrative = await generateBoardroomNarrative(
        {
          analysis_id: crypto.randomUUID(), // ✅ FIX
          company_name: clientName || "Onbenoemde organisatie",

          questions: {
            q1: intakeAnswers.q1,
            q2: intakeAnswers.q2,
            q3: intakeAnswers.q3,
            q4: intakeAnswers.q4,
            q5: intakeAnswers.q5,
          },

          documents,
          company_context: reportText, // legacy-safe
        },
        {
          minWords: MIN_NARRATIVE_WORDS,
        }
      );

      const parsed = parseAureliusReport(narrative.text, analysisType);
      setReport(parsed);
    } catch (err) {
      console.error(err);
      setLocalError(err instanceof Error ? err.message : "Analyse mislukt");
    } finally {
      setIsBuilding(false);
    }
  };

  /* ================= PDF ================= */

  const printReport = () => {
    if (!report) return;

    generateAureliusPDF(
      report.title || "Aurelius Analyse",
      toPDFReport(report),
      clientName || "Onbekende organisatie",
      { confidence: 0.82 }
    );
  };

  /* ================= RESET ================= */

  const reset = () => {
    setContext("");
    setFiles([]);
    setReport(null);
    setLocalError(null);
    setIsBuilding(false);
    setClientName("");
    setLinguisticSignals(null);
    setIntakeAnswers({ q1: "", q2: "", q3: "", q4: "", q5: "" });
    resetEngine();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    reset();
  }, [slug]);

  /* ================= RENDER ================= */

  return (
    <CyntraAnalysisLayout title={analysis.title} subtitle={analysis.subtitle}>
      {report && <Watermark risk="MODERATE" />}

      {(loading || isBuilding) && (
        <div className="mb-8 flex items-center gap-2 text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyse wordt opgebouwd…
        </div>
      )}

      {(error || localError) && (
        <div className="mb-8 flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error || localError}
        </div>
      )}

      {!report ? (
        <>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Naam organisatie"
            className="w-full mb-6 bg-black/40 border border-white/10 p-4 text-white"
          />

          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full mb-6 bg-black/40 border border-white/10 p-4 text-white"
            rows={6}
            placeholder="Vrije context"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              setFiles(e.target.files ? Array.from(e.target.files) : [])
            }
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 flex items-center gap-3 border border-white/20 px-6 py-3 text-white/80"
          >
            <Upload className="h-4 w-4" />
            Documenten uploaden (tot 20+)
          </button>

          {files.map((f) => (
            <div key={f.name} className="text-white/60 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {f.name}
            </div>
          ))}

          <button
            onClick={startAnalysis}
            disabled={loading || isBuilding}
            className="px-10 py-4 bg-[#d4af37] text-black font-bold uppercase"
          >
            Start analyse
          </button>
        </>
      ) : (
        <>
          <div className="mb-10 flex gap-6">
            <button onClick={reset} className="text-white/60">
              Nieuwe analyse
            </button>

            <button
              onClick={printReport}
              className="flex items-center gap-2 text-[#d4af37]"
            >
              <Printer className="h-4 w-4" />
              Exporteer PDF
            </button>
          </div>

          {CANONICAL_SECTION_ORDER.map(
            (key) =>
              report.sections[key] && (
                <section key={key} className="mb-16">
                  <h3 className="text-[#d4af37] mb-4 uppercase">
                    {report.sections[key].title}
                  </h3>
                  <pre className="whitespace-pre-wrap text-white/70">
                    {String(report.sections[key].content)}
                  </pre>
                </section>
              )
          )}

          {(report as any)?.interventions && (
            <InterventiePlan interventions={(report as any).interventions} />
          )}

          {executionPlan && <ExecutionPlan90D plan={executionPlan} />}
        </>
      )}
    </CyntraAnalysisLayout>
  );
}
