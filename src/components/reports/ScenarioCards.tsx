import { reportViewStyles } from "./reportViewStyles";
import type { BoardroomScenarioDocument } from "@/types/BoardroomDocument";

type ScenarioCardsProps = {
  scenarios: BoardroomScenarioDocument[];
  compact?: boolean;
};

export default function ScenarioCards({ scenarios, compact = false }: ScenarioCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className={reportViewStyles.header.label}>Scenariovergelijking</p>
        <h2 className={reportViewStyles.cockpit.panelTitle}>Drie strategische paden</h2>
      </div>
      <div className={reportViewStyles.cockpit.scenarioGrid}>
        {(scenarios || []).slice(0, 3).map((scenario, index) => (
          <article key={`${scenario.title}-${index}`} className={reportViewStyles.cockpit.scenarioCard}>
            <p className={reportViewStyles.cockpit.scenarioCode}>{`Scenario ${String.fromCharCode(65 + index)}`}</p>
            <h3 className={compact ? "text-[16px] font-semibold text-white" : reportViewStyles.cockpit.scenarioTitle}>
              {scenario.title}
            </h3>
            {!compact ? (
              <div className="flex gap-3 flex-nowrap text-[11px] uppercase tracking-[0.2em] text-slate-400">
                <span>Impact {scenario.impactScore ?? 0}/10</span>
                <span>Risico {scenario.riskScore ?? 0}/10</span>
                <span>Uitvoering {scenario.executionScore ?? 0}/10</span>
              </div>
            ) : null}
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
                <p className={reportViewStyles.cockpit.panelText}>{scenario.governanceImplication}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
