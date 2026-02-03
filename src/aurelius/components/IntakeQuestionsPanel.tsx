// ============================================================
// INTAKE QUESTIONS PANEL — EXECUTIVE GATE
// Path: src/aurelius/components/intake/IntakeQuestionsPanel.tsx
// ============================================================

import { useState } from "react";

interface IntakeQuestionsPanelProps {
  questions: string[];
  onComplete: (answers: string[]) => void;
}

export default function IntakeQuestionsPanel({
  questions,
  onComplete,
}: IntakeQuestionsPanelProps) {
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("")
  );

  const isComplete = answers.every((a) => a.trim().length > 2);

  return (
    <section className="border border-white/10 bg-black/30 p-10 mb-10">
      <h2 className="text-xs uppercase tracking-widest text-white/50 mb-6">
        Executive Intake — Required
      </h2>

      <div className="space-y-8">
        {questions.map((q, i) => (
          <div key={i}>
            <p className="text-sm text-[#d4af37] mb-2">
              {i + 1}. {q}
            </p>

            <textarea
              value={answers[i]}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              rows={3}
              placeholder="Antwoord…"
              className="w-full bg-black/40 border border-white/10 p-4 text-white resize-none"
            />
          </div>
        ))}
      </div>

      <button
        disabled={!isComplete}
        onClick={() => onComplete(answers)}
        className="mt-10 px-10 py-4 text-xs uppercase border border-[#d4af37] text-[#d4af37] disabled:opacity-30"
      >
        Confirm Intake Answers
      </button>
    </section>
  );
}
