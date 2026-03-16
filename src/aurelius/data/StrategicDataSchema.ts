export type StrategicCaseRecord = {
  case_id: string;
  organisatie_type: string;
  sector: string;
  organisatie_grootte: string;
  verdienmodel: string;
  dominant_problem: string;
  dominant_thesis: string;
  mechanisms: string[];
  strategic_options: string[];
  gekozen_strategie: string;
  interventieprogramma: string;
  analyse_datum: string;
};

export type StrategicInterventionRecord = {
  intervention_id: string;
  case_id: string;
  interventie_type: string;
  beschrijving: string;
  implementatie_datum: string;
};

export type StrategicOutcomeRecord = {
  outcome_id: string;
  intervention_id: string;
  financieel_effect: string;
  operationeel_effect: string;
  implementatie_succes: "laag" | "middel" | "hoog";
  evaluatie_datum: string;
};
