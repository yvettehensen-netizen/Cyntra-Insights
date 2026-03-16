// ============================================================
// PDF DOWNLOAD — BESLUITVORMINGSSCAN BOARDROOM REPORT (CLIENT)
// Generates a Boardroom-grade Besluitvormingsscan PDF in the browser
// ============================================================

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { ZorgBoardroomReportPDF } from "./ZorgBoardroomReport";

type DownloadZorgBoardroomReportParams = {
  report: any;
  organisation?: string;
  filename?: string;
};

function resolveOrganisation(report: any): string {
  return (
    report?.organisation ||
    report?.organisatie ||
    report?.company ||
    report?.company_name ||
    report?.intake?.companyName ||
    "Organisatie"
  );
}

export async function downloadZorgBoardroomReport({
  report,
  organisation,
  filename,
}: DownloadZorgBoardroomReportParams) {
  const orgName = organisation ?? resolveOrganisation(report);
  const safeFilename = (filename ?? `${orgName}_Besluitvormingsscan_rapport`)
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const document = (
    <ZorgBoardroomReportPDF data={report} organisation={orgName} />
  );

  const blob = await pdf(document).toBlob();

  saveAs(blob, `${safeFilename}.pdf`);
}
