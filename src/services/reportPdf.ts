import type { StrategicReport, AnalysisSession } from "@/platform/types";
import { ensureContentIntegrity } from "@/engine/contentIntegrityGuard";
import { CyntraDesignTokens } from "@/design/cyntraDesignTokens";
import { reportDesignSystem } from "@/design/reportDesignSystem";
import { assertCanonicalBoardroomDocument, assertCanonicalStrategicReport } from "@/engine/canonicalReportGuard";
import { buildBoardroomSections, compileBoardroomDocument } from "@/engine/reportCompiler";
import { parseContactLines as parseRawContactLines } from "@/services/reportText";
import type { BoardroomDocument } from "@/types/BoardroomDocument";
import type { StrategicReport as CanonicalStrategicReport } from "@/types/StrategicReport";
import { sanitizeReportOutput } from "@/utils/sanitizeReportOutput";
import { compactBoardroomBody, normalizeBoardroomBullet, normalizeBoardroomSentence } from "@/aurelius/executive/BoardroomLanguageNormalizer";
import { formatBoardroomMemo } from "@/components/reports/boardroomMemoFormatter";
import { rewriteReport } from "@/engine/rewriteLayer";

type ReportMeta = {
  organizationName: string;
  sector: string;
  analysisType: string;
  documentType: string;
  generatedAt: string;
  contactLines: string[];
};

type ParsedSection = {
  title: string;
  body: string;
};

type DesignCheck = {
  code: string;
  passed: boolean;
};

type ActionRow = {
  action: string;
  mechanism?: string;
  boardDecision?: string;
  owner: string;
  deadline: string;
  kpi: string;
};

type PdfRenderSection = {
  title: string;
  body: string;
  label?: string;
};

const BOARDROOM_CORE_TITLES = new Set([
  "BREAKPOINTS",
  "SITUATIE",
  "BESLUIT",
  "SPANNING",
  "BESLUITPAGINA",
  "STRATEGISCHE SPANNING",
  "EXECUTIVE DECISION CARD",
  "STRATEGISCH VERHAAL",
  "SCENARIOVERGELIJKING",
  "MECHANISME ANALYSE",
  "WAAROM DIT GEBEURT",
  "SCENARIO'S",
  "DOORBRAAKINZICHTEN",
  "BESTUURLIJKE ACTIES",
  "STOPREGELS",
  "VERDIEPING",
  "BESTUURLIJKE BESLISKAART",
  "HGBCO VERHAALLIJN",
  "BESTUURLIJKE VERHAALLIJN",
  "BESTUURLIJKE KERNSAMENVATTING",
  "HOE CYNTRA KAN HELPEN",
  "STRATEGISCH SPEELVELD",
  "BOARDROOM SUMMARY",
  "BOARDROOM SAMENVATTING",
  "BESLUITVRAAG",
  "BESTUURLIJKE IMPLICATIES",
  "KERNSTELLING VAN HET RAPPORT",
  "EXECUTIVE THESIS",
  "FEITENBASIS",
  "KEUZERICHTINGEN",
  "AANBEVOLEN KEUZE",
  "KILLER INSIGHTS",
  "DOORBRAAKINZICHTEN",
  "STRATEGISCHE BREUKPUNTEN",
  "BESTUURLIJK ACTIEPLAN",
  "INTERVENTIEPLAN",
  "SCENARIO'S",
  "BESTUURLIJKE STRESSTEST",
  "MOGELIJKE ONTWIKKELINGEN",
  "OPEN STRATEGISCHE VRAGEN",
  "BESLUITGEVOLGEN",
  "BESLUITGEVOLGEN SIMULATIE",
  "STRATEGISCHE HEFBOOMPUNTEN",
  "STRATEGISCH GEHEUGEN",
  "BESTUURLIJK DEBAT",
  "DOMINANTE THESE",
  "DOMINANT MECHANISM",
  "BOARDROOM INSIGHT",
  "MISDIAGNOSIS INSIGHT",
  "STRATEGISCH CONFLICT",
  "BESTUURLIJKE KEUZE",
  "KEERZIJDE VAN DE KEUZE",
  "INTERVENTIES",
  "SCENARIO: GEEN INTERVENTIE",
  "WIJ BESLUITEN",
  "BOARDROOM QUESTION",
  "EXECUTIVE THESIS",
  "STRATEGIC CONFLICT",
  "INEVITABILITY",
  "DECISION",
]);

const SECTION_ORDER = [
  "EXECUTIVE THESIS",
  "STRATEGIC CONFLICT",
  "MECHANISME ANALYSE",
  "INEVITABILITY",
  "BREAKPOINTS",
  "DECISION",
  "SCENARIOVERGELIJKING",
  "BESTUURLIJKE ACTIES",
];

const ABDF_PAGE_BREAK_TITLES = new Set([
  "VERDIEPING",
  "TECHNISCHE ANALYSE",
]);

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const isNoise = (line: string): boolean => {
  const value = String(line || "").trim();
  if (!value) return true;
  return [
    /^\[UPLOAD_CONTEXT\]/i,
    /^preview:/i,
    /^bestand:/i,
    /^notes?$/i,
    /^bron:/i,
    /^samenvatting\b/i,
    /^fireflies\b/i,
  ].some((pattern) => pattern.test(value));
};

function parseContactLines(source: unknown): string[] {
  return parseRawContactLines(source).filter((line) => !isNoise(line));
}

function looksLikeInternalOrganizationId(value: string): boolean {
  const text = normalize(value);
  return /^org-[a-z0-9-]+$/i.test(text) || /^(seeded-report|upload|onbekend)$/i.test(text);
}

function resolveDisplayOrganizationName(candidate: string, fallback?: string): string {
  const primary = normalize(candidate);
  if (primary && !looksLikeInternalOrganizationId(primary)) return primary;
  const secondary = normalize(fallback);
  if (secondary && !looksLikeInternalOrganizationId(secondary)) return secondary;
  return "Onbekende organisatie";
}

function formatNlDateTime(value?: string): string {
  const candidate = String(value || "").trim();
  if (!candidate) return new Date().toLocaleString("nl-NL");
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? candidate : parsed.toLocaleString("nl-NL");
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;
  const numeric = Number.parseInt(safe, 16);
  return [
    (numeric >> 16) & 255,
    (numeric >> 8) & 255,
    numeric & 255,
  ];
}

function cleanText(value: string): string {
  const raw = String(value || "")
    .replace(/Ø=Ý4|Ø=Ý|Ø=ß|&ª|�/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/\bSttihii\b/g, "")
    .replace(/(?:^|\n)\s*Geen inhoud beschikbaar\.?\s*(?=\n|$)/gim, "\n")
    .replace(/(?:^|\n)\s*🔴\s*ACTION ITEMS[\s\S]*?(?=\n(?:[A-Z][^\n]{2,}\n|\d+\.\s+|###\s+)|$)/gi, "\n")
    .replace(/(?:^|\n)\s*ACTION ITEMS[\s\S]*?(?=\n(?:[A-Z][^\n]{2,}\n|\d+\.\s+|###\s+)|$)/gi, "\n")
    .replace(/(?:^|\n)\s*NIEUWE INZICHTEN\s*\(KILLER INSIGHTS\)\s*(?=\n|$)/gi, "\n")
    .replace(/(?:^|\n)\s*Kopieer richting\s*(?=\n|$)/gi, "\n")
    .replace(/(?:^|\n)\s*bron\s*:[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*notes[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*action items[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*Mechanismeketens[\s\S]*$/i, "")
    .replace(/(?:^|\n)\s*(?:Max\s*5\s*topics|owner:\s*JIJ|owner:|deadline:|brondata:)[^\n]*(?=\n|$)/gi, "\n")
    .replace(/\bversus\b/gi, "\n")
    .replace(/ONDERLIGGENDEAANNAME/g, "ONDERLIGGENDE AANNAME")
    .replace(/kernvalt\b/g, "kern valt")
    .replace(/([a-z])([A-Z][a-z]+:)/g, "$1\n$2")
    .replace(/(kill-switch\.?)(90-DAGEN INTERVENTIEPLAN)/gi, "$1\n\n$2")
    .replace(/(doorstro)(Eigenaar:)/gi, "$1\n$2")
    .replace(/\bStrategische hefboompunten\b/gi, "Strategische keuzes met meeste effect")
    .replace(/\bStrategische hefboom:\s*/gi, "Strategische keuze: ")
    .replace(/\bDominante hefboomcombinatie\b/gi, "Sterkste combinatie van keuzes")
    .replace(/\bWaarom dit 80\/20 impact heeft\b/gi, "Waarom dit het meeste effect heeft")
    .replace(/\bPrimaire stuurhefboom\b/gi, "Primaire bestuurlijke keuze")
    .replace(/\bKritieke hefboom\b/gi, "Kritieke keuze")
    .replace(/\bDominante hefboom\b/gi, "Dominante keuze")
    .replace(/\bhefboomcombinatie\b/gi, "combinatie van keuzes")
    .replace(/\bhefboom\b/gi, "sturingspunt")
    .replace(/\.\./g, ".")
    .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
    .replace(/\b(SYMPTOOM|OORZAAK|MECHANISME|GEVOLG|SYSTEEMDRUK|BESTUURLIJKE IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|RISICO|NORM|ACTIE|EIGENAAR|DEADLINE|KPI|STOPREGEL)\s*—\s*/g, "\n$1 — ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return sanitizeReportOutput(dedupeRepeatedContent(raw));
}

function dedupeRepeatedContent(text: string): string {
  const paragraphs = String(text || "")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const fragments = paragraph
        .split(/(?<=[.!?])\s+|\n+/)
        .map((fragment) => fragment.trim())
        .filter(Boolean);
      const seen = new Set<string>();
      const unique: string[] = [];
      for (const fragment of fragments) {
        const key = fragment.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(fragment);
      }
      return unique.join(" ");
    });

  const seenParagraphs = new Set<string>();
  const uniqueParagraphs: string[] = [];
  for (const paragraph of paragraphs) {
    const key = paragraph.toLowerCase().replace(/\s+/g, " ");
    if (seenParagraphs.has(key)) continue;
    seenParagraphs.add(key);
    uniqueParagraphs.push(paragraph);
  }
  return uniqueParagraphs.join("\n\n");
}

function canonicalizeSectionTitle(value: string): string {
  const title = String(value || "").trim().toUpperCase();
  if (/^(STRATEGISCHE INTERVENTIES|90 DAGEN ACTIEPLAN|90-DAGEN INTERVENTIEPLAN)$/.test(title)) {
    return "90-DAGEN INTERVENTIEPLAN";
  }
  if (title === "BESTUURLIJK ACTIEPLAN") {
    return "90-DAGEN INTERVENTIEPLAN";
  }
  if (title === "STRATEGISCHE HEFBOOMPUNTEN") {
    return "STRATEGISCHE KEUZES MET MEESTE EFFECT";
  }
  if (title === "HGBCO VERHAALLIJN") {
    return "BESTUURLIJKE VERHAALLIJN";
  }
  if (title === "BESTUURLIJK ACTIEPLAN") {
    return "BESTUURLIJKE ACTIES";
  }
  return title;
}

function titleCaseHeading(value: string): string {
  const map: Record<string, string> = {
    "EXECUTIVE MEMO": "Executive Memo",
    "SITUATIE": "Situatie",
    "BESLUIT": "Besluit",
    "SPANNING": "Spanning",
    "BESLUITPAGINA": "Besluitpagina",
    "STRATEGISCHE SPANNING": "De echte strategische spanning",
    "EXECUTIVE DECISION CARD": "Executive Memo",
    "STRATEGISCH VERHAAL": "Strategisch Verhaal",
    "SCENARIOVERGELIJKING": "Bestuurlijke opties",
    "BESTUURLIJKE IMPLICATIES": "Bestuurlijke implicaties",
    "MECHANISME": "Mechanisme",
    "MECHANISME ANALYSE": "Mechanisme",
    "WAAROM DIT GEBEURT": "Waarom dit gebeurt",
    "SCENARIO'S": "Scenario's",
    "GEVOLGEN": "Gevolgen",
    "BESTUURLIJKE OPTIES": "Bestuurlijke opties",
    "STOPREGELS": "Stopregels",
    "BESTUURLIJKE ACTIES": "Acties",
    "VERDIEPING": "Verdieping",
    "BESTUURLIJKE BESLISKAART": "Bestuurlijke Besliskaart",
    "HGBCO VERHAALLIJN": "Bestuurlijke verhaallijn",
    "BESTUURLIJKE VERHAALLIJN": "Bestuurlijke verhaallijn",
    "BESTUURLIJKE KERNSAMENVATTING": "Kernsamenvatting voor bestuur",
    "HOE CYNTRA KAN HELPEN": "Waar Cyntra van betekenis kan zijn",
    "STRATEGISCH SPEELVELD": "Strategisch speelveld",
    "BESLUITVRAAG": "Besluitvraag",
    "KERNSTELLING VAN HET RAPPORT": "Kernstelling van het rapport",
    "EXECUTIVE THESIS": "Executive Summary",
    "STRATEGIC CONFLICT": "Strategisch conflict",
    "INEVITABILITY": "Onderbouwing",
    "BREAKPOINTS": "Breekpunten",
    "DECISION": "Besluit",
    "FEITENBASIS": "Feitenbasis",
    "KEUZERICHTINGEN": "Keuzerichtingen",
    "AANBEVOLEN KEUZE": "Voorgestelde keuze",
    "KILLER INSIGHTS": "Doorbraakinzichten",
    "DOORBRAAKINZICHTEN": "Gevolgen",
    "BESTUURLIJK ACTIEPLAN": "Bestuurlijke acties",
    "90-DAGEN INTERVENTIEPLAN": "Bestuurlijke acties",
    "STRATEGISCHE BREUKPUNTEN": "Strategische breukpunten",
    "BESTUURLIJKE STRESSTEST": "Stressproef",
    "STRATEGISCHE SCENARIO SIMULATIE": "Scenarioanalyse",
    "SCENARIO SIMULATIE": "Scenarioanalyse",
    "STRATEGISCHE KERNVRAGEN": "Strategische Kernvragen",
    "STRATEGISCH PATROON": "Strategisch Patroon",
    "SYSTEEMMECHANISME": "Systeemmechanisme",
    "BESTUURLIJKE WAARSCHUWINGSSIGNALEN": "Bestuurlijke Waarschuwingssignalen",
    "BESLUITGEVOLGEN": "Gevolgen van het besluit",
    "DOMINANTE THESE": "Dominante These",
    "DOMINANT MECHANISM": "Dominant Mechanism",
    "BOARDROOM INSIGHT": "Boardroom Insight",
    "MISDIAGNOSIS INSIGHT": "Misdiagnosis Insight",
    "STRATEGISCH CONFLICT": "Strategisch Conflict",
    "BESTUURLIJKE KEUZE": "Bestuurlijke Keuze",
    "KEERZIJDE VAN DE KEUZE": "Keerzijde van de Keuze",
    "INTERVENTIES": "Interventies",
    "SCENARIO: GEEN INTERVENTIE": "Scenario: Geen Interventie",
    "WIJ BESLUITEN": "Wij Besluiten",
    "BOARDROOM QUESTION": "Boardroom Question",
    "BOARDROOM SUMMARY": "Boardroom Summary",
    "BOARDROOM SAMENVATTING": "Boardroom Summary",
    "STRATEGISCHE HEFBOOMPUNTEN": "Strategische keuzes met meeste effect",
    "DOMINANTE HEFBOOMCOMBINATIE": "Sterkste combinatie van keuzes",
    "TECHNISCHE ANALYSE": "Uitvoerings- en kwaliteitsanalyse",
    "SCENARIOANALYSE": "Scenarioanalyse",
    "INTERVENTIE-ARCHITECTUUR": "Interventie-architectuur",
    "FINANCIËLE CONSEQUENTIES": "Financiele consequenties",
    "APPENDIX": "Appendix",
  };
  return map[value] || value;
}

function formatMetaLabel(label: string): string {
  const normalized = String(label || "").trim().toUpperCase();
  if (normalized === "ORGANISATIE") return "Organisatie";
  if (normalized === "SECTOR") return "Sector";
  if (normalized === "ANALYSE DATUM") return "Analyse datum";
  if (normalized === "BESLUIT") return "Besluit";
  if (normalized === "TITEL") return "Titel";
  if (normalized === "BESLUITVRAAG") return "Besluitvraag";
  if (normalized === "KERNINZICHT") return "Kerninzicht";
  if (normalized === "STRATEGISCHE SPANNING") return "Strategische spanning";
  if (normalized === "AANBEVOLEN RICHTING") return "Aanbevolen richting";
  if (normalized === "GROOTSTE RISICO BIJ UITSTEL") return "Grootste risico bij uitstel";
  return titleCaseHeading(normalized);
}

function deriveCoverSubtitle(meta: ReportMeta): string {
  const sector = meta.sector.toLowerCase();
  if (sector.includes("zorg") || sector.includes("ggz")) {
    return "Strategisch bestuursdossier voor directie, bestuur en toezicht in zorgorganisaties";
  }
  if (sector.includes("industrie")) {
    return "Strategisch bestuursdossier voor directie en toezicht op schaal, marge en uitvoeringskracht";
  }
  if (sector.includes("logistiek")) {
    return "Strategisch bestuursdossier voor directie en toezicht op ketenregie, capaciteit en besluitdiscipline";
  }
  if (sector.includes("zakelijke")) {
    return "Strategisch bestuursdossier voor directie, partners en toezicht op schaal, kwaliteit en governance";
  }
  return "Strategisch bestuursdossier voor directie, bestuur en toezicht";
}

function deriveAudienceLine(meta: ReportMeta): string {
  return `${meta.organizationName} • ${meta.sector} • uitsluitend voor intern bestuurlijk gebruik`;
}

function deriveCoverKicker(meta: ReportMeta): string {
  const sector = normalize(meta.sector).toLowerCase();
  if (sector.includes("zorg") || sector.includes("ggz")) {
    return "Cyntra strategic brain | bestuursdossier zorg";
  }
  if (sector.includes("onderwijs")) {
    return "Cyntra strategic brain | bestuursdossier onderwijs";
  }
  return "Cyntra strategic brain | bestuursdossier";
}

function deriveCoverDocumentLabel(meta: ReportMeta): string {
  const raw = normalize(meta.documentType || meta.analysisType || "Strategisch rapport");
  if (/boardroom executive dossier/i.test(raw)) return "Board decision dossier";
  if (/strategische analyse/i.test(raw)) return "Strategisch bestuursdossier";
  return raw;
}

function resolveContactLines(meta: ReportMeta): string[] {
  if (meta.contactLines.length) return meta.contactLines;
  return ["Geen contactgegevens gevonden in de broninput"];
}

function wrapTextToCharacterLimit(text: string, maxChars = 80): string {
  const lines = String(text || "").split("\n");
  const wrapped: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) {
      wrapped.push("");
      continue;
    }
    let remaining = line;
    while (remaining.length > maxChars) {
      const slice = remaining.slice(0, maxChars + 1);
      const breakpoint = Math.max(slice.lastIndexOf(" "), slice.lastIndexOf("-"));
      const cut = breakpoint > 20 ? breakpoint : maxChars;
      wrapped.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    if (remaining) wrapped.push(remaining);
  }
  return wrapped.join("\n");
}

function toPdfMemoBody(
  value: string,
  options?: {
    bullets?: boolean;
    maxChars?: number;
    maxParagraphs?: number;
  }
): string {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  if (options?.bullets) {
    return splitParagraphs(normalizeBulletLines(cleaned))
      .slice(0, options?.maxParagraphs ?? 4)
      .map((part) => `• ${normalizeBoardroomBullet(part, options?.maxChars ?? 120)}`)
      .join("\n");
  }
  return compactBoardroomBody(cleaned, {
    maxParagraphs: options?.maxParagraphs ?? 2,
    maxCharsPerParagraph: options?.maxChars ?? 220,
  });
}

export function parseReportSections(text: string): ParsedSection[] {
  const source = cleanText(text);
  if (!source) return [];
  const headings = [
    "SITUATIE",
    "BESLUIT",
    "SPANNING",
    "BESLUITPAGINA",
    "STRATEGISCHE SPANNING",
    "EXECUTIVE DECISION CARD",
    "STRATEGISCH VERHAAL",
    "SCENARIOVERGELIJKING",
    "MECHANISME ANALYSE",
    "WAAROM DIT GEBEURT",
    "BESTUURLIJKE ACTIES",
    "STOPREGELS",
    "VERDIEPING",
    "BESTUURLIJKE BESLISKAART",
    "BESTUURLIJKE VERHAALLIJN",
    "BESTUURLIJKE KERNSAMENVATTING",
    "BESTUURLIJKE IMPLICATIES",
    "STRATEGISCH SPEELVELD",
    "BESLUITVRAAG",
    "KERNSTELLING VAN HET RAPPORT",
    "FEITENBASIS",
    "KEUZERICHTINGEN",
    "AANBEVOLEN KEUZE",
    "DOORBRAAKINZICHTEN",
    "STRATEGISCHE BREUKPUNTEN",
    "BESTUURLIJK ACTIEPLAN",
    "BESLUITGEVOLGEN",
    "SCENARIO'S",
    "MOGELIJKE ONTWIKKELINGEN",
    "TECHNISCHE ANALYSE",
    "BESTUURLIJKE STRESSTEST",
    "OPEN STRATEGISCHE VRAGEN",
    "SCENARIOANALYSE",
    "INTERVENTIE-ARCHITECTUUR",
    "FINANCIËLE CONSEQUENTIES",
    "DOMINANTE THESE",
    "DOMINANT MECHANISM",
    "BOARDROOM INSIGHT",
    "MISDIAGNOSIS INSIGHT",
    "STRATEGISCH CONFLICT",
    "BESTUURLIJKE KEUZE",
    "KEERZIJDE VAN DE KEUZE",
    "INTERVENTIES",
    "SCENARIO: GEEN INTERVENTIE",
    "WIJ BESLUITEN",
    "BOARDROOM QUESTION",
    "EXECUTIVE THESIS",
    "STRATEGIC CONFLICT",
    "INEVITABILITY",
    "BREAKPOINTS",
    "DECISION",
    "APPENDIX",
  ];
  const escaped = headings.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const pattern = new RegExp(`^(?:(\\d+)\\.\\s+(.+)|###\\s+(.+)|(${escaped}))\\s*$`, "gmi");
  const matches = Array.from(source.matchAll(pattern));
  if (!matches.length) return [{ title: "Rapport", body: source }];

  const sections = matches.map((match, idx) => {
    const start = (match.index || 0) + match[0].length;
    const end = matches[idx + 1]?.index ?? source.length;
    const rawTitle = String(match[2] || match[3] || match[4] || "").trim();
    return {
      title: canonicalizeSectionTitle(rawTitle),
      body: cleanText(source.slice(start, end).trim()),
    };
  });
  return sections
    .filter(
      (section, index, all) =>
        section.body &&
        all.findIndex((candidate) => candidate.title.toUpperCase() === section.title.toUpperCase()) === index
    )
    .sort((left, right) => {
      const leftIndex = SECTION_ORDER.indexOf(left.title.toUpperCase());
      const rightIndex = SECTION_ORDER.indexOf(right.title.toUpperCase());
      const safeLeft = leftIndex >= 0 ? leftIndex : SECTION_ORDER.length + 1;
      const safeRight = rightIndex >= 0 ? rightIndex : SECTION_ORDER.length + 1;
      return safeLeft - safeRight;
    });
}

function parseSummaryFields(text: string): Array<{ label: string; body: string }> {
  const source = cleanText(text);
  if (!source) return [];
  const plainLineFields = source
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(Organisatie|Sector|Analyse datum|Besluit|Titel|Besluitvraag|Kerninzicht|Strategische spanning|Aanbevolen richting|Grootste risico bij uitstel)\s*:\s*(.+)$/i);
      if (!match) return null;
      return {
        label: match[1].toUpperCase(),
        body: cleanText(match[2] || ""),
      };
    })
    .filter((item): item is { label: string; body: string } => Boolean(item?.body));
  if (plainLineFields.length) {
    const unlabeledLines = source
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && !/^(Organisatie|Sector|Analyse datum|Besluit)\s*:/i.test(line))
      .slice(0, 2)
      .map((line, index) => ({
        label: index === 0 ? "KERNREGEL" : `KERNREGEL ${index + 1}`,
        body: cleanText(line),
      }));
    return [...plainLineFields, ...unlabeledLines];
  }
  const labels = ["DOMINANT RISICO", "AANBEVOLEN BESLUIT", "KEERZIJDE VAN DE KEUZE", "STOPREGEL", "BESLUIT"];
  return labels
    .map((label) => {
      const pattern = new RegExp(`${label}\\s*\\n([\\s\\S]*?)(?=\\n(?:${labels.join("|")})\\b|$)`, "i");
      const match = source.match(pattern);
      return {
        label,
        body: cleanText(match?.[1] || ""),
      };
    })
    .filter((item) => item.body);
}

function parseLabeledBlockFields(text: string, labels: string[]): Array<{ label: string; body: string }> {
  const source = cleanText(text);
  if (!source) return [];
  return labels
    .map((label, index) => {
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nextLabels = labels
        .slice(index + 1)
        .map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const pattern = new RegExp(`${escapedLabel}\\s*\\n([\\s\\S]*?)(?=\\n(?:${nextLabels || "$^"})\\b|$)`, "i");
      const match = source.match(pattern);
      return {
        label,
        body: cleanText(match?.[1] || ""),
      };
    })
    .filter((item) => item.body);
}

function splitParagraphs(text: string): string[] {
  const source = cleanText(text)
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .flatMap((part) => part.split(/\n(?=(?:Scenario\s+[A-C]\b|INZICHT|WAAROM DIT BELANGRIJK IS|STRATEGISCHE IMPACT|GOVERNANCEVRAAG|BESLUITMOMENT|MECHANISME|BESTUURLIJKE CONSEQUENTIE|IMPLICATIE|ACTIE|EIGENAAR|DEADLINE|KPI|RISICO|NORM|BESTUURLIJKE IMPLICATIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b)/g))
    .map((part) => part.trim())
    .filter((part) => part && !/^Geen inhoud beschikbaar\.?$/i.test(part));

  const merged: string[] = [];
  for (const part of source) {
    if (
      merged.length &&
      /^(?:ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|MECHANISME|RISICO|BESTUURLIJKE IMPLICATIE|OPERATIONEEL GEVOLG|FINANCIEEL GEVOLG|ORGANISATORISCH GEVOLG)$/i.test(merged[merged.length - 1]) &&
      !/^(?:Scenario\s+[A-C]\b|INZICHT|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b/i.test(part)
    ) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} — ${part}`;
      continue;
    }
    merged.push(part);
  }
  return merged;
}

function sanitizeNarrative(sections: ParsedSection[]): ParsedSection[] {
  return sections
    .map((section) => ({
      title: canonicalizeSectionTitle(section.title),
      body: dedupeRepeatedContent(cleanText(section.body || "")),
    }))
    .filter((section, index, all) => {
      if (!section.body) return false;
      return all.findIndex((candidate) => candidate.title === section.title) === index;
    });
}

function normalizeBulletLines(text: string): string {
  return cleanText(text)
    .replace(/(?:^|\n)\s*[-—*]\s+/g, "\n• ")
    .replace(/(?:^|\n)\s*•\s*/g, "\n• ");
}

function parseActionRows(text: string): ActionRow[] {
  const source = String(text || "").trim();
  const exactBlocks = Array.from(
    source.matchAll(/(?:^|\n)(Actie\s+\d+)\s*\n([\s\S]*?)(?=\nActie\s+\d+\s*\n|$)/gi)
  ).map((match) => `${match[1]}\n${match[2]}`.trim());
  const blocks = (exactBlocks.length ? exactBlocks : [source])
    .map((block) => block.trim())
    .filter((block) => /(?:ACTIE\s+—|ACTIE\s*\n)/i.test(block));
  return blocks.map((block, index) => ({
    action: normalize(
      block.match(/ACTIE\s+—\s*(.+?)(?=\n(?:MECHANISME|WAAROM|Bestuurlijk besluit|BESTUURLIJK BESLUIT|Eigenaar|VERANTWOORDELIJKE|Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
        || block.match(/ACTIE\s*\n(.+?)(?=\n(?:MECHANISME|WAAROM|Bestuurlijk besluit|BESTUURLIJK BESLUIT|Eigenaar|VERANTWOORDELIJKE|Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
        || `Actie ${index + 1}`
    ),
    mechanism: normalize(
      block.match(/MECHANISME\s*(?::|—)\s*(.+?)(?=\n(?:WAAROM|Bestuurlijk besluit|BESTUURLIJK BESLUIT|Eigenaar|VERANTWOORDELIJKE|Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
      || block.match(/WAAROM\s*\n(.+?)(?=\n(?:Bestuurlijk besluit|BESTUURLIJK BESLUIT|Eigenaar|VERANTWOORDELIJKE|Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
      || block.match(/WAAROM\s*(?::|—)\s*(.+?)(?=\n(?:Bestuurlijk besluit|BESTUURLIJK BESLUIT|Eigenaar|VERANTWOORDELIJKE|Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
      || ""
    ),
    boardDecision: normalize(
      block.match(/(?:Bestuurlijk besluit|BESTUURLIJK BESLUIT)\s*(?::|—)\s*(.+?)(?=\n(?:Eigenaar|VERANTWOORDELIJKE|Deadline|KPI)\b|$)/i)?.[1] || ""
    ),
    owner: normalize(
      block.match(/VERANTWOORDELIJKE\s*—\s*(.+?)(?:\s*•\s*.+)?(?=\nKPI\b|$)/i)?.[1]
      || block.match(/(?:Eigenaar|VERANTWOORDELIJKE)\s*(?::|—)\s*(.+?)(?=\n(?:Deadline|KPI)\b|$)/i)?.[1]
      || block.match(/EIGENAAR\s*\n(.+?)(?=\n(?:Deadline|DEADLINE|KPI)\b|$)/i)?.[1]
      || "Bestuur"
    ),
    deadline: normalize(
      block.match(/Deadline\s*(?::|—)\s*(.+?)(?=\nKPI\b|$)/i)?.[1]
      || block.match(/DEADLINE\s*\n(.+?)(?=\nKPI\b|$)/i)?.[1]
      || block.match(/VERANTWOORDELIJKE\s*—\s*.+?•\s*(.+?)(?=\nKPI\b|$)/i)?.[1]
      || "90 dagen"
    ),
    kpi: normalize(
      block.match(/KPI\s*(?::|—)\s*(.+?)$/i)?.[1]
      || block.match(/KPI\s*\n([\s\S]+)$/i)?.[1]
      || ""
    ),
  })).filter((row) => row.action);
}

function validateReportDesign(sections: ParsedSection[]): DesignCheck[] {
  const titleHierarchy = sections.every((section) => section.title === canonicalizeSectionTitle(section.title));
  const paragraphLength = sections.every((section) =>
    splitParagraphs(section.body).every((paragraph) => paragraph.length <= 680)
  );
  const spacing = sections.every((section) => !/\n{4,}/.test(section.body));
  const encoding = sections.every((section) => !/Ø=Ý|Ø=ß|&ª|�|Sttihii/.test(section.body));
  return [
    { code: "check_title_hierarchy", passed: titleHierarchy },
    { code: "check_paragraph_length", passed: paragraphLength },
    { code: "check_section_spacing", passed: spacing },
    { code: "check_encoding_clean", passed: encoding },
  ];
}

function estimateParagraphHeight(text: string, width: number, lineHeight: number, splitTextToSize: (text: string, width: number) => string[]): number {
  const lines = splitTextToSize(text, width);
  return lines.length * lineHeight + 10;
}

function buildPdfSections(document: BoardroomDocument): PdfRenderSection[] {
  const memo = rewriteReport(formatBoardroomMemo(document));
  return [
    {
      title: "EXECUTIVE THESIS",
      body: ensureContentIntegrity(
        [
          ...memo.executiveSummary,
          `Kernprobleem — ${memo.coreProblem}`,
          `Besluit — ${memo.decision}`,
        ].join("\n"),
        "pdf.executiveThesis"
      ),
      label: "Executive Summary",
    },
    {
      title: "STRATEGIC CONFLICT",
      body: ensureContentIntegrity(memo.coreProblem, "pdf.tradeOff"),
      label: "Strategisch conflict",
    },
    {
      title: "MECHANISME ANALYSE",
      body: ensureContentIntegrity(
        [
          ...memo.why.map((item) => `• ${item}`),
          ...memo.riskOfInaction.map((item) => `• ${item}`),
          ...memo.mechanism.map((item) => `• ${item}`),
        ].join("\n"),
        "pdf.mechanismAnalysis"
      ),
      label: "Onderbouwing",
    },
    {
      title: "BREAKPOINTS",
      body: ensureContentIntegrity(memo.stopRules.map((item) => `• ${item}`).join("\n"), "pdf.breakpoints"),
      label: "Breekpunten",
    },
    {
      title: "DECISION",
      body: ensureContentIntegrity(
        [memo.decision, `Bestuurlijke vraag — ${memo.boardQuestion}`].join("\n"),
        "pdf.decision"
      ),
      label: "Besluit",
    },
    {
      title: "SCENARIOVERGELIJKING",
      body: ensureContentIntegrity(
        memo.scenarios.map((scenario) => `${scenario.code} — ${scenario.title}\n${scenario.explanation}`).join("\n\n"),
        "pdf.scenarios"
      ),
      label: "Scenario's",
    },
    {
      title: "BESTUURLIJKE ACTIES",
      body: ensureContentIntegrity(
        memo.actions.map((item, index) => `Actie ${index + 1}\nACTIE — ${item}`).join("\n\n"),
        "pdf.actions"
      ),
      label: "Acties",
    },
  ].filter((section) => normalize(section.body));
}

function capSectionParagraphs(body: string, maxParagraphs = 12): string[] {
  return splitParagraphs(normalizeBulletLines(body)).slice(0, maxParagraphs);
}

function splitLabeledStatement(part: string): { label: string; body: string } | null {
  const match = String(part || "")
    .trim()
    .match(/^((?:KERNINZICHT|ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|INZICHT|WAAROM DIT BELANGRIJK IS|STRATEGISCHE IMPACT|GOVERNANCEVRAAG|BESLUITMOMENT|MECHANISME|WAAROM|EIGENAAR|DEADLINE|KPI|BESLUITVRAAG|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGELS?|OPERATIONEEL GEVOLG|FINANCIEEL GEVOLG|ORGANISATORISCH GEVOLG))\s*[—:-]\s*([\s\S]+)$/i);
  if (!match) return null;
  return {
    label: match[1].toUpperCase(),
    body: cleanText(match[2] || ""),
  };
}

export function metaFromSession(session: AnalysisSession): ReportMeta {
  return {
    organizationName: resolveDisplayOrganizationName(
      session.organization_name,
      session.strategic_report?.title
    ),
    sector: normalize(session.strategic_metadata?.sector) || "Onbekende sector",
    analysisType: normalize(session.analysis_type) || "Strategische analyse",
    documentType: "Boardroom Executive Dossier",
    generatedAt: new Date(session.updated_at || session.analyse_datum || Date.now()).toLocaleString("nl-NL"),
    contactLines: parseContactLines(session.input_data),
  };
}

export function metaFromReport(report: StrategicReport, options?: {
  organizationName?: string;
  sector?: string;
  analysisType?: string;
  documentType?: string;
  generatedAt?: string;
  rawInput?: string;
}): ReportMeta {
  return {
    organizationName: resolveDisplayOrganizationName(
      String(options?.organizationName || report.organization_id || ""),
      report.title
    ),
    sector: normalize(options?.sector) || "Onbekende sector",
    analysisType: normalize(options?.analysisType) || "Strategische analyse",
    documentType: normalize(options?.documentType) || "Boardroom Executive Dossier",
    generatedAt: formatNlDateTime(options?.generatedAt || report.generated_at),
    contactLines: parseContactLines(options?.rawInput),
  };
}

async function createDoc() {
  const jspdf = await import("jspdf");
  return new jspdf.jsPDF({ unit: "pt", format: "a4" });
}

export async function buildStyledReportPdfBlob(params: {
  title: string;
  subtitle?: string;
  reportBody: string;
  meta: ReportMeta;
  sourceStrategicReport?: CanonicalStrategicReport;
  sourceBoardroomDocument?: BoardroomDocument;
}): Promise<Blob | string> {
  assertCanonicalStrategicReport(params.sourceStrategicReport);
  assertCanonicalBoardroomDocument(params.sourceBoardroomDocument);
  if (typeof window === "undefined") {
    return cleanText(params.reportBody);
  }

  const doc = await createDoc();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = CyntraDesignTokens.spacing.pageMargin;
  const contentWidth = Math.min(450, pageWidth - margin * 2);
  const sourceDocument = params.sourceBoardroomDocument
    ? params.sourceBoardroomDocument
    : params.sourceStrategicReport
      ? compileBoardroomDocument(params.sourceStrategicReport)
      : undefined;
  assertCanonicalBoardroomDocument(sourceDocument);
  if (!sourceDocument) {
    throw new Error("BoardroomDocument is verplicht voor canonieke PDF-rendering.");
  }
  const narrativeSections = buildPdfSections(sourceDocument).map((section) => ({
    title: section.title,
    body: section.body,
  }));
  const validationSections = narrativeSections.map((section) => ({
    title: canonicalizeSectionTitle(section.title),
    body: section.body,
  }));
  const designChecks = validateReportDesign(validationSections);

  const theme = {
    bg: [255, 255, 255] as const,
    ink: hexToRgb(CyntraDesignTokens.colors.ink),
    muted: [107, 114, 128] as const,
    navy: [17, 17, 17] as const,
    panel: [255, 255, 255] as const,
    gold: hexToRgb(CyntraDesignTokens.colors.gold),
    line: [229, 231, 235] as const,
    alert: [107, 114, 128] as const,
  };
  const documentTypeLabel = normalize(params.meta.documentType || params.meta.analysisType || "Strategisch rapport");
  const coverKicker = deriveCoverKicker(params.meta).toUpperCase();

  const addPage = () => {
    doc.addPage();
    pageNo += 1;
    applyPageChrome(pageNo);
    return 140;
  };

  const applyPageChrome = (pageNo: number) => {
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setDrawColor(...theme.line);
    doc.setLineWidth(0.7);
    doc.line(margin, 52, pageWidth - margin, 52);

    doc.setTextColor(...theme.muted);
    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(7.5);
    doc.text(documentTypeLabel.toUpperCase(), margin, 28);

    doc.setTextColor(...theme.ink);
    doc.setFontSize(10.5);
    doc.text(normalize(params.meta.organizationName), margin, 44);
    doc.text(`Pagina ${pageNo}`, pageWidth - margin, 28, { align: "right" });

    doc.setTextColor(...theme.muted);
    doc.setFontSize(8);
    doc.text(deriveAudienceLine(params.meta), margin, pageHeight - 24);
  };

  const writeWrapped = (text: string, x: number, y: number, options?: { size?: number; color?: readonly [number, number, number]; lineHeight?: number; font?: "normal" | "bold"; }) => {
    const size = options?.size ?? 11;
    const color = options?.color ?? theme.ink;
    const lineHeight = options?.lineHeight ?? Math.round(size * 1.45);
    doc.setTextColor(...color);
    doc.setFont(reportDesignSystem.typography.pdfFont, options?.font || "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(wrapTextToCharacterLimit(text, 66), contentWidth);
    for (const line of lines) {
      doc.text(String(line), x, y);
      y += lineHeight;
    }
    return y;
  };

  const writeSectionHeading = (title: string, y: number) => {
    doc.setTextColor(...theme.ink);
    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(20);
    doc.text(titleCaseHeading(title), margin, y + 2);
    doc.setDrawColor(...theme.line);
    doc.setLineWidth(0.7);
    doc.line(margin, y + 16, pageWidth - margin, y + 16);
    return y + 40;
  };

  const writeLabel = (label: string, y: number, x = margin) => {
    doc.setTextColor(...theme.muted);
    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(8.5);
    doc.text(label, x, y);
    return y + 12;
  };

  const drawActionCards = (rows: ActionRow[], startY: number) => {
    let y = startY;
    for (const row of rows) {
      const summaryParts = [
        row.mechanism ? `WAAROM — ${row.mechanism}` : "",
        row.owner ? `EIGENAAR — ${row.owner}` : "",
        row.deadline ? `DEADLINE — ${row.deadline}` : "",
        row.kpi ? `KPI — ${row.kpi}` : "",
      ].filter(Boolean);
      const summaryText = summaryParts.join("\n");
      const rowHeight =
        38 + estimateParagraphHeight(summaryText, contentWidth - 36, 14, doc.splitTextToSize.bind(doc));
      if (y + rowHeight > pageHeight - 52) {
        y = addPage();
        y = writeSectionHeading("BESTUURLIJKE ACTIES", y - 18);
      }
      doc.setDrawColor(...theme.line);
      doc.setLineWidth(0.9);
      doc.line(margin, y - 2, margin, y + rowHeight - 16);

      doc.setTextColor(...theme.ink);
      doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
      doc.setFontSize(16);
      doc.text(doc.splitTextToSize(row.action, contentWidth - 24), margin + 16, y + 8);

      let cardY = y + 30;
      for (const part of splitParagraphs(summaryText)) {
        const labeled = splitLabeledStatement(part);
        if (labeled) {
          cardY = writeLabel(labeled.label, cardY, margin + 16);
          cardY = writeWrapped(labeled.body, margin + 20, cardY + 2, {
            size: 10.3,
            color: theme.ink,
            lineHeight: 16,
          });
          cardY += 10;
          continue;
        }
        cardY = writeWrapped(part, margin + 16, cardY, {
          size: 10.3,
          color: theme.ink,
          lineHeight: 16,
        });
        cardY += 10;
      }
      y += rowHeight + 20;
    }
    return y;
  };
  let pageNo = 0;
  const sectionByTitle = (title: string): ParsedSection | null =>
    narrativeSections.find((section) => section.title.toUpperCase() === title) || null;

  const renderExclusiveCover = () => {
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setDrawColor(...theme.line);
    doc.setLineWidth(0.8);
    doc.line(margin, 92, pageWidth - margin, 92);

    doc.setTextColor(...theme.muted);
    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(8);
    doc.text(coverKicker, margin, 72);

    doc.setTextColor(...theme.ink);
    doc.setFontSize(13);
    doc.text(normalize(params.meta.organizationName), margin, 124);

    const titleLines = doc.splitTextToSize("CYNTRA STRATEGIC BRAIN", contentWidth);
    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(22);
    let y = 190;
    for (const line of titleLines) {
      doc.text(String(line), margin, y);
      y += 28;
    }

    doc.setFontSize(16);
    doc.text(normalize(params.title).toUpperCase(), margin, y + 8);
    y += 42;

    doc.setFont(reportDesignSystem.typography.pdfFont, "normal");
    doc.setFontSize(10.5);
    const coverParagraphs = [
      normalize(params.subtitle),
      `Datum: ${formatNlDateTime(params.meta.generatedAt)}`,
    ].filter(Boolean);
    for (const paragraph of coverParagraphs) {
      const lines = doc.splitTextToSize(paragraph, Math.min(320, contentWidth));
      for (const line of lines) {
        doc.text(String(line), margin, y);
        y += 16;
      }
      y += 10;
    }
  };

  const renderSection = (title: string, startY: number) => {
    const section = sectionByTitle(title);
    if (!section?.body) return startY;
    const bodyParts = capSectionParagraphs(section.body || "", 12);
    if (!bodyParts.length) return startY;
    const normalizedTitle = section.title.toUpperCase();
    const isEmphasized = /DECISION/i.test(section.title);
    const estimatedHeight = 28 + bodyParts.reduce(
      (sum, part) => sum + estimateParagraphHeight(part, contentWidth, isEmphasized ? 17 : 15, doc.splitTextToSize.bind(doc)),
      0
    );

    let y = startY;
    if (y + estimatedHeight > pageHeight - 72) y = addPage();

    let bodyY = writeSectionHeading(normalizedTitle, y);
    if (normalizedTitle === "BESTUURLIJKE ACTIES") {
      bodyY = drawActionCards(parseActionRows(section.body), bodyY + 8);
      return bodyY + 36;
    }

    for (let index = 0; index < bodyParts.length; index += 1) {
      const part = bodyParts[index];
      const emphasis = /DECISION/i.test(section.title);
      const labeledStatement = splitLabeledStatement(part);
      const labelLike = /^(INZICHT|WAAROM DIT BELANGRIJK IS|STRATEGISCHE IMPACT|GOVERNANCEVRAAG|BESLUITMOMENT|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b/.test(part);

      if (bodyY > pageHeight - 82) {
        bodyY = addPage();
        bodyY = writeSectionHeading(normalizedTitle, bodyY - 18);
      }
      if (labeledStatement) {
        bodyY = writeLabel(labeledStatement.label, bodyY);
        bodyY = writeWrapped(labeledStatement.body, margin, bodyY + 1, {
          size: 10.2,
          color: theme.ink,
          lineHeight: 16,
          font: emphasis ? "bold" : "normal",
        });
        bodyY += 16;
        continue;
      }
      if (
        labelLike &&
        bodyParts[index + 1] &&
        !splitLabeledStatement(bodyParts[index + 1]) &&
        !/^(INZICHT|WAAROM DIT BELANGRIJK IS|STRATEGISCHE IMPACT|GOVERNANCEVRAAG|BESLUITMOMENT|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b/.test(bodyParts[index + 1])
      ) {
        bodyY = writeLabel(part, bodyY);
        bodyY = writeWrapped(bodyParts[index + 1], margin, bodyY + 1, {
          size: 10.2,
          color: theme.ink,
          lineHeight: 16,
          font: emphasis ? "bold" : "normal",
        });
        bodyY += 16;
        index += 1;
        continue;
      }
      bodyY = writeWrapped(part, margin, bodyY, {
        size: isEmphasized ? 14 : 10.2,
        color: theme.ink,
        lineHeight: isEmphasized ? 20 : 16,
        font: emphasis ? "bold" : "normal",
      });
      bodyY += 20;
    }

    return bodyY + 32;
  };

  pageNo = 1;
  renderExclusiveCover();
  const orderedTitles = [
    "EXECUTIVE THESIS",
    "STRATEGIC CONFLICT",
    "MECHANISME ANALYSE",
    "BREAKPOINTS",
    "DECISION",
    "SCENARIOVERGELIJKING",
    "BESTUURLIJKE ACTIES",
  ] as const;

  let y: number | null = null;
  for (const title of orderedTitles) {
    if (!sectionByTitle(title)?.body) continue;
    if (y == null) y = addPage();
    y = renderSection(title, y);
  }

  const violations = designChecks.filter((check) => !check.passed);
  if (violations.length) {
    console.warn("report_design_fail:", violations.map((check) => check.code).join(", "));
  }

  return doc.output("blob");
}

export async function buildStyledReportPdfDataUri(params: {
  title: string;
  subtitle?: string;
  reportBody: string;
  meta: ReportMeta;
  sourceStrategicReport?: CanonicalStrategicReport;
  sourceBoardroomDocument?: BoardroomDocument;
}): Promise<string> {
  const pdfOutput = await buildStyledReportPdfBlob(params);
  if (typeof pdfOutput === "string") return pdfOutput;
  await assertRenderablePdfBlob(pdfOutput);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) resolve(result);
      else reject(new Error("PDF data-URI genereren mislukt."));
    };
    reader.onerror = () => reject(reader.error || new Error("PDF data-URI genereren mislukt."));
    reader.readAsDataURL(pdfOutput);
  });
}

async function assertRenderablePdfBlob(blob: Blob): Promise<void> {
  if (!(blob instanceof Blob)) {
    throw new Error("PDF-rendering gaf geen geldig Blob-object terug.");
  }
  if (blob.size < 512) {
    throw new Error("PDF-rendering leverde een te klein document op.");
  }
  const header = await blob.slice(0, 4).text();
  if (!header.startsWith("%PDF")) {
    throw new Error("PDF-rendering leverde geen geldig PDF-document op.");
  }
}

export async function downloadStyledReportPdf(params: {
  filename: string;
  title: string;
  subtitle?: string;
  reportBody: string;
  meta: ReportMeta;
  previewWindow?: Window | null;
  skipDownload?: boolean;
  sourceStrategicReport?: CanonicalStrategicReport;
  sourceBoardroomDocument?: BoardroomDocument;
}): Promise<void> {
  const pdfOutput = await buildStyledReportPdfBlob(params);
  const pdfBlob = pdfOutput instanceof Blob ? pdfOutput : new Blob([pdfOutput], { type: "application/pdf" });
  await assertRenderablePdfBlob(pdfBlob);
  const pdfUrl = URL.createObjectURL(pdfBlob);

  if (params.previewWindow && !params.previewWindow.closed) {
    try {
      params.previewWindow.document.open();
      params.previewWindow.document.write(`<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <title>${params.filename}</title>
    <style>
      html, body { margin: 0; height: 100%; background: #0f1724; }
      iframe { border: 0; width: 100%; height: 100%; background: white; }
    </style>
  </head>
  <body>
    <iframe src="${pdfUrl}" title="${params.filename}"></iframe>
  </body>
</html>`);
      params.previewWindow.document.close();
      params.previewWindow.addEventListener(
        "beforeunload",
        () => URL.revokeObjectURL(pdfUrl),
        { once: true }
      );
    } catch {
      params.previewWindow.close();
      URL.revokeObjectURL(pdfUrl);
      throw new Error("PDF preview openen mislukt.");
    }
  }

  if (!params.skipDownload) {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = params.filename;
    link.rel = "noopener";
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  setTimeout(() => URL.revokeObjectURL(pdfUrl), params.previewWindow ? 60000 : 5000);
}
