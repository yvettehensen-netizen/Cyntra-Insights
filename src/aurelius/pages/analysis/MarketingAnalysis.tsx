// src/aurelius/pages/analysis/MarketingAnalysis.tsx
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

export default function MarketingAnalysis() {
  const { runAurelius3, loading, error } = useAurelius3();

  const [context, setContext] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<AureliusAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInput = context.trim().length > 0 || file !== null;

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startAnalysis = async () => {
    if (!hasInput || loading) return;

    try {
      const document_data = file
        ? await readFileAsBase64(file)
        : undefined;

      const record = await runAurelius3({
        analysis_type: "marketing",
        company_context: context.trim(),
        ...(document_data ? { document_data } : {}),
      });

      if (typeof record?.report !== "string") {
        throw new Error("Ongeldig rapport ontvangen");
      }

      setReport(parseAureliusReport(record.report, "marketing"));
    } catch (err) {
      console.error("Marketing analyse fout:", err);
    }
  };

  const downloadPDF = () => {
    if (!report) return;
    generateAureliusPDF(report.title ?? "Marketing Analyse", report);
  };

  const reset = () => {
    setContext("");
    setFile(null);
    setReport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 pt-32 pb-40 text-white">
      {loading && (
        <div className="mb-6 flex items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin h-4 w-4" />
          <span>Marketinganalyse wordt uitgevoerd…</span>
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
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={12}
              className="w-full rounded-md bg-black/30 border border-white/10 p-6 resize-none"
              placeholder="Beschrijf positionering, kanalen, funnel, conversie en boodschap…"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
            />

            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
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
              {loading ? "Analyseren…" : "Start Marketing Analyse"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
