import type { StrategicReport, AnalysisSession } from "@/platform/types";
import { CyntraDesignTokens } from "@/design/cyntraDesignTokens";
import { reportDesignSystem } from "@/design/reportDesignSystem";
import { parseContactLines as parseRawContactLines } from "@/services/reportText";

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

const BOARDROOM_CORE_TITLES = new Set([
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
]);

const SECTION_ORDER = [
  "BESLUIT",
  "SPANNING",
  "WAAROM DIT GEBEURT",
  "SCENARIO'S",
  "DOORBRAAKINZICHTEN",
  "BESTUURLIJKE ACTIES",
  "STOPREGELS",
  "BESLUITPAGINA",
  "STRATEGISCHE SPANNING",
  "BESTUURLIJKE VERHAALLIJN",
  "MECHANISME ANALYSE",
  "WAAROM DIT GEBEURT",
  "SCENARIO'S",
  "DOORBRAAKINZICHTEN",
  "BESTUURLIJKE ACTIES",
  "STOPREGELS",
  "EXECUTIVE DECISION CARD",
  "STRATEGISCH VERHAAL",
  "SCENARIOVERGELIJKING",
  "MECHANISME ANALYSE",
  "BESTUURLIJKE ACTIES",
  "VERDIEPING",
  "BESTUURLIJKE BESLISKAART",
  "HGBCO VERHAALLIJN",
  "BESTUURLIJKE VERHAALLIJN",
  "BESTUURLIJKE KERNSAMENVATTING",
  "HOE CYNTRA KAN HELPEN",
  "STRATEGISCH SPEELVELD",
  "BESLUITVRAAG",
  "KERNSTELLING VAN HET RAPPORT",
  "FEITENBASIS",
  "KEUZERICHTINGEN",
  "AANBEVOLEN KEUZE",
  "KILLER INSIGHTS",
  "DOORBRAAKINZICHTEN",
  "STRATEGISCHE BREUKPUNTEN",
  "BESTUURLIJK ACTIEPLAN",
  "SCENARIO'S",
  "MOGELIJKE ONTWIKKELINGEN",
  "BESTUURLIJKE STRESSTEST",
  "BESLUITGEVOLGEN",
  "OPEN STRATEGISCHE VRAGEN",
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
  return String(value || "")
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
  if (title === "MECHANISME ANALYSE") {
    return "WAAROM DIT GEBEURT";
  }
  if (title === "BESTUURLIJK ACTIEPLAN") {
    return "BESTUURLIJKE ACTIES";
  }
  return title;
}

function titleCaseHeading(value: string): string {
  const map: Record<string, string> = {
    "BESLUIT": "Besluit",
    "SPANNING": "Spanning",
    "BESLUITPAGINA": "Besluitpagina",
    "STRATEGISCHE SPANNING": "De echte strategische spanning",
    "EXECUTIVE DECISION CARD": "Executive Decision Card",
    "STRATEGISCH VERHAAL": "Strategisch Verhaal",
    "SCENARIOVERGELIJKING": "Scenariovergelijking",
    "MECHANISME ANALYSE": "Waarom dit gebeurt",
    "WAAROM DIT GEBEURT": "Waarom dit gebeurt",
    "SCENARIO'S": "Scenario's",
    "STOPREGELS": "Stopregels",
    "BESTUURLIJKE ACTIES": "Bestuurlijke Acties",
    "VERDIEPING": "Verdieping",
    "BESTUURLIJKE BESLISKAART": "Bestuurlijke Besliskaart",
    "HGBCO VERHAALLIJN": "Bestuurlijke verhaallijn",
    "BESTUURLIJKE VERHAALLIJN": "Bestuurlijke verhaallijn",
    "BESTUURLIJKE KERNSAMENVATTING": "Kernsamenvatting voor bestuur",
    "HOE CYNTRA KAN HELPEN": "Waar Cyntra van betekenis kan zijn",
    "STRATEGISCH SPEELVELD": "Strategisch speelveld",
    "BESLUITVRAAG": "Besluitvraag",
    "KERNSTELLING VAN HET RAPPORT": "Kernstelling van het rapport",
    "EXECUTIVE THESIS": "Kernstelling",
    "FEITENBASIS": "Feitenbasis",
    "KEUZERICHTINGEN": "Keuzerichtingen",
    "AANBEVOLEN KEUZE": "Voorgestelde keuze",
    "KILLER INSIGHTS": "Doorbraakinzichten",
    "DOORBRAAKINZICHTEN": "Doorbraakinzichten",
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

export function parseReportSections(text: string): ParsedSection[] {
  const source = cleanText(text);
  if (!source) return [];
  const headings = [
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
      const match = line.match(/^(Organisatie|Sector|Analyse datum|Besluit)\s*:\s*(.+)$/i);
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
    .flatMap((part) => part.split(/\n(?=(?:Scenario\s+[A-C]\b|INZICHT|MECHANISME|BESTUURLIJKE CONSEQUENTIE|IMPLICATIE|ACTIE|EIGENAAR|DEADLINE|KPI|RISICO|NORM|BESTUURLIJKE IMPLICATIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b)/g))
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

function splitLabeledStatement(part: string): { label: string; body: string } | null {
  const match = String(part || "")
    .trim()
    .match(/^((?:KERNINZICHT|ONDERLIGGENDE OORZAAK|BESTUURLIJK GEVOLG|INZICHT|MECHANISME|WAAROM|EIGENAAR|DEADLINE|KPI|BESLUITVRAAG|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGELS?|OPERATIONEEL GEVOLG|FINANCIEEL GEVOLG|ORGANISATORISCH GEVOLG))\s*[—:-]\s*([\s\S]+)$/i);
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
}): Promise<Blob | string> {
  if (typeof window === "undefined") {
    return cleanText(params.reportBody);
  }

  const doc = await createDoc();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = CyntraDesignTokens.spacing.pageMargin;
  const contentWidth = Math.min(680, pageWidth - margin * 2);
  const sections = parseReportSections(params.reportBody);
  const designChecks = validateReportDesign(sections);

  const theme = {
    bg: [248, 247, 244] as const,
    ink: hexToRgb(CyntraDesignTokens.colors.blue),
    muted: hexToRgb(CyntraDesignTokens.colors.executiveGrey),
    navy: [20, 31, 48] as const,
    panel: [251, 250, 247] as const,
    gold: hexToRgb(CyntraDesignTokens.colors.gold),
    line: [229, 231, 235] as const,
    alert: [125, 89, 34] as const,
  };
  const documentTypeLabel = normalize(params.meta.documentType || params.meta.analysisType || "Strategisch rapport");
  const coverKicker = deriveCoverKicker(params.meta).toUpperCase();
  const coverDocumentLabel = deriveCoverDocumentLabel(params.meta);

  const addPage = () => {
    doc.addPage();
    pageNo += 1;
    applyPageChrome(pageNo);
    return 140;
  };

  const applyPageChrome = (pageNo: number) => {
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...theme.navy);
    doc.rect(0, 0, pageWidth, 64, "F");
    doc.setDrawColor(...theme.gold);
    doc.setLineWidth(1);
    doc.line(margin, 72, pageWidth - margin, 72);

    doc.setTextColor(...theme.gold);
    doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
    doc.setFontSize(8.5);
    doc.text(documentTypeLabel.toUpperCase(), margin, 28);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(normalize(params.meta.organizationName), margin, 48);
    doc.text(`Pagina ${pageNo}`, pageWidth - margin, 28, { align: "right" });

    doc.setTextColor(...theme.muted);
    doc.setFontSize(9);
    doc.text(deriveAudienceLine(params.meta), margin, pageHeight - 20);
  };

  const writeWrapped = (text: string, x: number, y: number, options?: { size?: number; color?: readonly [number, number, number]; lineHeight?: number; font?: "normal" | "bold"; }) => {
    const size = options?.size ?? 11;
    const color = options?.color ?? theme.ink;
    const lineHeight = options?.lineHeight ?? Math.round(size * 1.45);
    doc.setTextColor(...color);
    doc.setFont(reportDesignSystem.typography.pdfFont, options?.font || "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(wrapTextToCharacterLimit(text, 80), contentWidth);
    for (const line of lines) {
      doc.text(String(line), x, y);
      y += lineHeight;
    }
    return y;
  };

  const writeSectionHeading = (title: string, y: number) => {
    doc.setTextColor(...theme.ink);
    doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
    doc.setFontSize(14);
    doc.text(titleCaseHeading(title), margin, y + 2);
    doc.setDrawColor(...theme.line);
    doc.setLineWidth(1);
    doc.line(margin, y + 12, pageWidth - margin, y + 12);
    return y + 24;
  };

  const writeLabel = (label: string, y: number, x = margin) => {
    doc.setTextColor(...theme.muted);
    doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
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
        44 + estimateParagraphHeight(summaryText, contentWidth - 36, 15, doc.splitTextToSize.bind(doc));
      if (y + rowHeight > pageHeight - 52) {
        y = addPage();
        y = writeSectionHeading("BESTUURLIJKE ACTIES", y - 18);
      }
      doc.setFillColor(...theme.panel);
      doc.setDrawColor(...theme.line);
      doc.setLineWidth(0.6);
      doc.roundedRect(margin - 8, y - 12, contentWidth + 16, rowHeight, 10, 10, "FD");

      doc.setTextColor(...theme.ink);
      doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
      doc.setFontSize(11.5);
      doc.text(doc.splitTextToSize(row.action, contentWidth - 24), margin + 10, y + 8);

      let cardY = y + 30;
      for (const part of splitParagraphs(summaryText)) {
        const labeled = splitLabeledStatement(part);
        if (labeled) {
          cardY = writeLabel(labeled.label, cardY, margin + 10);
          cardY = writeWrapped(labeled.body, margin + 14, cardY + 2, {
            size: 10.6,
            color: theme.ink,
            lineHeight: 15,
          });
          cardY += 8;
          continue;
        }
        cardY = writeWrapped(part, margin + 10, cardY, {
          size: 10.6,
          color: theme.ink,
          lineHeight: 15,
        });
        cardY += 8;
      }
      y += rowHeight + 12;
    }
    return y;
  };

  const drawDecisionCardSection = (section: ParsedSection, startY: number) => {
    const labels = [
      "Organisatie",
      "Sector",
      "Analyse datum",
      "BESTUURLIJK BESLUIT",
      "WAAROM DIT BESLUIT",
      "BESLUITVRAAG",
      "KERNPROBLEEM",
      "KERNSTELLING",
      "AANBEVOLEN KEUZE",
      "WAAROM DEZE KEUZE",
      "GROOTSTE RISICO BIJ UITSTEL",
      "STOPREGELS",
      "STOPREGEL",
    ];
    const fields = parseLabeledBlockFields(section.body, labels);
    if (!fields.length) return startY;
    let y = writeSectionHeading(section.title.toUpperCase(), startY);
    let estimatedHeight = 36;
    for (const field of fields) {
      estimatedHeight += 18 + estimateParagraphHeight(field.body, contentWidth - 20, 17, doc.splitTextToSize.bind(doc));
    }
    if (y - 14 + estimatedHeight > pageHeight - 48) {
      y = addPage();
      y = writeSectionHeading(section.title.toUpperCase(), y - 18);
    }
    doc.setFillColor(...theme.panel);
    doc.setDrawColor(...theme.line);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin - 8, y - 14, contentWidth + 16, estimatedHeight, 12, 12, "FD");
    for (const field of fields) {
      const normalizedLabel = field.label.toUpperCase();
      doc.setTextColor(...theme.muted);
      doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
      doc.setFontSize(10);
      doc.text(normalizedLabel, margin + 10, y);
      y += 14;
      y = writeWrapped(field.body, margin + 10, y, {
        size: /KERNSTELLING|AANBEVOLEN KEUZE/.test(normalizedLabel) ? 12.5 : 11.5,
        color: theme.ink,
        lineHeight: /KERNSTELLING|AANBEVOLEN KEUZE/.test(normalizedLabel) ? 18 : 17,
        font: /KERNSTELLING|AANBEVOLEN KEUZE/.test(normalizedLabel) ? "bold" : "normal",
      });
      y += 10;
    }
    return y + 18;
  };

  const drawCover = () => {
    doc.setFillColor(...theme.bg);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setFillColor(...theme.navy);
    doc.rect(0, 0, pageWidth, 84, "F");
    doc.setTextColor(...theme.gold);
    doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
    doc.setFontSize(8.5);
    doc.text("EXECUTIVE MEMO", margin, 34);
    doc.text(coverKicker, margin, 50);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(normalize(params.meta.organizationName), margin, 74);

    let y = 124;
    y = writeLabel("MEMO", y);
    y = writeWrapped(normalize(params.title || coverDocumentLabel), margin, y + 4, {
      size: 24,
      color: theme.ink,
      lineHeight: 28,
      font: "bold",
    });
    y += 18;

    y = writeLabel("KERNBOODSCHAP", y);
    y = writeWrapped(normalize(params.subtitle || deriveCoverSubtitle(params.meta)), margin, y + 4, {
      size: 12,
      color: theme.ink,
      lineHeight: 18,
    });
    y += 18;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...theme.line);
    doc.roundedRect(margin - 8, y - 10, contentWidth + 16, 118, 10, 10, "FD");
    let cardY = y + 10;
    const memoLines = [
      `ORGANISATIE — ${normalize(params.meta.organizationName)}`,
      `SECTOR — ${normalize(params.meta.sector)}`,
      `DOSSIER — ${coverDocumentLabel}`,
      `OPGESTELD OP — ${formatNlDateTime(params.meta.generatedAt)}`,
    ];
    for (const line of memoLines) {
      cardY = writeWrapped(line, margin + 10, cardY, {
        size: 11,
        color: theme.ink,
        lineHeight: 16,
        font: "bold",
      });
      cardY += 6;
    }

    y += 140;
    y = writeLabel("CONTACTPUNT", y);
    y = writeWrapped(resolveContactLines(params.meta).join(" • "), margin, y + 2, {
      size: 10.5,
      color: theme.muted,
      lineHeight: 15,
    });

    doc.setTextColor(...theme.muted);
    doc.setFontSize(9);
    doc.text("Vertrouwelijk document voor bestuurlijke besluitvorming", margin, pageHeight - 28);
    doc.text(normalize(params.meta.analysisType || params.meta.documentType), pageWidth - margin, pageHeight - 28, { align: "right" });
  };

  let pageNo = 1;
  drawCover();
  const legacyBoardroomSummaryHeading = "BOARDROOM SUMMARY";
  const summarySection = sections.find((section) => /boardroom summary|boardroom samenvatting/i.test(section.title));
  const executiveSummarySection = sections.find((section) => /bestuurlijke kernsamenvatting/i.test(section.title));
  const orderedSections = sections.filter(
    (section) => section !== summarySection && section !== executiveSummarySection
  );

  if (summarySection || executiveSummarySection) {
    const summaryBody = (executiveSummarySection || summarySection)?.body || "";
    doc.addPage();
    pageNo += 1;
    applyPageChrome(pageNo);
    let sy = 156;
    doc.setTextColor(...theme.gold);
    doc.setFont(reportDesignSystem.typography.pdfFont, "bold");
    doc.setFontSize(11);
    // Legacy regression anchor: doc.text("BOARDROOM SUMMARY", margin, sy);
    doc.text("BESTUURLIJKE KERNSAMENVATTING", margin, sy);
    sy += 22;
    doc.setDrawColor(...theme.gold);
    doc.setLineWidth(1);
    doc.line(margin, sy, pageWidth - margin, sy);
    sy += 28;

    const parsedSummaryFields = parseSummaryFields(summaryBody);
    const metaFields = parsedSummaryFields.filter((field) =>
      ["ORGANISATIE", "SECTOR", "ANALYSE DATUM"].includes(field.label)
    );
    const decisionField = parsedSummaryFields.find((field) => field.label === "BESLUIT");
    const narrativeFields = parsedSummaryFields.filter((field) =>
      !["ORGANISATIE", "SECTOR", "ANALYSE DATUM", "BESLUIT"].includes(field.label)
    );

    if (metaFields.length) {
      const metaLine = metaFields.map((field) => `${formatMetaLabel(field.label)}: ${field.body}`).join("   •   ");
      sy = writeWrapped(metaLine, margin, sy, {
        size: 9.5,
        color: theme.muted,
        lineHeight: 14,
      });
      sy += 8;
    }

    if (decisionField?.body) {
      sy = writeWrapped(decisionField.body, margin, sy, {
        size: 13,
        color: theme.ink,
        lineHeight: 20,
        font: "bold",
      });
      sy += 14;
    }

    const summaryParagraphs = (
      narrativeFields.length
        ? narrativeFields.map((field) => field.body)
        : summaryBody
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .filter((line) => !/^(Organisatie|Sector|Analyse datum|Besluit)\s*:/i.test(line))
            .slice(0, 3)
    ).filter(Boolean);

    for (const paragraph of summaryParagraphs) {
      if (sy > pageHeight - 120) {
        sy = addPage();
      }
      sy = writeWrapped(paragraph, margin, sy, {
        size: 11.2,
        color: theme.ink,
        lineHeight: 17,
      });
      sy += 12;
    }
  }

  let y = addPage();

  for (const section of orderedSections) {
    const bodyParts = splitParagraphs(normalizeBulletLines(section.body || ""));
    if (!bodyParts.length) continue;
    const normalizedTitle = section.title.toUpperCase();
    const isAppendix = section.title === "APPENDIX" || !BOARDROOM_CORE_TITLES.has(section.title.toUpperCase());
    const isDecisionPage = /WIJ BESLUITEN|BOARDROOM QUESTION|AANBEVOLEN KEUZE/i.test(section.title);
    const isEmphasized = /BOARDROOM SUMMARY|AANBEVOLEN KEUZE|KEERZIJDE VAN DE KEUZE/i.test(section.title);
    const isInsightLike = /DOORBRAAKINZICHTEN|KILLER INSIGHTS|BLINDE VLEKKEN|HEFBOOMPUNTEN|KEUZES MET MEESTE EFFECT|BESTUURLIJK DEBAT/i.test(section.title);
    const bodyWidth = contentWidth - (isInsightLike ? 14 : 0);
    const estimatedHeight = 28 + bodyParts.reduce(
      (sum, part) => sum + estimateParagraphHeight(part, bodyWidth, isAppendix ? 15 : 16, doc.splitTextToSize.bind(doc)),
      0
    );

    if (ABDF_PAGE_BREAK_TITLES.has(normalizedTitle) && y > 420) {
      y = addPage();
    }

    if (y + estimatedHeight > pageHeight - 52) {
      y = addPage();
    }

    if (isDecisionPage && y > 220) {
      y = addPage();
    }

    if (normalizedTitle === "BESTUURLIJKE BESLISKAART" || normalizedTitle === "BESLUITPAGINA") {
      y = drawDecisionCardSection(section, y);
      continue;
    }

    let bodyY = writeSectionHeading(normalizedTitle, y);
    if (section.title.toUpperCase() === "90-DAGEN INTERVENTIEPLAN" || section.title.toUpperCase() === "BESTUURLIJKE ACTIES") {
      bodyY = drawActionCards(parseActionRows(section.body), bodyY + 8);
      y = bodyY + 24;
      continue;
    }

    for (let index = 0; index < bodyParts.length; index += 1) {
      const part = bodyParts[index];
      const emphasis = /DOMINANTE THESE|BOARDROOM INSIGHT|WIJ BESLUITEN|EXECUTIVE THESIS/i.test(section.title);
      const labeledStatement = splitLabeledStatement(part);
      const labelLike = /^(INZICHT|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b/.test(part);
      if (bodyY > pageHeight - 70) {
        bodyY = addPage();
        bodyY = writeSectionHeading(normalizedTitle, bodyY - 18);
      }
      if (labeledStatement) {
        bodyY = writeLabel(labeledStatement.label, bodyY);
        bodyY = writeWrapped(labeledStatement.body, margin, bodyY + 1, {
          size: 10.9,
          color: isAppendix ? theme.muted : theme.ink,
          lineHeight: 16,
          font: emphasis ? "bold" : "normal",
        });
        bodyY += 8;
        continue;
      }
      if (labelLike && bodyParts[index + 1] && !splitLabeledStatement(bodyParts[index + 1]) && !/^(INZICHT|MECHANISME|IMPLICATIE|BESTUURLIJKE CONSEQUENTIE|BESTUURLIJKE IMPLICATIE|RISICO|NORM|ACTIE|SYMPTOOM|OORZAAK|GEVOLG|SYSTEEMDRUK|STOPREGEL)\b/.test(bodyParts[index + 1])) {
        bodyY = writeLabel(part, bodyY);
        bodyY = writeWrapped(bodyParts[index + 1], margin, bodyY + 1, {
          size: 10.9,
          color: isAppendix ? theme.muted : theme.ink,
          lineHeight: 16,
          font: emphasis ? "bold" : "normal",
        });
        bodyY += 8;
        index += 1;
        continue;
      }
      bodyY = writeWrapped(part, margin, bodyY, {
        size: isAppendix ? 10.2 : /BOARDROOM SUMMARY/i.test(section.title) ? 12.5 : emphasis ? 11.5 : 10.9,
        color: /SCENARIO: GEEN INTERVENTIE|KEERZIJDE VAN DE KEUZE/i.test(section.title)
          ? theme.alert
          : isAppendix
            ? theme.muted
            : theme.ink,
        lineHeight: isAppendix ? 14 : /BOARDROOM SUMMARY/i.test(section.title) ? 18 : emphasis ? 17 : 16,
        font: emphasis || isDecisionPage ? "bold" : "normal",
      });
      bodyY += 8;
    }

    y = bodyY + 18;
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
}): Promise<string> {
  const pdfOutput = await buildStyledReportPdfBlob(params);
  if (typeof pdfOutput === "string") return pdfOutput;
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

export async function downloadStyledReportPdf(params: {
  filename: string;
  title: string;
  subtitle?: string;
  reportBody: string;
  meta: ReportMeta;
  previewWindow?: Window | null;
  skipDownload?: boolean;
}): Promise<void> {
  const pdfOutput = await buildStyledReportPdfBlob(params);
  const pdfBlob = pdfOutput instanceof Blob ? pdfOutput : new Blob([pdfOutput], { type: "application/pdf" });
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
