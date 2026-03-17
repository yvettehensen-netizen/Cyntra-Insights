import type { BestuurlijkeBesliskaart } from "./types";
import { reportViewStyles } from "./reportViewStyles";

type BoardDecisionCardProps = {
  data: BestuurlijkeBesliskaart;
  decisionQuestion?: string;
  onCopyDecision?: () => void;
};

export default function BoardDecisionCard({ data, decisionQuestion, onCopyDecision }: BoardDecisionCardProps) {
  return (
    <section className={reportViewStyles.cockpit.panel}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={reportViewStyles.header.label}>Besluit</p>
            <h2 className={reportViewStyles.cockpit.panelTitle}>{data.recommendedChoice}</h2>
          </div>
          {onCopyDecision ? (
            <button type="button" className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200" onClick={onCopyDecision}>
              Kopieer
            </button>
          ) : null}
        </div>
        {decisionQuestion ? <p className={reportViewStyles.cockpit.panelText}>{decisionQuestion}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <article className={reportViewStyles.cockpit.signalCard}>
            <p className={reportViewStyles.cockpit.scenarioLabel}>Kernprobleem</p>
            <p className={reportViewStyles.cockpit.panelText}>{data.coreProblem}</p>
          </article>
          <article className={reportViewStyles.cockpit.signalCard}>
            <p className={reportViewStyles.cockpit.scenarioLabel}>Kernstelling</p>
            <p className={reportViewStyles.cockpit.panelText}>{data.coreStatement}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
