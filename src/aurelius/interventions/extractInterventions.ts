import type { Intervention } from "./types";

type AnyReport = {
  case_id?: string;
  source_case_id?: string;
  organization_id?: string;
  organisation_id?: string;
  session_id?: string;
  sector?: string;
  sections?: Record<string, unknown>;
  recommendations?: unknown;
  actions?: unknown;
  interventionPlan?: unknown;
  board_report?: string;
  report?: string;
  dominant_thesis?: unknown;
  dominante_these?: unknown;
  kernspanning?: unknown;
  trade_offs?: unknown;
  tradeoffs?: unknown;
  price_of_delay?: unknown;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item)).filter(Boolean);
  }
  const raw = normalize(value);
  if (!raw) return [];
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function makeId(): string {
  const ref = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (ref?.randomUUID) return ref.randomUUID();
  const rand = Math.random().toString(36).slice(2, 10);
  return `int-${Date.now()}-${rand}`;
}

function clampConfidence(value: unknown, fallback = 0.7): number {
  const num = Number(value);
  if (Number.isFinite(num) && num >= 0 && num <= 1) return num;
  return fallback;
}

function pickLines(report: AnyReport): string[] {
  const sections = report.sections || {};
  const dominant = [
    ...toArray((sections as any).dominante_these),
    ...toArray((sections as any).dominant_thesis),
    ...toArray((sections as any)["dominante these"]),
    ...toArray(report.dominante_these),
    ...toArray(report.dominant_thesis),
  ];
  const tension = [
    ...toArray((sections as any).kernspanning),
    ...toArray((sections as any)["kernspanning"]),
    ...toArray(report.kernspanning),
  ];
  const tradeoffs = [
    ...toArray((sections as any).trade_offs),
    ...toArray((sections as any).tradeoffs),
    ...toArray((sections as any)["trade-offs"]),
    ...toArray(report.trade_offs),
    ...toArray(report.tradeoffs),
  ];
  const delay = [
    ...toArray((sections as any).price_of_delay),
    ...toArray((sections as any)["price of delay"]),
    ...toArray(report.price_of_delay),
  ];

  const flat = [
    ...dominant,
    ...tension,
    ...tradeoffs,
    ...delay,
    ...toArray(report.recommendations),
    ...toArray(report.actions),
    ...toArray(report.interventionPlan),
  ];

  const plainText = normalize(report.board_report || report.report);
  if (plainText) {
    const extracted = plainText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^(?:\d+[.)]|[-*])\s+/.test(line))
      .map((line) => line.replace(/^(?:\d+[.)]|[-*])\s+/, "").trim());
    flat.push(...extracted);
  }

  return Array.from(new Set(flat.filter(Boolean))).slice(0, 24);
}

function normalizeKey(value: string): string {
  return normalize(value).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, " ").trim();
}

function isNoiseLine(line: string): boolean {
  const text = normalize(line);
  if (!text) return true;
  if (text.length < 3 || text.length > 140) return true;
  if (/^placeholder toegevoegd door narrativestructureguard/i.test(text)) return true;
  if (/^(?:\d+\.?\s*)?(besluitvraag|bestuurlijke these|feitenbasis|strategische opties|aanbevolen keuze|besluitregels|kpi monitoring|besluittekst|sector benchmark|vergelijkbare organisaties|strategische positie)$/i.test(text)) return true;
  if (/^(?:\d+\.?\s*)?(context layer|diagnosis layer|mechanism layer|decision layer|output 1|board memo|executive summary)$/i.test(text)) return true;
  if (/[.:]\s/.test(text) && text.split(/[.!?]+/).filter((part) => normalize(part)).length > 2) return true;
  return false;
}

function looksLikeIntervention(line: string): boolean {
  const text = normalize(line);
  if (!text) return false;
  const hasActionWord = /(heronderhandeling|reductie|stabilisatie|herstructurering|formaliseren|afdwingen|verbreding|discipline|monitoring|escalatie|prioritering|rationalisatie|optimalisatie|verbetering|interventie)/i.test(text);
  const hasDomainNoun = /(contract|marge|capaciteit|portfolio|mandaat|kpi|governance|planning|cash|kosten|risico|uitvoering|strategie)/i.test(text);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return wordCount >= 2 && wordCount <= 18 && (hasActionWord || hasDomainNoun);
}

function inferImpact(text: string): string {
  if (/marge|cash|liquiditeit|tarief|kostprijs/i.test(text)) return "hoog";
  if (/capaciteit|planning|wachttijd|productiviteit/i.test(text)) return "middel";
  return "middel";
}

function inferRisk(text: string): string {
  if (/contract|verzekeraar|plafond/i.test(text)) return "hoog";
  if (/team|adoptie|weerstand|eigenaarschap/i.test(text)) return "middel";
  return "middel";
}

export function extractInterventionsFromReport(report: AnyReport): Intervention[] {
  const createdAt = new Date().toISOString();
  const source_case_id = normalize(
    report.source_case_id || report.case_id || report.session_id || report.organization_id || report.organisation_id
  );
  const sourceCaseId = source_case_id || "case-onbekend";

  const lines = pickLines(report)
    .filter((line) => !isNoiseLine(line))
    .filter((line) => looksLikeIntervention(line));
  const dedup = new Set<string>();
  const uniqueLines: string[] = [];
  for (const line of lines) {
    const key = normalizeKey(line);
    if (!key || dedup.has(key)) continue;
    dedup.add(key);
    uniqueLines.push(line);
  }

  return uniqueLines.slice(0, 12).map((line, index) => {
    const title = line.length > 96 ? `${line.slice(0, 93)}...` : line;
    return {
      id: makeId(),
      title: title || `Interventie ${index + 1}`,
      description: line,
      owner: undefined,
      deadline: undefined,
      impact: inferImpact(line),
      risk: inferRisk(line),
      confidence: clampConfidence((report as any).confidence, 0.7),
      source_case_id: sourceCaseId,
      source_case: sourceCaseId,
      sector: normalize(report.sector) || undefined,
      created_at: createdAt,
    };
  });
}
