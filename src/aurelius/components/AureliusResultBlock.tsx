interface Props {
  result: any;
}

export default function AureliusResultBlock({ result }: Props) {
  if (!result) return null;

  return (
    <div className="space-y-14 text-white">

      {/* EXECUTIVE HYPOTHESIS */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">
          Executive Hypothesis
        </h2>
        <p className="text-lg text-gray-200 mb-4">
          {result.executive_hypothesis?.statement}
        </p>

        <div className="text-sm text-gray-400">
          Confidence level:{" "}
          <strong>{result.executive_hypothesis?.confidence_level}</strong>
        </div>

        {result.executive_hypothesis?.key_assumptions?.length > 0 && (
          <ul className="mt-4 list-disc ml-6 text-gray-400 text-sm">
            {result.executive_hypothesis.key_assumptions.map(
              (a: string, i: number) => (
                <li key={i}>{a}</li>
              )
            )}
          </ul>
        )}
      </section>

      {/* POSITIONING SCORE */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
          Strategic Positioning Score
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(
            result.strategic_positioning_score?.subscores || {}
          ).map(([key, value]: any) => (
            <div key={key}>
              <div className="text-xs text-gray-400 uppercase">
                {key.replace(/_/g, " ")}
              </div>
              <div className="text-3xl font-bold">{value}/100</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-gray-300">
          {result.strategic_positioning_score?.interpretation}
        </p>
      </section>

      {/* MARKET REALITY */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
          Market Reality Check
        </h2>

        <div className="space-y-4 text-gray-300">
          <p>
            <strong>Who wins today:</strong>{" "}
            {result.market_reality_check?.who_wins_today}
          </p>
          <p>
            <strong>Why they win:</strong>{" "}
            {result.market_reality_check?.why_they_win}
          </p>
          <p>
            <strong>Overestimation:</strong>{" "}
            {result.market_reality_check?.where_the_company_overestimates_itself}
          </p>
          <p>
            <strong>Underestimation:</strong>{" "}
            {result.market_reality_check?.where_it_underestimates_the_market}
          </p>
        </div>
      </section>

      {/* STRATEGIC TRADE-OFFS */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
          Strategic Trade-offs
        </h2>

        <div className="space-y-6">
          {result.strategic_tradeoffs?.map((t: any, i: number) => (
            <div
              key={i}
              className="border-l-4 border-[#D4AF37] pl-6 space-y-2"
            >
              <div className="font-semibold">{t.choice}</div>
              <div className="text-gray-300">
                We choose <strong>{t.option_selected}</strong> and reject{" "}
                <strong>{t.option_rejected}</strong>.
              </div>
              <div className="text-sm text-gray-400">
                Consequence: {t.consequence}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KEY RISKS */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
          Key Strategic Risks
        </h2>

        <ul className="space-y-4 text-gray-300">
          {result.key_risks?.map((r: any, i: number) => (
            <li key={i}>
              <strong>{r.risk}</strong> — impact: {r.impact}
              <div className="text-sm text-gray-400">
                Trigger: {r.trigger_condition}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 90 DAY MOVES */}
      <section className="p-8 bg-black/40 border border-white/10 rounded-2xl">
        <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">
          90-Day Strategic Moves
        </h2>

        <div className="space-y-6">
          {result.ninety_day_strategic_moves?.map((m: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="font-semibold">{m.action}</div>
              <div className="text-gray-300">{m.expected_effect}</div>
              <div className="text-sm text-red-400">
                Stop doing: {m.explicitly_stop_doing}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CONCLUSION */}
      <section className="p-8 bg-gradient-to-br from-[#8B1538]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">Final Conclusion</h2>
        <p className="text-xl font-semibold">
          {result.final_conclusion?.dominant_truth}
        </p>
        <p className="mt-4 text-gray-300">
          Strategic cost of inaction:{" "}
          {result.final_conclusion?.strategic_cost_of_inaction}
        </p>
      </section>
    </div>
  );
}
