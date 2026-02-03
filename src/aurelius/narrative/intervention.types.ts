export type InterventionLevel =
  | "strategie"
  | "organisatie"
  | "cultuur"
  | "operatie"
  | "financien"
  | "innovatie"
  | "individu";

export type ImpactLevel = "Laag" | "Middel" | "Hoog";

export interface Intervention {
  id: string;
  level: InterventionLevel;
  issue: string;

  description: string;
  behavior_change: string;
  consequence_if_not_done: string;

  impact_level: ImpactLevel;

  implementation_steps: string[];
  metrics: string[];
  risks: string[];

  related_interventions: string[];
}
