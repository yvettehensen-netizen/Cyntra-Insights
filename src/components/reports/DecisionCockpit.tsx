import BestuurlijkeBesliskaartCard from "./BestuurlijkeBesliskaartCard";
import ExecutionRiskRadar from "./ExecutionRiskRadar";
import ReportStructuredContent from "./ReportStructuredContent";
import { reportViewStyles } from "./reportViewStyles";
import ScenarioCards from "./ScenarioCards";
import StopRuleCards from "./StopRuleCards";
import StrategicTensionVisual from "./StrategicTensionVisual";
import type { GovernanceIntervention, ReportSection, ReportViewModel } from "./types";
import { detectRelevantTension } from "@/aurelius/engine/visuals/TensionLibrary";

type DecisionCockpitProps = {
  model: ReportViewModel;
  compact?: boolean;
  titleLabel: string;
  titleSubtitle?: string;
  analysisSections: ReportSection[];
  onCopyDecision?: () => void;
};

type TimelineBucket = {
  title: string;
  items: GovernanceIntervention[];
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function compactBoardText(value: unknown, max = 150): string {
  const text = normalize(value);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).trim()}...`;
}

function splitTension(text: string): { left: string; right: string; explanation: string } {
  const detected = detectRelevantTension(text);
  return {
    left: detected.leftPole,
    right: detected.rightPole,
    explanation: detected.explanation,
  };
}

function bucketIndex(deadline: string): number {
  const match = normalize(deadline).match(/(\d+)/);
  const day = Number(match?.[1] || 90);
  if (day <= 30) return 0;
  if (day <= 60) return 1;
  return 2;
}

function buildTimeline(items: GovernanceIntervention[]): TimelineBucket[] {
  const buckets: TimelineBucket[] = [
    { title: "0-30 dagen", items: [] },
    { title: "30-60 dagen", items: [] },
    { title: "60-90 dagen", items: [] },
  ];
  items.forEach((item) => {
    buckets[bucketIndex(item.deadline)].items.push(item);
  });
  return buckets;
}

function findSignal(model: ReportViewModel, label: string): { current: string; stopRule: string; risk: "high" | "medium" | "low" } {
  const key = label.toLowerCase();
  const stopRule = model.bestuurlijkeBesliskaart.stopRules.find((item) => normalize(item).toLowerCase().includes(key)) || "Geen expliciete stopregel in bron.";
  const current =
    key === "caseload"
      ? model.boardDecisionPressure.operational
      : key === "wachttijd"
        ? model.boardDecisionPressure.operational
        : key === "marge"
          ? model.boardDecisionPressure.financial
          : model.boardDecisionPressure.organizational;
  const risk: "high" | "medium" | "low" = /hoog|druk|verlies|uit balans|oploopt|breekt|structureel/i.test(`${stopRule} ${current}`) ? "high" : /herzie|grens|monitor|alert/i.test(`${stopRule} ${current}`) ? "medium" : "low";
  return { current, stopRule, risk };
}

function riskClass(risk: "high" | "medium" | "low"): string {
  if (risk === "high") return reportViewStyles.cockpit.signalRiskHigh;
  if (risk === "medium") return reportViewStyles.cockpit.signalRiskMedium;
  return reportViewStyles.cockpit.signalRiskLow;
}

function executionRiskItems(model: ReportViewModel): Array<{ label: string; value: string }> {
  return [
    { label: "capaciteit", value: model.boardDecisionPressure.operational },
    { label: "financieel", value: model.boardDecisionPressure.financial },
    { label: "markt", value: model.strategicConflict },
    { label: "organisatie", value: model.boardDecisionPressure.organizational },
    { label: "governance", value: model.boardQuestion || model.strategyAlert },
  ];
}

function topAnalysisSections(sections: ReportSection[], compact: boolean): ReportSection[] {
  const excluded = new Set(["BESLUIT", "SPANNING", "WAAROM DIT GEBEURT", "SCENARIO'S", "DOORBRAAKINZICHTEN", "BESTUURLIJKE ACTIES", "STOPREGELS"]);
  const filtered = sections.filter((section) => !excluded.has(section.title.toUpperCase()) && normalize(section.body));
  return compact ? filtered.slice(0, 4) : filtered;
}

export default function DecisionCockpit({ model, compact = false, titleLabel, titleSubtitle, analysisSections, onCopyDecision }: DecisionCockpitProps) {
  const tension = splitTension(model.strategicConflict || model.bestuurlijkeBesliskaart.coreStatement);
  const timeline = buildTimeline(model.governanceInterventions);
  const visibleAnalysis = topAnalysisSections(analysisSections, compact);
  const signals = ["Caseload", "Wachttijd", "Marge", "Flexratio"].map((label) => ({ label, ...findSignal(model, label) }));

  return (
    <div className={reportViewStyles.layout.root}>
      <header className={reportViewStyles.layout.header}>
        <p className={reportViewStyles.header.label}>{titleLabel}</p>
        <h1 className={reportViewStyles.header.title}>{model.organizationName}</h1>
        <p className={reportViewStyles.header.subtitle}>{titleSubtitle || "Besluit boven analyse. Eerst de keuze, dan spanning, oorzaak, scenario's, acties en stopregels."}</p>
        <div className={reportViewStyles.header.meta}>
          <p>{model.sector}</p>
          <p>{model.sessionId}</p>
          <p>{new Date(model.createdAt).toLocaleDateString("nl-NL")}</p>
        </div>
      </header>

      <BestuurlijkeBesliskaartCard data={model.bestuurlijkeBesliskaart} decisionQuestion={model.boardQuestion} onCopyDecision={onCopyDecision} />

      <div className={reportViewStyles.layout.grid12}>
        <section className={`${reportViewStyles.cockpit.panel} ${reportViewStyles.layout.column6}`}>
          <StrategicTensionVisual leftPole={tension.left} rightPole={tension.right} explanation={tension.explanation} />
        </section>
        <section className={`${reportViewStyles.cockpit.panel} ${reportViewStyles.layout.column6}`}>
          <ScenarioCards scenarios={model.compactScenarios} />
        </section>
      </div>

      <section className={reportViewStyles.cockpit.panel}>
        <div className="space-y-4">
          <div>
            <p className={reportViewStyles.header.label}>Bestuurlijke acties</p>
            <h2 className={reportViewStyles.cockpit.panelTitle}>Tijdlijn voor 90 dagen</h2>
          </div>
          <div className={reportViewStyles.cockpit.timelineGrid}>
            {timeline.map((bucket) => (
              <article key={bucket.title} className={reportViewStyles.cockpit.timelineColumn}>
                <h3 className={reportViewStyles.cockpit.scenarioTitle}>{bucket.title}</h3>
                {bucket.items.length ? bucket.items.map((item) => (
                  <div key={`${bucket.title}-${item.action}`} className={reportViewStyles.cockpit.timelineCard}>
                    <p className="text-[15px] font-semibold text-white">{item.action}</p>
                    <p className={reportViewStyles.cockpit.panelText}>Eigenaar: {item.owner}</p>
                    <p className={reportViewStyles.cockpit.panelText}>Waarom: {compactBoardText(item.mechanism, 120)}</p>
                    <p className={reportViewStyles.cockpit.panelText}>KPI: {compactBoardText(item.kpi, 120)}</p>
                  </div>
                )) : <p className={reportViewStyles.cockpit.panelText}>Geen expliciete actie gepland in dit venster.</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <StopRuleCards rules={model.bestuurlijkeBesliskaart.stopRules} />

      <section className={reportViewStyles.cockpit.panel}>
        <div className="space-y-4">
          <div>
            <p className={reportViewStyles.header.label}>Vroege waarschuwing</p>
            <h2 className={reportViewStyles.cockpit.panelTitle}>Signalen die het bestuur direct moet volgen</h2>
          </div>
          <div className={reportViewStyles.cockpit.signalGrid}>
            {signals.map((signal) => (
              <article key={signal.label} className={reportViewStyles.cockpit.signalCard}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={reportViewStyles.cockpit.scenarioLabel}>{signal.label}</p>
                    <p className={reportViewStyles.cockpit.signalValue}>{signal.current}</p>
                  </div>
                  <span className={riskClass(signal.risk)}>{signal.risk === "high" ? "hoog risico" : signal.risk === "medium" ? "alert" : "stabiel"}</span>
                </div>
                <div>
                  <p className={reportViewStyles.cockpit.scenarioLabel}>Stopregel</p>
                  <p className={reportViewStyles.cockpit.panelText}>{signal.stopRule}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ExecutionRiskRadar items={executionRiskItems(model)} />

      {visibleAnalysis.length ? (
        <section className={reportViewStyles.cockpit.panel}>
          <div className="space-y-4">
            <div>
              <p className={reportViewStyles.header.label}>Verdieping</p>
              <h2 className={reportViewStyles.cockpit.panelTitle}>Aanvullende context voor bestuur en toezicht</h2>
            </div>
            <div className="space-y-6">
              {visibleAnalysis.map((section, index) => (
                <article key={`${section.title}-${index}`} className="space-y-2">
                  <h3 className={reportViewStyles.cockpit.scenarioTitle}>{section.title}</h3>
                  <ReportStructuredContent body={section.body} compact />
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
