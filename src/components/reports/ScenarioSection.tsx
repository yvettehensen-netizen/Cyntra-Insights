import { reportViewStyles } from "./reportViewStyles";
import type { CompactScenario } from "./types";

type ScenarioSectionProps = {
  scenarios: CompactScenario[];
};

export default function ScenarioSection({ scenarios }: ScenarioSectionProps) {
  if (!scenarios.length) return null;
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      {scenarios.slice(0, 3).map((scenario, index) => (
        <article
          key={`${scenario.title}-${index}`}
          className={`${reportViewStyles.panel.root} ${
            scenario.recommended ? "border-gold/60 shadow-[0_10px_30px_rgba(248,201,81,0.15)]" : ""
          }`}
        >
          <p className={reportViewStyles.section.number}>Scenario {String.fromCharCode(65 + index)}</p>
          <h3 className={reportViewStyles.panel.title}>{scenario.title}</h3>
          {scenario.recommended ? (
            <p className={reportViewStyles.cockpit.scenarioBadge}>Aanbevolen scenario</p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <span>Impact {scenario.impactScore ?? 0}/10</span>
            <span>Risico {scenario.riskScore ?? 0}/10</span>
            <span>Uitvoering {scenario.difficultyScore ?? 0}/10</span>
          </div>
          <div className={reportViewStyles.panel.list}>
            <p><span className="font-semibold text-white">Mechanisme:</span> {scenario.mechanism}</p>
            <p><span className="font-semibold text-white">Risico:</span> {scenario.risk}</p>
            <p><span className="font-semibold text-white">Bestuurlijke implicatie:</span> {scenario.boardImplication}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
