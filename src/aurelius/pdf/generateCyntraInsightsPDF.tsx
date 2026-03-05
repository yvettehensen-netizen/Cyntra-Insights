import { pdf } from "@react-pdf/renderer";
import { AureliusReportPDF } from "./AureliusReportPDF";

export type CyntraInsightsPDFInput = {
  title: string;
  company: string;
  date: string;
  contactPerson?: string;
  result: {
    executive_summary?: string;
    insights?: string[];
    risks?: string[];
    opportunities?: string[];
  };
};

export async function generateCyntraInsightsPDF(
  input: CyntraInsightsPDFInput
) {
  const blob = await pdf(
    <AureliusReportPDF
      title={input.title}
      company={input.company}
      date={input.date}
      contactPerson={input.contactPerson}
      result={input.result}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${input.title.replace(/[^\w]+/g, "_")}_Cyntra_Insights.pdf`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
