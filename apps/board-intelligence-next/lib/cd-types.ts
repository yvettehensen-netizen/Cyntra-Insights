export type DecisionCycleStatus =
  | "draft"
  | "pending_analysis"
  | "running_analysis"
  | "decision_pending"
  | "decision_registered"
  | "intervention_active"
  | "closed"
  | "cancelled"
  | "failed";

export type AnalysisRunStatus = "pending" | "running" | "done" | "failed" | "cancelled";

export type DecisionOutcome = "approved" | "rejected" | "deferred" | "conditional";

export type InterventionStatus =
  | "proposed"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";

export interface DecisionCycleRow {
  id: string;
  organization_id: string;
  cycle_key: string;
  title: string;
  scope: string;
  status: DecisionCycleStatus;
  priority: number;
  opened_at: string;
  target_decision_at: string | null;
  closed_at: string | null;
  current_snapshot_version: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionCycleContextRow {
  id: string;
  decision_cycle_id: string;
  organization_id: string;
  decision_domain: string;
  business_unit: string | null;
  geography: string | null;
  regulatory_regime: string | null;
  risk_appetite_score: number | null;
  materiality_level: number | null;
  baseline_revenue_impact: number | null;
  baseline_cost_impact: number | null;
  created_at: string;
  updated_at: string;
}

export interface DecisionCycleStakeholderRow {
  id: string;
  decision_cycle_id: string;
  organization_id: string;
  stakeholder_type: string;
  name: string;
  role: string;
  email: string | null;
  accountability_area: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRunRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  request_id: string | null;
  idempotency_key: string | null;
  analysis_kind: string;
  status: AnalysisRunStatus;
  prompt_template: string;
  prompt_version: string;
  model_provider: string;
  model_name: string;
  model_version: string;
  temperature: number;
  max_tokens: number;
  input_checksum: string;
  output_checksum: string | null;
  started_at: string | null;
  finished_at: string | null;
  error_code: string | null;
  error_message: string | null;
  requested_by: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisInputParameterRow {
  id: number;
  analysis_run_id: string;
  parameter_name: string;
  parameter_type: "text" | "number" | "boolean" | "date" | "enum";
  ordinal: number;
  unit: string | null;
  text_value: string | null;
  numeric_value: number | null;
  boolean_value: boolean | null;
  date_value: string | null;
  enum_value: string | null;
  created_at: string;
}

export interface AnalysisFindingRow {
  id: string;
  analysis_run_id: string;
  finding_code: string;
  pillar: string;
  severity: number;
  confidence: number;
  narrative: string;
  evidence_ref: string | null;
  created_at: string;
}

export interface AnalysisMetricRow {
  id: string;
  analysis_run_id: string;
  metric_code: string;
  metric_value: number;
  metric_unit: string | null;
  trend_value: number | null;
  created_at: string;
}

export interface DecisionRecordRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  selected_analysis_run_id: string | null;
  decision_code: string;
  decision_statement: string;
  outcome: DecisionOutcome;
  rationale: string;
  approved_by: string;
  approved_at: string;
  effective_from: string | null;
  effective_to: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface InterventionRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  decision_record_id: string | null;
  intervention_code: string;
  name: string;
  owner_name: string;
  owner_role: string | null;
  status: InterventionStatus;
  target_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  budget_amount: number;
  expected_impact_score: number | null;
  actual_impact_score: number | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface InterventionEventRow {
  id: number;
  intervention_id: string;
  event_type: string;
  old_status: InterventionStatus | null;
  new_status: InterventionStatus | null;
  note: string | null;
  performed_by: string;
  performed_at: string;
  created_at: string;
}

export interface CycleIssueRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  issue_type: string;
  issue_code: string;
  description: string;
  severity: number;
  issue_status: string;
  recurrence_count: number;
  unresolved_count: number;
  first_seen: string | null;
  last_seen: string | null;
  owner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface GovernanceMetricObservationRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  metric_code: string;
  observed_value: number;
  observed_at: string;
  source_analysis_run_id: string | null;
  source_system: string;
  created_at: string;
}

export interface DecisionCycleSnapshotRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  version_no: number;
  snapshot_type: string;
  snapshot_reason: string;
  cycle_status: DecisionCycleStatus;
  latest_analysis_status: AnalysisRunStatus | null;
  decision_outcome: DecisionOutcome | null;
  dsi_score: number;
  risk_index: number | null;
  execution_index: number | null;
  compliance_index: number | null;
  total_interventions: number;
  open_interventions: number;
  captured_by: string;
  captured_at: string;
  snapshot_hash: string;
  created_at: string;
}

export interface AuditLogRow {
  id: number;
  organization_id: string;
  decision_cycle_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  actor: string;
  reason: string | null;
  request_id: string | null;
  happened_at: string;
  prev_event_hash: string | null;
  event_hash: string;
  created_at: string;
}

export interface AuditLogDetailRow {
  audit_log_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface ReportDocumentRow {
  id: string;
  organization_id: string;
  decision_cycle_id: string;
  analysis_run_id: string | null;
  report_type: string;
  report_format: "html" | "pdf" | "markdown";
  title: string;
  version_no: number;
  is_current: boolean;
  html_content: string | null;
  storage_path: string | null;
  checksum_sha256: string;
  generated_by: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  log: AuditLogRow;
  details: AuditLogDetailRow[];
}

export interface AnalysisRunDetail {
  run: AnalysisRunRow;
  inputParameters: AnalysisInputParameterRow[];
  findings: AnalysisFindingRow[];
  metrics: AnalysisMetricRow[];
}

export interface DecisionCycleReconstruction {
  cycle: DecisionCycleRow;
  context: DecisionCycleContextRow | null;
  stakeholders: DecisionCycleStakeholderRow[];
  analyses: AnalysisRunDetail[];
  decisions: DecisionRecordRow[];
  interventions: InterventionRow[];
  issues: CycleIssueRow[];
  governanceMetrics: GovernanceMetricObservationRow[];
  latestSnapshot: DecisionCycleSnapshotRow | null;
  reports: ReportDocumentRow[];
  audit: AuditEntry[];
}

export interface DsiFactors {
  conflict_count: number;
  execution_speed: number;
  intervention_completion_rate: number;
  decision_latency: number;
  governance_discipline: number;
}

export interface DsiPoint {
  date: string;
  dsi: number;
  conflict_count: number;
  execution_speed: number;
  intervention_completion_rate: number;
  decision_latency: number;
  governance_discipline: number;
}

export interface DsiResponse {
  decisionCycleId: string;
  snapshotVersion: number | null;
  dsiScore: number;
  factors: DsiFactors;
  trend90d: DsiPoint[];
  capturedAt: string;
}
