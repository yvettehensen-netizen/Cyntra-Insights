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
// - Versterkte besluitdruk in layout: keerzijde van de keuze, eigenaarschap, deadlines visueel benadrukt.
// - Geavanceerde HGBCO-uitbreiding: impliciete framework-voeding voor diepere analyse in tabel.
// ============================================================

import jsPDF from "jspdf";
import {
  applyBoardEditorialPolicy,
  dedupeSectionHeadings,
  sanitizeBoardOutput,
} from "@/aurelius/utils/boardOutputSanitizer";
import {
  assertSentenceIntegrity,
  assertBoardOutputStandard,
  runBoardOutputGuard,
} from "@/aurelius/synthesis/boardOutputGuard";
import { assertOutputIntegrity } from "@/aurelius/synthesis/outputIntegrity";
import { getBoardroomFileName } from "@/utils/download";

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
    trade_off?: string; // ADD ONLY: Impliciete keuzeconflict benadrukking.
    measurable_result?: string; // ADD ONLY: Impliciet OKR voor executie.
  }> | Record<string, string[]>;
}

export interface CyntraCoverMeta {
  confidence?: number;
  industry?: string;
  snapshot?: string;
  contactPerson?: string;
}

/* ================= CONSTANTS ================= */

const PAGE = { w: 210, h: 297 };
const M = { x: 24, y: 26 };

const HEADER_H = 14;
const FOOTER_H = 14;

const FONT_BODY = 10.4;
const LINE = 5.8;

/* ================= THEME ================= */

// Website-aligned Cyntra palette: #0b0e14 / #111624 / #c4a465 / #e4cc8c
const COVER_BG: RGB = [11, 14, 20];
const INNER_BG: RGB = [251, 249, 244];
const BLUE: RGB = [11, 14, 20];
const GOLD: RGB = [196, 164, 101];
const ANTHRACITE: RGB = [30, 35, 50];
const LIGHT_GRAY: RGB = [244, 239, 229];
const WHITE: RGB = [255, 255, 255];
const EXECUTIVE_TITLE: RGB = BLUE;
const EXECUTIVE_TEXT: RGB = ANTHRACITE;
const EXECUTIVE_MUTED: RGB = [89, 96, 116];
const EXECUTIVE_CARD: RGB = [255, 254, 251];
const EXECUTIVE_CARD_BORDER: RGB = [228, 204, 140];
const SECTION_DIVIDER: RGB = GOLD;
const DECISION_CONTRACT_BG: RGB = LIGHT_GRAY;
const DECISION_CONTRACT_BORDER: RGB = GOLD;
const DECISION_CONTRACT_BORDER_WIDTH_MM = 0.8;
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
    title: "Dominante These",
    aliases: ["bestuurlijke_these", "waar_staan_we_nu_echt"],
  },
  {
    key: "kernconflict",
    title: "Structurele Kernspanning",
    aliases: ["het_kernconflict", "wat_hier_fundamenteel_schuurt"],
  },
  {
    key: "expliciete_tradeoffs",
    title: "Keerzijde van de keuze",
    aliases: ["de_keuzes_die_nu_voorliggen", "tradeoffs"],
  },
  {
    key: "opportunity_cost",
    title: "De Prijs van Uitstel",
    aliases: ["wat_er_gebeurt_als_er_niets_verandert"],
  },
  {
    key: "governance_impact",
    title: "Mandaat & Besluitrecht",
    aliases: ["wat_dit_vraagt_van_bestuur_en_organisatie"],
  },
  {
    key: "machtsdynamiek_onderstroom",
    title: "Onderstroom & Informele Macht",
    aliases: ["machtsdynamiek__onderstroom"],
  },
  {
    key: "executierisico",
    title: "Faalmechanisme",
    aliases: [],
  },
  {
    key: "interventieplan_90dagen",
    title: "90-Dagen Interventieontwerp",
    aliases: ["90dagen_interventieplan", "90_dagen_actieplan"],
  },
  {
    key: "decision_contract",
    title: "Besluitkader",
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
    "De keerzijde van de keuze ontbreekt in de bronoutput. Leg per keuze vast wat wordt gewonnen, wat wordt verloren en wie mandaat inlevert.",
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
    "Besluitkader ontbreekt in de bronoutput. Leg keuze, eigenaarschap, tijdshorizon, expliciet verlies en niet-onderhandelbare stopregels vast.",
};

/* ================= HELPERS ================= */

const resetBodyFont = (doc: jsPDF) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT_BODY);
  doc.setTextColor(...EXECUTIVE_TEXT);
};

function sanitizeReportText(value: string): string {
  let cleaned = sanitizeBoardOutput(String(value ?? ""));
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

function sectionContentToText(value: unknown): string {
  if (typeof value === "string") return sanitizeReportText(value);
  if (Array.isArray(value)) return value.map((entry) => String(entry ?? "").trim()).filter(Boolean).join("\n");
  if (value && typeof value === "object") {
    try {
      return sanitizeReportText(JSON.stringify(value));
    } catch {
      return "";
    }
  }
  return "";
}

function buildCanonicalValidationText(report: AnalysisResult): string {
  const raw = sanitizeReportText(String(report.raw_markdown ?? ""));
  if (hasCanonicalHeadings(raw)) return raw;

  const sections = report.sections ?? {};
  const entries = Object.values(sections)
    .map((entry) => ({
      title: sanitizeReportText(String(entry?.title ?? "")),
      content: sectionContentToText(entry?.content),
    }))
    .filter((entry) => entry.content.length > 0);

  if (!entries.length) return sanitizeReportText(String(report.executive_summary ?? ""));

  return CANONICAL_TITLES.map((title, index) => {
    const found =
      entries.find((entry) => entry.title.toLowerCase() === title.toLowerCase()) ??
      entries.find((entry) => entry.title.toLowerCase().includes(title.toLowerCase()));
    return `${index + 1}. ${title}\n\n${found?.content ?? ""}`.trim();
  })
    .join("\n\n")
    .trim();
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

  const windows = [
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

  const deduped = new Set<string>();
  return windows.filter((window) => {
    const key = `${window.label}:${window.content}`.toLowerCase().trim();
    if (!key) return false;
    if (deduped.has(key)) return false;
    deduped.add(key);
    return true;
  });
}

function hasExplicitLossLanguage(text: string): boolean {
  return /\b(verlies|verliest|verliespost|inleveren|machtverlies|afbouw|stopzetten|opheffen|afstoten|be[eë]indig)\b/i.test(
    text
  );
}

function firstNonEmptyString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function resolveCoverContact(report: AnalysisResult, meta?: CyntraCoverMeta): string {
  const record = report as Record<string, unknown>;
  return (
    firstNonEmptyString(
      meta?.contactPerson,
      record.contactPerson,
      record.contactpersoon,
      record.contact_person,
      record.primaryContact,
      record.primary_contact,
      record.clientContact,
      record.client_contact,
      record.requestedBy,
      record.requested_by,
      record.aanvrager,
      record.owner
    ) || "Nog niet opgegeven"
  );
}

function trimToWordBudget(text: string, maxWords: number): string {
  const words = sanitizeReportText(String(text ?? ""))
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
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
  const sourceText = buildCanonicalValidationText(report);
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
  const doc = new jsPDF("p", "mm", "a4");
  const generatedAt = new Date();
  const dateLabel = formatReportDate(generatedAt);
  const organizationName =
    sanitizeReportText(company || report.organisation || "Onbenoemd") || "Onbenoemd";
  const contactName = sanitizeReportText(resolveCoverContact(report, meta));
  const downloadFileName = getBoardroomFileName(reportType, organizationName);

  doc.setProperties({ title: downloadFileName });

  let y = HEADER_H + M.y;
  let page = 0;
  let sectionIndex = 0;

  const paintInnerBackground = () => {
    doc.setFillColor(...INNER_BG);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");
  };

  const header = () => {
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(M.x, 12, PAGE.w - M.x, 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.8);
    doc.setTextColor(...GOLD);
    doc.text("CYNTRA INSIGHTS", M.x, 9.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.1);
    doc.setTextColor(...BLUE);
    doc.text(
      isDecisionDocument ? "Besluitdocument Raad van Bestuur" : "Bestuurlijke Analyse & Interventie",
      PAGE.w - M.x,
      9.2,
      { align: "right" }
    );
  };

  const footer = () => {
    const footerY = PAGE.h - 6.4;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(M.x, PAGE.h - FOOTER_H + 2.8, PAGE.w - M.x, PAGE.h - FOOTER_H + 2.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.9);
    doc.setTextColor(...ANTHRACITE);
    doc.text("Cyntra Insights", M.x, footerY);
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
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.3);
    doc.line(M.x, y - 3.2, PAGE.w - M.x, y - 3.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(isDecisionDocument ? 14 : 18);
    doc.setTextColor(...GOLD);
    doc.text(`${index}.`, M.x, y + 2.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(isDecisionDocument ? 12.5 : 14);
    doc.setTextColor(...BLUE);
    doc.text(heading, M.x + 14, y + 2.2);
  };

  /* ================= COVER ================= */

  const coverCenterX = PAGE.w / 2;
  if (isDecisionDocument) {
    doc.setFillColor(...INNER_BG);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...BLUE);
    doc.text("Besluitdocument Raad van Bestuur", coverCenterX, 122, { align: "center" });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(M.x + 28, 130, PAGE.w - (M.x + 28), 130);
  } else {
    doc.setFillColor(...COVER_BG);
    doc.rect(0, 0, PAGE.w, PAGE.h, "F");
    doc.setFillColor(17, 22, 36);
    doc.rect(0, 0, PAGE.w, 38, "F");
    doc.setFillColor(...GOLD);
    doc.rect(M.x, 44, PAGE.w - M.x * 2, 0.9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(25);
    doc.setTextColor(...GOLD);
    doc.text("Bestuurlijke Analyse & Interventie", coverCenterX, 140, { align: "center" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.2);
  doc.setTextColor(...(isDecisionDocument ? ANTHRACITE : WHITE));
  doc.text(`Organisatie: ${organizationName}`, coverCenterX, 155, {
    align: "center",
    maxWidth: PAGE.w - M.x * 2,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.8);
  doc.text(`Contactpersoon: ${contactName}`, coverCenterX, 163, {
    align: "center",
    maxWidth: PAGE.w - M.x * 2,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  doc.text(`Datum: ${dateLabel}`, coverCenterX, 171, {
    align: "center",
    maxWidth: PAGE.w - M.x * 2,
  });

  if (meta?.confidence !== undefined) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.6);
    doc.setTextColor(...(isDecisionDocument ? ANTHRACITE : WHITE));
    doc.text(
      `Besluitbetrouwbaarheid: ${(meta.confidence * 100).toFixed(0)}%`,
      coverCenterX,
      186.5,
      { align: "center" }
    );
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.6);
  doc.setTextColor(...(isDecisionDocument ? ANTHRACITE : WHITE));
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

  const resolvedSectionsRaw = EXECUTIVE_SECTION_CATALOG.map((entry) => {
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
      text: applyBoardEditorialPolicy(sanitizeReportText(text), entry.title),
    };
  });

  const resolvedSections = dedupeSectionHeadings(resolvedSectionsRaw);

  // Subtle brand bridge from cover to content for a more cohesive visual flow.
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(M.x, HEADER_H + 7.5, PAGE.w - M.x, HEADER_H + 7.5);

  for (const section of resolvedSections) {
    sectionIndex++;
    const isDecisionSection = section.key === "decision_contract";
    const sectionTitle = section.title;
    const sectionText = trimToWordBudget(
      section.text,
      isDecisionSection ? 260 : 190
    );

    const drawHeadingWithFlow = (continued = false) => {
      ensure(18);
      drawSectionHeading(
        sectionIndex,
        continued ? `${sectionTitle} (vervolg)` : sectionTitle
      );
      y += 8;
    };

    if (section.key === "opportunity_cost") {
      const windows = splitOpportunityWindows(sectionText).map((item) => {
        const paragraphs = splitIntoReadableParagraphs(item.content, 2, 170);
        const lineSets = paragraphs.map((paragraph) =>
          doc.splitTextToSize(paragraph, PAGE.w - M.x * 2 - 16)
        );
        const lineCount = lineSets.reduce((count, lines) => count + lines.length, 0);
        const blockHeight = Math.max(
          28,
          11 + lineCount * LINE + Math.max(0, paragraphs.length - 1) * 2.1
        );
        return { label: item.label, lineSets, blockHeight };
      });

      let headingDrawn = false;
      for (let index = 0; index < windows.length; index += 1) {
        const window = windows[index];
        if (!headingDrawn) {
          drawHeadingWithFlow(false);
          headingDrawn = true;
        }
        ensure(window.blockHeight + 12);
        if (y + window.blockHeight + 12 > PAGE.h - FOOTER_H - 10) {
          newPage();
          drawHeadingWithFlow(true);
        }

        const blockY = y + 2;
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
        doc.setFontSize(10.9);
        window.lineSets.forEach((lines, paragraphIndex) => {
          lines.forEach((line) => {
            const pressureLine = /structurele druk/i.test(line);
            doc.setTextColor(...(pressureLine ? GOLD : EXECUTIVE_TEXT));
            doc.text(line, M.x + 6, lineY);
            lineY += LINE;
          });
          if (paragraphIndex < window.lineSets.length - 1) lineY += 1.8;
        });

        y = blockY + window.blockHeight + 8;
      }
      y += 2;
      continue;
    }

    const renderBlocks = buildPdfNarrativeBlocks(
      doc,
      sectionText,
      PAGE.w - M.x * 2 - (isDecisionSection ? 14 : 16)
    );

    const lineItems: Array<
      | { type: "line"; text: string; kind: NarrativeBlockKind; lineHeight: number; fontSize: number }
      | { type: "gap"; height: number }
    > = [];

    renderBlocks.forEach((block, blockIndex) => {
      block.lines.forEach((line) => {
        lineItems.push({
          type: "line",
          text: line,
          kind: block.kind,
          lineHeight: block.lineHeight,
          fontSize: Math.max(10.8, block.fontSize),
        });
      });
      if (blockIndex < renderBlocks.length - 1) {
        lineItems.push({ type: "gap", height: block.gapAfter });
      }
    });

    let cursor = 0;
    let continued = false;
    while (cursor < lineItems.length) {
      drawHeadingWithFlow(continued);

      const cardTop = y + 2;
      const availableBottom = PAGE.h - FOOTER_H - 10;
      const availableContentHeight = Math.max(24, availableBottom - (cardTop + 8));
      let usedHeight = 0;
      let takeUntil = cursor;

      while (takeUntil < lineItems.length) {
        const item = lineItems[takeUntil];
        const itemHeight = item.type === "gap" ? item.height : item.lineHeight;
        if (usedHeight + itemHeight > availableContentHeight && takeUntil > cursor) break;
        usedHeight += itemHeight;
        takeUntil += 1;
      }

      const chunk = lineItems.slice(cursor, takeUntil);
      const cardHeight = Math.max(24, 10 + usedHeight);

      doc.setFillColor(...(isDecisionSection ? DECISION_CONTRACT_BG : EXECUTIVE_CARD));
      doc.setDrawColor(...(isDecisionSection ? DECISION_CONTRACT_BORDER : EXECUTIVE_CARD_BORDER));
      doc.setLineWidth(isDecisionSection ? DECISION_CONTRACT_BORDER_WIDTH_MM : 0.3);
      doc.roundedRect(
        M.x,
        cardTop,
        PAGE.w - M.x * 2,
        cardHeight,
        2.8,
        2.8,
        "FD"
      );

      let cursorY = y + 10;
      chunk.forEach((item) => {
        if (item.type === "gap") {
          cursorY += item.height;
          return;
        }
        const isHeading = item.kind !== "paragraph";
        const monthLine = /^maand\s+\d+/i.test(item.text);
        const interventionLine = /^\d+\.\s*actie:/i.test(item.text);
        const escalationLine = /^escalatiepad:/i.test(item.text);
        const consequenceLine = /^gevolg\b|^gevolg bij missen\b/i.test(item.text);
        const choiceLine = /^de keuze vandaag\b|^voorkeursoptie\b/i.test(item.text);
        const pressureLine = /structurele druk/i.test(item.text);
        const color = isHeading
          ? EXECUTIVE_TITLE
          : monthLine
          ? BLUE
          : interventionLine
          ? ANTHRACITE
          : escalationLine
          ? ANTHRACITE
          : pressureLine
          ? GOLD
          : consequenceLine
          ? EXECUTIVE_TEXT
          : choiceLine
          ? BLUE
          : hasExplicitLossLanguage(item.text)
          ? EXECUTIVE_TEXT
          : EXECUTIVE_TEXT;
        doc.setFont("helvetica", isHeading ? "bold" : "normal");
        doc.setFontSize(item.fontSize);
        doc.setTextColor(...color);
        if (escalationLine) {
          doc.setDrawColor(...GOLD);
          doc.setLineWidth(0.3);
          doc.line(M.x + 6, cursorY - 3.2, PAGE.w - M.x - 6, cursorY - 3.2);
        }
        doc.text(item.text, M.x + 6, cursorY);
        cursorY += item.lineHeight;
      });
      resetBodyFont(doc);

      y = cardTop + cardHeight + 8;
      cursor = takeUntil;
      if (cursor < lineItems.length) {
        newPage();
        continued = true;
      }
    }
    y += 1;
  }

  doc.save(downloadFileName);
}
