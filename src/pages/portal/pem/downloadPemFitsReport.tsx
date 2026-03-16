import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { PemFitsReportPDF } from "./PemFitsReportPDF";

function safeFilename(value: string) {
  return value
    .replace(/[^\w]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveOrganisation(report: any) {
  return (
    report?.organisation ||
    report?.organisatie ||
    report?.organisation_name ||
    report?.organisationContext ||
    report?.organisation_context ||
    report?.company ||
    "Organisatie"
  );
}

export async function downloadPemFitsReport({
  report,
  scanLabel,
  scanTagline,
  organisation,
  accentKey,
}: {
  report: any;
  scanLabel: string;
  scanTagline?: string;
  organisation?: string;
  accentKey?: string;
}) {
  const orgName = organisation ?? resolveOrganisation(report);
  const filename = safeFilename(`${orgName}_${scanLabel}_Cyntra_Fits`);

  const pdfDoc = (
    <PemFitsReportPDF
      report={report}
      scanLabel={scanLabel}
      scanTagline={scanTagline}
      organisation={orgName}
      accentKey={accentKey}
    />
  );

  const blob = await pdf(pdfDoc).toBlob();
  const url = URL.createObjectURL(blob);

  // Reliable print: hidden iframe (pop-up safe)
  try {
    const iframe = window.document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // ignore
      }
      setTimeout(() => {
        URL.revokeObjectURL(url);
        iframe.remove();
      }, 2000);
    };
    window.document.body.appendChild(iframe);
  } catch {
    // ignore print fallback
  }

  // Always provide a download
  saveAs(blob, `${filename}.pdf`);
}
