// ============================================================
// INTAKE GATE — ANALYSIS ACCESS CONTROL
// Path: src/aurelius/components/intake/IntakeGate.tsx
// ============================================================

import IntakeQuestionsPanel from "./IntakeQuestionsPanel";

interface IntakeGateProps {
  questions?: string[];
  onReady: (compiledContext: string) => void;
}

export default function IntakeGate({ questions, onReady }: IntakeGateProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-white/80">
        <p className="mb-3 text-sm">
          Intakevragen zijn niet beschikbaar. Je kunt direct doorgaan met de
          analyseflow.
        </p>
        <button
          type="button"
          onClick={() => onReady("")}
          className="rounded-md border border-[#D4AF37]/60 px-4 py-2 text-sm text-[#f6dd93] hover:bg-[#1a1408]"
        >
          Start zonder intakevragen
        </button>
      </div>
    );
  }

  return (
    <IntakeQuestionsPanel
      questions={questions}
      onComplete={(answers) => {
        const compiled = answers
          .map((a, i) => `Q${i + 1}: ${questions[i]}\nA: ${a}`)
          .join("\n\n");

        onReady(compiled);
      }}
    />
  );
}
