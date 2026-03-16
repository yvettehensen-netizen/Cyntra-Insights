export interface StoredReport {
  id: string;
  analysisId: string;
  title: string;
  date: string;
  baliScore: number;
  betrouwbaarheid: number;
  interventionStatus: string;
  pdfUrl?: string;
  analysisRoute?: string;
}

