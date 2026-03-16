export const BOARD_MEMO_REQUIRED_SECTIONS = [
  "1. Besluitvraag",
  "2. Executive Thesis",
  "3. Feitenbasis",
  "4. Strategische opties",
  "5. Aanbevolen keuze",
  "6. Niet-onderhandelbare besluitregels",
  "7. 90-dagen interventieplan",
  "8. KPI monitoring",
  "9. Besluittekst",
] as const;

export type BoardMemoSection = (typeof BOARD_MEMO_REQUIRED_SECTIONS)[number];
