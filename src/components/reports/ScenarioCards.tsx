import type { CompactScenario } from "./types";
import { reportViewStyles } from "./reportViewStyles";

type ScenarioCardsProps = {
  scenarios: CompactScenario[];
};

export default function ScenarioCards({ scenarios }: ScenarioCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className={reportViewStyles.header.label}>Scenariovergelijking</p>
        <h2 className={reportViewStyles.cockpit.panelTitle}>Drie strategische paden</h2>
      </div>
      <div className={reportViewStyles.cockpit.scenarioGrid}>
        {scenarios.slice(0, 3).map((scenario, index) => (
          <article key={`${scenario.title}-${index}`} className={reportViewStyles.cockpit.scenarioCard}>
            <p className={reportViewStyles.cockpit.scenarioCode}>{`Scenario ${String.fromCharCode(65 + index)}`}</p>
            <h3 className={reportViewStyles.cockpit.scenarioTitle}>{scenario.title.replace(/^Scenario\s+[A-Z]\s+[—-]\s+/i, "")}</h3>
            <div className="space-y-3">
              <div>
                <p className={reportViewStyles.cockpit.scenarioLabel}>Strategisch mechanisme</p>
                <p className={reportViewStyles.cockpit.panelText}>{scenario.mechanism}</p>
              </div>
              <div>
                <p className={reportViewStyles.cockpit.scenarioLabel}>Risico</p>
                <p className={reportViewStyles.cockpit.panelText}>{scenario.risk}</p>
              </div>
              <div>
                <p className={reportViewStyles.cockpit.scenarioLabel}>Bestuurlijke implicatie</p>
                <p className={reportViewStyles.cockpit.panelText}>{scenario.boardImplication}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
