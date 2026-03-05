// src/aurelius/pages/analysis/StrategyAnalysis.tsx
import { useState, useRef } from "react";
import {
  AureliusAnalysisResult,
  parseAureliusReport,
} from "../../utils/parseAureliusReport";
import { useAurelius3 } from "../../hooks/useAurelius3";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

import {
  Loader2,
  Upload,
  AlertCircle,
  RotateCw,
  FileText,
  X,
  Download,
} from "lucide-react";

import { generateAureliusPDF } from "../../utils/generateAureliusPDF";

/* =========================
   COMPONENT
========================= */

export default function StrategyAnalysis() {
  const { runAurelius3, loading, error } = useAurelius3();

  const [context, setContext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInput = context.trim().length > 0 || file !== null;

  /* =========================
     FILE HELPERS
  ========================= */

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     ANALYSIS
  ========================= */

  const startAnalysis = async () => {
    if (!hasInput || loading) return;

    try {
      const document_data = file
        ? await readFileAsBase64(file)
        : undefined;

      const record = await runAurelius3({
        analysis_type: "strategy",
        company_context: context.trim(),
        ...(document_data ? { document_data } : {}),
      });

      if (typeof record?.report !== "string") {
        throw new Error("Ongeldig rapport ontvangen");
      }

      const parsed = parseAureliusReport(record.report, "strategy");
      setReport(parsed);
    } catch (err) {
      console.error("Analyse fout:", err);
    }
  };

  /* =========================
     PDF
  ========================= */

  const downloadPDF = () => {
    if (!report) return;
    generateAureliusPDF(
      report.title ?? "Strategische Analyse",
      report
    );
  };

  /* =========================
     RESET
  ========================= */

  const reset = () => {
    setContext("");
    setFile(null);
    setReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 pt-32 pb-40 text-white">
      {loading && (
        <div className="mb-6 flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Strategische analyse wordt uitgevoerd…</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {report ? (
        <div className="space-y-16">
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={reset}>
              <RotateCw className="mr-2 h-4 w-4" />
              Nieuwe analyse
            </Button>
            <Button variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download rapport (PDF)
            </Button>
          </div>

          {report.executive_summary && (
            <section>
              <h2 className="text-3xl font-bold mb-4">
                Executive Summary
              </h2>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {report.executive_summary}
              </p>
            </section>
          )}

          {Object.entries(report.sections).map(([key, section]) => {
            if (key === "executive_summary" || key === "title") return null;

            return (
              <section key={key}>
                <h3 className="text-2xl font-bold mb-4">
                  {section.title}
                </h3>
              </section>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-6 p-6">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={10}
              className="w-full rounded-md bg-black/30 border border-white/10 p-6 resize-none"
              placeholder="Beschrijf de strategische situatie…"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload document
            </Button>

            {file && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <FileText className="h-4 w-4" />
                <span className="truncate">{file.name}</span>
                <button onClick={removeFile}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Button
              onClick={startAnalysis}
              disabled={!hasInput || loading}
              className="bg-[#D4AF37] text-black font-bold w-full"
            >
              {loading ? "Analyseren…" : "Start analyse"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
