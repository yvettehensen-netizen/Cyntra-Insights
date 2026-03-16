import type { ReportViewModel } from "./types";
import { reportViewStyles } from "./reportViewStyles";
import { presentReportSectionTitle } from "./reportTitlePresentation";

type EngineAnalysisViewProps = {
  model: ReportViewModel;
};

export default function EngineAnalysisView({ model }: EngineAnalysisViewProps) {
  return (
    <div className="space-y-8">
      <section className={reportViewStyles.section.root}>
        <div>
          <p className={reportViewStyles.section.number}>Uitvoerings- en kwaliteitsanalyse</p>
          <h2 className={reportViewStyles.section.title}>Uitvoerings- en kwaliteitsanalyse</h2>
          <div className={reportViewStyles.section.rule} />
        </div>
        <p className={reportViewStyles.panel.mutedBody}>
          Volledige technische analyse voor scenario’s, besluitgeheugen, vroegsignalen, governance-aannames en kwaliteitscontroles.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <article className={reportViewStyles.panel.root}>
          <p className={reportViewStyles.panel.title}>Inhoudscheck</p>
          <p className="text-[14px] text-white">Niveau: {model.qualityLevel}</p>
          <div className={reportViewStyles.panel.list}>
            {model.qualityChecks.length ? model.qualityChecks.map((check) => <p key={check}>• {check}</p>) : <p>• Geen checks</p>}
          </div>
        </article>

        <article className={reportViewStyles.panel.root}>
          <p className={reportViewStyles.panel.title}>Kritieke signalen</p>
          <div className={reportViewStyles.panel.criticalList}>
            {model.criticalFlags.length ? model.criticalFlags.map((flag) => <p key={flag}>• {flag}</p>) : <p>• Geen kritieke signalen</p>}
          </div>
        </article>

        <article className={reportViewStyles.panel.root}>
          <p className={reportViewStyles.panel.title}>Overige signalen</p>
          <div className={reportViewStyles.panel.warningList}>
            {model.nonCriticalFlags.length ? model.nonCriticalFlags.map((flag) => <p key={flag}>• {flag}</p>) : <p>• Geen overige signalen</p>}
          </div>
        </article>
      </section>

      <div className="space-y-8">
        {model.engineSections.length ? (
          model.engineSections.map((section) => (
            <article key={section.title} className={reportViewStyles.panel.root}>
              <p className={reportViewStyles.panel.title}>{presentReportSectionTitle(section.title)}</p>
              <p className={reportViewStyles.panel.body}>{section.body || "Geen inhoud."}</p>
            </article>
          ))
        ) : (
          <section className={reportViewStyles.panel.root}>
            <p className={reportViewStyles.panel.mutedBody}>Geen technische secties gevonden.</p>
          </section>
        )}
      </div>
    </div>
  );
}
