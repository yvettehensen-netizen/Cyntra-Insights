import React, { useState } from "react";
import { runQuickWins } from "../../cie/client";

function SectionCard({ title, children }: any) {
  return (
    <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-100 mb-2">{title}</h3>
      <div className="text-xs text-gray-300 space-y-1">{children}</div>
    </div>
  );
}

export default function QuickWinsPage() {
  const [context, setContext] = useState("");
  const [documentData, setDocumentData] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadDocs = async (e: any) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setLoadingUpload(true);

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));

    try {
      const res = await fetch(
        import.meta.env.VITE_SUPABASE_URL + "/functions/v1/document-upload",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: fd
        }
      );
      const data = await res.json();
      setDocumentData(data.document_data);
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
      const out = await runQuickWins({
        company_context: context,
        document_data: documentData,
      });

      setResult(out);

      const history = JSON.parse(localStorage.getItem("cyntra_analyses") || "[]");
      history.push({
        type: "quickwins",
        ...out,
        generatedAt: new Date().toISOString(),
      });
      localStorage.setItem("cyntra_analyses", JSON.stringify(history));
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
          Quick Wins Analyse
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Identificeer financiële quick wins met hoge ROI: pricing, inkoop, voorraad, digitalisering
        </p>

        <form onSubmit={uploadDocs} className="mb-6 bg-[#111111] border border-[#222222] rounded-xl p-5">
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

          {documentData && (
            <pre className="mt-3 bg-[#0B0B0B] text-xs p-3 rounded-xl max-h-40 overflow-y-auto text-gray-400 border border-[#222222]">
              {documentData}
            </pre>
          )}
        </form>

        <form onSubmit={analyze} className="mb-6 bg-[#111111] border border-[#222222] rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-2 text-gray-200">2. Bedrijfscontext</h2>
          <textarea
            className="w-full h-28 bg-[#0B0B0B] border border-[#222222] rounded-xl p-3 text-sm text-gray-200"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Beschrijf uw sector, omzet, marges, voorraadomloop, inkoopprocessen en belangrijkste uitdagingen..."
          />
          <button
            type="submit"
            disabled={loadingAnalysis}
            className="mt-3 bg-[#D4AF37] text-black text-xs px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-[#c9a332] transition"
          >
            {loadingAnalysis ? "Analyseren..." : "Genereer Quick Wins"}
          </button>
        </form>

        {result && (
          <div className="space-y-4">
            <SectionCard title="Quick Wins (ROI first)">
              {result.quick_wins?.map((q: any, i: number) => (
                <div key={i} className="pb-3 border-b border-[#222222] last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#D4AF37]">{q.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      q.confidence === 'High' ? 'bg-green-900/20 text-green-400' :
                      q.confidence === 'Medium' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {q.confidence}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mb-2">{q.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-[#111111] p-2 rounded">
                      <div className="text-gray-500">Impact 12m</div>
                      <div className="text-gray-200 font-semibold">
                        €{q.expected_impact_12m?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="bg-[#111111] p-2 rounded">
                      <div className="text-gray-500">Investering</div>
                      <div className="text-gray-200 font-semibold">
                        €{q.investment_required?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="bg-[#111111] p-2 rounded">
                      <div className="text-gray-500">ROI</div>
                      <div className="text-[#D4AF37] font-semibold">
                        {q.roi_months} mnd
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Executive Samenvatting">
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
