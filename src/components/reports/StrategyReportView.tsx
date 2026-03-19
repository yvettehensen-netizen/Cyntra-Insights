import { reportViewStyles } from "./reportViewStyles";
import ReportStructuredContent from "./ReportStructuredContent";
import type { ReportSection } from "./types";
import { assertCanonicalBoardroomDocument } from "@/engine/canonicalReportGuard";
import { buildBoardroomSections } from "@/engine/reportCompiler";
import type { BoardroomDocument } from "@/types/BoardroomDocument";

type StrategyReportViewProps = {
  boardroomDocument: BoardroomDocument;
  sections?: ReportSection[];
  mode?: "strategy" | "scenario";
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function asBody(value: unknown): string {
  return String(value ?? "").trim();
}

function buildStrategySectionsFromBoardroomDocument(document: BoardroomDocument): ReportSection[] {
  return buildBoardroomSections(document).filter((section) => !["SCENARIOVERGELIJKING", "BESTUURLIJKE ACTIES"].includes(section.title));
}

function parseLabeledInterventionBlocks(body: string): string[] {
  return body.split(/\n(?=Interventie\s+\d+)/i).filter(Boolean);
}

function buildScenarioSectionsFromBoardroomDocument(document: BoardroomDocument): ReportSection[] {
  return document.scenarioCards.map((scenario) => ({
    title: asBody(scenario.title),
    body: [
      `MECHANISME\n${asBody(scenario.mechanism)}`,
      `RISICO\n${asBody(scenario.risk)}`,
      `BESTUURLIJKE IMPLICATIE\n${asBody(scenario.governanceImplication)}`,
    ].join("\n\n"),
  }));
}

export default function StrategyReportView({
  boardroomDocument,
  sections,
  mode = "strategy",
}: StrategyReportViewProps) {
  assertCanonicalBoardroomDocument(boardroomDocument);
  const isScenario = mode === "scenario";
  const organizationName = boardroomDocument.meta.organizationName || "Onbekende organisatie";
  const sector = boardroomDocument.meta.sector || "Onbekende sector";
  const sessionId = boardroomDocument.meta.reportId || "Onbekend rapport";
  const createdAt = boardroomDocument.meta.analysisDate || new Date().toISOString();
  const deckSubtitle = isScenario
    ? "Vergelijk scenario's, mechanismen en risico's voordat het bestuur committeert."
    : "Volledige strategische onderbouwing met besluitrichting, mechanismen en consequenties.";

  const resolvedSections = ((sections && sections.length)
    ? sections
    : isScenario
      ? buildScenarioSectionsFromBoardroomDocument(boardroomDocument)
      : buildStrategySectionsFromBoardroomDocument(boardroomDocument))
    .map((section) =>
      /Interventie\s+\d+/i.test(section.body)
        ? { ...section, body: parseLabeledInterventionBlocks(section.body).join("\n\n") }
        : section
    )
    .filter((section) => normalize(section.body));

  return (
    <div className={reportViewStyles.layout.root}>
      <header className={reportViewStyles.layout.header}>
        <p className={reportViewStyles.header.label}>{isScenario ? "Scenario simulatie" : "Strategisch rapport"}</p>
        <h1 className={reportViewStyles.header.title}>{organizationName}</h1>
        <p className={reportViewStyles.header.subtitle}>{deckSubtitle}</p>
        <div className={reportViewStyles.header.meta}>
          <p>{sector}</p>
          <p>{sessionId}</p>
          <p>{new Date(createdAt).toLocaleDateString("nl-NL")}</p>
        </div>
      </header>

      <div className="space-y-6">
        {resolvedSections.map((section, index) => (
          <section key={`${section.title}-${index}`} className={reportViewStyles.section.root}>
            <p className={reportViewStyles.section.number}>{isScenario ? `Scenario ${index + 1}` : `Sectie ${index + 1}`}</p>
            <h2 className={reportViewStyles.section.title}>{section.title}</h2>
            <div className={reportViewStyles.section.rule} />
            <ReportStructuredContent body={section.body} />
          </section>
        ))}
      </div>
    </div>
  );
}
