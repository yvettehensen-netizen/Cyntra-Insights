// ============================================================
// AURELIUS — EXECUTIVE WORD EXPORT (CANON UPGRADE)
// VOLLEDIG TS-FOUTLOOS
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

/* ============================================================
   TYPES — ADD ONLY
============================================================ */

export interface AnalysisData {
  title: string;
  executive_summary?: string;
  insights?: string;
  risks?: string;
  opportunities?: string;
  roadmap_90d?: string;
  full_text?: string;
  timestamp?: string;

  /* ADD ONLY */
  organisation?: string;
  analysis_type?: string;
  confidence?: number;

  hgbco?: {
    H?: string;
    G?: string;
    B?: string[];
    C?: string[];
    O?: string;
  };

  [key: string]: unknown;
}

/* ============================================================
   UTILITIES
============================================================ */

function paragraphText(
  text: string,
  options?: {
    size?: number;
    italics?: boolean;
    color?: string;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacingAfter?: number;
    spacingBefore?: number;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.alignment,
    spacing: {
      after: options?.spacingAfter,
      before: options?.spacingBefore,
    },
    children: [
      new TextRun({
        text,
        size: options?.size ?? 22,
        italics: options?.italics,
        color: options?.color,
      }),
    ],
  });
}

function addTextBlock(
  sections: Paragraph[],
  title: string,
  content: string
) {
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
    })
  );

  content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      sections.push(
        paragraphText(line, {
          spacingAfter: 120,
        })
      );
    });
}

/* ============================================================
   MAIN GENERATOR
============================================================ */

export async function generateWord(
  data: AnalysisData
): Promise<void> {
  const sections: Paragraph[] = [];

  /* ================= COVER ================= */

  sections.push(
    new Paragraph({
      text: "Aurelius Executive Intelligence",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  if (data.organisation) {
    sections.push(
      paragraphText(data.organisation, {
        italics: true,
        size: 20,
        color: "666666",
        spacingAfter: 200,
      })
    );
  }

  if (data.timestamp) {
    sections.push(
      paragraphText(
        `Gegenereerd op ${new Date(
          data.timestamp
        ).toLocaleDateString("nl-NL")}`,
        {
          italics: true,
          size: 18,
          color: "777777",
          spacingAfter: 400,
        }
      )
    );
  }

  /* ================= HGBCO (ADD ONLY) ================= */

  if (data.hgbco) {
    sections.push(
      new Paragraph({
        text: "HGBCO Besluitkaart",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    if (data.hgbco.H)
      addTextBlock(sections, "H — Huidige realiteit", data.hgbco.H);

    if (data.hgbco.G)
      addTextBlock(sections, "G — Gekozen richting", data.hgbco.G);

    if (data.hgbco.B?.length)
      addTextBlock(
        sections,
        "B — Structurele blokkades",
        data.hgbco.B.join("\n")
      );

    if (data.hgbco.C?.length)
      addTextBlock(
        sections,
        "C — Closure-interventies",
        data.hgbco.C.join("\n")
      );

    if (data.hgbco.O)
      addTextBlock(sections, "O — Outcome", data.hgbco.O);
  }

  /* ================= MAIN CONTENT ================= */

  if (data.full_text) {
    addTextBlock(sections, "Analyse", data.full_text);
  } else {
    if (data.executive_summary)
      addTextBlock(
        sections,
        "Executive Summary",
        data.executive_summary
      );

    if (data.insights)
      addTextBlock(sections, "Inzichten", data.insights);

    if (data.risks)
      addTextBlock(sections, "Risico’s", data.risks);

    if (data.opportunities)
      addTextBlock(sections, "Kansen", data.opportunities);

    if (data.roadmap_90d)
      addTextBlock(
        sections,
        "90-Dagen Actieplan",
        data.roadmap_90d
      );
  }

  /* ================= FOOTER ================= */

  sections.push(
    paragraphText(
      `© ${new Date().getFullYear()} Aurelius Executive Intelligence — Vertrouwelijk`,
      {
        alignment: AlignmentType.CENTER,
        italics: true,
        size: 18,
        color: "999999",
        spacingBefore: 600,
      }
    )
  );

  /* ================= DOCX BUILD ================= */

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  const safeTitle = data.title
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const filename = `aurelius-${safeTitle}-${Date.now()}.docx`;

  saveAs(blob, filename);
}
