import type { ReportViewModel } from "./types";

type EngineAnalysisViewProps = {
  model: ReportViewModel;
};

export default function EngineAnalysisView({ model }: EngineAnalysisViewProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-white/10 bg-black/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">Technische Analyse</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
          Volledige technische analyse voor scenario’s, besluitgeheugen, vroegsignalen, governance-aannames en kwaliteitscontroles.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9BB0CE]">Inhoudscheck</p>
          <p className="mt-2 text-sm text-white">Niveau: {model.qualityLevel}</p>
          <div className="mt-3 space-y-1 text-xs text-gray-300">
            {model.qualityChecks.length ? model.qualityChecks.map((check) => <p key={check}>- {check}</p>) : <p>- Geen checks</p>}
          </div>
        </article>

        <article className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">Kritieke Signalen</p>
          <div className="mt-3 space-y-1 text-xs text-red-100">
            {model.criticalFlags.length ? model.criticalFlags.map((flag) => <p key={flag}>- {flag}</p>) : <p>- Geen kritieke signalen</p>}
          </div>
        </article>

        <article className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">Overige Signalen</p>
          <div className="mt-3 space-y-1 text-xs text-amber-100">
            {model.nonCriticalFlags.length ? model.nonCriticalFlags.map((flag) => <p key={flag}>- {flag}</p>) : <p>- Geen overige signalen</p>}
          </div>
        </article>
      </section>

      <div className="grid gap-4">
        {model.engineSections.length ? (
          model.engineSections.map((section) => (
            <article key={section.title} className="rounded-xl border border-white/10 bg-[#0b1427] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8EA2C2]">{section.title}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#E6EDF8]">{section.body || "Geen inhoud."}</p>
            </article>
          ))
        ) : (
          <section className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-gray-300">Geen technische secties gevonden.</p>
          </section>
        )}
      </div>
    </div>
  );
}
