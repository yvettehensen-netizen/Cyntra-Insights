import { synthesizeFinalReport } from "./aureliusSynthesis";
import type { AureliusAnalysisResult } from "../aurelius/utils/parseAureliusReport";

/* =========================
   TYPES
========================= */

export interface BoardReport {
  title: string;
  final: ReturnType<typeof synthesizeFinalReport>;
  analyses: readonly AureliusAnalysisResult[];
}

/* =========================
   INTERNAL TYPE GUARDS
========================= */

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];

/* =========================
   MAIN
========================= */

export function generateAureliusBoardReport(
  analyses: readonly AureliusAnalysisResult[]
): BoardReport {
  if (analyses.length === 0) {
    throw new Error(
      "Minstens één analyse vereist voor het genereren van een Board Report."
    );
  }

  /* =========================
     SIGNAL EXTRACTION
  ========================= */

  const bestText = analyses
    .map(extractBestSignal)
    .filter(Boolean)
    .join("\n\n---\n\n");

  const critiqueText =
    analyses
      .map(extractCritiqueSignal)
      .filter(Boolean)
      .join("\n\n---\n\n") || bestText;

  /* =========================
     FINAL SYNTHESIS
  ========================= */

  const final = synthesizeFinalReport(bestText, critiqueText);

  return {
    title: "Aurelius Strategische Board Analyse",
    final,
    analyses,
  };
}

/* =========================
   HELPERS
========================= */

function extractBestSignal(
  analysis: AureliusAnalysisResult
): string {
  const parts: string[] = [];

  if (analysis.executive_summary?.trim()) {
    parts.push(analysis.executive_summary.trim());
  }

  Object.values(analysis.sections).forEach((section) => {
    if (/conclusie|samenvatting|aanbeveling|summary/i.test(section.title)) {
      parts.push(
        `### ${section.title}\n${stringifySectionContent(
          section.content
        )}`
      );
    }
  });

  return parts.join("\n\n");
}

function extractCritiqueSignal(
  analysis: AureliusAnalysisResult
): string {
  const parts: string[] = [];

  Object.values(analysis.sections).forEach((section) => {
    if (/risico|bottleneck|zwakte|challenge|risk/i.test(section.title)) {
      parts.push(
        `### ${section.title}\n${stringifySectionContent(
          section.content
        )}`
      );
    }
  });

  const risks = asStringArray(analysis.risks);
  if (risks.length) {
    parts.push(
      "### Strategische Risico’s\n" +
        risks.map((r) => `- ${r}`).join("\n")
    );
  }

  return parts.join("\n\n");
}

function stringifySectionContent(
  content: string | string[] | Record<string, string[]>
): string {
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content.map((i) => `- ${i}`).join("\n");
  }

  return Object.entries(content)
    .map(
      ([k, v]) =>
        `${k.replace(/_/g, " ").toUpperCase()}:\n${v
          .map((i) => `- ${i}`)
          .join("\n")}`
    )
    .join("\n\n");
}
