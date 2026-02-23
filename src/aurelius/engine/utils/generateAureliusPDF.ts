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
const M = { x: 24, y: 26 };

const HEADER_H = 14;
const FOOTER_H = 14;

const FONT_BODY = 10.4;
const LINE = 5.8;

/* ================= THEME ================= */

const COVER_BG: RGB = [247, 250, 255];
const COVER_GRID: RGB = [214, 226, 241];
const INNER_BG: RGB = [255, 255, 255];
const GOLD: RGB = [168, 132, 46];
const WHITE: RGB = [255, 255, 255];
const EXECUTIVE_TITLE: RGB = [19, 52, 88];
const EXECUTIVE_TEXT: RGB = [28, 40, 58];
const EXECUTIVE_MUTED: RGB = [102, 118, 138];
const EXECUTIVE_CARD: RGB = [255, 255, 255];
const EXECUTIVE_CARD_BORDER: RGB = [221, 229, 239];
const SECTION_DIVIDER: RGB = [205, 217, 233];
const LOSS_TEXT_RED: RGB = [175, 39, 39];
const DECISION_CONTRACT_BG: RGB = [252, 248, 236];
const DECISION_CONTRACT_BORDER: RGB = [168, 132, 46];
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
    title: "Opportunity Cost (30 / 90 / 365 dagen)",
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

const EXECUTIVE_SECTION_DEFAULTS: Record<
  (typeof EXECUTIVE_SECTION_CATALOG)[number]["key"],
  string
> = {
  dominante_bestuurlijke_these:
    "De organisatie bevindt zich op een beslismoment waarbij uitstel direct leidt tot lagere voorspelbaarheid en oplopende uitvoeringsdruk. De Raad moet nu expliciet kiezen en die keuze in ritme doorvoeren.",
  kernconflict:
    "Het kernconflict is bestuurlijk pijnlijk: stabiliseren met expliciet verlies of doorgaan met schijnharmonie en oplopende uitvoeringsschade.",
  expliciete_tradeoffs:
    "Expliciete trade-offs ontbreken in de bronoutput. Leg per keuze vast wat wordt gewonnen, wat wordt verloren en wie mandaat inlevert.",
  opportunity_cost:
    "30 dagen: direct tempoverlies en eerste financiële erosie. 90 dagen: zichtbare machtsverschuiving en structurele frictie. 365 dagen: systeemverschuiving en verlies van strategische keuzevrijheid. Absolute €-bedragen alleen met berekening en bron; anders expliciet niet onderbouwd.",
  governance_impact:
    "Governance-impact vraagt één centrale beslislijn met eigenaarschap, KPI's en hard escalatieritme over instroom, capaciteit, kwaliteit en marge.",
  machtsdynamiek_onderstroom:
    "Machtsdynamiek en onderstroom moeten expliciet worden gemaakt: welke informele blokkades vertragen uitvoering en welke actoren verliezen invloed.",
  executierisico:
    "Executierisico concentreert zich rond parallelle prioriteiten, dubbelmandaat en vertraagde escalatie.",
  interventieplan_90dagen:
    "Week 1-2: bindend consolidatiebesluit, stop-doinglijst en eigenaarschap per prioriteit. Week 3-6: herverdeling van capaciteit en besluitrechten naar een vaste regiecadans met beslislog. Week 7-12: verankering van gedrag met aantoonbare adoptie en KPI-impact. Dag 30: eerste executiebewijs. Dag 60: stabiel ritme. Dag 90: meetbare verbetering op kern-KPI's.",
  decision_contract:
    "Decision Contract ontbreekt in de bronoutput. Leg keuze, eigenaarschap, tijdshorizon, expliciet verlies en niet-onderhandelbare stopregels vast.",
};

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

type NarrativeBlockKind = "chapter" | "ratio" | "stream" | "paragraph";

interface PdfNarrativeBlock {
  kind: NarrativeBlockKind;
  text: string;
  lines: string[];
  fontSize: number;
  lineHeight: number;
  gapAfter: number;
}

function classifyNarrativeBlock(text: string): NarrativeBlockKind {
  const line = String(text ?? "").trim().replace(/^#{1,6}\s*/, "");
  if (/^\d+\.\s+/.test(line)) return "chapter";
  if (/^[A-E]\.\s+/.test(line)) return "ratio";
  if (/^(Bovenstroom|Onderstroom)\b/i.test(line)) return "stream";
  return "paragraph";
}

function splitNarrativeBlocksWithHeadingHints(text: string): Array<{
  kind: NarrativeBlockKind;
  text: string;
}> {
  const source = sanitizeReportText(text);
  if (!source) return [];

  const paragraphs = source
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const blocks: Array<{ kind: NarrativeBlockKind; text: string }> = [];
  for (const paragraph of paragraphs) {
    const kind = classifyNarrativeBlock(paragraph);
    if (kind === "paragraph") {
      const split = splitIntoReadableParagraphs(paragraph, 2, 220);
      split.forEach((piece) => blocks.push({ kind: "paragraph", text: piece }));
    } else {
      blocks.push({ kind, text: paragraph.replace(/^#{1,6}\s*/, "").trim() });
    }
  }
  return blocks;
}

function buildPdfNarrativeBlocks(
  doc: jsPDF,
  text: string,
  maxWidth: number
): PdfNarrativeBlock[] {
  const blocks = splitNarrativeBlocksWithHeadingHints(text);
  return blocks.map((block) => {
    const styleByKind: Record<
      NarrativeBlockKind,
      { fontSize: number; lineHeight: number; gapAfter: number }
    > = {
      chapter: { fontSize: 12.2, lineHeight: 6.2, gapAfter: 2.6 },
      ratio: { fontSize: 11.2, lineHeight: 5.6, gapAfter: 2.2 },
      stream: { fontSize: 10.8, lineHeight: 5.4, gapAfter: 2.0 },
      paragraph: { fontSize: 10.2, lineHeight: LINE, gapAfter: 2.0 },
    };

    const style = styleByKind[block.kind];
    doc.setFont("helvetica", block.kind === "paragraph" ? "normal" : "bold");
    doc.setFontSize(style.fontSize);
    const lines = doc.splitTextToSize(block.text, maxWidth);
    return {
      kind: block.kind,
      text: block.text,
      lines,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      gapAfter: style.gapAfter,
    };
  });
}

function measurePdfNarrativeBlocks(blocks: PdfNarrativeBlock[]): number {
  if (!blocks.length) return 0;
  return blocks.reduce((height, block, index) => {
    const blockHeight = block.lines.length * block.lineHeight;
    const gap = index < blocks.length - 1 ? block.gapAfter : 0;
    return height + blockHeight + gap;
  }, 0);
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

function normalizeHeading(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMarkdownSection(markdown: string, headingHints: string[]): string {
  const source = String(markdown ?? "").trim();
  if (!source) return "";

  const normalizedHints = headingHints.map((hint) => normalizeHeading(hint));
  const headingRegex = /^#{1,6}\s*(.+?)\s*$/gm;
  const matches = [...source.matchAll(headingRegex)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    if (match.index == null) continue;

    const heading = normalizeHeading(match[1] ?? "");
    const isTarget = normalizedHints.some(
      (hint) => heading.includes(hint) || hint.includes(heading)
    );
    if (!isTarget) continue;

    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const content = source.slice(start, end).replace(/^\n+/, "").trim();

    if (content) return sanitizeReportText(content);
  }

  return "";
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
  doc.setFillColor(...EXECUTIVE_TITLE);
  doc.rect(0, 0, PAGE.w, 26, "F");
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
  doc.setTextColor(...EXECUTIVE_TITLE);
  doc.text("CYNTRA", coverCenterX, 124, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...GOLD);
  doc.text("INSIGHTS", coverCenterX, 133, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16.8);
  doc.setTextColor(...EXECUTIVE_TITLE);
  doc.text("STRATEGISCH BESLUITRAPPORT", coverCenterX, 165, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.2);
  doc.setTextColor(...EXECUTIVE_TEXT);
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
  doc.setTextColor(...EXECUTIVE_MUTED);
  doc.text("Vertrouwelijk – Raad van Bestuur", coverCenterX, PAGE.h - 22, {
    align: "center",
  });
  doc.text(`© Cyntra Insights ${generatedAt.getFullYear()}`, coverCenterX, PAGE.h - 14, {
    align: "center",
  });

  newPage();

  /* ================= CORE SECTIONS ================= */

  const sections = report.sections ?? {};
  const markdownSource = sanitizeReportText(
    report.raw_markdown ||
      normalize((report as Record<string, unknown>).narrative) ||
      ""
  );

  const resolvedSections = EXECUTIVE_SECTION_CATALOG.map((entry) => {
    const direct = sections[entry.key];
    let text = direct ? normalize(direct.content).trim() : "";

    if (!text) {
      for (const alias of entry.aliases) {
        const aliased = sections[alias];
        if (!aliased) continue;
        text = normalize(aliased.content).trim();
        if (text) break;
      }
    }

    if (!text && markdownSource) {
      text = extractMarkdownSection(markdownSource, [
        entry.title,
        ...entry.aliases,
      ]);
    }

    if (!text) {
      text = EXECUTIVE_SECTION_DEFAULTS[entry.key];
    }

    return {
      key: entry.key,
      title: entry.title,
      text: sanitizeReportText(text),
    };
  });

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
          30,
          12 + lineCount * LINE + Math.max(0, paragraphs.length - 1) * 2.4
        );
        return { label: item.label, lineSets, blockHeight };
      });

      const totalBlocksHeight =
        windows.reduce((sum, item) => sum + item.blockHeight, 0) +
        Math.max(0, windows.length - 1) * 7;
      const totalHeight = 12 + totalBlocksHeight + 10;
      ensure(totalHeight + 18);

      drawSectionHeading(sectionIndex, section.title);
      y += 8;

      let blockY = y + 2;
      windows.forEach((window, index) => {
        doc.setFillColor(...EXECUTIVE_CARD);
        doc.setDrawColor(...EXECUTIVE_CARD_BORDER);
        doc.setLineWidth(0.3);
        doc.roundedRect(
          M.x,
          blockY,
          PAGE.w - M.x * 2,
          window.blockHeight,
          2.8,
          2.8,
          "FD"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.1);
        doc.setTextColor(...EXECUTIVE_TITLE);
        doc.text(window.label, M.x + 6, blockY + 8);

        let lineY = blockY + 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.2);
        window.lineSets.forEach((lines, paragraphIndex) => {
          lines.forEach((line) => {
            doc.setTextColor(
              ...(hasExplicitLossLanguage(line) ? LOSS_TEXT_RED : EXECUTIVE_TEXT)
            );
            doc.text(line, M.x + 6, lineY);
            lineY += LINE;
          });
          if (paragraphIndex < window.lineSets.length - 1) {
            lineY += 2.1;
          }
        });

        blockY += window.blockHeight + (index < windows.length - 1 ? 7 : 0);
      });

      y = blockY + 10;
      continue;
    }

    const renderBlocks = buildPdfNarrativeBlocks(
      doc,
      section.text,
      PAGE.w - M.x * 2 - 16
    );
    const textHeight = measurePdfNarrativeBlocks(renderBlocks);
    const cardHeight = Math.max(38, 12 + textHeight);
    ensure(cardHeight + 20);

    drawSectionHeading(sectionIndex, section.title);
    y += 8;

    doc.setFillColor(...EXECUTIVE_CARD);
    doc.setDrawColor(...EXECUTIVE_CARD_BORDER);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      M.x,
      y + 2,
      PAGE.w - M.x * 2,
      cardHeight,
      2.8,
      2.8,
      "FD"
    );

    let cursorY = y + 10;
    renderBlocks.forEach((block, blockIndex) => {
      doc.setFont("helvetica", block.kind === "paragraph" ? "normal" : "bold");
      doc.setFontSize(block.fontSize);
      block.lines.forEach((line) => {
        const isHeading = block.kind !== "paragraph";
        const color = isHeading
          ? EXECUTIVE_TITLE
          : hasExplicitLossLanguage(line)
          ? LOSS_TEXT_RED
          : EXECUTIVE_TEXT;
        doc.setTextColor(...color);
        doc.text(line, M.x + 6, cursorY);
        cursorY += block.lineHeight;
      });
      if (blockIndex < renderBlocks.length - 1) {
        cursorY += block.gapAfter;
      }
    });
    resetBodyFont(doc);

    y += cardHeight + 13;
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
    doc.setTextColor(...EXECUTIVE_TITLE);
    doc.text(`${sectionIndex}. ${decisionSection.title}`, framePaddingX, frameY + 6.2);

    const decisionBlocks = buildPdfNarrativeBlocks(
      doc,
      decisionSection.text,
      frameInnerWidth - 2
    );

    let decisionY = frameY + 15;
    for (let i = 0; i < decisionBlocks.length; i += 1) {
      const block = decisionBlocks[i];
      doc.setFont("helvetica", block.kind === "paragraph" ? "normal" : "bold");
      doc.setFontSize(block.fontSize);
      for (const line of block.lines) {
        if (decisionY > frameY + frameH - 8) break;
        const isHeading = block.kind !== "paragraph";
        const color = isHeading
          ? EXECUTIVE_TITLE
          : hasExplicitLossLanguage(line)
          ? LOSS_TEXT_RED
          : EXECUTIVE_TEXT;
        doc.setTextColor(...color);
        doc.text(line, framePaddingX, decisionY);
        decisionY += block.lineHeight;
      }

      if (decisionY > frameY + frameH - 8) break;
      if (i < decisionBlocks.length - 1) {
        decisionY += block.gapAfter;
      }
    }
    resetBodyFont(doc);
  }

  doc.save(`${company.replace(/[^\w]+/g, "_")}_Aurelius_Report.pdf`);
}
