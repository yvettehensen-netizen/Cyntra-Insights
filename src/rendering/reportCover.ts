export type ReportCoverData = {
  organization: string;
  title?: string;
  subtitle?: string;
  date: string;
};

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  return parsed.toLocaleDateString("nl-NL", options);
};

export function buildCoverText({ organization, title, subtitle, date }: ReportCoverData): string {
  return [
    "CYNTRA STRATEGIC BRAIN",
    "",
    title || "Bestuursdossier",
    "",
    organization,
    "",
    subtitle || "Strategische analyse van organisatie, contractmodel en bestuurlijke keuzes.",
    "",
    `Datum: ${formatDate(date)}`,
    "",
    "Geen rommel.",
    "Geen tabellen.",
    "Alleen typografie en ruimte.",
  ]
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{2,}/g, "\n\n");
}
