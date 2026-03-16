import type { ReportViewModel } from "./types";
import { reportViewStyles } from "./reportViewStyles";
import { buildCyntraMeaning, buildHgbcoNarrative } from "./reportNarrativeBridge";

type StrategicStoryBridgeCardProps = {
  model: ReportViewModel;
  compact?: boolean;
};

export default function StrategicStoryBridgeCard({
  model,
  compact = false,
}: StrategicStoryBridgeCardProps) {
  const hgbco = buildHgbcoNarrative(model);
  const cyntraMeaning = buildCyntraMeaning(model);

  return (
    <section className={reportViewStyles.storyBridge.root}>
      <div className={reportViewStyles.storyBridge.header}>
        <div>
          <p className={reportViewStyles.storyBridge.label}>HGBCO</p>
          <h2 className={reportViewStyles.storyBridge.title}>Logisch verhaal voor bestuur en vervolg</h2>
        </div>
        <p className={reportViewStyles.storyBridge.subtitle}>
          Rustige vertaling van analyse naar besluit, consequentie en wat Cyntra concreet kan betekenen.
        </p>
      </div>

      <div className={reportViewStyles.storyBridge.grid}>
        {hgbco.map((item) => (
          <div key={item.key} className={reportViewStyles.storyBridge.block}>
            <p className={reportViewStyles.storyBridge.eyebrow}>{item.key} • {item.title}</p>
            <p className={reportViewStyles.storyBridge.body}>{item.body}</p>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className={reportViewStyles.storyBridge.helpPanel}>
          <p className={reportViewStyles.storyBridge.helpTitle}>Hoe Cyntra kan helpen</p>
          <div className="space-y-4">
            <div>
              <p className={reportViewStyles.storyBridge.helpEyebrow}>Bestuurlijke opgave</p>
              <p className={reportViewStyles.storyBridge.body}>{cyntraMeaning.bestuurlijkeOpgave}</p>
            </div>
            <div>
              <p className={reportViewStyles.storyBridge.helpEyebrow}>Waarom dit nu speelt</p>
              <p className={reportViewStyles.storyBridge.body}>{cyntraMeaning.waaromNu}</p>
            </div>
            <div>
              <p className={reportViewStyles.storyBridge.helpEyebrow}>Waar Cyntra kan helpen</p>
              <ul className={reportViewStyles.storyBridge.helpList}>
                {cyntraMeaning.waarCyntraKanHelpen.map((item) => (
                  <li key={item} className={reportViewStyles.storyBridge.helpListItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={reportViewStyles.storyBridge.helpEyebrow}>Concrete volgende stap</p>
              <p className={reportViewStyles.storyBridge.body}>{cyntraMeaning.concreteVolgendeStap}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
