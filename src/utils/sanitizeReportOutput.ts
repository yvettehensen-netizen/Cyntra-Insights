const HGBCO_PATTERN = /\bHGBCO\b[\s:–-]*|[\[\(]?HGBCO[\]\)]?/gi;
const DECORATIVE_CHROME_LINE_PATTERNS = [
  /^\s*CYNTRA STRATEGIC BRAIN(?:\s*\|\s*BESTUURSDOSSIER(?:\s+\w+)?)?\s*$/i,
  /^\s*(?:KORT DOSSIER|VOLLEDIG DOSSIER)\s*$/i,
  /^\s*Pagina\s+\d+\s*$/i,
  /^\s*(?:Compact bestuursdocument voor snelle besluitvorming\.|Volledig bestuursdossier voor directie, bestuur en toezicht\.)\s*$/i,
  /^\s*[^•\n]+ • [^•\n]+ • uitsluitend voor intern bestuurlijk gebruik\s*$/i,
];

export function sanitizeReportOutput(text: string): string {
  if (!text) return "";
  const withoutChrome = text
    .replace(HGBCO_PATTERN, "")
    .split("\n")
    .filter((line) => !DECORATIVE_CHROME_LINE_PATTERNS.some((pattern) => pattern.test(line.trim())))
    .join("\n");
  return withoutChrome.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
