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
const M = { x: 22, y: 24 };

const HEADER_H = 14;
const FOOTER_H = 14;

const FONT_BODY = 10.2;
const LINE = 5.4;

/* ================= THEME ================= */

const COVER_BG: RGB = [0, 31, 63]; // #001F3F
const COVER_GRID: RGB = [6, 43, 78];
const INNER_BG: RGB = [10, 15, 28]; // #0A0F1C
const GOLD: RGB = [212, 175, 55]; // #D4AF37
const WHITE: RGB = [255, 255, 255];
const EXECUTIVE_TITLE: RGB = [212, 175, 55];
const EXECUTIVE_TEXT: RGB = [232, 238, 247];
const EXECUTIVE_MUTED: RGB = [160, 172, 191];
const EXECUTIVE_CARD: RGB = [16, 24, 38];
const EXECUTIVE_CARD_BORDER: RGB = [26, 47, 77];
const SECTION_DIVIDER: RGB = [10, 37, 64]; // #0A2540
const LOSS_TEXT_RED: RGB = [255, 77, 77]; // #FF4D4D
const DECISION_CONTRACT_BG: RGB = [28, 37, 38]; // #1C2526
const DECISION_CONTRACT_BORDER: RGB = [212, 175, 55];
const SECTION_TITLE_MARGIN_BOTTOM = 8;
const DECISION_CONTRACT_BORDER_WIDTH_MM = 0.8;
const COVER_GLOBE_RADIUS = 84;
const FALLBACK_WARNING_MARKERS = [
  /\[CYNTRA_FALLBACK_WARNING\]/gi,
  /SIGNATURE LAYER WAARSCHUWING:[^\n]*\n?/gi,
  /^\s*Aanname:[^\n]*\n?/gim,
  /^\s*Contextanker:[^\n]*\n?/gim,
  /\bbeperkte context\b/gi,
  /\bduid structureel\b/gi,
  /\bcontextsignaal\b/gi,
  /werk uit structureel/gi,
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
  doc.setTextColor(...EXECUTIVE_TEXT);
};

function sanitizeReportText(value: string): string {
  let cleaned = String(value ?? "");
  for (const marker of FALLBACK_WARNING_MARKERS) {
    cleaned = cleaned.replace(marker, "");
  }
  cleaned = cleaned
    .replace(
      /^\s*(SIGNATURE LAYER WAARSCHUWING|Aanname:|Contextanker:|Contextsignaal:)[^\n]*\n?/gim,
      ""
    )
    .replace(/\b(duid structureel|werk uit structureel|beperkte context)\b/gi, "");
  cleaned = cleaned
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

function formatReportDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function splitIntoSentences(text: string): string[] {
  return (text.match(/[^.!?\n]+[.!?]?/g) ?? [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitIntoReadableParagraphs(
  text: string,
  maxSentences = 2,
  maxChars = 260
): string[] {
  const source = sanitizeReportText(text);
  if (!source) return [];

  const blocks = source
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const bulletLines = lines.filter((line) =>
      /^([-*•]|\d+[.)])\s+/.test(line)
    );
    if (bulletLines.length > 0) {
      paragraphs.push(
        ...bulletLines.map((line) =>
          line.replace(/^([-*•]|\d+[.)])\s+/, "").trim()
        )
      );
      continue;
    }

    const sentences = splitIntoSentences(block);
    if (sentences.length <= maxSentences && block.length <= maxChars) {
      paragraphs.push(block);
      continue;
    }

    let cursor = "";
    let count = 0;
    for (const sentence of sentences) {
      const candidate = cursor ? `${cursor} ${sentence}` : sentence;
      if (!cursor) {
        cursor = sentence;
        count = 1;
        continue;
      }

      if (count >= maxSentences || candidate.length > maxChars) {
        paragraphs.push(cursor.trim());
        cursor = sentence;
        count = 1;
        continue;
      }

      cursor = candidate;
      count += 1;
    }

    if (cursor.trim()) {
      paragraphs.push(cursor.trim());
    }
  }

  return paragraphs.filter(Boolean);
}

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
  const generatedAt = new Date();
  const dateLabel = formatReportDate(generatedAt);
  const organizationName =
    sanitizeReportText(company || report.organisation || "Onbenoemd") || "Onbenoemd";

  let y = HEADER_H + M.y;
  let page = 0;
  let sectionIndex = 0;

  const paintInnerBackground = () => {
    doc.setFillColor(...INNER_BG);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  };

  const drawCoverGrid = () => {
    const centerX = PAGE.w / 2;
    const centerY = PAGE.h / 2 - 32;

    doc.setDrawColor(...COVER_GRID);
    doc.setLineWidth(0.26);
    doc.ellipse(centerX, centerY, COVER_GLOBE_RADIUS, COVER_GLOBE_RADIUS * 0.72);

    for (let i = 1; i <= 4; i++) {
      const ratio = 1 - i * 0.16;
      doc.ellipse(
        centerX,
        centerY,
        COVER_GLOBE_RADIUS * ratio,
        COVER_GLOBE_RADIUS * 0.72 * ratio
      );
    }

    for (let i = -4; i <= 4; i++) {
      const radiusX = Math.max(8, Math.abs(i) * 7 + 6);
      doc.ellipse(centerX, centerY, radiusX, COVER_GLOBE_RADIUS * 0.72);
    }
  };

  const header = () => {
    doc.setDrawColor(...SECTION_DIVIDER);
    doc.setLineWidth(0.4);
    doc.line(M.x, 12, PAGE.w - M.x, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...GOLD);
    doc.text("CYNTRA INSIGHTS", M.x, 9.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    doc.setTextColor(...EXECUTIVE_MUTED);
    doc.text("Strategisch Besluitrapport", PAGE.w - M.x, 9.2, { align: "right" });
  };

  const footer = () => {
    const footerY = PAGE.h - 6.4;
    doc.setDrawColor(...SECTION_DIVIDER);
    doc.setLineWidth(0.35);
    doc.line(M.x, PAGE.h - FOOTER_H + 2.8, PAGE.w - M.x, PAGE.h - FOOTER_H + 2.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.9);
    doc.setTextColor(...EXECUTIVE_MUTED);
    doc.text("Cyntra Insights – Executive Operating System", M.x, footerY);
    doc.text("Vertrouwelijk", PAGE.w / 2, footerY, { align: "center" });
    doc.text(`${page}`, PAGE.w - M.x, footerY, { align: "right" });

    resetBodyFont(doc);
  };

  const newPage = () => {
    doc.addPage();
    page += 1;
    paintInnerBackground();
    header();
    footer();
    y = HEADER_H + M.y;
  };

  const ensure = (h: number) => {
    if (y + h > PAGE.h - FOOTER_H - 10) newPage();
  };

  const drawSectionHeading = (index: number, heading: string) => {
    doc.setDrawColor(...SECTION_DIVIDER);
    doc.setLineWidth(0.45);
    doc.line(M.x, y - 3.2, PAGE.w - M.x, y - 3.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.6);
    doc.setTextColor(...EXECUTIVE_TITLE);
    doc.text(`${index}. ${heading}`, M.x, y + 1.2);
  };

  /* ================= COVER ================= */

  doc.setFillColor(...COVER_BG);
  doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  drawCoverGrid();

  const coverCenterX = PAGE.w / 2;
  doc.setDrawColor(...GOLD);
  doc.setFillColor(...COVER_BG);
  doc.setLineWidth(1.1);
  doc.circle(coverCenterX, 98, 16, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(...GOLD);
  doc.text("C", coverCenterX, 101, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(43);
  doc.setTextColor(...GOLD);
  doc.text("CYNTRA", coverCenterX, 124, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("INSIGHTS", coverCenterX, 133, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16.8);
  doc.setTextColor(...WHITE);
  doc.text("STRATEGISCH BESLUITRAPPORT", coverCenterX, 165, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.2);
  doc.setTextColor(...WHITE);
  doc.text(`${organizationName} – ${dateLabel}`, coverCenterX, 176, {
    align: "center",
    maxWidth: PAGE.w - M.x * 2,
  });

  if (meta?.confidence !== undefined) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.6);
    doc.setTextColor(...EXECUTIVE_MUTED);
    doc.text(
      `Besluitbetrouwbaarheid: ${(meta.confidence * 100).toFixed(0)}%`,
      coverCenterX,
      186.5,
      { align: "center" }
    );
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(...WHITE);
  doc.text("Vertrouwelijk – Raad van Bestuur", coverCenterX, PAGE.h - 22, {
    align: "center",
  });
  doc.text(`© Cyntra Insights ${generatedAt.getFullYear()}`, coverCenterX, PAGE.h - 14, {
    align: "center",
  });

  newPage();

  /* ================= HGBCO ================= */

  if (report.hgbco) {
    sectionIndex++;
    ensure(24);
    drawSectionHeading(sectionIndex, "HGBCO Besluitkaart");
    y += 8;

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
      hgbcoBody.push([
        "Doelstellingen met meetbare resultaten",
        report.hgbco.objectives_key_results,
      ]);
    }

    if (report.hgbco.governance_readiness) {
      hgbcoBody.push(["Governance-volwassenheid", report.hgbco.governance_readiness]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: M.x, right: M.x },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.7,
        cellPadding: 2.2,
        textColor: mutableRGB(EXECUTIVE_TEXT),
        fillColor: mutableRGB(EXECUTIVE_CARD),
        lineColor: mutableRGB(EXECUTIVE_CARD_BORDER),
      },
      headStyles: {
        fillColor: mutableRGB(SECTION_DIVIDER),
        textColor: mutableRGB(GOLD),
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: mutableRGB([13, 20, 33]),
      },
      head: [["Dimensie", "Inhoud"]],
      body: hgbcoBody,
      columnStyles: {
        0: { cellWidth: 48 },
      },
    });

    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;
    if (y > PAGE.h - FOOTER_H - 24) newPage();
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
          `${x.deadline_days} dagen`,
          x.trade_off || "",
          x.measurable_result || "",
        ])
      );
    }

    if (rows.length > 0) {
      sectionIndex++;
      ensure(24);
      drawSectionHeading(sectionIndex, "Interventieplan");
      y += 8;

      autoTable(doc, {
        startY: y,
        margin: { left: M.x, right: M.x },
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.1,
          cellPadding: 2,
          textColor: mutableRGB(EXECUTIVE_TEXT),
          fillColor: mutableRGB(EXECUTIVE_CARD),
          lineColor: mutableRGB(EXECUTIVE_CARD_BORDER),
        },
        headStyles: {
          fillColor: mutableRGB(SECTION_DIVIDER),
          textColor: mutableRGB(GOLD),
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: mutableRGB([13, 20, 33]),
        },
        head: [
          [
            "#",
            "Interventie",
            "Owner",
            "Deliverable",
            "Deadline",
            "Trade-off",
            "Meetbaar resultaat",
          ],
        ],
        body: rows,
      });

      y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 10;
      if (y > PAGE.h - FOOTER_H - 24) newPage();
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

    for (const section of regularSections) {
      sectionIndex++;

      if (section.key === "opportunity_cost") {
        const windows = splitOpportunityWindows(section.text).map((item) => {
          const paragraphs = splitIntoReadableParagraphs(item.content, 2, 180);
          const lineSets = paragraphs.map((paragraph) =>
            doc.splitTextToSize(paragraph, PAGE.w - M.x * 2 - 16)
          );
          const lineCount = lineSets.reduce((count, lines) => count + lines.length, 0);
          const blockHeight = Math.max(
            28,
            10 + lineCount * LINE + Math.max(0, paragraphs.length - 1) * 2.1
          );
          return { label: item.label, paragraphs, lineSets, blockHeight };
        });

        const totalBlocksHeight =
          windows.reduce((sum, item) => sum + item.blockHeight, 0) +
          Math.max(0, windows.length - 1) * 5.5;
        const totalHeight = 10 + totalBlocksHeight + 8;
        ensure(totalHeight + 16);

        drawSectionHeading(sectionIndex, section.title);
        y += 6;

        let blockY = y + 2;
        windows.forEach((window, index) => {
          doc.setFillColor(...EXECUTIVE_CARD);
          doc.setDrawColor(...EXECUTIVE_CARD_BORDER);
          doc.setLineWidth(0.35);
          doc.roundedRect(
            M.x,
            blockY,
            PAGE.w - M.x * 2,
            window.blockHeight,
            2.6,
            2.6,
            "FD"
          );

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.8);
          doc.setTextColor(...EXECUTIVE_TITLE);
          doc.text(window.label, M.x + 5, blockY + 7);

          let lineY = blockY + 12;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.05);
          window.lineSets.forEach((lines, paragraphIndex) => {
            lines.forEach((line) => {
              doc.setTextColor(
                ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : EXECUTIVE_TEXT)
              );
              doc.text(line, M.x + 5, lineY);
              lineY += LINE;
            });
            if (paragraphIndex < window.lineSets.length - 1) {
              lineY += 1.8;
            }
          });

          blockY += window.blockHeight + (index < windows.length - 1 ? 5.5 : 0);
        });

        y = blockY + 8;
        continue;
      }

      const paragraphs = splitIntoReadableParagraphs(section.text, 2, 220);
      const lineSets = paragraphs.map((paragraph) =>
        doc.splitTextToSize(paragraph, PAGE.w - M.x * 2 - 16)
      );
      const lineCount = lineSets.reduce((count, lines) => count + lines.length, 0);
      const cardHeight = Math.max(
        34,
        10 + lineCount * LINE + Math.max(0, paragraphs.length - 1) * 2.1
      );
      ensure(cardHeight + 18);

      drawSectionHeading(sectionIndex, section.title);
      y += 6;

      doc.setFillColor(...EXECUTIVE_CARD);
      doc.setDrawColor(...EXECUTIVE_CARD_BORDER);
      doc.setLineWidth(0.35);
      doc.roundedRect(
        M.x,
        y + 2,
        PAGE.w - M.x * 2,
        cardHeight,
        2.6,
        2.6,
        "FD"
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.1);

      let cursorY = y + 9;
      lineSets.forEach((lines, paragraphIndex) => {
        lines.forEach((line) => {
          doc.setTextColor(
            ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : EXECUTIVE_TEXT)
          );
          doc.text(line, M.x + 5, cursorY);
          cursorY += LINE;
        });
        if (paragraphIndex < lineSets.length - 1) {
          cursorY += 1.9;
        }
      });

      y += cardHeight + 12;
    }

    if (decisionSection) {
      newPage();
      sectionIndex++;

      const frameX = M.x - 2;
      const frameY = HEADER_H + 8;
      const frameW = PAGE.w - frameX * 2;
      const frameH = PAGE.h - frameY - FOOTER_H - 6;
      const framePaddingX = M.x + 4;
      const frameInnerWidth = frameW - 12;

      doc.setFillColor(...DECISION_CONTRACT_BG);
      doc.roundedRect(frameX, frameY, frameW, frameH, 3.2, 3.2, "F");
      doc.setDrawColor(...DECISION_CONTRACT_BORDER);
      doc.setLineWidth(DECISION_CONTRACT_BORDER_WIDTH_MM);
      doc.roundedRect(frameX, frameY, frameW, frameH, 3.2, 3.2, "S");

      doc.setDrawColor(...SECTION_DIVIDER);
      doc.setLineWidth(0.35);
      doc.line(framePaddingX, frameY + 8.5, PAGE.w - framePaddingX, frameY + 8.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14.2);
      doc.setTextColor(...WHITE);
      doc.text(`${sectionIndex}. ${decisionSection.title}`, framePaddingX, frameY + 6.2);

      const decisionParagraphs = splitIntoReadableParagraphs(decisionSection.text, 2, 220);
      const decisionLineSets = decisionParagraphs.map((paragraph) =>
        doc.splitTextToSize(paragraph, frameInnerWidth - 2)
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.1);

      let decisionY = frameY + 15;
      for (let i = 0; i < decisionLineSets.length; i += 1) {
        const lines = decisionLineSets[i];
        for (const line of lines) {
          if (decisionY > frameY + frameH - 8) break;
          doc.setTextColor(
            ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : WHITE)
          );
          doc.text(line, framePaddingX, decisionY);
          decisionY += LINE;
        }

        if (decisionY > frameY + frameH - 8) break;
        if (i < decisionLineSets.length - 1) {
          decisionY += 2;
        }
      }
    }
  }

  doc.save(`${company.replace(/[^\w]+/g, "_")}_Aurelius_Report.pdf`);
}
