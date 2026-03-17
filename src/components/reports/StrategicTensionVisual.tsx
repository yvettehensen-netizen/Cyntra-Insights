import { reportViewStyles } from "./reportViewStyles";

type StrategicTensionVisualProps = {
  leftPole: string;
  rightPole: string;
  explanation: string;
};

export default function StrategicTensionVisual({ leftPole, rightPole, explanation }: StrategicTensionVisualProps) {
  return (
    <div className={reportViewStyles.cockpit.tensionWrap}>
      <div>
        <p className={reportViewStyles.header.label}>Strategische spanning</p>
        <h2 className={reportViewStyles.cockpit.panelTitle}>Waar de keuze structureel botst</h2>
      </div>
      <div className={reportViewStyles.cockpit.tensionAxis}>
        <div className={reportViewStyles.cockpit.tensionLabelRow}>
          <span>{leftPole}</span>
          <span>{rightPole}</span>
        </div>
        <div className={reportViewStyles.cockpit.tensionTrack}>
          <div className={reportViewStyles.cockpit.tensionLine} />
          <div className={reportViewStyles.cockpit.tensionPoleTop}>
            <div className={reportViewStyles.cockpit.tensionDot} />
            <span className="max-w-[180px] text-left text-[12px] font-medium tracking-[0.01em] text-slate-300">{leftPole}</span>
          </div>
          <div className={reportViewStyles.cockpit.tensionCurrent}>
            <div className={reportViewStyles.cockpit.tensionCurrentDot} />
            <span className={reportViewStyles.cockpit.tensionCurrentLabel}>Huidige positie</span>
          </div>
          <div className={reportViewStyles.cockpit.tensionPoleBottom}>
            <div className={reportViewStyles.cockpit.tensionDot} />
            <span className="max-w-[180px] text-right text-[12px] font-medium tracking-[0.01em] text-slate-300">{rightPole}</span>
          </div>
        </div>
      </div>
      <p className={reportViewStyles.cockpit.panelText}>{explanation}</p>
    </div>
  );
}
