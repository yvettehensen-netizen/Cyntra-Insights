function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function generateFallbackExecutiveSummary(_data: any) {
  return "Samenvatting automatisch gegenereerd omdat de analyse geen samenvatting produceerde.";
}

export function generateFallbackBoardMemo(data: any) {
  const summary = normalize(data?.executive_summary);
  const conflict = normalize(data?.strategic_conflict);
  const recommendation = normalize(data?.recommended_option);
  const lines = [
    "Board memo niet beschikbaar. Analyse voltooid maar memo kon niet worden opgebouwd.",
    summary ? `Executive summary: ${summary}` : "",
    conflict ? `Strategisch conflict: ${conflict}` : "",
    recommendation ? `Aanbevolen optie: ${recommendation}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function generateFallbackConflict() {
  return "Strategisch conflict niet automatisch bepaald.";
}

export function generateFallbackRecommendation() {
  return "Geen aanbevolen optie beschikbaar.";
}

export function generateFallbackInterventions() {
  return [];
}
