#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const repoRoot = process.cwd();
const exportServicePath = path.join(repoRoot, "src/services/exportService.ts");
const reportPdfPath = path.join(repoRoot, "src/services/reportPdf.ts");
const reportPagePath = path.join(repoRoot, "src/pages/portal/saas/StrategischRapportSaaSPage.tsx");

const exportService = fs.readFileSync(exportServicePath, "utf8");
const reportPdf = fs.readFileSync(reportPdfPath, "utf8");
const reportPage = fs.readFileSync(reportPagePath, "utf8");

assert(
  exportService.includes("export async function createPdfPreviewUrl("),
  "exportService mist inline preview-url helper"
);

assert(
  exportService.includes('? window.open("", "_blank")'),
  "exportService mist browser-veilige fallback voor generieke PDF-export"
);

assert(
  !exportService.includes('window.open("", "_blank", "noopener,noreferrer")'),
  "exportService gebruikt nog een preview-open met noopener/noreferrer die preview kan breken"
);

assert(
  reportPage.includes('if (mode === "preview") {') &&
    reportPage.includes("setInlinePdfPreview((current) => {"),
  "rapportpagina gebruikt geen inline preview-flow"
);

assert(
  reportPage.includes("preview: false,") &&
    reportPage.includes("download: true,"),
  "rapportpagina stuurt download-flow niet expliciet als download aan"
);

assert(
  reportPage.includes('onClick={() => void handlePdf(session.sessionId, "preview")}') &&
    reportPage.includes('title={inlinePdfPreview?.filename || "PDF preview"}'),
  "rapportpagina rendert geen inline PDF-preview"
);

assert(
  reportPdf.includes("const pdfUrl = URL.createObjectURL(pdfBlob);") &&
    reportPdf.includes("<iframe src=\"${pdfUrl}\" title=\"${params.filename}\"></iframe>"),
  "pdf renderer gebruikt preview-window niet via ingebedde blob-preview"
);

assert(
  reportPdf.includes("link.href = pdfUrl;"),
  "pdf renderer downloadt PDF niet via blob-URL"
);

assert(
  reportPdf.includes("async function assertRenderablePdfBlob(blob: Blob): Promise<void>") &&
    reportPdf.includes('throw new Error("PDF-rendering leverde geen geldig PDF-document op.")') &&
    reportPdf.includes("await assertRenderablePdfBlob(pdfOutput);") &&
    reportPdf.includes("await assertRenderablePdfBlob(pdfBlob);"),
  "pdf renderer valideert het document niet expliciet voor preview en download"
);

assert(
  reportPdf.includes("setTimeout(() => URL.revokeObjectURL(pdfUrl), params.previewWindow ? 60000 : 5000);"),
  "pdf renderer houdt blob-URL niet lang genoeg in leven"
);

assert(
  exportService.includes("previewWindow.document.body.innerHTML"),
  "exportService toont geen tijdelijke preview-status tijdens PDF-opbouw"
);

assert(
  reportPage.includes('function safeDownloadFilenamePart(') &&
    reportPage.includes('"Strategische analyse"'),
  "rapportdownload gebruikt nog geen leesbare bestandsnamen"
);

assert(
  reportPage.includes("const scenarioSections = model.scenarioSections.length ? model.scenarioSections : model.strategySections;"),
  "scenario-export gebruikt niet expliciet de scenario-secties"
);

assert(
  reportPage.includes("const technicalSections = model.engineSections.length ? model.engineSections : buildTechnicalFallbackSections({"),
  "technische export gebruikt geen engineSections/fallback"
);

assert(
  reportPage.includes("function buildFullDossierExport(") &&
    reportPage.includes("buildScenarioReportExport(model)") &&
    reportPage.includes("buildTechnicalAnalysisExport(model)"),
  "volledig dossier combineert strategisch rapport, scenario's en technische analyse niet"
);

assert(
  reportPage.includes("function buildStrategicReportExport(") &&
    reportPage.includes('"BESLUITPAGINA"') &&
    reportPage.includes('"STRATEGISCHE SPANNING"') &&
    reportPage.includes('"SCENARIO\'S"') &&
    reportPage.includes('"DOORBRAAKINZICHTEN"') &&
    reportPage.includes('"STOPREGELS"'),
  "strategische export gebruikt geen gecureerde bestuursstructuur"
);

assert(
  reportPdf.includes('"BESLUITPAGINA"') &&
    reportPdf.includes('"STRATEGISCHE SPANNING"') &&
    reportPdf.includes('"TECHNISCHE ANALYSE"'),
  "pdf parser herkent strategische exportkoppen niet"
);

assert(
  reportPdf.includes("const isNoise = (line: string)") &&
    reportPdf.includes("^preview:") &&
    reportPdf.includes("^bestand:"),
  "pdf cover filtert upload-previewvervuiling niet uit contactregels"
);

assert(
  reportPdf.includes("const plainLineFields = source") &&
    reportPdf.includes("Organisatie|Sector|Analyse datum|Besluit"),
  "pdf kernsamenvatting ondersteunt board-summary regels niet expliciet"
);

assert(
  reportPdf.includes("const drawActionCards = (rows: ActionRow[], startY: number) => {") &&
    !reportPdf.includes("const drawActionTable = (rows: ActionRow[], startY: number) => {"),
  "pdf actieplan gebruikt nog de generieke tabelweergave"
);

console.log("report pdf actions regression passed");
