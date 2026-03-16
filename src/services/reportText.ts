export function parseContactLines(rawInput?: string): string[] {
  const text = String(rawInput || "");
  if (!text) return [];

  const isNoise = (line: string) =>
    /(?:^\[UPLOAD_CONTEXT\]|^bestand:|^preview:|^notes?$|^bron:|^samenvatting\b|^fireflies\b|^organisatiestrategie\b|^positionering\b|^operationeel\b|^personeel\b|^cultuur\b)/i.test(line) ||
    line.length > 110;

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !isNoise(line));

  const matches = lines.filter((line) => {
    return (
      /(contact|contactpersoon|e-mail|email|telefoon|mobiel|bestuurder|ceo|directeur|rvb|rvt)/i.test(line) ||
      /@/.test(line) ||
      /\+?\d[\d\s\-()]{7,}/.test(line)
    );
  });

  return Array.from(new Set(matches)).slice(0, 4);
}
