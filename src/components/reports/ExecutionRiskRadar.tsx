import { reportViewStyles } from "./reportViewStyles";

type ExecutionRiskRadarProps = {
  items: Array<{ label: string; value: string }>;
};

export default function ExecutionRiskRadar({ items }: ExecutionRiskRadarProps) {
  return (
    <section className={reportViewStyles.cockpit.panel}>
      <div className="space-y-4">
        <div>
          <p className={reportViewStyles.header.label}>Uitvoeringsdruk</p>
          <h2 className={reportViewStyles.cockpit.panelTitle}>Waar de gekozen koers kan vastlopen</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {items.map((item) => (
            <article key={item.label} className={reportViewStyles.cockpit.signalCard}>
              <p className={reportViewStyles.cockpit.scenarioLabel}>{item.label}</p>
              <p className={reportViewStyles.cockpit.panelText}>{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
