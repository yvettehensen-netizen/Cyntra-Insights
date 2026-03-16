import { DecisionRegistry, type DecisionRecord } from "./DecisionRegistry";

type SessionLike = {
  session_id: string;
  organization_name?: string;
  updated_at?: string;
  analyse_datum?: string;
  strategic_metadata?: {
    gekozen_strategie?: string;
    decision_memory?: {
      decision_record?: {
        gekozen_strategie?: string;
      };
      boardroom_alert?: string;
    };
  };
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function deriveOwner(choice: string): string {
  const value = choice.toLowerCase();
  if (value.includes("netwerk") || value.includes("partner")) return "Directeur strategie";
  if (value.includes("kosten") || value.includes("herstruct")) return "CFO / COO";
  if (value.includes("consol")) return "CEO / Directie";
  return "Bestuur";
}

export function buildDecisionRecord(session: SessionLike): DecisionRecord {
  const chosenOption =
    normalize(session.strategic_metadata?.decision_memory?.decision_record?.gekozen_strategie) ||
    normalize(session.strategic_metadata?.gekozen_strategie) ||
    "Geen gekozen richting vastgelegd";
  const decision =
    normalize(session.strategic_metadata?.decision_memory?.boardroom_alert) ||
    "Bestuurlijke keuze vereist expliciete uitvoeringsdiscipline.";

  return {
    decision_id: `decision-${session.session_id}`,
    session_id: session.session_id,
    organization: normalize(session.organization_name) || "Onbekende organisatie",
    decision,
    chosen_option: chosenOption,
    date: normalize(session.updated_at || session.analyse_datum) || new Date().toISOString(),
    owner: deriveOwner(chosenOption),
    status: "actief",
  };
}

export function syncDecisionRecord(session: SessionLike): DecisionRecord {
  const existing = DecisionRegistry.getBySession(session.session_id);
  if (existing) return existing;
  const record = buildDecisionRecord(session);
  return DecisionRegistry.upsert(record);
}
