import { supabase } from "@/lib/supabaseClient";
import type {
  BoardSummaryResponse,
  DriftResponse,
  ExecutiveControlRoomData,
  GovernanceResponse,
  PatternLearningResponse,
  RiskEvolutionResponse,
  SriResponse,
} from "./types";

const INTELLIGENCE_BASE = (import.meta.env.VITE_INTELLIGENCE_API_BASE || "").replace(/\/$/, "");

function actieveOrganisatieId() {
  if (typeof localStorage === "undefined") return "";
  return String(localStorage.getItem("active_org_id") || "").trim();
}

async function fetchEndpoint<T>(endpoint: string, organisatieId: string): Promise<T> {
  const qs = new URLSearchParams();
  if (organisatieId) qs.set("organisation_id", organisatieId);

  const url = `${INTELLIGENCE_BASE}${endpoint}?${qs.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Endpoint ${endpoint} gaf ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

function sriBand(score: number) {
  if (score <= 35) return "Autonomous";
  if (score <= 55) return "SRE";
  if (score <= 75) return "CTO Freeze";
  return "Exec Committee";
}

function governanceKleur(status: string): "green" | "orange" | "red" | "deep-red" {
  const s = status.toLowerCase();
  if (s === "critical") return "deep-red";
  if (s === "high") return "red";
  if (s === "medium") return "orange";
  return "green";
}

async function fallbackSri(organisatieId: string): Promise<SriResponse> {
  const { data: sriRows } = await supabase
    .schema("ops")
    .from("sri_evolution")
    .select(
      "organisation_id,date,sri,trend,risk_velocity,evolution_score,confidence_band_lower,confidence_band_upper,drift_flag,risk_cluster"
    )
    .eq("organisation_id", organisatieId)
    .order("date", { ascending: true })
    .limit(120);

  const { data: escalaties } = await supabase
    .schema("ops")
    .from("governance_escalation_log")
    .select("severity,status")
    .neq("status", "resolved")
    .limit(100);

  const trend = (sriRows || []).map((row: any) => ({
    datum: String(row.date || ""),
    sri: Number(row.sri || 0),
    trend: Number(row.trend || 0),
    risicosnelheid: Number(row.risk_velocity || 0),
    evolution_score: Number(row.evolution_score || row.sri || 0),
    confidence_band_lower: Number(row.confidence_band_lower || row.sri || 0),
    confidence_band_upper: Number(row.confidence_band_upper || row.sri || 0),
    drift_flag: Boolean(row.drift_flag),
    risk_cluster: String(row.risk_cluster || "MEDIUM"),
    band: sriBand(Number(row.sri || 0)),
  }));

  const laatste = trend[trend.length - 1];
  const severityRank = Math.max(
    1,
    ...(escalaties || []).map((item: any) => {
      const s = String(item.severity || "low").toLowerCase();
      if (s === "critical") return 4;
      if (s === "high") return 3;
      if (s === "medium") return 2;
      return 1;
    })
  );

  const status = severityRank >= 4 ? "critical" : severityRank >= 3 ? "high" : severityRank >= 2 ? "medium" : "low";

  return {
    gegenereerd_op: new Date().toISOString(),
    organisatie_id: organisatieId || null,
    huidige_sri: Number(laatste?.sri || 0),
    sri_band: laatste?.band || sriBand(0),
    drift_delta_7d: 0,
    risicosnelheid: Number(laatste?.risicosnelheid || 0),
    governance_state: status as any,
    governance_kleur: governanceKleur(status),
    actieve_escalaties: (escalaties || []).length,
    volatility_indicator: 0,
    sri_trend: trend,
    band_transities: [],
    freeze_trigger_lijnen: [75, 90],
    drempel_lijnen: { autonomous: 35, sre: 55, cto_freeze: 75, exec_committee: 90 },
  };
}

async function fallbackDrift(organisatieId: string): Promise<DriftResponse> {
  const { data } = await supabase
    .schema("ops")
    .from("model_drift_log")
    .select("analysis_date,drift_type,drift_score,severity")
    .eq("organisation_id", organisatieId)
    .gte("analysis_date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10))
    .order("analysis_date", { ascending: true });

  const rows = data || [];
  return {
    gegenereerd_op: new Date().toISOString(),
    organisatie_id: organisatieId || null,
    drift_intensiteit_heatmap: rows.map((row: any) => ({
      datum: String(row.analysis_date),
      drift_type: String(row.drift_type),
      intensiteit: Number(row.drift_score || 0),
      severity: String(row.severity || "low") as any,
    })),
    drift_clusters: [],
    severity_classificatie: { low: 0, medium: 0, high: 0, critical: 0 },
    besluit_omkeringen_detectie: { aantal: 0, events: [] },
    drift_tijdlijn: rows.map((row: any) => ({
      datum: String(row.analysis_date),
      drift_type: String(row.drift_type),
      score: Number(row.drift_score || 0),
      severity: String(row.severity || "low") as any,
    })),
  };
}

async function fallbackRiskEvolution(organisatieId: string): Promise<RiskEvolutionResponse> {
  const { data } = await supabase
    .schema("ops")
    .from("sri_evolution")
    .select("date,sri,risk_velocity")
    .eq("organisation_id", organisatieId)
    .order("date", { ascending: true })
    .limit(120);

  const trend = (data || []).map((row: any) => ({
    datum: String(row.date),
    score: Number(row.sri || 0),
    risicosnelheid: Number(row.risk_velocity || 0),
  }));

  return {
    gegenereerd_op: new Date().toISOString(),
    organisatie_id: organisatieId || null,
    risico_distributie: [],
    waargenomen_trend: trend,
    projectie_90_dagen: [],
    confidence_decay_overlay: [],
    risico_acceleratie_vector: { huidig: trend.at(-1)?.risicosnelheid || 0, trend_7d: 0, richting: "stabiel" },
  };
}

async function fallbackGovernance(organisatieId: string): Promise<GovernanceResponse> {
  return {
    organisatie_id: organisatieId || null,
    authority_routing_tabel: [
      { band: "Autonomous", sri_min: 0, sri_max: 35, eigenaar: "Autonome operatie", escalatiepad: "Team Lead", actie: "Monitoren" },
      { band: "SRE", sri_min: 36, sri_max: 55, eigenaar: "SRE / Operations", escalatiepad: "Head of Analytics", actie: "Verscherpte review" },
      { band: "CTO Freeze", sri_min: 56, sri_max: 75, eigenaar: "CTO", escalatiepad: "Risk Officer", actie: "Freeze voorbereiden" },
      { band: "Exec Committee", sri_min: 76, sri_max: 100, eigenaar: "Executive Committee", escalatiepad: "Board", actie: "Direct ingrijpen" },
    ],
    escalation_ladder: [],
    actieve_freeze_flags: [],
    governance_override_acties: [],
    governance_state: {
      status: "low",
      kleur: "green",
      sri_band: "Autonomous",
      actieve_escalaties: 0,
    },
  };
}

async function fallbackPatternLearning(organisatieId: string): Promise<PatternLearningResponse> {
  return {
    gegenereerd_op: new Date().toISOString(),
    organisatie_id: organisatieId || null,
    recurrent_patterns: [],
    decision_type_cluster: [],
    stagnation_signals: 0,
    escalation_frequency: 0,
    decision_memory: [],
    audit_logs: [],
    decision_pattern_clusters: [],
    herhaalde_faal_signaturen: [],
    dominante_structurele_bottlenecks: [],
    learning_density_score: 0,
  };
}

async function fallbackBoardSummary(organisatieId: string): Promise<BoardSummaryResponse> {
  const { data } = await supabase
    .from("decision_briefs")
    .select("executive_thesis")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    gegenereerd_op: new Date().toISOString(),
    organisatie_id: organisatieId || null,
    executive_thesis: String(data?.executive_thesis || "Nog geen actieve executive thesis."),
    dominant_risico: "Nog geen dominant risico beschikbaar.",
    onomkeerbaar_besluit: "Nog geen onomkeerbaar besluit gedetecteerd.",
    authority_summary_90_dagen: "Authority summary nog niet beschikbaar.",
    escalatie_exposure: { actief: 0, hoogste_ernst: "low" },
    governance_readiness_score: 0,
  };
}

export async function laadExecutiveControlRoomData(organisatieIdArg?: string): Promise<ExecutiveControlRoomData> {
  const organisatieId = organisatieIdArg || actieveOrganisatieId();

  try {
    const [sri, drift, riskEvolution, governance, patternLearning, boardSummary] = await Promise.all([
      fetchEndpoint<SriResponse>("/intelligence/sri", organisatieId),
      fetchEndpoint<DriftResponse>("/intelligence/drift", organisatieId),
      fetchEndpoint<RiskEvolutionResponse>("/intelligence/risk-evolution", organisatieId),
      fetchEndpoint<GovernanceResponse>("/intelligence/governance", organisatieId),
      fetchEndpoint<PatternLearningResponse>("/intelligence/pattern-learning", organisatieId),
      fetchEndpoint<BoardSummaryResponse>("/intelligence/board-summary", organisatieId),
    ]);

    return {
      sri,
      drift,
      riskEvolution,
      governance,
      patternLearning,
      boardSummary,
    };
  } catch {
    const [sri, drift, riskEvolution, governance, patternLearning, boardSummary] = await Promise.all([
      fallbackSri(organisatieId),
      fallbackDrift(organisatieId),
      fallbackRiskEvolution(organisatieId),
      fallbackGovernance(organisatieId),
      fallbackPatternLearning(organisatieId),
      fallbackBoardSummary(organisatieId),
    ]);

    return {
      sri,
      drift,
      riskEvolution,
      governance,
      patternLearning,
      boardSummary,
    };
  }
}
