export type NormalizeMetadataInput = {
  organisation?: string;
  companyName?: string;
  sector?: string;
  sectorSelected?: string;
  analysisDate?: string;
  now?: Date;
};

export type NormalizedMetadata = {
  organisation: string;
  sector: string;
  analysisDate: string;
};

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeOrganisation(value: string): string {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || "Onbekende organisatie";
}

function normalizeSector(value: string): string {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Onbekende sector";
  if (/jeugdzorg/i.test(cleaned)) return "Jeugdzorg";
  if (/ggz/i.test(cleaned)) return "GGZ";
  return cleaned;
}

export function normalizeMetadata(input: NormalizeMetadataInput): NormalizedMetadata {
  return {
    organisation: normalizeOrganisation(input.organisation || input.companyName || ""),
    sector: normalizeSector(input.sector || input.sectorSelected || ""),
    analysisDate: String(input.analysisDate ?? "").trim() || formatDate(input.now ?? new Date()),
  };
}
