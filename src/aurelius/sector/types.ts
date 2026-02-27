export type Sector =
  | "gezondheidszorg"
  | "advies_consultancy"
  | "bouw"
  | "cultuur"
  | "energie"
  | "financiele_dienstverlening"
  | "detailhandel"
  | "industrie"
  | "onderwijs";

export const SECTOR_OPTIONS: Array<{ value: Sector; label: string }> = [
  { value: "gezondheidszorg", label: "Gezondheidszorg" },
  { value: "advies_consultancy", label: "Advies / Consultancy" },
  { value: "bouw", label: "Bouw" },
  { value: "cultuur", label: "Cultuur" },
  { value: "energie", label: "Energie" },
  { value: "financiele_dienstverlening", label: "Financiële dienstverlening" },
  { value: "detailhandel", label: "Detailhandel" },
  { value: "industrie", label: "Industrie" },
  { value: "onderwijs", label: "Onderwijs" },
];
