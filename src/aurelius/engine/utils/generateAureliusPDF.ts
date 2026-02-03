// ============================================================
// src/aurelius/utils/generateAureliusPDF.ts
// AURELIUS HGBCO — EXECUTIVE DECISION PDF EXPORT (FINAL CANON)
//
// 🔒 HEILIG:
// - Routes, signatures, exports IDENTIEK
// - HGBCO blijft primaire pagina
// - Interventieplan + legacy blijven intact
//
// ➕ ADD ONLY:
// - Decision confidence op cover
// - HGBCO verdieping (Porter / PESTEL / 7S / GROW samenvatting)
// - Governance-readiness signal
// - Impliciete integratie van BCG Matrix, Ansoff Matrix, VRIO, SWOT, OKR — voed HGBCO-verdieping, secties en interventies zonder expliciete vermelding (portfolio-optimalisatie, groeipad-evaluatie, resource-beoordeling, interne/externe balans, doelstellingen met meetbare resultaten).
// - Versterkte besluitdruk in layout: trade-offs, eigenaarschap, deadlines visueel benadrukt.
// - Geavanceerde HGBCO-uitbreiding: impliciete framework-voeding voor diepere analyse in tabel.
// ============================================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= TYPES ================= */

type RGB = readonly [number, number, number];

export interface HGBCOCard {
  H: string;
  G: string;
  B: string[];
  C: string[];
  O: string;

  /* ===== ADD ONLY ===== */
  confidence?: number;
  governance_readiness?: "laag" | "middel" | "hoog";
  /* =================== */

  /* ===== ADD ONLY: Framework-verdieping (impliciet) ===== */
  portfolio_analysis?: string; // Impliciet BCG: groei/marktaandeel classificatie.
  growth_strategies?: string; // Impliciet Ansoff: markt/product opties.
  resource_evaluation?: string; // Impliciet VRIO: waarde/uniciteit/nabootsbaarheid/organisatie.
  internal_external_balance?: string; // Impliciet SWOT: sterktes/zwaktes/kansen/bedreigingen.
  objectives_key_results?: string; // Impliciet OKR: ambitieuze doelen met meetbare resultaten.
  /* ====================================================== */
}

export interface AnalysisResult {
  title?: string;
  executive_summary?: string;

  /** ✅ HGBCO PRIMARY BACKBONE */
  hgbco?: HGBCOCard;

  sections?: Record<
    string,
    {
      title: string;
      content: string | string[] | Record<string, unknown>;
    }
  >;

  organisation?: string;

  /** ✅ Legacy ZorgScan fallback */
  besluitkaart?: Array<{
    fase: string;
    arena: string;
    signaal: string;
    interventie?: string;
    owner?: string;
    irreversibility_deadline?: string;
  }>;

  /** ✅ Boardroom Interventies (primary shape) */
  interventions?: Array<{
    priority: number;
    title: string;
    owner: string;
    deliverable: string;
    deadline_days: number;
    trade_off?: string; // ADD ONLY: Impliciete trade-off benadrukking.
    measurable_result?: string; // ADD ONLY: Impliciet OKR voor executie.
  }> | Record<string, string[]>;
}

export interface CyntraCoverMeta {
  confidence?: number;
  industry?: string;
  snapshot?: string;
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

/* ================= CANONICAL ORDER ================= */

const CANONICAL_SECTION_ORDER = [
  "waar_staan_we_nu_echt",
  "wat_hier_fundamenteel_schuurt",
  "wat_er_gebeurt_als_er_niets_verandert",
  "de_keuzes_die_nu_voorliggen",
  "wat_dit_vraagt_van_bestuur_en_organisatie",
  "het_besluit_dat_nu_nodig_is",
];

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

const mutableRGB = (c: RGB): [number, number, number] => [...c];

/* ============================================================
   PDF GENERATOR — HGBCO CANON
============================================================ */

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

  const paintBlackBackground = () => {
    doc.setFillColor(...BLACK);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  };

  const header = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text("AURELIUS DECISION ENGINE™", M.x, 16);
    resetBodyFont(doc);
  };

  const footer = () => {
    doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.text(`© ${new Date().getFullYear()} Aurelius`, M.x, PAGE.h - 5);
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...WHITE);
  doc.text(company, M.x, 118, { maxWidth: 150 });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(15);
  doc.setTextColor(...GOLD);
  doc.text(title, M.x, 144, { maxWidth: 150 });

  if (meta?.confidence !== undefined) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(
      `Besluitbetrouwbaarheid: ${(meta.confidence * 100).toFixed(0)}%`,
      M.x,
      168
    );
  }

  newPage();

  /* ================= HGBCO ================= */

  if (report.hgbco) {
    sectionIndex++;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...GOLD);
    doc.text(`${sectionIndex}. HGBCO Besluitkaart`, M.x, y);

    y += 10;

    const hgbcoBody = [
      ["H — Huidige realiteit", report.hgbco.H],
      ["G — Gekozen richting", report.hgbco.G],
      ["B — Belemmeringen", report.hgbco.B.join("\n• ")],
      ["C — Closure-interventies", report.hgbco.C.join("\n• ")],
      ["O — Outcome na closure", report.hgbco.O],
    ];

    // ADD ONLY: Framework-verdieping impliciet in extra rijen.
    if (report.hgbco.portfolio_analysis) {
      hgbcoBody.push(["Portfolio-optimalisatie", report.hgbco.portfolio_analysis]);
    }
    if (report.hgbco.growth_strategies) {
      hgbcoBody.push(["Groeipad-evaluatie", report.hgbco.growth_strategies]);
    }
    if (report.hgbco.resource_evaluation) {
      hgbcoBody.push(["Resource-beoordeling", report.hgbco.resource_evaluation]);
    }
    if (report.hgbco.internal_external_balance) {
      hgbcoBody.push(["Interne/externe balans", report.hgbco.internal_external_balance]);
    }
    if (report.hgbco.objectives_key_results) {
      hgbcoBody.push(["Doelstellingen met meetbare resultaten", report.hgbco.objectives_key_results]);
    }

    if (report.hgbco.governance_readiness) {
      hgbcoBody.push(["Governance-volwassenheid", report.hgbco.governance_readiness]);
    }

    autoTable(doc, {
      startY: y,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: mutableRGB(WHITE),
        fillColor: mutableRGB(BLACK),
        lineColor: mutableRGB(GOLD),
      },
      head: [["Dimensie", "Inhoud"]],
      body: hgbcoBody,
    });

    newPage();
  }

  /* ================= INTERVENTIES ================= */

  if (report.interventions) {
    const rows: string[][] = [];

    if (Array.isArray(report.interventions)) {
      report.interventions.forEach((x) =>
        rows.push([
          String(x.priority),
          x.title,
          x.owner,
          x.deliverable,
          `${x.deadline_days}d`,
          x.trade_off || "", // ADD ONLY: Trade-off kolom.
          x.measurable_result || "", // ADD ONLY: Meetbare resultaat kolom (impliciet OKR).
        ])
      );
    }

    if (rows.length > 0) {
      sectionIndex++;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...GOLD);
      doc.text(`${sectionIndex}. Interventieplan`, M.x, y);

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
        head: [["#", "Interventie", "Owner", "Deliverable", "Deadline", "Trade-off", "Meetbaar resultaat"]],
        body: rows,
      });

      newPage();
    }
  }

  /* ================= CORE SECTIONS ================= */

  if (report.sections) {
    for (const key of CANONICAL_SECTION_ORDER) {
      const s = report.sections[key];
      if (!s) continue;

      sectionIndex++;

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
        const lines = doc.splitTextToSize(
          para,
          PAGE.w - M.x * 2 - 4
        );
        for (const line of lines) {
          doc.text(line, M.x, y);
          y += LINE;
        }
        y += 6;
      }

      y += 4;
    }
  }

  newPage();
  doc.save(`${company.replace(/[^\w]+/g, "_")}_Aurelius_Report.pdf`);
}