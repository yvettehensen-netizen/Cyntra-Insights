import type { ReportViewModel } from "./types";

type BoardroomViewProps = {
  model: ReportViewModel;
  onCopyDecision?: () => void;
};

function renderConflictLines(value: string): string[] {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export default function BoardroomView({ model, onCopyDecision }: BoardroomViewProps) {
  const conflictLines = renderConflictLines(model.strategicConflict);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.22),_transparent_28%),linear-gradient(135deg,_#10192d_0%,_#0b1324_48%,_#17233d_100%)]">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F3D884]">Cyntra Insights</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">{model.organizationName}</h3>
          <p className="mt-1 text-sm text-[#C8D4E6]">{model.deckSubtitle}</p>
        </div>
        <div className="grid gap-4 px-5 py-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8EA2C2]">Branche</p>
            <p className="mt-1 text-sm text-white">{model.sector}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8EA2C2]">Rapportcode</p>
            <p className="mt-1 text-sm text-white">{model.sessionId}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8EA2C2]">Datum</p>
            <p className="mt-1 text-sm text-white">{new Date(model.createdAt).toLocaleString("nl-NL")}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8EA2C2]">Kwaliteit</p>
            <p className="mt-1 text-sm text-white">
              {model.qualityScore}/100 • {model.qualityTier}
            </p>
          </div>
        </div>
        <div className="grid gap-4 border-t border-white/10 px-5 py-4 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8EA2C2]">Contactpersoon(en)</p>
            {model.contactLines.length ? (
              <div className="mt-1 space-y-1 text-sm text-white">
                {model.contactLines.map((line) => (
                  <p key={`${model.sessionId}-${line}`}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-[#C8D4E6]">Geen contactregels in broninput gevonden.</p>
            )}
          </div>
          {model.strategyAlert ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">Strategie Alert</p>
              <p className="mt-2 text-sm leading-6 text-amber-50">{model.strategyAlert}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#1c2438] via-[#11192d] to-[#0b1324] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F3D884]">Dominante These</p>
          <p className="mt-3 text-2xl font-semibold leading-tight text-white">{model.dominantThesis || "Niet beschikbaar."}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0b1427] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9BB0CE]">Strategisch Conflict</p>
          <div className="mt-3 space-y-2 text-base leading-7 text-white">
            {conflictLines.length ? conflictLines.map((line, index) => <p key={`${model.sessionId}-conflict-${index}`}>{line}</p>) : <p>Niet beschikbaar.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">Bestuurlijke Keuze</p>
          <div className="mt-4 grid gap-3">
            {model.boardOptions.length ? (
              model.boardOptions.map((option) => (
                <div key={`${model.sessionId}-${option}`} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white">
                  {option}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-300">Geen expliciete opties gevonden.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/8 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F3D884]">Aanbevolen Richting</p>
              <p className="mt-3 text-lg font-semibold leading-7 text-white">{model.recommendedDirection || "Niet beschikbaar."}</p>
            </div>
            {onCopyDecision ? (
              <button
                type="button"
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                onClick={onCopyDecision}
              >
                Kopieer richting
              </button>
            ) : null}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9BB0CE]">Interventies</p>
          <div className="mt-4 grid gap-3">
            {model.topInterventions.length ? (
              model.topInterventions.map((item, index) => (
                <div key={`${model.sessionId}-intervention-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    {index + 1}. {item.title}
                  </p>
                  {item.mechanism ? <p className="mt-1 text-xs leading-5 text-gray-300">{item.mechanism}</p> : null}
                  {item.kpi ? <p className="mt-2 text-xs text-[#DDE7F5]">KPI: {item.kpi}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-300">Geen interventies gevonden.</p>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#0b1427] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4AF37]">Bestuurlijke Vraag</p>
          <p className="mt-4 text-lg font-medium leading-8 text-white">{model.boardQuestion || "Niet beschikbaar."}</p>
          {model.noIntervention ? (
            <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9BB0CE]">Scenario: Geen Interventie</p>
              <p className="mt-2 text-sm leading-6 text-[#E6EDF8]">{model.noIntervention}</p>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}
