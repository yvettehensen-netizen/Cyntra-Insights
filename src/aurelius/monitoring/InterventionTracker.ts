export type InterventionStatus = "gestart" | "vertraagd" | "afgerond";

export type InterventionTrackRecord = {
  intervention_id: string;
  decision_id: string;
  session_id: string;
  intervention: string;
  owner: string;
  deadline: string;
  status: InterventionStatus;
  risk: string;
  kpi: string;
};

const STORAGE_KEY = "cyntra_intervention_tracker_v1";

type SessionLike = {
  session_id: string;
  intervention_predictions?: Array<{
    interventie?: string;
    risico?: string;
    kpi_effect?: string;
    confidence?: "laag" | "middel" | "hoog";
  }>;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function readRows(): InterventionTrackRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as InterventionTrackRecord[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRows(rows: InterventionTrackRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function deriveOwner(title: string, index: number): string {
  const value = title.toLowerCase();
  if (value.includes("partner") || value.includes("alliantie")) return "Directeur strategie";
  if (value.includes("triage") || value.includes("toegang")) return "COO";
  if (value.includes("beleid") || value.includes("gemeent")) return "Bestuur";
  return ["CEO", "COO", "CFO"][index % 3];
}

function deriveDeadline(index: number): string {
  return ["Q2", "Q3", "Q4"][index % 3];
}

function deriveStatus(risk: string, confidence: string, index: number): InterventionStatus {
  const lowConfidence = confidence.toLowerCase() === "laag";
  if (risk.toLowerCase().includes("hoog") || lowConfidence) return "vertraagd";
  if (index === 0) return "gestart";
  return "afgerond";
}

export function buildInterventionTrackers(session: SessionLike, decisionId: string): InterventionTrackRecord[] {
  return (session.intervention_predictions || []).slice(0, 5).map((item, index) => {
    const title = normalize(item.interventie) || `Interventie ${index + 1}`;
    const risk = normalize(item.risico) || "Geen expliciet risico vastgelegd";
    return {
      intervention_id: `${session.session_id}-intervention-${index + 1}`,
      decision_id: decisionId,
      session_id: session.session_id,
      intervention: title,
      owner: deriveOwner(title, index),
      deadline: deriveDeadline(index),
      status: deriveStatus(risk, normalize(item.confidence), index),
      risk,
      kpi: normalize(item.kpi_effect) || "KPI ontbreekt",
    };
  });
}

export const InterventionTracker = {
  listByDecision(decisionId: string): InterventionTrackRecord[] {
    return readRows().filter((row) => row.decision_id === decisionId);
  },
  sync(session: SessionLike, decisionId: string): InterventionTrackRecord[] {
    const existing = this.listByDecision(decisionId);
    if (existing.length) return existing;
    const created = buildInterventionTrackers(session, decisionId);
    const next = [...readRows(), ...created];
    writeRows(next);
    return created;
  },
};
