import ResultTemplate from "../../components/ResultTemplate";

export default function ExecutiveSummary() {
  return (
    <ResultTemplate
      title="Executive Summary"
      subtitle="Board-level synthesis of key insights and risks"
      visualImage="/assets/aurelius/visual-executive.svg"
    >
      <section className="space-y-6">
        <p className="text-gray-300 text-lg leading-relaxed">
          This executive summary highlights the most critical findings
          identified by the Aurelius Engine.
        </p>

        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-[#D4AF37] font-semibold">
            Immediate action required on execution discipline and accountability.
          </p>
        </div>
      </section>
    </ResultTemplate>
  );
}
