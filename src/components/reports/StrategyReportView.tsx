import type { ReportSection, ReportViewModel } from "./types";

type StrategyReportViewProps = {
  model: ReportViewModel;
};

function SectionCard({ section }: { section: ReportSection }) {
  const paragraphs = section.body.split(/\n\s*\n/g).map((part) => part.trim()).filter(Boolean);
  return (
    <article className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))] px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8EA2C2]">{section.title}</p>
      <div className="mt-3 space-y-3">
        {paragraphs.length ? (
          paragraphs.map((paragraph, index) => (
            <p key={`${section.title}-${index}`} className="whitespace-pre-wrap text-sm leading-7 text-[#E6EDF8]">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-400">Geen inhoud.</p>
        )}
      </div>
    </article>
  );
}

export default function StrategyReportView({ model }: StrategyReportViewProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-gradient-to-b from-[#131c30] to-[#0c1322] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">Strategisch Rapport</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
          Deze laag bundelt de bestuurlijke onderbouwing in leesbare vorm: samenvatting, killer insights, kernconflict,
          interventies, feitenbasis en hypothese.
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#9BB0CE]">Samenvatting</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#E6EDF8]">
            {model.executiveSummary || "Samenvatting niet beschikbaar."}
          </p>
        </div>
      </section>

      <div className="grid gap-4">
        {model.strategySections.length ? (
          model.strategySections.map((section) => <SectionCard key={section.title} section={section} />)
        ) : (
          <section className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-gray-300">Geen strategische rapportsecties gevonden.</p>
          </section>
        )}
      </div>
    </div>
  );
}
