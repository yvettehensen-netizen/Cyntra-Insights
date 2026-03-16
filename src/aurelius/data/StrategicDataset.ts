export type StrategicDatasetRecord = {
  dataset_id: string;
  sector: string;
  probleemtype: string;
  mechanismen: string[];
  interventies: string[];
  outcomes: string[];
  created_at: string;
};

export type InterventionDatasetRecord = {
  intervention_id: string;
  sector: string;
  probleemtype: string;
  interventie: string;
  impact: string;
  risico: string;
  succes_score: number;
  created_at: string;
};

export type CaseDatasetRecord = {
  case_id: string;
  organisation_name: string;
  sector: string;
  probleemtype: string;
  dominante_these: string;
  gekozen_strategie: string;
  interventie: string;
  resultaat: string;
  created_at: string;
};

export type SectorBenchmarkSnapshot = {
  sector: string;
  totaal: number;
  probleemverdeling: Array<{ label: string; count: number }>;
  interventieverdeling: Array<{ label: string; count: number }>;
};
