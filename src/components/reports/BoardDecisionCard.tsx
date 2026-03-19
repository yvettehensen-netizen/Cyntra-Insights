import type { BoardroomExecutiveDecisionCardDocument } from "@/types/BoardroomDocument";
import { reportViewStyles } from "./reportViewStyles";

type BoardDecisionCardProps = {
  card: BoardroomExecutiveDecisionCardDocument;
  onCopyDecision?: () => void;
};

export default function BoardDecisionCard({ card, onCopyDecision }: BoardDecisionCardProps) {
  return (
    <section className={reportViewStyles.cockpit.panel}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={reportViewStyles.header.label}>Besluit</p>
            <h2 className={reportViewStyles.cockpit.panelTitle}>{card.summary}</h2>
          </div>
          {onCopyDecision ? (
            <button type="button" className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200" onClick={onCopyDecision}>
              Kopieer
            </button>
          ) : null}
        </div>
        {card.decisionQuestion ? (
          <article className={reportViewStyles.cockpit.signalCard}>
            <p className={reportViewStyles.cockpit.scenarioLabel}>Besluitvraag</p>
            <p className={reportViewStyles.cockpit.panelText}>{card.decisionQuestion}</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
