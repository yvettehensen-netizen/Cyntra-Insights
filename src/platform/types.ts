export type SubscriptionType = "Starter" | "Professional" | "Enterprise";

export type OrganizationAccount = {
  organization_id: string;
  organisatie_naam: string;
  sector: string;
  organisatie_grootte: string;
  abonnementstype: SubscriptionType;
  analyses: string[];
  created_at: string;
  updated_at: string;
};

export const SESSION_STATUS = {
  NEW: "nieuw",
  RUNNING: "draait",
  COMPLETED: "completed",
  LEGACY_COMPLETED: "voltooid",
  FAILED: "fout",
} as const;

export type AnalysisSessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export function isSessionCompleted(status?: string): boolean {
  return status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.LEGACY_COMPLETED;
}

export function normalizeSessionStatus(status?: string): AnalysisSessionStatus {
  if (status === SESSION_STATUS.COMPLETED || status === SESSION_STATUS.LEGACY_COMPLETED) {
    return SESSION_STATUS.COMPLETED;
  }
  if (
    status === SESSION_STATUS.NEW ||
    status === SESSION_STATUS.RUNNING ||
    status === SESSION_STATUS.FAILED
  ) {
    return status;
  }
  return SESSION_STATUS.NEW;
}

export type StrategicReport = {
  report_id: string;
  session_id: string;
  organization_id: string;
  title: string;
  sections: string[];
  generated_at: string;
  report_body: string;
};

export type AnalysisSession = {
  session_id: string;
  organization_id: string;
  organization_name?: string;
  analyse_datum: string;
  input_data: string;
  board_report: string;
  status: AnalysisSessionStatus;
  analysis_type?: string;
  executive_summary?: string;
  board_memo?: string;
  strategic_metadata?: {
    sector: string;
    probleemtype: string;
    case_classification?: "CRISIS" | "STABLE" | "SUCCESS_MODEL" | "TRANSFORMATION";
    case_classification_reason?: string;
    strategic_mode?: "FIX" | "PROTECT" | "SCALE" | "TRANSFORM";
    dominant_system_mode?: "volumemodel" | "platformmodel" | "kennislicentiemodel" | "netwerkmodel" | "beleidsinvloedmodel";
    system_transformation?: {
      rationale: string;
      decision_power: string;
      payment_power: string;
      blocking_power: string;
      thesis: string;
    };
    system_actor_mapping?: Array<{
      actor: string;
      role: string;
      interest: string;
      influence: "laag" | "middel" | "hoog";
    }>;
    economic_engine?: {
      pressure: string;
      unit_economics: string;
      constraint: string;
    };
    power_structure?: {
      beslist: string;
      betaalt: string;
      blokkeert: string;
    };
    strategic_mechanisms?: {
      success: string;
      risk: string;
      scale: string;
      confidence: number;
    };
    strategic_pattern?: {
      pattern:
        | "professional_partnership"
        | "cooperatief_kennisbedrijf"
        | "platform_model"
        | "scale_model"
        | "network_model"
        | "ecosystem_strategy"
        | "mission_driven_organization"
        | "klassiek_organisatiemodel";
      rationale: string;
      confidence: number;
      primary_pattern?: string;
      secondary_pattern?: string;
      scale_mechanism?: string;
      typical_risks?: string[];
      growth_strategy?: string;
      strategic_interventions?: string[];
      boardroom_framing?: string;
    };
    strategic_flywheel?: {
      loop: string[];
      narrative: string;
      confidence: number;
    };
    strategy_simulation?: {
      simulation_context: {
        strategic_options: string[];
        core_mechanism: string;
        ecosystem_factors: string[];
        capacity_context: string;
      };
      strategic_scenarios: Array<{
        scenario: "A" | "B" | "C";
        strategy_type: "conservatief" | "expansief" | "hybride";
        description: string;
      }>;
      simulation_results: Array<{
        scenario: "A" | "B" | "C";
        capaciteit: string;
        financien: string;
        cultuur: string;
        netwerk: string;
      }>;
      scenario_risks: Array<{
        scenario: "A" | "B" | "C";
        risico: string;
        kans: "laag" | "middel" | "hoog";
        impact: "laag" | "middel" | "hoog";
      }>;
      strategy_comparison: string;
      decision_guidance: string;
      early_warning_signals: Array<{
        scenario: "A" | "B" | "C";
        indicator: string;
        kpi: string;
      }>;
      boardroom_visualization: string;
    };
    decision_memory?: {
      decision_record: {
        decision_id: string;
        organisatie: string;
        datum: string;
        gekozen_strategie: string;
        bestuurlijke_hypothese: string;
        kernconflict: string;
        interventies: string[];
        kpi_doelen: string[];
      };
      decision_context: {
        aannames: string[];
        risico_s: string[];
        strategische_reden: string;
      };
      decision_history: Array<{
        session_id: string;
        datum: string;
        gekozen_strategie: string;
        dominant_thesis: string;
      }>;
      decision_alignment: {
        status: "consistent" | "gedeeltelijk afwijkend" | "fundamenteel afwijkend";
        vorige_strategie: string;
        nieuwe_richting: string;
        board_vraag: string;
      };
      boardroom_alert: string;
    };
    early_warning_system?: {
      risk_signals: string[];
      warning_indicators: Array<{
        indicator: string;
        huidige_waarde: string;
        risico: string;
        actie: string;
      }>;
      risk_thresholds: Array<{
        kpi: string;
        norm: string;
        kritische_waarde: string;
      }>;
      boardroom_alert: string;
    };
    strategic_leverage_points?: Array<{
      title: string;
      leverage_type: "capaciteit" | "kennis" | "macht" | "netwerk" | "standaardisatie";
      mechanism: string;
      case_datapoint: string;
      intervention: string;
      target: string;
      impact: string;
    }>;
    strategic_hefbomen?: Array<{
      hefboom:
        | "marktuitbreiding"
        | "nieuwe segmenten"
        | "geografische expansie"
        | "prijsstrategie"
        | "volumegroei"
        | "productiviteit"
        | "automatisering"
        | "capaciteitsbenutting"
        | "procesoptimalisatie"
        | "supply chain"
        | "kostenstructuur"
        | "margeverbetering"
        | "kapitaalallocatie"
        | "investeringsdiscipline"
        | "schaalvoordelen"
        | "positionering"
        | "merkautoriteit"
        | "distributiemacht"
        | "ecosystemen"
        | "netwerkstrategieën"
        | "governance"
        | "leiderschap"
        | "cultuur"
        | "talentstrategie"
        | "incentive structuur"
        | "data-infrastructuur"
        | "besluitritme";
      mechanisme: string;
      risico: string;
      bestuurlijke_implicatie: string;
      score: number;
    }>;
    strategic_hefboom_combinatie?: {
      hefbomen: [string, string, string];
      strategisch_effect: string;
    };
    strategic_causal_analysis?: {
      items: Array<{
        hefboom: string;
        mechanisme: string;
        operationeel_effect: string;
        financieel_effect: string;
        strategisch_risico: string;
        bestuurlijke_implicatie: string;
      }>;
      graph: {
        nodes: Array<{
          id: string;
          type: "lever" | "effect" | "risk";
          label: string;
        }>;
        edges: Array<{
          source: string;
          target: string;
          relation: string;
        }>;
      };
      summary: string;
    };
    strategy_dna?: {
      archetype:
        | "professional partnership"
        | "scale operator"
        | "platform ecosystem"
        | "network orchestrator"
        | "innovation driven"
        | "mission institution"
        | "capital allocator"
        | "hybrid organization";
      kernmechanisme: string;
      groeimodel: string;
      strategisch_risico: string;
      strategievoorkeur: string;
    };
    strategic_scenarios?: Array<{
      scenario: "A" | "B" | "C";
      name: string;
      mechanism: string;
      operational_effect: string;
      financial_effect: string;
      strategic_risk: string;
      board_implication: string;
      risk_level: "laag" | "middel" | "hoog";
    }>;
    strategic_stress_tests?: Array<{
      scenario:
        | "economische recessie"
        | "personeelstekort"
        | "vraagshock"
        | "beleidswijziging"
        | "reputatiecrisis";
      effect: string;
      strategic_risk: string;
      board_implication: string;
    }>;
    strategic_thesis?: {
      board_question: string;
      dominant_thesis: string;
      killer_insight: string;
      decisions: string[];
    };
    mvp_engine?: {
      signalExtraction: {
        facts: string[];
        tensions: string[];
        patterns: string[];
        anomalies: string[];
      };
      strategicConflict: {
        conflict: string;
        sideA: string;
        sideB: string;
        mechanism: string;
        boardQuestion: string;
      };
      killerInsight: {
        insight: string;
        mechanism: string;
        implication: string;
      };
      interventionEngine: {
        interventions: Array<{
          title: string;
          leverage: "capaciteit" | "kennis" | "macht" | "netwerk" | "standaardisatie";
          action: string;
          goal: string;
          risk: string;
        }>;
      };
      boardMemo: {
        executiveSummary: string;
        bestuurlijkeHypothese: string;
        kernconflict: string;
        killerInsight: string;
        besluitopties: Array<{
          code: "A" | "B" | "C";
          label: string;
          mechanism: string;
          upside: string;
          downside: string;
        }>;
        interventions: Array<{
          title: string;
          leverage: "capaciteit" | "kennis" | "macht" | "netwerk" | "standaardisatie";
          action: string;
          goal: string;
          risk: string;
        }>;
        openQuestions: string[];
        memoText: string;
      };
    };
    boardroom_intervention_architecture_v3?: {
      name: string;
      layer_count: number;
      module_count: number;
      layers: Array<{
        id: string;
        label: string;
        modules: string[];
      }>;
      pipeline: string[];
    };
    boardroom_decision_engine_v3?: Record<string, unknown>;
    intervention_contract?: {
      version: string;
      mode: "maatwerk";
      requires_case_datapoint: boolean;
      requires_leverage_type: boolean;
      requires_measurable_target: boolean;
    };
    intervention_contract_prompt?: string;
    boardroom_conflict?: {
      statement: string;
      side_a: string;
      side_b: string;
      forcing_choice: string;
      explicit_loss: string;
    };
    mechanismen: string[];
    interventies: string[];
    strategische_opties: string[];
    gekozen_strategie: string;
  };
  strategic_agent?: {
    request_id: string;
    organisation_id: string;
    session_id: string;
    executed_at: string;
    pipeline: string[];
  };
  intervention_predictions?: Array<{
    interventie: string;
    impact: string;
    risico: string;
    kpi_effect: string;
    confidence: "laag" | "middel" | "hoog";
  }>;
  strategic_report?: StrategicReport;
  is_archived?: boolean;
  archived_at?: string;
  archive_reason?: string;
  quality_score?: number;
  quality_tier?: "premium" | "standard" | "low";
  quality_flags?: string[];
  analysis_runtime_ms?: number;
  engine_mode?: "local-deterministic" | "local-llm" | "api";
  error_message?: string;
  updated_at: string;
};

export type DeliveredReport = {
  session_id: string;
  filename: string;
  mime_type: string;
  content: string;
  generated_at: string;
};

export type AnonymizedStrategicRecord = {
  record_id: string;
  session_id: string;
  sector: string;
  probleemtype: string;
  mechanismen: string[];
  interventies: string[];
  strategische_opties: string[];
  gekozen_strategie: string;
  created_at: string;
};

export type StrategicCaseRecord = {
  case_id: string;
  organisation_name: string;
  sector: string;
  probleemtype: string;
  dominante_these: string;
  mechanismen: string[];
  strategische_opties: string[];
  gekozen_strategie: string;
  interventieplan: string;
  created_at: string;
};
