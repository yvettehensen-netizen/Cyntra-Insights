import { useState } from "react";
import { useAureliusAnalysis } from "../hooks/useAureliusAnalysis";
import AureliusResultBlock from "./AureliusResultBlock";

/**
 * AURELIUS ANALYSIS RUNNER — HEILIGE UI
 * ✅ Type-safe
 * ✅ Geen hook- of backend-wijzigingen
 * ➕ Besluitcontext additief verwerkt
 */
export default function AureliusAnalysisRunner() {
  const [context, setContext] = useState("");
  const [documents, setDocuments] = useState("");
  const [decisionQuestion, setDecisionQuestion] = useState("");

  const { loading, result, error, runAnalysis } = useAureliusAnalysis();

  async function start() {
    const combinedContext = `
${context}

${
  decisionQuestion
    ? `\n---\nBESTUURLIJK BESLUIT / VASTLOPENDE KEUZE:\n${decisionQuestion}`
    : ""
}
`.trim();

    await runAnalysis({
      analysisType: "strategy",
      textInput: combinedContext,
      ...(documents ? { fileInputBase64: documents } : {}),
    });
  }

  return (
    <div className="text-white max-w-3xl space-y-6">
      {/* ================= CONTEXT ================= */}
      <textarea
        className="w-full bg-black/30 border border-white/10 p-4 rounded-lg"
        rows={6}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Beschrijf het bedrijf, context, strategische spanningen…"
      />

      {/* ================= DECISION CONTEXT (ADD ONLY) ================= */}
      <textarea
        className="w-full bg-black/25 border border-white/10 p-4 rounded-lg"
        rows={3}
        value={decisionQuestion}
        onChange={(e) => setDecisionQuestion(e.target.value)}
        placeholder="Optioneel: welk besluit moet bestuur nemen of waar loopt besluitvorming vast?"
      />

      {/* ================= DOCUMENTS ================= */}
      <textarea
        className="w-full bg-black/20 border border-white/10 p-4 rounded-lg"
        rows={4}
        value={documents}
        onChange={(e) => setDocuments(e.target.value)}
        placeholder="Optioneel: extra notities, documenten…"
      />

      {/* ================= ACTION ================= */}
      <button
        disabled={loading}
        onClick={start}
        className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg disabled:opacity-60"
      >
        {loading ? "Analyseren…" : "Start Analyse"}
      </button>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="text-red-400 bg-red-900/30 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ================= RESULT ================= */}
      {result && <AureliusResultBlock result={result} />}
    </div>
  );
}
