import { useRef } from "react";
import DecisionBlock from "./DecisionBlock";
import ReportSection from "./ReportSection";
import ScenarioBlock from "./ScenarioBlock";
import { reportViewStyles } from "./reportViewStyles";
import { formatBoardroomMemo } from "./boardroomMemoFormatter";
import { rewriteReport } from "@/engine/rewriteLayer";
import type { BoardroomDocument } from "@/types/BoardroomDocument";

type DecisionCockpitProps = {
  boardroomDocument: BoardroomDocument;
  compact?: boolean;
  titleLabel: string;
  onCopyDecision?: () => void;
};

function stepScroll(target: { current: HTMLElement | null }) {
  target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DecisionCockpit({
  boardroomDocument,
  compact = false,
  titleLabel,
  onCopyDecision,
}: DecisionCockpitProps) {
  const executiveRef = useRef<HTMLElement | null>(null);
  const proofRef = useRef<HTMLElement | null>(null);
  const scenariosRef = useRef<HTMLElement | null>(null);
  const decisionRef = useRef<HTMLElement | null>(null);
  const memo = rewriteReport(formatBoardroomMemo(boardroomDocument));

  return (
    <div className={reportViewStyles.board.shell}>
      <header className="space-y-3">
        <p className={reportViewStyles.board.eyebrow}>{titleLabel}</p>
        <p className={reportViewStyles.board.introMuted}>{memo.metaLine}</p>
        <nav className={reportViewStyles.board.topbar}>
          <button type="button" className={reportViewStyles.board.navButton} onClick={() => stepScroll(executiveRef)}>Executive</button>
          <button type="button" className={reportViewStyles.board.navButton} onClick={() => stepScroll(proofRef)}>Proof</button>
          <button type="button" className={reportViewStyles.board.navButton} onClick={() => stepScroll(scenariosRef)}>Scenario’s</button>
          <button type="button" className={reportViewStyles.board.navButton} onClick={() => stepScroll(decisionRef)}>Besluit</button>
        </nav>
      </header>

      <ReportSection id="executive" eyebrow="Executive Summary" title="Executive Summary">
        <div ref={executiveRef} className="space-y-8">
          <div className="space-y-4">
            {memo.executiveSummary.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className={reportViewStyles.board.body}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <p className={reportViewStyles.board.meta}>Kernprobleem</p>
            <p className={reportViewStyles.board.body}>{memo.coreProblem}</p>
          </div>

          <div className="space-y-2">
            <p className={reportViewStyles.board.meta}>Besluit</p>
            <p className={reportViewStyles.board.rowTitle}>{memo.decision}</p>
          </div>
        </div>
      </ReportSection>

      <ReportSection id="proof" eyebrow="Onderbouwing" title="Onderbouwing">
        <div ref={proofRef} className="space-y-8">
          <div className="space-y-3">
            <p className={reportViewStyles.board.meta}>Waarom deze keuze</p>
            <ul className={reportViewStyles.board.bulletList}>
              {memo.why.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className={reportViewStyles.board.meta}>Wat gebeurt er als je niets doet</p>
            <ul className={reportViewStyles.board.bulletList}>
              {memo.riskOfInaction.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className={reportViewStyles.board.meta}>Mechanisme</p>
            <ul className={reportViewStyles.board.bulletList}>
              {memo.mechanism.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className={reportViewStyles.board.meta}>Stopregels</p>
            <ul className={reportViewStyles.board.bulletList}>
              {memo.stopRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className={reportViewStyles.board.meta}>Actieplan</p>
            <ul className={reportViewStyles.board.bulletList}>
              {memo.actions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </ReportSection>

      <ReportSection id="scenarios" eyebrow="Scenario’s" title="Scenario’s">
        <div ref={scenariosRef} className={reportViewStyles.board.rowGrid}>
          {memo.scenarios.map((scenario) => (
            <ScenarioBlock
              key={scenario.code}
              code={scenario.code}
              title={scenario.title}
              explanation={scenario.explanation}
            />
          ))}
        </div>
      </ReportSection>

      <ReportSection id="decision" eyebrow="Besluit" title="Besluit">
        <div ref={decisionRef} className="space-y-8">
          <DecisionBlock headline={memo.decision} />
          <div className="space-y-2">
            <p className={reportViewStyles.board.meta}>Bestuurlijke vraag</p>
            <p className={reportViewStyles.board.body}>{memo.boardQuestion}</p>
          </div>
          {onCopyDecision ? (
            <button type="button" className={reportViewStyles.board.navButton} onClick={onCopyDecision}>
              Kopieer besluit
            </button>
          ) : null}
        </div>
      </ReportSection>
    </div>
  );
}
