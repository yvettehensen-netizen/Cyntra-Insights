// src/aurelius/types/ExpandedBoardReport.ts

export interface ExpandedSection {
  title: string;
  narrative: string;        // 1–2 pagina’s tekst
  implications: string[];   // board-impact
  risks: string[];
  decisions: string[];      // expliciete besluitpunten
}

export interface ExpandedBoardReport {
  company_name: string;
  executive_summary: string;     // ±2 pagina’s
  sections: ExpandedSection[];   // 8–12 secties → 20–40 pagina’s
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  ceo_message: string;           // slotbrief (1–2 pagina’s)
}
