// ============================================================
// src/aurelius/utils/generateAureliusPDF.ts
// CYNTRA INSIGHTS — EXECUTIVE INTELLIGENCE SNAPSHOT
// FINAL CANON — BLACK · GOLD · WHITE ONLY
// NO GREY · NO WATERMARK · PURE ELITE OUTPUT
// COSMETIC UPGRADE ONLY — FUNCTIONALITY IDENTICAL
// ============================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= TYPES ================= */

type RGB = readonly [number, number, number];

export interface AnalysisResult {
  title?: string;
  executive_summary?: string;
  sections?: Record<
    string,
    {
      title: string;
      content: string | string[] | Record<string, unknown>;
    }
  >;

  /* ============================================================
     ✅ ADD ONLY — ZORGSCAN EXTENSIONS (OPTIONAL)
  ============================================================ */
  organisation?: string;
  primary_failure?: string;
  roadmap_summary?: string;
  besluitkaart?: Array<{
    fase: string;
    arena: string;
    structurele_spanning: string;
    failure_mode: string;
    signaal: string;
    interventie?: string;
    owner?: string;
    irreversibility_deadline?: string;
  }>;
}

export interface CyntraCoverMeta {
  confidence?: number;
  industry?: string;
  contactPerson?: string;
  snapshot?: string;
  hasUnderstreamSignals?: boolean;
}

/* ================= CONSTANTS ================= */

const PAGE = { w: 210, h: 297 };
const M = { x: 28, y: 30 };

const HEADER_H = 22;
const FOOTER_H = 12;

const FONT_BODY = 10.6;
const LINE = 7.4;

/* ================= THEME ================= */

const BLACK: RGB = [0, 0, 0];
const GOLD: RGB = [184, 151, 68];
const WHITE: RGB = [255, 255, 255];

const CONF_HIGH: RGB = [110, 160, 135];
const CONF_MED: RGB = GOLD;
const CONF_LOW: RGB = [160, 110, 110];

/* ================= LOGO ================= */

const CYNTRA_LOGO_BASE64 =
  "data:image/png;base64,REPLACE_THIS_WITH_REAL_LOGO";

/* ================= HELPERS ================= */

const resetBodyFont = (doc: jsPDF) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_BODY);
  doc.setTextColor(...WHITE);
};

const normalize = (v: unknown): string => {
  if (!v) return "";
  if (Array.isArray(v)) return v.map(normalize).join("\n\n");
  if (typeof v === "object") {
    return Object.entries(v)
      .map(([k, val]) => `${k}: ${normalize(val)}`)
      .join("\n\n");
  }
  return String(v);
};

const confidenceColor = (c?: number): RGB => {
  if (c === undefined) return CONF_MED;
  if (c >= 0.75) return CONF_HIGH;
  if (c >= 0.5) return CONF_MED;
  return CONF_LOW;
};

/* ============================================================
   ✅ ADD ONLY — TYPE FIX FOR JSPDF-AUTOTABLE COLORS
   autoTable expects mutable tuples, RGB is readonly.
============================================================ */

const mutableRGB = (c: RGB): [number, number, number] => [...c];

/* ================= SIGNATURES ================= */

export function generateAureliusPDF(
  title: string,
  report: AnalysisResult
): void;

export function generateAureliusPDF(
  title: string,
  report: AnalysisResult,
  company: string,
  meta?: CyntraCoverMeta
): void;

/* ================= IMPLEMENTATION ================= */

export function generateAureliusPDF(
  title: string,
  report: AnalysisResult,
  company: string = "—",
  meta?: CyntraCoverMeta
) {
  const doc = new jsPDF("p", "mm", "a4");

  let y = HEADER_H + M.y;
  let page = 1;
  let sectionIndex = 0;

  /* ================= PAGE BACKGROUND ================= */

  const paintBlackBackground = () => {
    doc.setFillColor(...BLACK);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  };

  /* ================= PAGE CORE ================= */

  const header = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text("CYNTRA INSIGHTS", M.x, 16);
    resetBodyFont(doc);
  };

  const footer = () => {
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);

    doc.text(`© ${new Date().getFullYear()} Cyntra Insights`, M.x, PAGE.h - 5);
    doc.text(`${page}`, PAGE.w - M.x, PAGE.h - 5, { align: "right" });

    resetBodyFont(doc);
  };

  const newPage = () => {
    doc.addPage();
    page++;

    paintBlackBackground();
    header();
    footer();

    y = HEADER_H + M.y;
  };

  const ensure = (h: number) => {
    if (y + h > PAGE.h - FOOTER_H - 14) newPage();
  };

  /* ================= COVER ================= */

  paintBlackBackground();

  try {
    doc.addImage(CYNTRA_LOGO_BASE64, "PNG", M.x, 20, 28, 10);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...GOLD);
    doc.text("CYNTRA INSIGHTS", M.x, 28);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...WHITE);
  doc.text(company, M.x, 118, { maxWidth: 150 });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(15);
  doc.setTextColor(...GOLD);
  doc.text(title, M.x, 144, { maxWidth: 150 });

  if (meta?.confidence !== undefined) {
    doc.setFontSize(9);
    doc.setTextColor(...confidenceColor(meta.confidence));
    doc.text(`Confidence ${meta.confidence.toFixed(2)}`, PAGE.w - M.x, 28, {
      align: "right",
    });
  }

  newPage();

  /* ================= EXECUTIVE SUMMARY ================= */

  if (report.executive_summary) {
    sectionIndex++;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...GOLD);
    doc.text(`1. Executive Samenvatting`, M.x, y);

    y += 12;
    resetBodyFont(doc);

    const blocks = normalize(report.executive_summary)
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    for (const block of blocks) {
      ensure(22);

      const lines = doc.splitTextToSize(block, PAGE.w - M.x * 2 - 4);

      for (const line of lines) {
        ensure(LINE);
        doc.text(line, M.x, y);
        y += LINE;
      }

      y += 6;
    }

    newPage();
  }

  /* ============================================================
     ✅ ADD ONLY — ZORGSCAN BESLUITKAART PDF EXPORT
  ============================================================ */

  if (report.besluitkaart && report.besluitkaart.length > 0) {
    sectionIndex++;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...GOLD);
    doc.text(`${sectionIndex}. Besluitvormingskaart (90D Roadmap)`, M.x, y);

    y += 10;

    autoTable(doc, {
      startY: y,
      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 8.5,
        textColor: mutableRGB(WHITE),
        fillColor: mutableRGB(BLACK),
        lineColor: mutableRGB(GOLD),
      },

      headStyles: {
        fillColor: mutableRGB(BLACK),
        textColor: mutableRGB(GOLD),
        lineWidth: 0.2,
      },

      bodyStyles: {
        fillColor: mutableRGB(BLACK),
      },

      head: [["Fase", "Owner", "Interventie", "Deadline"]],

      body: report.besluitkaart.map((s) => [
        s.fase,
        s.owner ?? "—",
        s.interventie ?? "—",
        s.irreversibility_deadline ?? "—",
      ]),
    });

    newPage();
  }

  /* ================= CORE SECTIONS ================= */

  if (report.sections) {
    for (const s of Object.values(report.sections)) {
      sectionIndex++;

      ensure(30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...GOLD);
      doc.text(`${sectionIndex}. ${s.title}`, M.x, y);

      y += 12;
      resetBodyFont(doc);

      const paragraphs = normalize(s.content)
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      for (const para of paragraphs) {
        ensure(18);

        const lines = doc.splitTextToSize(para, PAGE.w - M.x * 2 - 4);

        for (const line of lines) {
          ensure(LINE);
          doc.text(line, M.x, y);
          y += LINE;
        }

        y += 6;
      }

      y += 4;
    }
  }

  doc.save(`${company.replace(/[^\w]+/g, "_")}_Cyntra_Insights.pdf`);
}
