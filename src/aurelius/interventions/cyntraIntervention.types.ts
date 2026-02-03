// ============================================================
// CYNTRA INTERVENTION TYPES — IP CORE
// ============================================================

export type SystemFailure =
  | "besluitvorming"
  | "focus"
  | "governance"
  | "teamdynamiek"
  | "leiderschap"
  | "executie";

export type InterventionLevel =
  | "strategie"
  | "organisatie"
  | "team"
  | "individu";

export interface CyntraIntervention {
  id: string;
  name: string;
  systemFailure: SystemFailure;
  level: InterventionLevel;

  painStatement: string;

  forcedStop: string;
  enforcedChange: string;

  decisionOwner: string;
  irreversibility: string;

  damageIfIgnored: string;
}
