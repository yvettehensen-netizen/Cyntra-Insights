import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { runInteractiveIntake, runFullIntelligenceAnalysis, type IntakeMessage } from "../cie/client";

export default function IntakeWizardChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IntakeMessage[]>([
    {
      role: "assistant",
      content:
        "Hoi, ik ben Cyntra. Laten we beginnen met een intake voor jouw bedrijf. Kun je je bedrijf kort beschrijven? Sector, omzet, aantal FTE en type klanten graag.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [intakeDone, setIntakeDone] = useState(false);
  const [intakeSummary, setIntakeSummary] = useState<string | null>(null);
  const [intakeState, setIntakeState] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingFull, setAnalyzingFull] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    const updatedMessages: IntakeMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await runInteractiveIntake(updatedMessages);

      if (response.is_complete) {
        setIntakeDone(true);
        setIntakeSummary(response.summary);
        setIntakeState(response.intake_state);

        const finalMessages: IntakeMessage[] = [
          ...updatedMessages,
          {
            role: "assistant",
            content:
              "Dank je! Ik heb nu een compleet beeld van jouw bedrijf. Klik hieronder om de volledige analyse te starten.",
          },
        ];
        setMessages(finalMessages);

        localStorage.setItem(
          "cyntra_intake_last",
          JSON.stringify({
            messages: finalMessages,
            summary: response.summary,
            intake_state: response.intake_state,
            recommended_analyses: response.recommended_analyses,
            generatedAt: new Date().toISOString(),
          })
        );
      } else {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: response.next_question },
        ]);
      }
    } catch (err: any) {
      console.error("Intake error:", err);
      setError(
        err.message ||
          "Er ging iets mis bij het ophalen van het antwoord. Probeer het opnieuw."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStartAnalysis() {
    if (!intakeSummary) return;

    setAnalyzingFull(true);
    setError(null);

    try {
      const { success, data, error } = await runFullIntelligenceAnalysis({
        company_context: intakeSummary,
        document_data: "",
      });

      if (!success) {
        throw new Error(error?.message || "Analyse mislukt.");
      }

      const toStore = {
        generatedAt: new Date().toISOString(),
        context: intakeSummary,
        documentPresent: false,
        result: data,
      };
      localStorage.setItem("cyntra_last_full_report", JSON.stringify(toStore));

      navigate("/full-report");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(
        err.message || "De volledige analyse is mislukt. Probeer het later opnieuw."
      );
    } finally {
      setAnalyzingFull(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-inter">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#F5D66B]">
            Full AI Report – Interactieve Intake
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Cyntra stelt je gerichte vragen over jouw bedrijf. Daarna genereert het
            systeem een volledig strategisch rapport met alle analyses.
          </p>
        </div>

        <div className="bg-[#0b0b0b] border border-[#222] rounded-2xl p-6 mb-6 h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "assistant"
                      ? "bg-[#F5D66B]/10 border border-[#F5D66B]/30 text-gray-200"
                      : "bg-[#222] border border-[#333] text-gray-300"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wide mb-1 opacity-60">
                    {msg.role === "assistant" ? "Cyntra" : "Jij"}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-[#F5D66B]/10 border border-[#F5D66B]/30">
                  <div className="text-[10px] uppercase tracking-wide mb-1 opacity-60">
                    Cyntra
                  </div>
                  <p className="text-sm text-gray-400 italic">
                    Denkt na...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {!intakeDone && (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type je antwoord hier..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-[#0b0b0b] border border-[#333] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#F5D66B] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-lg bg-[#F5D66B] text-black font-semibold hover:bg-[#E5C65B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Verstuur
            </button>
          </form>
        )}

        {intakeDone && (
          <div className="bg-[#0b0b0b] border border-[#333] rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#F5D66B] mb-2">
                Intake Compleet
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Cyntra heeft nu een volledig beeld van jouw bedrijf. Klik op de
                knop hieronder om de complete analyse te starten. Dit omvat SWOT,
                benchmark, financiële analyse, cashflow, quick wins, onderstroom,
                teamdynamiek, veranderkracht en een 90-dagen masterplan.
              </p>
              {intakeSummary && (
                <div className="bg-[#050505] border border-[#222] rounded-lg p-4 mb-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Samenvatting Intake
                  </h4>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {intakeSummary}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={analyzingFull}
              className="w-full px-6 py-4 rounded-lg bg-[#F5D66B] text-black font-semibold text-base hover:bg-[#E5C65B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzingFull
                ? "Analyse loopt... (15-20 sec)"
                : "Start Volledige Analyse (CIE)"}
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-4 py-2 rounded-lg border border-[#333] text-gray-300 text-sm hover:border-[#555] transition-colors"
            >
              Terug naar Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
