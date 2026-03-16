export interface AureliusOutputContract {
  executive_summary: string;
  board_memo: string;
  strategic_conflict: string;
  recommended_option: string;
  interventions: any[];
  board_memo_quality?: {
    score: number;
    findings: string[];
  };
  strategic_levers?: any[];
  strategy_dna?: any;
  causal_analysis?: any;
  scenario_simulation?: any;
  benchmark?: any;
  drift_analysis?: any;
  decision_memory?: any;
}
