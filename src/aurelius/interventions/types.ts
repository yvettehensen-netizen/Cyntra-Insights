interface Intervention {
  id: string;
  title: string;
  description: string;
  owner?: string;
  deadline?: string;
  impact?: string;
  risk?: string;
  confidence: number;
  source_case_id: string;
  source_case?: string;
  sector?: string;
  created_at: string;
}

export type { Intervention };
