export interface Analysis {
  id: string;
  user_id: string;
  company_name?: string | null;
  created_at: string;
  status: "draft" | "final" | "archived";
  truth_delta?: number | null;
  summary?: string | null;
}
