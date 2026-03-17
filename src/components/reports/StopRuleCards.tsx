import { reportViewStyles } from "./reportViewStyles";

type StopRuleCardsProps = {
  rules: string[];
};

export default function StopRuleCards({ rules }: StopRuleCardsProps) {
  return (
    <section className={reportViewStyles.cockpit.panel}>
      <div className="space-y-4">
        <div>
          <p className={reportViewStyles.header.label}>Stopregels</p>
          <h2 className={reportViewStyles.cockpit.panelTitle}>Wanneer het bestuur de koers moet herijken</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rules.slice(0, 6).map((rule) => (
            <article key={rule} className={reportViewStyles.cockpit.signalCard}>
              <p className={reportViewStyles.cockpit.scenarioLabel}>Herzien als</p>
              <p className={reportViewStyles.cockpit.panelText}>{rule}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
