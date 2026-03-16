import type { BestuurlijkeBesliskaart } from "./types";
import { reportViewStyles } from "./reportViewStyles";

type BestuurlijkeBesliskaartCardProps = {
  data?: BestuurlijkeBesliskaart;
};

export default function BestuurlijkeBesliskaartCard({ data }: BestuurlijkeBesliskaartCardProps) {
  if (!data) return null;
  return (
    <section className={reportViewStyles.decisionCard.root}>
      <p className={reportViewStyles.decisionCard.label}>BESTUURLIJKE BESLISKAART</p>
      <div className={reportViewStyles.decisionCard.metaGrid}>
        <div>
          <p className={reportViewStyles.decisionCard.metaLabel}>Organisatie</p>
          <p className={reportViewStyles.decisionCard.metaValue}>{data.organization}</p>
        </div>
        <div>
          <p className={reportViewStyles.decisionCard.metaLabel}>Sector</p>
          <p className={reportViewStyles.decisionCard.metaValue}>{data.sector}</p>
        </div>
        <div>
          <p className={reportViewStyles.decisionCard.metaLabel}>Analyse datum</p>
          <p className={reportViewStyles.decisionCard.metaValue}>{data.analysisDate}</p>
        </div>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>KERNPROBLEEM</p>
        <p className={reportViewStyles.decisionCard.sectionBody}>{data.coreProblem}</p>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>KERNSTELLING</p>
        <p className={reportViewStyles.decisionCard.sectionBody}>{data.coreStatement}</p>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>AANBEVOLEN KEUZE</p>
        <p className={reportViewStyles.decisionCard.sectionBody}>{data.recommendedChoice}</p>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>WAAROM DEZE KEUZE</p>
        <ul className={reportViewStyles.decisionCard.bulletList}>
          {data.whyReasons.map((reason) => (
            <li key={reason} className={reportViewStyles.decisionCard.bullet}>
              {reason}
            </li>
          ))}
        </ul>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>GROOTSTE RISICO BIJ UITSTEL</p>
        <p className={reportViewStyles.decisionCard.sectionBody}>{data.riskIfDelayed}</p>
      </div>
      <div className={reportViewStyles.decisionCard.section}>
        <p className={reportViewStyles.decisionCard.sectionTitle}>STOPREGEL</p>
        <div className={reportViewStyles.decisionCard.stopRules}>
          {data.stopRules.map((line) => (
            <p key={line} className={reportViewStyles.decisionCard.sectionBody}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
