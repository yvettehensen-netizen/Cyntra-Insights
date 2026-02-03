// src/aurelius/pdf/downloadCyntraReport.tsx

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { AureliusReportPDF } from "./AureliusReportPDF";
import { defaultWhiteLabel } from "./whiteLabelConfig";

type DownloadCyntraReportParams = {
  title: string;
  company: string;
  date: string;
  result: any;
  whiteLabel?: any;
};

export async function downloadCyntraReport({
  title,
  company,
  date,
  result,
  whiteLabel = defaultWhiteLabel,
}: DownloadCyntraReportParams) {
  const document = (
    <AureliusReportPDF
      title={title}
      company={company}
      date={date}
      result={result}
      whiteLabel={whiteLabel}
    />
  );

  const blob = await pdf(document).toBlob();

  saveAs(blob, `${title.replace(/[^\w]+/g, "_")}.pdf`);
}
