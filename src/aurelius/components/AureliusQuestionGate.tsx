// src/aurelius/components/AureliusQuestionGate.tsx
type Question = {
  id: string;
  question: string;
  why_it_matters: string;
};

export default function AureliusQuestionGate({
  questions,
  onContinue,
}: {
  questions: Question[];
  onContinue: () => void;
}) {
  return (
    <div className="mt-16 bg-black/40 border border-[#D4AF37]/30 rounded-3xl p-12 backdrop-blur-xl">
      <h2 className="text-3xl font-bold text-[#D4AF37] mb-8">
        Aurelius kan nog geen oordeel vellen
      </h2>

      <p className="text-gray-300 text-lg mb-10">
        Beantwoord eerst deze vragen. Zonder deze antwoorden zou elk advies
        speculatief zijn.
      </p>

      <div className="space-y-8">
        {questions.map((q) => (
          <div key={q.id} className="border-l-4 border-[#D4AF37] pl-6">
            <p className="text-xl font-semibold mb-2">{q.question}</p>
            <p className="text-sm text-gray-400">{q.why_it_matters}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-12 px-12 py-5 bg-[#D4AF37] text-black font-bold rounded-2xl hover:scale-105 transition"
      >
        Ik beantwoord deze vragen →
      </button>
    </div>
  );
}
