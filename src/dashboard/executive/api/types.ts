export type GovernanceKleur = "green" | "orange" | "red" | "deep-red";
export type Severity = "low" | "medium" | "high" | "critical";

export interface SriTrendPunt {
  datum: string;
  sri: number;
  trend: number;
  risicosnelheid: number;
  evolution_score: number;
  confidence_band_lower: number;
  confidence_band_upper: number;
  drift_flag: boolean;
  risk_cluster: string;
  band: string;
}

export interface SriResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  huidige_sri: number;
  sri_band: string;
  drift_delta_7d: number;
  risicosnelheid: number;
  governance_state: Severity;
  governance_kleur: GovernanceKleur;
  actieve_escalaties: number;
  volatility_indicator: number;
  sri_trend: SriTrendPunt[];
  band_transities: Array<{ datum: string; van: string; naar: string }>;
  freeze_trigger_lijnen: number[];
  drempel_lijnen: {
    autonomous: number;
    sre: number;
    cto_freeze: number;
    exec_committee: number;
  };
}

export interface DriftResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  drift_intensiteit_heatmap: Array<{
    datum: string;
    drift_type: string;
    intensiteit: number;
    severity: Severity;
  }>;
  drift_clusters: Array<{
    cluster: string;
    gemiddelde_score: number;
    hoogste_score: number;
    aantal: number;
    severity: Severity;
  }>;
  severity_classificatie: Record<Severity, number>;
  besluit_omkeringen_detectie: {
    aantal: number;
    events: Array<{
      tijdstip: string;
      analyse_type: string;
      drift_type: string;
      severity: Severity;
      score: number;
      omschrijving: string;
    }>;
  };
  drift_tijdlijn: Array<{
    datum: string;
    drift_type: string;
    score: number;
    severity: Severity;
  }>;
}

export interface RiskEvolutionResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  risico_distributie: Array<{ band: string; aantal: number }>;
  waargenomen_trend: Array<{ datum: string; score: number; risicosnelheid: number }>;
  projectie_90_dagen: Array<{
    datum: string;
    score: number;
    ondergrens: number;
    bovengrens: number;
    confidence_decay: number;
  }>;
  confidence_decay_overlay: Array<{ datum: string; confidence: number }>;
  risico_acceleratie_vector: {
    huidig: number;
    trend_7d: number;
    richting: "stijgend" | "dalend" | "stabiel";
  };
}

export interface GovernanceResponse {
  gegenereerd_op?: string;
  organisatie_id: string | null;
  authority_routing_tabel: Array<{
    band: string;
    sri_min: number;
    sri_max: number;
    eigenaar: string;
    escalatiepad: string;
    actie: string;
  }>;
  escalation_ladder: Array<{
    tijdstip: string;
    actie: string;
    severity: Severity;
    status: string;
    reden: string;
  }>;
  actieve_freeze_flags: Array<{
    actie: string;
    status: string;
    severity: Severity;
    reden: string;
    gestart_op: string;
  }>;
  governance_override_acties: Array<{
    datum: string;
    actie: string;
    urgency: string;
    severity: Severity;
    beschrijving: string;
    status: string;
  }>;
  governance_state: {
    status: Severity;
    kleur: GovernanceKleur;
    sri_band: string;
    actieve_escalaties: number;
  };
}

export interface PatternLearningResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  recurrent_patterns: string[];
  decision_type_cluster: string[];
  stagnation_signals: number;
  escalation_frequency: number;
  decision_memory: Array<{
    analysis_id: string;
    timestamp: string;
    gate_score: number;
    gate_status: string;
    repair_attempts: number;
    decision_velocity: number;
    activated_lenses: string[];
    dominant_risk_axes: string[];
    dominant_claim_axes: string[];
  }>;
  audit_logs: Array<{
    analysis_id: string;
    timestamp: string;
    repair_attempts: number;
    single_call_mode: boolean;
    duration_ms: number;
  }>;
  decision_pattern_clusters: Array<{
    cluster_label: string;
    frequentie: number;
    stabiliteit: number;
    acceleratie: number;
    last_seen: string;
  }>;
  herhaalde_faal_signaturen: Array<{
    signatuur: string;
    aantal: number;
    ernst: Severity;
  }>;
  dominante_structurele_bottlenecks: Array<{
    naam: string;
    impact: number;
  }>;
  learning_density_score: number;
}

export interface DecisionIntelligenceResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  irreversibility_score: number;
  ownership_clarity_score: number;
  ownership_clarity: number;
  execution_probability: number;
  decision_strength_index: number;
  evolution_state: "Verbetering" | "Verslechtering" | "Stilstand";
  evolution_delta: number;
  history: Array<{
    analysis_id: string;
    timestamp: string;
    gate_score: number;
    gate_status: string;
    repair_attempts: number;
    decision_velocity: number;
    single_call_mode: boolean;
    duration_ms: number;
    activated_lenses: string[];
    dominant_risk_axes: string[];
  }>;
}

export interface BoardSummaryResponse {
  gegenereerd_op: string;
  organisatie_id: string | null;
  executive_thesis: string;
  dominant_risico: string;
  onomkeerbaar_besluit: string;
  authority_summary_90_dagen: string;
  escalatie_exposure: {
    actief: number;
    hoogste_ernst: Severity;
  };
  governance_readiness_score: number;
}

export interface ExecutiveControlRoomData {
  sri: SriResponse;
  drift: DriftResponse;
  riskEvolution: RiskEvolutionResponse;
  governance: GovernanceResponse;
  patternLearning: PatternLearningResponse;
  boardSummary: BoardSummaryResponse;
}
