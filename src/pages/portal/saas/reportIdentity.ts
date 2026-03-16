export function formatReportCode(sessionId: string): string {
  const raw = String(sessionId || "").trim();
  const match = raw.match(/^sess-(\d{8})(\d{6})-([A-Z0-9]+)$/i);
  if (match) {
    const [, ymd, hms, suffix] = match;
    return `RPT-${ymd}-${hms}-${suffix.toUpperCase()}`;
  }
  if (!raw) return "RPT-ONBEKEND";
  return raw.toUpperCase().startsWith("RPT-") ? raw.toUpperCase() : `RPT-${raw.toUpperCase()}`;
}

export function formatReportShortDate(value?: string): string {
  if (!value) return "Onbekend";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Onbekend";
  return date.toLocaleString("nl-NL");
}
