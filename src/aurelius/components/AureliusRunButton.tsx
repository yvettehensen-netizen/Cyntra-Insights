import { useState } from "react";
import { useAureliusAnalysis } from "@/aurelius/hooks/useAureliusAnalysis";
import { Loader2 } from "lucide-react";

export default function AureliusRunButton() {
  const { runAnalysis, loading, result, error } = useAureliusAnalysis();

  const [context, setContext] = useState("");
  const [documents, setDocuments] = useState("");

  // Lokale reset — want jouw hook heeft geen reset functie
  const handleReset = () => {
    setContext("");
    setDocuments("");
  };

  const handleRun = async () => {
    if (!context.trim() && !documents.trim()) return;

    await runAnalysis({
      analysisType: "strategy",
      textInput: context.trim(),
      fileInputBase64: documents.trim(), // tijdelijk als tekst, later base64 van PDF
    });
  };

  const hasInput = context.trim().length > 0 || documents.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-12">
      {/* Bedrijfscontext */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bedrijfscontext & Strategische Vraag
        </label>
        <textarea
          className="w-full p-5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:outline-none transition-all resize-none"
          rows={8}
          placeholder="Beschrijf het bedrijf, huidige situatie, doelen, uitdagingen, team, metrics, marktpositie..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Extra documenten / tekst */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Optioneel: Extra documenten, interviews of notities
        </label>
        <textarea
          className="w-full p-5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[#D4AF37]/50 focus:outline-none transition-all resize-none"
          rows={5}
          placeholder="Plak hier aanvullende informatie, transcripties, of later: geüploade documenten..."
          value={documents}
          onChange={(e) => setDocuments(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Run knop */}
      <div className="flex justify-center">
        <button
          onClick={handleRun}
          disabled={loading || !hasInput}
          className="group relative px-12 py-5 bg-gradient-to-r from-[#8B1538] to-[#D4AF37] rounded-xl font-bold text-black text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-4"
        >
          {loading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Aurelius analyseert...
            </>
          ) : (
            "Run Aurelius 3.5"
          )}
          <span className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Foutmelding */}
      {error && (
        <div className="max-w-2xl mx-auto p-5 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-center">
          <p className="font-medium">Analyse mislukt</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={handleReset}
            className="mt-4 text-sm underline hover:text-white transition"
          >
            Velden leegmaken en opnieuw proberen
          </button>
        </div>
      )}

      {/* Resultaat */}
      {result && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#D4AF37]">Analyse Voltooid</h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-white underline transition"
            >
              Nieuwe analyse starten
            </button>
          </div>
          <pre className="bg-black/50 border border-white/10 rounded-xl p-6 text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}