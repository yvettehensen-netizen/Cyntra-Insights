import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { submitBoardTestResult } from "@/api/submitBoardTestResult";

type MaturityLabel = "instrument" | "rapport";

const scoreOpties = [1, 2, 3, 4, 5];

export default function BoardTestPage() {
  const [clarityScore, setClarityScore] = useState(3);
  const [riskRecallScore, setRiskRecallScore] = useState(3);
  const [decisionNeedScore, setDecisionNeedScore] = useState(3);
  const [maturityLabel, setMaturityLabel] = useState<MaturityLabel>("instrument");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const perceivedMaturity = useMemo(() => {
    return maturityLabel === "instrument" ? 85 : 35;
  }, [maturityLabel]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const session = await supabase.auth.getSession();
      const boardMemberId =
        session.data.session?.user?.id || crypto.randomUUID();

      const decisionConfidence = Number(
        (((riskRecallScore + decisionNeedScore) / 2) * 20).toFixed(1)
      );

      await submitBoardTestResult({
        board_member_id: boardMemberId,
        clarity_score: clarityScore,
        decision_confidence: decisionConfidence,
        perceived_maturity: perceivedMaturity,
        feedback: feedback.trim(),
      });

      setStatus("Bestuurlijke adoptietest opgeslagen.");
      setFeedback("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Opslaan bestuurlijke adoptietest mislukt."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[980px] px-4 pb-10 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-[#0f141c] p-6">
        <header className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Bestuurlijke adoptietest</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Bestuurlijke bruikbaarheidstest</h1>
        </header>

        <form onSubmit={onSubmit} className="space-y-5">
          <QuestionScale
            label="Begrijp je de staat binnen 60 seconden?"
            value={clarityScore}
            onChange={setClarityScore}
          />

          <QuestionScale
            label="Kun je het dominante risico herhalen?"
            value={riskRecallScore}
            onChange={setRiskRecallScore}
          />

          <QuestionScale
            label="Weet je welke beslissing nodig is?"
            value={decisionNeedScore}
            onChange={setDecisionNeedScore}
          />

          <fieldset className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
            <legend className="px-1 text-sm font-medium text-white">
              Voelt dit als instrument of rapport?
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMaturityLabel("instrument")}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  maturityLabel === "instrument"
                    ? "border-white/70 bg-white/15 text-white"
                    : "border-white/20 bg-transparent text-white/75"
                }`}
              >
                Instrument
              </button>
              <button
                type="button"
                onClick={() => setMaturityLabel("rapport")}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  maturityLabel === "rapport"
                    ? "border-white/70 bg-white/15 text-white"
                    : "border-white/20 bg-transparent text-white/75"
                }`}
              >
                Rapport
              </button>
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-sm text-white/80">Feedback</span>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/20 bg-[#0b1017] px-3 py-2 text-sm text-white"
              placeholder="Wat helpt, wat ontbreekt, wat moet scherper?"
            />
          </label>

          {status ? (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
              {status}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-red-400/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Opslaan adoptietest"}
          </button>
        </form>
      </section>
    </div>
  );
}

function QuestionScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-white/10 bg-[#0b1017] p-4">
      <legend className="px-1 text-sm font-medium text-white">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {scoreOpties.map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`h-9 w-9 rounded-full border text-sm font-semibold ${
              score === value
                ? "border-white/75 bg-white/15 text-white"
                : "border-white/25 text-white/70"
            }`}
            aria-label={`${label} score ${score}`}
          >
            {score}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
