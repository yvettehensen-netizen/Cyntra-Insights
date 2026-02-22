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
  raw_markdown?: string;

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
const EXECUTIVE_TITLE: RGB = [10, 37, 64];
const EXECUTIVE_TEXT: RGB = [20, 28, 40];
const EXECUTIVE_CARD: RGB = [248, 250, 252];
const LOSS_TEXT_RED: RGB = [255, 77, 77]; // #FF4D4D
const DECISION_CONTRACT_BG: RGB = [28, 37, 38]; // #1C2526
const DECISION_CONTRACT_BORDER: RGB = [10, 37, 64]; // #0A2540
const SECTION_TITLE_MARGIN_BOTTOM = 7; // ~1.2rem visual spacing
const DECISION_CONTRACT_BORDER_WIDTH_MM = 0.7; // ~2px equivalent
const FALLBACK_WARNING_MARKERS = [
  /\[CYNTRA_FALLBACK_WARNING\]/gi,
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
];

/* ================= CANONICAL ORDER ================= */

const EXECUTIVE_SECTION_CATALOG = [
  {
    key: "dominante_bestuurlijke_these",
    title: "Dominante Bestuurlijke These",
    aliases: ["bestuurlijke_these", "waar_staan_we_nu_echt"],
  },
  {
    key: "kernconflict",
    title: "Kernconflict",
    aliases: ["het_kernconflict", "wat_hier_fundamenteel_schuurt"],
  },
  {
    key: "expliciete_tradeoffs",
    title: "Expliciete Trade-offs",
    aliases: ["de_keuzes_die_nu_voorliggen", "tradeoffs"],
  },
  {
    key: "opportunity_cost",
    title: "Opportunity Cost",
    aliases: ["wat_er_gebeurt_als_er_niets_verandert"],
  },
  {
    key: "governance_impact",
    title: "Governance Impact",
    aliases: ["wat_dit_vraagt_van_bestuur_en_organisatie"],
  },
  {
    key: "machtsdynamiek_onderstroom",
    title: "Machtsdynamiek & Onderstroom",
    aliases: ["machtsdynamiek__onderstroom"],
  },
  {
    key: "executierisico",
    title: "Executierisico",
    aliases: [],
  },
  {
    key: "interventieplan_90dagen",
    title: "90-Dagen Interventieplan",
    aliases: ["90dagen_interventieplan", "90_dagen_actieplan"],
  },
  {
    key: "decision_contract",
    title: "Decision Contract",
    aliases: ["het_besluit_dat_nu_nodig_is"],
  },
] as const;

/* ================= HELPERS ================= */

const resetBodyFont = (doc: jsPDF) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_BODY);
  doc.setTextColor(...WHITE);
};

function sanitizeReportText(value: string): string {
  let cleaned = String(value ?? "");
  for (const marker of FALLBACK_WARNING_MARKERS) {
    cleaned = cleaned.replace(marker, "");
  }
  cleaned = cleaned
    .replace(/^\s*(Aanname:|Contextanker:|beperkte context|duid structureel)[^\n]*\n?/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned;
}

const normalize = (v: unknown): string => {
  if (!v) return "";
  if (Array.isArray(v)) return sanitizeReportText(v.map(normalize).join("\n\n"));
  if (typeof v === "object") {
    return sanitizeReportText(
      Object.entries(v)
      .map(([k, val]) => `${k}: ${normalize(val)}`)
      .join("\n\n")
    );
  }
  return sanitizeReportText(String(v));
};

const mutableRGB = (c: RGB): [number, number, number] => [...c];

function splitOpportunityWindows(text: string): Array<{ label: string; content: string }> {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const segments = {
    "30 dagen": [] as string[],
    "90 dagen": [] as string[],
    "365 dagen": [] as string[],
  };

  let active: keyof typeof segments = "30 dagen";
  for (const line of lines) {
    if (/(^|\s)(30|0)\s*dagen?/i.test(line) || /dag\s*0/i.test(line)) {
      active = "30 dagen";
      continue;
    }
    if (/(^|\s)90\s*dagen?/i.test(line)) {
      active = "90 dagen";
      continue;
    }
    if (/(^|\s)365\s*dagen?/i.test(line) || /\b1\s*jaar\b/i.test(line)) {
      active = "365 dagen";
      continue;
    }
    segments[active].push(line);
  }

  const fallback = text
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return [
    {
      label: "30 dagen",
      content: segments["30 dagen"].join(" ").trim() || fallback[0] || "Niet gespecificeerd.",
    },
    {
      label: "90 dagen",
      content: segments["90 dagen"].join(" ").trim() || fallback[1] || fallback[0] || "Niet gespecificeerd.",
    },
    {
      label: "365 dagen",
      content: segments["365 dagen"].join(" ").trim() || fallback[2] || fallback[1] || fallback[0] || "Niet gespecificeerd.",
    },
  ];
}

function hasExplicitLossLanguage(text: string): boolean {
  return /\b(verlies|verliest|verliespost|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|be[eë]indig)\b/i.test(
    text
  );
}

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
    const sections = report.sections ?? {};

    const resolvedSections = EXECUTIVE_SECTION_CATALOG.map((entry) => {
      const direct = sections[entry.key];
      if (direct) {
        return {
          key: entry.key,
          title: entry.title,
          text: normalize(direct.content).trim(),
        };
      }

      for (const alias of entry.aliases) {
        const aliased = sections[alias];
        if (!aliased) continue;
        const text = normalize(aliased.content).trim();
        if (text) {
          return {
            key: entry.key,
            title: entry.title,
            text,
          };
        }
      }

      return {
        key: entry.key,
        title: entry.title,
        text: "",
      };
    }).filter((entry) => entry.text.length > 0);

    const decisionSection = resolvedSections.find(
      (entry) => entry.key === "decision_contract"
    );
    const regularSections = resolvedSections.filter(
      (entry) => entry.key !== "decision_contract"
    );

    const contentWidth = PAGE.w - M.x * 2 - 12;
    const lineHeight = 5.2;

    for (const section of regularSections) {
      sectionIndex++;

      if (section.key === "opportunity_cost") {
        const windows = splitOpportunityWindows(section.text).map((item) => ({
          label: item.label,
          lines: doc.splitTextToSize(item.content, contentWidth),
        }));

        const windowsHeight = windows.reduce(
          (total, item, index) =>
            total +
            5 + // subtitle
            item.lines.length * lineHeight +
            (index < windows.length - 1 ? 7 : 3), // separator rhythm
          0
        );
        const cardHeight = Math.max(
          42,
          SECTION_TITLE_MARGIN_BOTTOM + windowsHeight + 10
        );
        ensure(cardHeight + 18);

        doc.setFillColor(...EXECUTIVE_CARD);
        doc.setDrawColor(...EXECUTIVE_TITLE);
        doc.setLineWidth(0.3);
        doc.roundedRect(
          M.x - 2,
          y + 2,
          PAGE.w - M.x * 2 + 4,
          cardHeight,
          2.5,
          2.5,
          "FD"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13.5);
        doc.setTextColor(...EXECUTIVE_TITLE);
        doc.text(`${sectionIndex}. ${section.title}`, M.x, y);

        let cursorY = y + SECTION_TITLE_MARGIN_BOTTOM;
        windows.forEach((item, index) => {
          cursorY += 2;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(...EXECUTIVE_TITLE);
          doc.text(item.label, M.x + 4, cursorY);
          cursorY += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.1);
          for (const line of item.lines) {
            doc.setTextColor(
              ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : EXECUTIVE_TEXT)
            );
            doc.text(line, M.x + 4, cursorY);
            cursorY += lineHeight;
          }

          if (index < windows.length - 1) {
            cursorY += 2;
            doc.setDrawColor(...EXECUTIVE_TITLE);
            doc.setLineWidth(0.35);
            doc.line(M.x + 4, cursorY, PAGE.w - M.x - 4, cursorY);
            cursorY += 3;
          }
        });

        y += cardHeight + 14;
        continue;
      }

      const paragraphs = section.text
        .split(/\n\s*\n+/)
        .map((part) => part.trim())
        .filter(Boolean);
      const lines = paragraphs.flatMap((part, index) => {
        const splitLines = doc.splitTextToSize(part, contentWidth);
        return index === 0 ? splitLines : ["", ...splitLines];
      });

      const cardHeight = Math.max(
        30,
        SECTION_TITLE_MARGIN_BOTTOM + 6 + lines.length * lineHeight
      );
      ensure(cardHeight + 18);

      doc.setFillColor(...EXECUTIVE_CARD);
      doc.setDrawColor(...EXECUTIVE_TITLE);
      doc.setLineWidth(0.3);
      doc.roundedRect(
        M.x - 2,
        y + 2,
        PAGE.w - M.x * 2 + 4,
        cardHeight,
        2.5,
        2.5,
        "FD"
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13.5);
      doc.setTextColor(...EXECUTIVE_TITLE);
      doc.text(`${sectionIndex}. ${section.title}`, M.x, y);

      let cursorY = y + SECTION_TITLE_MARGIN_BOTTOM;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.1);
      for (const line of lines) {
        if (!line) {
          cursorY += lineHeight * 0.45;
          continue;
        }
        doc.setTextColor(
          ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : EXECUTIVE_TEXT)
        );
        doc.text(line, M.x + 4, cursorY);
        cursorY += lineHeight;
      }

      y += cardHeight + 14;
    }

    if (decisionSection) {
      newPage();
      sectionIndex++;

      const frameX = 0;
      const frameY = HEADER_H + 4;
      const frameW = PAGE.w;
      const frameH = PAGE.h - frameY - FOOTER_H - 2;
      const framePaddingX = M.x;

      doc.setFillColor(...DECISION_CONTRACT_BG);
      doc.rect(frameX, frameY, frameW, frameH, "F");
      doc.setDrawColor(...DECISION_CONTRACT_BORDER);
      doc.setLineWidth(DECISION_CONTRACT_BORDER_WIDTH_MM);
      doc.rect(frameX, frameY, frameW, frameH);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14.5);
      doc.setTextColor(...WHITE);
      doc.text(
        `${sectionIndex}. ${decisionSection.title}`,
        framePaddingX,
        frameY + 12
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.2);

      const decisionLines = doc.splitTextToSize(
        decisionSection.text,
        frameW - framePaddingX * 2
      );
      let decisionY = frameY + 12 + SECTION_TITLE_MARGIN_BOTTOM;
      for (const line of decisionLines) {
        if (decisionY > frameY + frameH - 8) break;
        doc.setTextColor(
          ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : WHITE)
        );
        doc.text(line, framePaddingX, decisionY);
        decisionY += 5.4;
      }
    }
  }

  doc.save(`${company.replace(/[^\w]+/g, "_")}_Aurelius_Report.pdf`);
}
