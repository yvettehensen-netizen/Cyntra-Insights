export type HistoricalLearningNarrativeInput = {
  vergelijkbare_cases: string[];
  historische_interventies: string[];
  interventieresultaten: string[];
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toLines(items: string[], fallback: string): string {
  if (!items.length) return fallback;
  return items.map((item, index) => `${index + 1}. ${normalize(item)}`).join("\n");
}

export function buildHistoricalLearningNarrativeSection(
  input: HistoricalLearningNarrativeInput
): string {
  return [
    "### HISTORISCHE LEERINZICHTEN",
    "Vergelijkbare cases",
    toLines(input.vergelijkbare_cases, "Geen vergelijkbare cases beschikbaar."),
    "",
    "Historische interventies",
    toLines(
      input.historische_interventies,
      "Nog geen robuuste interventiehistoriek beschikbaar voor dit casustype."
    ),
    "",
    "Resultaten van interventies",
    toLines(
      input.interventieresultaten,
      "Resultaten nog onvoldoende vastgelegd; uitkomstregistratie verplicht in volgende cyclus."
    ),
  ].join("\n");
}

export function appendHistoricalLearningSection(
  boardReport: string,
  input: HistoricalLearningNarrativeInput
): string {
  const section = buildHistoricalLearningNarrativeSection(input);
  const normalizedReport = String(boardReport ?? "").trim();
  if (!normalizedReport) return section;
  if (/###\s*HISTORISCHE LEERINZICHTEN/i.test(normalizedReport)) return normalizedReport;
  return `${normalizedReport}\n\n${section}`;
}

