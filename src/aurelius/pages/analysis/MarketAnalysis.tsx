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
  BarChart3,
} from "lucide-react";

import { generateAureliusPDF } from "../../utils/generateAureliusPDF";

/* =========================
   COMPONENT
========================= */

export default function MarketAnalysis() {
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
      reader.onerror = () => reject(new Error("Bestand lezen mislukt"));
      reader.readAsDataURL(file);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =========================
     ANALYSIS
  ========================= */

  const startAnalysis = async () => {
    if (!hasInput || loading) return;

    try {
      let document_data: string | null = null;

      if (file) {
        document_data = await readFileAsBase64(file);
      }

      const record = await runAurelius3({
        analysis_type: "strategy",
        company_context: context.trim(),
        ...(document_data ? { document_data } : {}),
      });

      if (!record?.report || typeof record.report !== "string") {
        throw new Error("Geen geldig rapport ontvangen");
      }

      const parsed = parseAureliusReport(record.report, "strategy");
      setReport(parsed);
    } catch (err) {
      console.error("Marktanalyse mislukt:", err);
    }
  };

  /* =========================
     PDF
  ========================= */

  const downloadPDF = () => {
    if (!report) return;
    generateAureliusPDF(
      report.title ?? "Markt & Concurrentie Analyse",
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 pt-32 pb-40 text-white">
      {loading && (
        <div className="mb-6 flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Markt wordt geanalyseerd…</span>
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

          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-8">
              <div
                className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-200"
                dangerouslySetInnerHTML={{
                  __html: String(report.html_content),
                }}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              Markt & Concurrentie Analyse
            </h1>

            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={12}
              className="w-full rounded-md bg-black/30 border border-white/10 p-6 resize-none"
              placeholder="Beschrijf marktdynamiek, concurrenten, prijsdruk, substitutie, klantkeuzes, differentiatie en waar positionering onder druk staat."
            />

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
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
              {loading ? "Analyseren…" : "Start Marktanalyse"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
