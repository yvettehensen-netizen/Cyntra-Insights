import { useState } from "react";
import {
  AureliusAnalysisResult,
  parseAureliusReport,
} from "../../utils/parseAureliusReport";
import { useAurelius3 } from "../../hooks/useAurelius3";
import AureliusNavbar from "@/aurelius/components/AureliusNavbar";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

import {
  Users,
  HelpCircle,
  ArrowRight,
  Lock,
  Clock,
  Loader2,
  AlertCircle,
  RotateCw,
  Download,
} from "lucide-react";

import { generateAureliusPDF } from "../../utils/generateAureliusPDF";

/* =========================
   COMPONENT
========================= */

export default function TeamDynamicsAnalysis() {
  const { runAurelius3, loading, error } = useAurelius3();

  const [context, setContext] = useState("");
  const [documents, setDocuments] = useState("");
  const [showGatekeeper, setShowGatekeeper] = useState(true);
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);

  const hasInput = context.trim().length > 0;

  /* =========================
     ANALYSIS
  ========================= */

  const startAnalysis = async () => {
    if (!hasInput || loading) return;

    try {
      const payload: {
        analysis_type: string;
        company_context: string;
        document_data?: string;
      } = {
        analysis_type: "strategy",
        company_context: context.trim(),
      };

      if (documents.trim().length > 0) {
        payload.document_data = documents.trim();
      }

      const record = await runAurelius3(payload);

      if (!record?.report || typeof record.report !== "string") {
        throw new Error("Geen geldig rapport ontvangen");
      }

      const parsed = parseAureliusReport(record.report, "strategy");
      setReport(parsed);
    } catch (err) {
      console.error("Teamdynamiek analyse fout:", err);
    }
  };

  /* =========================
     PDF
  ========================= */

  const downloadPDF = () => {
    if (!report) return;
    generateAureliusPDF(
      "Teamdynamiek & Machtsstructuren",
      report
    );
  };

  /* =========================
     RESET
  ========================= */

  const reset = () => {
    setContext("");
    setDocuments("");
    setReport(null);
    setShowGatekeeper(true);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0A090A] via-[#120B10] to-[#0A090A] text-white overflow-hidden">
      <AureliusNavbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40">
        {/* STATUS */}
        {loading && (
          <div className="mb-8 flex items-center gap-3 text-lg text-gray-300">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Aurelius ontleedt teamstructuren…</span>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-center gap-3 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= RESULT ================= */}
        {report ? (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#D4AF37]">
                  Teamdynamiek & Machtsstructuren
                </h1>
                <p className="text-gray-400 mt-2">
                  Strategische analyse van besluitvorming en invloed
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={reset}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Nieuwe analyse
                </Button>
                <Button variant="outline" onClick={downloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-8">
                <div
                  className="prose prose-invert max-w-none text-gray-200 leading-relaxed space-y-8"
                  dangerouslySetInnerHTML={{
                    __html: String(report.html_content),
                  }}
                />
              </CardContent>
            </Card>

            <details className="mt-12">
              <summary className="cursor-pointer text-lg font-medium text-[#D4AF37] hover:underline">
                Toon volledige AI-output (markdown)
              </summary>
              <pre className="mt-4 whitespace-pre-wrap text-gray-300 text-sm bg-black/40 p-6 rounded-lg border border-white/10 overflow-auto">
                {report.raw_markdown}
              </pre>
            </details>
          </div>
        ) : (
          <>
            {/* ================= GATEKEEPER ================= */}
            {showGatekeeper && (
              <div className="bg-black/65 backdrop-blur-xl border border-[#D4AF37]/40 rounded-3xl p-16 text-center space-y-12 shadow-2xl max-w-4xl mx-auto">
                <HelpCircle className="w-16 h-16 mx-auto text-[#D4AF37]" />

                <h2 className="text-5xl font-bold leading-tight">
                  Teams liegen niet
                  <br />
                  <span className="text-[#D4AF37]">
                    — structuren doen dat wel
                  </span>
                </h2>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Aurelius analyseert teamdynamiek op macht, invloed en verborgen besluitvorming —
                  niet op individueel gedrag.
                </p>

                <button
                  onClick={() => setShowGatekeeper(false)}
                  className="inline-flex items-center gap-6 px-24 py-10 rounded-3xl bg-[#D4AF37] text-black font-bold text-2xl shadow-xl hover:scale-105 transition"
                >
                  Ik geef de echte teamrealiteit
                  <ArrowRight size={36} />
                </button>
              </div>
            )}

            {/* ================= FORM ================= */}
            {!showGatekeeper && (
              <Card className="bg-black/40 border-white/10 mt-16">
                <CardContent className="space-y-8 p-10">
                  <div className="flex items-center gap-4 text-2xl font-bold text-[#D4AF37]">
                    <Users className="h-8 w-8" />
                    Teamdynamiek & Machtsstructuren
                  </div>

                  <textarea
                    rows={12}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Wie beslist écht? Welke conflicten worden vermeden? Wie heeft informele macht?"
                    className="w-full rounded-lg bg-black/50 border border-white/10 p-6 resize-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition"
                  />

                  <textarea
                    rows={6}
                    value={documents}
                    onChange={(e) => setDocuments(e.target.value)}
                    placeholder="Organogrammen, HR-notities, observaties, e-mails (optioneel)"
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-6 resize-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                  />

                  <div className="text-center pt-6">
                    <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-black/40 border border-white/10 mb-6">
                      <Clock className="w-6 h-6 text-[#D4AF37]" />
                      <span className="text-gray-300">
                        Analyse duurt ± 3–5 minuten
                      </span>
                      <Lock className="w-6 h-6 text-[#D4AF37]" />
                    </div>

                    <Button
                      onClick={startAnalysis}
                      disabled={!hasInput || loading}
                      className="w-full bg-[#D4AF37] text-black font-bold text-2xl py-8"
                    >
                      {loading ? "Analyseren…" : "Start Teamdynamiek Analyse"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
