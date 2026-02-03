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
    return null;
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
