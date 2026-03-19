import { reportViewStyles } from "./reportViewStyles";
import type { StructuredKillerInsight } from "./types";

type GovernanceImplicationsCardProps = {
  items: StructuredKillerInsight[];
};

export default function GovernanceImplicationsCard({ items }: GovernanceImplicationsCardProps) {
  if (!items.length) return null;
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      {items.slice(0, 4).map((item, index) => (
        <article key={`${item.insight}-${index}`} className={reportViewStyles.panel.root}>
          <p className={reportViewStyles.section.number}>Implicatie {index + 1}</p>
          <div className={reportViewStyles.panel.list}>
            <p><span className="font-semibold text-white">Strategische impact:</span> {item.insight}</p>
            <p><span className="font-semibold text-white">Governancevraag:</span> {item.mechanism}</p>
            <p><span className="font-semibold text-white">Besluitmoment:</span> {item.implication}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
