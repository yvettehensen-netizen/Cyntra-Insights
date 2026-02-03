// src/components/AureliusResult.tsx

export default function AureliusResult({ data }: { data: any }) {
  if (!data) return null;

  const r = data.result;

  return (
    <div className="space-y-8 text-white max-w-4xl mx-auto">
      <section>
        <h2 className="text-3xl font-bold mb-3">Executive Summary</h2>
        <p className="text-gray-300 leading-relaxed">
          {r.executive_summary}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Top Inzichten</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-300">
          {r.insights.map((i: string, idx: number) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Risico's</h2>
        <ul className="list-disc ml-6 space-y-2 text-red-300">
          {r.risks.map((i: string, idx: number) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">Kansen</h2>
        <ul className="list-disc ml-6 space-y-2 text-green-300">
          {r.opportunities.map((i: string, idx: number) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3">90-Dagen Plan</h2>
        <ul className="list-disc ml-6 space-y-2 text-yellow-300">
          {r.roadmap_90d.map((i: string, idx: number) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-1">CEO Bericht</h2>
        <p className="text-blue-300">{r.ceo_message}</p>
      </section>

      <div className="text-right text-sm text-gray-400">
        Confidence Score: {Math.round(r.confidence_score * 100)}%
      </div>
    </div>
  );
}
