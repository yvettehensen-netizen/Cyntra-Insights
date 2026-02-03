import React, { useState } from "react";
import { runBenchmark } from "../../cie/client";

function SectionCard({ title, children }: any) {
  return (
    <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-100 mb-2">{title}</h3>
      <div className="text-xs text-gray-300 space-y-1">{children}</div>
    </div>
  );
}

export default function BenchmarkPage() {
  const [context, setContext] = useState("");
  const [documents, setDocuments] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadDocs = async (e: any) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setLoadingUpload(true);

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(
        import.meta.env.VITE_SUPABASE_URL + "/functions/v1/document-upload",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData
        }
      );

      const json = await res.json();
      setDocuments(json.document_data);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoadingUpload(false);
    }
  };

  const analyze = async (e: any) => {
    e.preventDefault();
    setLoadingAnalysis(true);

    try {
      const data = await runBenchmark({
        company_context: context,
        document_data: documents,
      });

      setResult(data);

      const hist = JSON.parse(localStorage.getItem("cyntra_analyses") || "[]");
      hist.push({
        type: "benchmark",
        ...data,
        generatedAt: new Date().toISOString(),
      });
      localStorage.setItem("cyntra_analyses", JSON.stringify(hist));
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-inter px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#D4AF37] mb-4">
          Benchmark Analyse
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Vergelijk uw bedrijfsprestaties met peers in uw sector
        </p>

        <form onSubmit={uploadDocs} className="mb-6 bg-[#111111] border border-[#222222] rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-2 text-gray-200">1. Documenten uploaden</h2>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#D4AF37] file:text-black hover:file:bg-[#c9a332]"
          />
          <button
            type="submit"
            disabled={loadingUpload}
            className="mt-3 bg-[#D4AF37] text-black text-xs px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-[#c9a332] transition"
          >
            {loadingUpload ? "Verwerken..." : "Upload"}
          </button>

          {documents && (
            <pre className="mt-3 bg-[#0B0B0B] text-xs p-3 rounded-xl max-h-40 overflow-y-auto text-gray-400 border border-[#222222]">
              {documents}
            </pre>
          )}
        </form>

        <form onSubmit={analyze} className="mb-6 bg-[#111111] border border-[#222222] rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-2 text-gray-200">2. Bedrijfscontext</h2>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Beschrijf uw sector, omzet, EBITDA, aantal FTE en belangrijkste KPI's..."
            className="w-full h-28 p-3 bg-[#0B0B0B] border border-[#222222] rounded-xl text-sm text-gray-200"
          />
          <button
            type="submit"
            disabled={loadingAnalysis}
            className="mt-3 bg-[#D4AF37] text-black text-xs px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-[#c9a332] transition"
          >
            {loadingAnalysis ? "Analyseren..." : "Genereer Benchmark"}
          </button>
        </form>

        {result && (
          <div className="space-y-4">
            <SectionCard title="Benchmark Metrics">
              {result.metrics?.map((m: any, i: number) => (
                <div key={i} className="pb-2 border-b border-[#222222] last:border-0">
                  <p className="font-semibold text-[#D4AF37]">{m.metric}</p>
                  <p className="text-gray-400 text-[11px]">
                    Uw waarde: <span className="text-gray-200">{m.company_value}</span> |
                    Peer gemiddelde: <span className="text-gray-200">{m.peer_average}</span> |
                    Top 25%: <span className="text-gray-200">{m.top_25_percent}</span>
                  </p>
                  {m.gap_vs_average && (
                    <p className="text-[10px] text-gray-500">
                      Gap vs gemiddelde: {m.gap_vs_average} | Gap vs top: {m.gap_vs_top}
                    </p>
                  )}
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Samenvatting">
              <p>{result.summary}</p>
            </SectionCard>

            <div className="flex gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-lg text-xs hover:bg-[#D4AF37] hover:text-black transition"
              >
                Print / PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
