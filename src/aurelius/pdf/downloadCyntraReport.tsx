// src/aurelius/pdf/downloadCyntraReport.tsx

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { AureliusReportPDF } from "./AureliusReportPDF";
import { defaultWhiteLabel } from "./whiteLabelConfig";
import {
  assertSentenceIntegrity,
  assertBoardOutputStandard,
  runBoardOutputGuard,
} from "@/aurelius/synthesis/boardOutputGuard";
import { assertOutputIntegrity } from "@/aurelius/synthesis/outputIntegrity";

type DownloadCyntraReportParams = {
  title: string;
  company: string;
  date: string;
  result: any;
  contactPerson?: string;
  whiteLabel?: any;
};

const CANONICAL_TITLES = [
  "Dominante These",
  "Structurele Kernspanning",
  "Keerzijde van de keuze",
  "De Prijs van Uitstel",
  "Mandaat & Besluitrecht",
  "Onderstroom & Informele Macht",
  "Faalmechanisme",
  "90-Dagen Interventieontwerp",
  "Besluitkader",
] as const;

function hasCanonicalHeadings(text: string): boolean {
  return (String(text ?? "").match(/^\s*(?:###\s*)?[1-9]\.\s+[^\n]+$/gm) ?? []).length >= 9;
}

function sectionText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map((entry) => String(entry ?? "").trim()).filter(Boolean).join("\n");
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.content === "string") return record.content.trim();
  }
  return "";
}

function buildCanonicalValidationText(result: any): string {
  const raw = String(result?.raw_markdown ?? "").trim();
  if (hasCanonicalHeadings(raw)) return raw;

  const sections = (result?.sections ?? {}) as Record<string, unknown>;
  const entries = Object.values(sections)
    .map((entry) => {
      const record = (entry && typeof entry === "object") ? (entry as Record<string, unknown>) : {};
      const title = String(record.title ?? "").trim();
      const content = sectionText(record.content ?? entry);
      return { title, content };
    })
    .filter((entry) => entry.content.length > 0);

  if (!entries.length) {
    return String(result?.executive_summary ?? "").trim();
  }

  const assembled = CANONICAL_TITLES.map((title, index) => {
    const found =
      entries.find((entry) => entry.title.toLowerCase() === title.toLowerCase()) ??
      entries.find((entry) => entry.title.toLowerCase().includes(title.toLowerCase()));
    return `${index + 1}. ${title}\n\n${found?.content ?? ""}`.trim();
  });
  return assembled.join("\n\n").trim();
}

export async function downloadCyntraReport({
  title,
  company,
  date,
  result,
  contactPerson,
  whiteLabel = defaultWhiteLabel,
}: DownloadCyntraReportParams) {
  const sourceText = buildCanonicalValidationText(result);
  const fullExportText = runBoardOutputGuard(sourceText, { fullDocument: true });
  const isDecisionDocument = /Besluitdocument Raad van Bestuur/i.test(String(title || ""));
  const reportType = isDecisionDocument ? "decision" : "analysis";
  try {
    assertBoardOutputStandard(fullExportText, {
      documentType: reportType,
      sourceText,
    });
    assertOutputIntegrity(fullExportText);
    assertSentenceIntegrity(fullExportText);
  } catch (error) {
    const message = String((error as Error)?.message ?? error ?? "");
    throw new Error(
      message ||
        "Board-output v1.3: integriteitscontrole faalt (duplicatie of afgeknotte zin)."
    );
  }

  const document = (
    <AureliusReportPDF
      title={title}
      company={company}
      date={date}
      result={result}
      contactPerson={contactPerson}
      whiteLabel={whiteLabel}
    />
  );

  const blob = await pdf(document).toBlob();

  saveAs(blob, `${title.replace(/[^\w]+/g, "_")}.pdf`);
}
