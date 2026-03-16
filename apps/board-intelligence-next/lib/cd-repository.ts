import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  calculateDsiFromFactors,
  calculateDsiTrendFromDailyFactors,
  deriveFactorsFromReconstruction,
  estimateGovernanceDiscipline,
} from "@/lib/cd-formulas";
import type {
  AnalysisInputParameterRow,
  AnalysisRunDetail,
  AnalysisRunRow,
  AuditEntry,
  AuditLogDetailRow,
  AuditLogRow,
  DecisionCycleContextRow,
  DecisionCycleReconstruction,
  DecisionCycleRow,
  DecisionCycleSnapshotRow,
  DecisionCycleStakeholderRow,
  DecisionRecordRow,
  DsiResponse,
  GovernanceMetricObservationRow,
  InterventionEventRow,
  InterventionRow,
  ReportDocumentRow,
  CycleIssueRow,
} from "@/lib/cd-types";

type SupabaseJson = Record<string, unknown>;

function checksumFromObject(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function assertData<T>(data: T | null, error: { message?: string } | null, message: string): T {
  if (error || data == null) {
    throw new Error(`${message}${error?.message ? `: ${error.message}` : ""}`);
  }
  return data;
}

export async function listOrganizations(): Promise<Array<{ id: string; name: string }>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("organizations")
    .select("id,name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to list organizations: ${error.message}`);
  }

  return (data ?? []).map((entry) => ({
    id: String(entry.id),
    name: String(entry.name),
  }));
}

export async function listDecisionCycles(options: {
  organizationId: string;
  status?: string | null;
  limit?: number;
}): Promise<DecisionCycleRow[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .schema("cd")
    .from("decision_cycle")
    .select("*")
    .eq("organization_id", options.organizationId)
    .order("opened_at", { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list decision cycles: ${error.message}`);
  }

  return (data ?? []) as DecisionCycleRow[];
}

export async function createDecisionCycle(input: {
  organizationId: string;
  cycleKey: string;
  title: string;
  scope: string;
  priority?: number;
  targetDecisionAt?: string | null;
  createdBy: string;
  context?: {
    decisionDomain: string;
    businessUnit?: string | null;
    geography?: string | null;
    regulatoryRegime?: string | null;
    riskAppetiteScore?: number | null;
    materialityLevel?: number | null;
    baselineRevenueImpact?: number | null;
    baselineCostImpact?: number | null;
  };
}): Promise<DecisionCycleRow> {
  const supabase = getSupabaseAdmin();

  const { data: cycleData, error: cycleError } = await supabase
    .schema("cd")
    .from("decision_cycle")
    .insert({
      organization_id: input.organizationId,
      cycle_key: input.cycleKey,
      title: input.title,
      scope: input.scope,
      status: "draft",
      priority: input.priority ?? 3,
      target_decision_at: input.targetDecisionAt ?? null,
      created_by: input.createdBy,
      updated_by: input.createdBy,
    })
    .select("*")
    .single();

  const cycle = assertData<DecisionCycleRow>(
    cycleData as DecisionCycleRow | null,
    cycleError,
    "Failed to create decision cycle"
  );

  if (input.context) {
    const { error: contextError } = await supabase
      .schema("cd")
      .from("decision_cycle_context")
      .upsert({
        decision_cycle_id: cycle.id,
        organization_id: cycle.organization_id,
        decision_domain: input.context.decisionDomain,
        business_unit: input.context.businessUnit ?? null,
        geography: input.context.geography ?? null,
        regulatory_regime: input.context.regulatoryRegime ?? null,
        risk_appetite_score: input.context.riskAppetiteScore ?? null,
        materiality_level: input.context.materialityLevel ?? null,
        baseline_revenue_impact: input.context.baselineRevenueImpact ?? null,
        baseline_cost_impact: input.context.baselineCostImpact ?? null,
      });

    if (contextError) {
      throw new Error(`Decision cycle created but context upsert failed: ${contextError.message}`);
    }
  }

  return cycle;
}

export async function updateDecisionCycle(
  decisionCycleId: string,
  patch: Partial<{
    title: string;
    scope: string;
    priority: number;
    status: DecisionCycleRow["status"];
    target_decision_at: string | null;
    updated_by: string;
  }>
): Promise<DecisionCycleRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("decision_cycle")
    .update(patch)
    .eq("id", decisionCycleId)
    .select("*")
    .single();

  return assertData<DecisionCycleRow>(
    data as DecisionCycleRow | null,
    error,
    "Failed to update decision cycle"
  );
}

export async function getDecisionCycleDetail(decisionCycleId: string): Promise<{
  cycle: DecisionCycleRow;
  context: DecisionCycleContextRow | null;
  stakeholders: DecisionCycleStakeholderRow[];
}> {
  const supabase = getSupabaseAdmin();

  const [{ data: cycleData, error: cycleError }, { data: contextData, error: contextError }, { data: stakeholdersData, error: stakeholdersError }] =
    await Promise.all([
      supabase.schema("cd").from("decision_cycle").select("*").eq("id", decisionCycleId).single(),
      supabase
        .schema("cd")
        .from("decision_cycle_context")
        .select("*")
        .eq("decision_cycle_id", decisionCycleId)
        .maybeSingle(),
      supabase
        .schema("cd")
        .from("decision_cycle_stakeholder")
        .select("*")
        .eq("decision_cycle_id", decisionCycleId)
        .order("created_at", { ascending: true }),
    ]);

  const cycle = assertData<DecisionCycleRow>(
    cycleData as DecisionCycleRow | null,
    cycleError,
    "Decision cycle not found"
  );

  if (contextError) {
    throw new Error(`Failed to load cycle context: ${contextError.message}`);
  }

  if (stakeholdersError) {
    throw new Error(`Failed to load cycle stakeholders: ${stakeholdersError.message}`);
  }

  return {
    cycle,
    context: (contextData as DecisionCycleContextRow | null) ?? null,
    stakeholders: (stakeholdersData ?? []) as DecisionCycleStakeholderRow[],
  };
}

export async function listAnalysisRuns(decisionCycleId: string): Promise<AnalysisRunRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("analysis_run")
    .select("*")
    .eq("decision_cycle_id", decisionCycleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list analysis runs: ${error.message}`);
  }

  return (data ?? []) as AnalysisRunRow[];
}

export async function listAnalysisRunsByOrganization(options: {
  organizationId: string;
  status?: AnalysisRunRow["status"] | null;
  limit?: number;
}): Promise<AnalysisRunRow[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .schema("cd")
    .from("analysis_run")
    .select("*")
    .eq("organization_id", options.organizationId)
    .order("created_at", { ascending: false })
    .limit(options.limit ?? 200);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to list organization analysis runs: ${error.message}`);
  }

  return (data ?? []) as AnalysisRunRow[];
}

export async function createAnalysisRun(input: {
  decisionCycleId: string;
  organizationId: string;
  requestId?: string | null;
  idempotencyKey?: string | null;
  analysisKind: string;
  promptTemplate: string;
  promptVersion: string;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  temperature?: number;
  maxTokens?: number;
  inputParameters: Array<{
    parameterName: string;
    parameterType: "text" | "number" | "boolean" | "date" | "enum";
    ordinal?: number;
    unit?: string | null;
    textValue?: string | null;
    numericValue?: number | null;
    booleanValue?: boolean | null;
    dateValue?: string | null;
    enumValue?: string | null;
  }>;
  requestedBy: string;
}): Promise<AnalysisRunDetail> {
  const supabase = getSupabaseAdmin();

  const checksumPayload = input.inputParameters.map((entry) => ({
    name: entry.parameterName,
    type: entry.parameterType,
    ordinal: entry.ordinal ?? 0,
    text: entry.textValue ?? null,
    numeric: entry.numericValue ?? null,
    bool: entry.booleanValue ?? null,
    date: entry.dateValue ?? null,
    enum: entry.enumValue ?? null,
  }));

  const inputChecksum = checksumFromObject(checksumPayload);

  const { data: runData, error: runError } = await supabase
    .schema("cd")
    .from("analysis_run")
    .insert({
      organization_id: input.organizationId,
      decision_cycle_id: input.decisionCycleId,
      request_id: input.requestId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      analysis_kind: input.analysisKind,
      status: "pending",
      prompt_template: input.promptTemplate,
      prompt_version: input.promptVersion,
      model_provider: input.modelProvider,
      model_name: input.modelName,
      model_version: input.modelVersion,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens ?? 4000,
      input_checksum: inputChecksum,
      requested_by: input.requestedBy,
    })
    .select("*")
    .single();

  const run = assertData<AnalysisRunRow>(
    runData as AnalysisRunRow | null,
    runError,
    "Failed to create analysis run"
  );

  if (input.inputParameters.length) {
    const rows = input.inputParameters.map((entry) => ({
      analysis_run_id: run.id,
      parameter_name: entry.parameterName,
      parameter_type: entry.parameterType,
      ordinal: entry.ordinal ?? 0,
      unit: entry.unit ?? null,
      text_value: entry.textValue ?? null,
      numeric_value: entry.numericValue ?? null,
      boolean_value: entry.booleanValue ?? null,
      date_value: entry.dateValue ?? null,
      enum_value: entry.enumValue ?? null,
    }));

    const { error: inputError } = await supabase
      .schema("cd")
      .from("analysis_input_parameter")
      .insert(rows);

    if (inputError) {
      throw new Error(`Analysis run created but parameters insert failed: ${inputError.message}`);
    }
  }

  return {
    run,
    inputParameters: await getAnalysisInputParameters(run.id),
    findings: [],
    metrics: [],
  };
}

async function getAnalysisInputParameters(analysisRunId: string): Promise<AnalysisInputParameterRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("analysis_input_parameter")
    .select("*")
    .eq("analysis_run_id", analysisRunId)
    .order("ordinal", { ascending: true });

  if (error) {
    throw new Error(`Failed to load analysis parameters: ${error.message}`);
  }

  return (data ?? []) as AnalysisInputParameterRow[];
}

export async function getAnalysisRunDetail(analysisRunId: string): Promise<AnalysisRunDetail> {
  const supabase = getSupabaseAdmin();

  const [runQuery, inputQuery, findingsQuery, metricsQuery] = await Promise.all([
    supabase.schema("cd").from("analysis_run").select("*").eq("id", analysisRunId).single(),
    supabase
      .schema("cd")
      .from("analysis_input_parameter")
      .select("*")
      .eq("analysis_run_id", analysisRunId)
      .order("ordinal", { ascending: true }),
    supabase
      .schema("cd")
      .from("analysis_finding")
      .select("*")
      .eq("analysis_run_id", analysisRunId)
      .order("severity", { ascending: false }),
    supabase
      .schema("cd")
      .from("analysis_metric")
      .select("*")
      .eq("analysis_run_id", analysisRunId)
      .order("metric_code", { ascending: true }),
  ]);

  const run = assertData<AnalysisRunRow>(
    runQuery.data as AnalysisRunRow | null,
    runQuery.error,
    "Analysis run not found"
  );

  if (inputQuery.error) throw new Error(`Failed to load input parameters: ${inputQuery.error.message}`);
  if (findingsQuery.error) throw new Error(`Failed to load findings: ${findingsQuery.error.message}`);
  if (metricsQuery.error) throw new Error(`Failed to load metrics: ${metricsQuery.error.message}`);

  return {
    run,
    inputParameters: (inputQuery.data ?? []) as AnalysisInputParameterRow[],
    findings: (findingsQuery.data ?? []) as any,
    metrics: (metricsQuery.data ?? []) as any,
  };
}

export async function retryAnalysisRun(analysisRunId: string, actor: string): Promise<AnalysisRunRow> {
  const supabase = getSupabaseAdmin();

  const { data: currentData, error: currentError } = await supabase
    .schema("cd")
    .from("analysis_run")
    .select("*")
    .eq("id", analysisRunId)
    .single();

  const current = assertData<AnalysisRunRow>(
    currentData as AnalysisRunRow | null,
    currentError,
    "Analysis run not found"
  );

  if (!["failed", "cancelled"].includes(current.status)) {
    throw new Error("Only failed or cancelled analysis runs can be retried.");
  }

  const { data, error } = await supabase
    .schema("cd")
    .from("analysis_run")
    .update({
      status: "pending",
      error_code: null,
      error_message: null,
      started_at: null,
      finished_at: null,
      updated_at: new Date().toISOString(),
      requested_by: actor,
    })
    .eq("id", analysisRunId)
    .select("*")
    .single();

  return assertData<AnalysisRunRow>(
    data as AnalysisRunRow | null,
    error,
    "Failed to retry analysis run"
  );
}

export async function listDecisionRecords(decisionCycleId: string): Promise<DecisionRecordRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("decision_record")
    .select("*")
    .eq("decision_cycle_id", decisionCycleId)
    .order("approved_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list decision records: ${error.message}`);
  }

  return (data ?? []) as DecisionRecordRow[];
}

export async function createDecisionRecord(input: {
  decisionCycleId: string;
  organizationId: string;
  selectedAnalysisRunId?: string | null;
  decisionCode: string;
  decisionStatement: string;
  outcome: DecisionRecordRow["outcome"];
  rationale: string;
  approvedBy: string;
  approvedAt?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}): Promise<DecisionRecordRow> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .schema("cd")
    .from("decision_record")
    .insert({
      organization_id: input.organizationId,
      decision_cycle_id: input.decisionCycleId,
      selected_analysis_run_id: input.selectedAnalysisRunId ?? null,
      decision_code: input.decisionCode,
      decision_statement: input.decisionStatement,
      outcome: input.outcome,
      rationale: input.rationale,
      approved_by: input.approvedBy,
      approved_at: input.approvedAt ?? new Date().toISOString(),
      effective_from: input.effectiveFrom ?? null,
      effective_to: input.effectiveTo ?? null,
      created_by: input.approvedBy,
      updated_by: input.approvedBy,
    })
    .select("*")
    .single();

  const record = assertData<DecisionRecordRow>(
    data as DecisionRecordRow | null,
    error,
    "Failed to create decision record"
  );

  await supabase
    .schema("cd")
    .from("decision_cycle")
    .update({ status: "decision_registered", updated_by: input.approvedBy })
    .eq("id", input.decisionCycleId);

  return record;
}

export async function listInterventions(decisionCycleId: string): Promise<InterventionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention")
    .select("*")
    .eq("decision_cycle_id", decisionCycleId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list interventions: ${error.message}`);
  }

  return (data ?? []) as InterventionRow[];
}

export async function listInterventionsByOrganization(
  organizationId: string
): Promise<InterventionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(`Failed to list organization interventions: ${error.message}`);
  }

  return (data ?? []) as InterventionRow[];
}

export async function createIntervention(input: {
  decisionCycleId: string;
  organizationId: string;
  decisionRecordId?: string | null;
  interventionCode: string;
  name: string;
  ownerName: string;
  ownerRole?: string | null;
  status?: InterventionRow["status"];
  targetDate?: string | null;
  budgetAmount?: number;
  expectedImpactScore?: number | null;
  createdBy: string;
}): Promise<InterventionRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention")
    .insert({
      organization_id: input.organizationId,
      decision_cycle_id: input.decisionCycleId,
      decision_record_id: input.decisionRecordId ?? null,
      intervention_code: input.interventionCode,
      name: input.name,
      owner_name: input.ownerName,
      owner_role: input.ownerRole ?? null,
      status: input.status ?? "proposed",
      target_date: input.targetDate ?? null,
      budget_amount: input.budgetAmount ?? 0,
      expected_impact_score: input.expectedImpactScore ?? null,
      created_by: input.createdBy,
      updated_by: input.createdBy,
    })
    .select("*")
    .single();

  const intervention = assertData<InterventionRow>(
    data as InterventionRow | null,
    error,
    "Failed to create intervention"
  );

  await supabase
    .schema("cd")
    .from("decision_cycle")
    .update({ status: "intervention_active", updated_by: input.createdBy })
    .eq("id", input.decisionCycleId)
    .in("status", ["decision_registered", "intervention_active"]);

  return intervention;
}

export async function updateIntervention(
  interventionId: string,
  patch: Partial<{
    status: InterventionRow["status"];
    owner_name: string;
    owner_role: string | null;
    target_date: string | null;
    actual_impact_score: number | null;
    updated_by: string;
  }>
): Promise<InterventionRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention")
    .update(patch)
    .eq("id", interventionId)
    .select("*")
    .single();

  return assertData<InterventionRow>(
    data as InterventionRow | null,
    error,
    "Failed to update intervention"
  );
}

export async function listInterventionEvents(interventionId: string): Promise<InterventionEventRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention_event")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("performed_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list intervention events: ${error.message}`);
  }

  return (data ?? []) as InterventionEventRow[];
}

export async function appendInterventionEvent(input: {
  interventionId: string;
  eventType: string;
  oldStatus?: InterventionRow["status"] | null;
  newStatus?: InterventionRow["status"] | null;
  note?: string | null;
  performedBy: string;
}): Promise<InterventionEventRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("intervention_event")
    .insert({
      intervention_id: input.interventionId,
      event_type: input.eventType,
      old_status: input.oldStatus ?? null,
      new_status: input.newStatus ?? null,
      note: input.note ?? null,
      performed_by: input.performedBy,
      performed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  return assertData<InterventionEventRow>(
    data as InterventionEventRow | null,
    error,
    "Failed to append intervention event"
  );
}

export async function addGovernanceMetricObservation(input: {
  decisionCycleId: string;
  organizationId: string;
  metricCode: string;
  observedValue: number;
  observedAt?: string;
  sourceAnalysisRunId?: string | null;
  sourceSystem: string;
}): Promise<GovernanceMetricObservationRow> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .schema("cd")
    .from("governance_metric_observation")
    .insert({
      organization_id: input.organizationId,
      decision_cycle_id: input.decisionCycleId,
      metric_code: input.metricCode,
      observed_value: input.observedValue,
      observed_at: input.observedAt ?? new Date().toISOString(),
      source_analysis_run_id: input.sourceAnalysisRunId ?? null,
      source_system: input.sourceSystem,
    })
    .select("*")
    .single();

  return assertData<GovernanceMetricObservationRow>(
    data as GovernanceMetricObservationRow | null,
    error,
    "Failed to add governance metric observation"
  );
}

export async function listAuditTimeline(decisionCycleId: string, limit = 200): Promise<AuditEntry[]> {
  const supabase = getSupabaseAdmin();

  const { data: logsData, error: logsError } = await supabase
    .schema("cd")
    .from("audit_log")
    .select("*")
    .eq("decision_cycle_id", decisionCycleId)
    .order("id", { ascending: false })
    .limit(limit);

  if (logsError) {
    throw new Error(`Failed to load audit logs: ${logsError.message}`);
  }

  const logs = (logsData ?? []) as AuditLogRow[];
  if (!logs.length) return [];

  const ids = logs.map((entry) => entry.id);
  const { data: detailData, error: detailError } = await supabase
    .schema("cd")
    .from("audit_log_detail")
    .select("*")
    .in("audit_log_id", ids)
    .order("field_name", { ascending: true });

  if (detailError) {
    throw new Error(`Failed to load audit details: ${detailError.message}`);
  }

  const details = (detailData ?? []) as AuditLogDetailRow[];

  return logs.map((log) => ({
    log,
    details: details.filter((detail) => detail.audit_log_id === log.id),
  }));
}

export async function listAuditByOrganization(
  organizationId: string,
  limit = 300
): Promise<AuditEntry[]> {
  const supabase = getSupabaseAdmin();

  const { data: logsData, error: logsError } = await supabase
    .schema("cd")
    .from("audit_log")
    .select("*")
    .eq("organization_id", organizationId)
    .order("id", { ascending: false })
    .limit(limit);

  if (logsError) {
    throw new Error(`Failed to load organization audit logs: ${logsError.message}`);
  }

  const logs = (logsData ?? []) as AuditLogRow[];
  if (!logs.length) return [];

  const ids = logs.map((entry) => entry.id);
  const { data: detailData, error: detailError } = await supabase
    .schema("cd")
    .from("audit_log_detail")
    .select("*")
    .in("audit_log_id", ids)
    .order("field_name", { ascending: true });

  if (detailError) {
    throw new Error(`Failed to load organization audit details: ${detailError.message}`);
  }

  const details = (detailData ?? []) as AuditLogDetailRow[];

  return logs.map((log) => ({
    log,
    details: details.filter((detail) => detail.audit_log_id === log.id),
  }));
}

export async function appendAuditEvent(input: {
  organizationId: string;
  decisionCycleId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  actor: string;
  reason?: string | null;
  requestId?: string | null;
  details?: Array<{ fieldName: string; oldValue?: string | null; newValue?: string | null }>;
}): Promise<AuditEntry> {
  const supabase = getSupabaseAdmin();

  const { data: auditIdData, error: auditIdError } = await supabase
    .schema("cd")
    .rpc("write_audit_event", {
      p_organization_id: input.organizationId,
      p_decision_cycle_id: input.decisionCycleId ?? null,
      p_entity_type: input.entityType,
      p_entity_id: input.entityId ?? null,
      p_action: input.action,
      p_actor: input.actor,
      p_reason: input.reason ?? null,
      p_request_id: input.requestId ?? null,
    });

  if (auditIdError || typeof auditIdData !== "number") {
    throw new Error(`Failed to append audit event: ${auditIdError?.message ?? "invalid response"}`);
  }

  if (input.details?.length) {
    for (const detail of input.details) {
      const { error: detailError } = await supabase.schema("cd").rpc("write_audit_detail", {
        p_audit_log_id: auditIdData,
        p_field_name: detail.fieldName,
        p_old_value: detail.oldValue ?? null,
        p_new_value: detail.newValue ?? null,
      });

      if (detailError) {
        throw new Error(`Audit event added but detail failed: ${detailError.message}`);
      }
    }
  }

  const { data: logData, error: logError } = await supabase
    .schema("cd")
    .from("audit_log")
    .select("*")
    .eq("id", auditIdData)
    .single();

  const log = assertData<AuditLogRow>(
    logData as AuditLogRow | null,
    logError,
    "Failed to fetch newly created audit event"
  );

  const { data: detailsData, error: detailsError } = await supabase
    .schema("cd")
    .from("audit_log_detail")
    .select("*")
    .eq("audit_log_id", auditIdData)
    .order("field_name", { ascending: true });

  if (detailsError) {
    throw new Error(`Failed to fetch audit details: ${detailsError.message}`);
  }

  return {
    log,
    details: (detailsData ?? []) as AuditLogDetailRow[],
  };
}

export async function listReports(decisionCycleId: string): Promise<ReportDocumentRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("report_document")
    .select("*")
    .eq("decision_cycle_id", decisionCycleId)
    .order("version_no", { ascending: false });

  if (error) {
    throw new Error(`Failed to list reports: ${error.message}`);
  }

  return (data ?? []) as ReportDocumentRow[];
}

export async function listReportsByOrganization(
  organizationId: string
): Promise<ReportDocumentRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("report_document")
    .select("*")
    .eq("organization_id", organizationId)
    .order("generated_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(`Failed to list organization reports: ${error.message}`);
  }

  return (data ?? []) as ReportDocumentRow[];
}

export async function getDecisionCycleReconstruction(
  decisionCycleId: string
): Promise<DecisionCycleReconstruction> {
  const supabase = getSupabaseAdmin();

  const [
    cycleResult,
    contextResult,
    stakeholderResult,
    analysisRunsResult,
    decisionsResult,
    interventionsResult,
    issuesResult,
    metricsResult,
    snapshotResult,
    reportsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase.schema("cd").from("decision_cycle").select("*").eq("id", decisionCycleId).single(),
    supabase
      .schema("cd")
      .from("decision_cycle_context")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .maybeSingle(),
    supabase
      .schema("cd")
      .from("decision_cycle_stakeholder")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("created_at", { ascending: true }),
    supabase
      .schema("cd")
      .from("analysis_run")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("created_at", { ascending: false }),
    supabase
      .schema("cd")
      .from("decision_record")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("approved_at", { ascending: false }),
    supabase
      .schema("cd")
      .from("intervention")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("created_at", { ascending: false }),
    supabase
      .schema("cd")
      .from("cycle_issue")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("updated_at", { ascending: false }),
    supabase
      .schema("cd")
      .from("governance_metric_observation")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("observed_at", { ascending: false })
      .limit(500),
    supabase
      .schema("cd")
      .from("decision_cycle_snapshot")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("version_no", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .schema("cd")
      .from("report_document")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("version_no", { ascending: false }),
    supabase
      .schema("cd")
      .from("audit_log")
      .select("*")
      .eq("decision_cycle_id", decisionCycleId)
      .order("id", { ascending: false })
      .limit(500),
  ]);

  const cycle = assertData<DecisionCycleRow>(
    cycleResult.data as DecisionCycleRow | null,
    cycleResult.error,
    "Decision cycle not found"
  );

  if (contextResult.error) throw new Error(`Failed to load cycle context: ${contextResult.error.message}`);
  if (stakeholderResult.error) throw new Error(`Failed to load stakeholders: ${stakeholderResult.error.message}`);
  if (analysisRunsResult.error) throw new Error(`Failed to load analysis runs: ${analysisRunsResult.error.message}`);
  if (decisionsResult.error) throw new Error(`Failed to load decisions: ${decisionsResult.error.message}`);
  if (interventionsResult.error) throw new Error(`Failed to load interventions: ${interventionsResult.error.message}`);
  if (issuesResult.error) throw new Error(`Failed to load issues: ${issuesResult.error.message}`);
  if (metricsResult.error) throw new Error(`Failed to load governance metrics: ${metricsResult.error.message}`);
  if (snapshotResult.error) throw new Error(`Failed to load latest snapshot: ${snapshotResult.error.message}`);
  if (reportsResult.error) throw new Error(`Failed to load reports: ${reportsResult.error.message}`);
  if (auditLogsResult.error) throw new Error(`Failed to load audit logs: ${auditLogsResult.error.message}`);

  const analysisRuns = (analysisRunsResult.data ?? []) as AnalysisRunRow[];
  const analysisIds = analysisRuns.map((entry) => entry.id);

  let paramsByAnalysis = new Map<string, AnalysisInputParameterRow[]>();
  let findingsByAnalysis = new Map<string, any[]>();
  let metricsByAnalysis = new Map<string, any[]>();

  if (analysisIds.length) {
    const [paramsResult, findingsResult, analysisMetricsResult] = await Promise.all([
      supabase
        .schema("cd")
        .from("analysis_input_parameter")
        .select("*")
        .in("analysis_run_id", analysisIds)
        .order("ordinal", { ascending: true }),
      supabase
        .schema("cd")
        .from("analysis_finding")
        .select("*")
        .in("analysis_run_id", analysisIds)
        .order("severity", { ascending: false }),
      supabase
        .schema("cd")
        .from("analysis_metric")
        .select("*")
        .in("analysis_run_id", analysisIds)
        .order("metric_code", { ascending: true }),
    ]);

    if (paramsResult.error) throw new Error(`Failed to load analysis parameters: ${paramsResult.error.message}`);
    if (findingsResult.error) throw new Error(`Failed to load findings: ${findingsResult.error.message}`);
    if (analysisMetricsResult.error) throw new Error(`Failed to load analysis metrics: ${analysisMetricsResult.error.message}`);

    for (const row of (paramsResult.data ?? []) as AnalysisInputParameterRow[]) {
      if (!paramsByAnalysis.has(row.analysis_run_id)) paramsByAnalysis.set(row.analysis_run_id, []);
      paramsByAnalysis.get(row.analysis_run_id)!.push(row);
    }

    for (const row of (findingsResult.data ?? []) as any[]) {
      if (!findingsByAnalysis.has(row.analysis_run_id)) findingsByAnalysis.set(row.analysis_run_id, []);
      findingsByAnalysis.get(row.analysis_run_id)!.push(row);
    }

    for (const row of (analysisMetricsResult.data ?? []) as any[]) {
      if (!metricsByAnalysis.has(row.analysis_run_id)) metricsByAnalysis.set(row.analysis_run_id, []);
      metricsByAnalysis.get(row.analysis_run_id)!.push(row);
    }
  }

  const auditLogs = (auditLogsResult.data ?? []) as AuditLogRow[];
  const auditLogIds = auditLogs.map((entry) => entry.id);

  let auditEntries: AuditEntry[] = [];
  if (auditLogIds.length) {
    const { data: detailData, error: detailError } = await supabase
      .schema("cd")
      .from("audit_log_detail")
      .select("*")
      .in("audit_log_id", auditLogIds)
      .order("field_name", { ascending: true });

    if (detailError) throw new Error(`Failed to load audit log details: ${detailError.message}`);

    const grouped = new Map<number, AuditLogDetailRow[]>();
    for (const row of (detailData ?? []) as AuditLogDetailRow[]) {
      if (!grouped.has(row.audit_log_id)) grouped.set(row.audit_log_id, []);
      grouped.get(row.audit_log_id)!.push(row);
    }

    auditEntries = auditLogs.map((log) => ({
      log,
      details: grouped.get(log.id) ?? [],
    }));
  }

  return {
    cycle,
    context: (contextResult.data as DecisionCycleContextRow | null) ?? null,
    stakeholders: (stakeholderResult.data ?? []) as DecisionCycleStakeholderRow[],
    analyses: analysisRuns.map((run) => ({
      run,
      inputParameters: paramsByAnalysis.get(run.id) ?? [],
      findings: findingsByAnalysis.get(run.id) ?? [],
      metrics: metricsByAnalysis.get(run.id) ?? [],
    })),
    decisions: (decisionsResult.data ?? []) as DecisionRecordRow[],
    interventions: (interventionsResult.data ?? []) as InterventionRow[],
    issues: (issuesResult.data ?? []) as CycleIssueRow[],
    governanceMetrics: (metricsResult.data ?? []) as GovernanceMetricObservationRow[],
    latestSnapshot: (snapshotResult.data as DecisionCycleSnapshotRow | null) ?? null,
    reports: (reportsResult.data ?? []) as ReportDocumentRow[],
    audit: auditEntries,
  };
}

export async function getDsiResponse(decisionCycleId: string): Promise<DsiResponse> {
  const reconstruction = await getDecisionCycleReconstruction(decisionCycleId);
  const factors = deriveFactorsFromReconstruction(reconstruction);
  factors.governance_discipline = estimateGovernanceDiscipline(reconstruction.governanceMetrics);

  const dsiScore = calculateDsiFromFactors(factors);
  const trend90d = await getDsiTrend(decisionCycleId);

  return {
    decisionCycleId,
    snapshotVersion: reconstruction.latestSnapshot?.version_no ?? null,
    dsiScore,
    factors,
    trend90d,
    capturedAt: new Date().toISOString(),
  };
}

export async function getDsiTrend(decisionCycleId: string): Promise<DsiResponse["trend90d"]> {
  const supabase = getSupabaseAdmin();

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: metricsData, error: metricsError } = await supabase
    .schema("cd")
    .from("governance_metric_observation")
    .select("metric_code,observed_value,observed_at")
    .eq("decision_cycle_id", decisionCycleId)
    .gte("observed_at", ninetyDaysAgo)
    .order("observed_at", { ascending: true });

  if (metricsError) {
    throw new Error(`Failed to fetch DSI trend metrics: ${metricsError.message}`);
  }

  const { data: issueData, error: issueError } = await supabase
    .schema("cd")
    .from("cycle_issue")
    .select("issue_type,issue_status,updated_at")
    .eq("decision_cycle_id", decisionCycleId)
    .gte("updated_at", ninetyDaysAgo)
    .order("updated_at", { ascending: true });

  if (issueError) {
    throw new Error(`Failed to fetch DSI trend issues: ${issueError.message}`);
  }

  const { data: interventionData, error: interventionError } = await supabase
    .schema("cd")
    .from("intervention")
    .select("status,created_at,completed_at")
    .eq("decision_cycle_id", decisionCycleId)
    .order("created_at", { ascending: true });

  if (interventionError) {
    throw new Error(`Failed to fetch DSI trend interventions: ${interventionError.message}`);
  }

  const { data: cycleData, error: cycleError } = await supabase
    .schema("cd")
    .from("decision_cycle")
    .select("opened_at")
    .eq("id", decisionCycleId)
    .single();

  if (cycleError || !cycleData) {
    throw new Error(`Failed to fetch cycle timestamps: ${cycleError?.message ?? "not found"}`);
  }

  const openedAt = new Date(cycleData.opened_at as string);

  const metrics = (metricsData ?? []) as Array<{
    metric_code: string;
    observed_value: number;
    observed_at: string;
  }>;

  const issues = (issueData ?? []) as Array<{
    issue_type: string;
    issue_status: string;
    updated_at: string;
  }>;

  const interventions = (interventionData ?? []) as Array<{
    status: string;
    created_at: string;
    completed_at: string | null;
  }>;

  const byDate = new Map<string, {
    conflict_count: number;
    execution_speed: number[];
    governance_discipline: number[];
    repair_attempts: number[];
    gate_score: number[];
  }>();

  const asDate = (ts: string): string => ts.slice(0, 10);

  for (const row of metrics) {
    const key = asDate(row.observed_at);
    if (!byDate.has(key)) {
      byDate.set(key, {
        conflict_count: 0,
        execution_speed: [],
        governance_discipline: [],
        repair_attempts: [],
        gate_score: [],
      });
    }

    const entry = byDate.get(key)!;

    if (row.metric_code === "decision_velocity") {
      entry.execution_speed.push(Number(row.observed_value));
    }

    if (row.metric_code === "stakeholder_alignment") {
      entry.governance_discipline.push(Number(row.observed_value));
    }

    if (row.metric_code === "repair_attempts") {
      entry.repair_attempts.push(Number(row.observed_value));
    }

    if (row.metric_code === "gate_score") {
      entry.gate_score.push(Number(row.observed_value));
    }
  }

  for (const issue of issues) {
    if (issue.issue_type !== "conflict" || issue.issue_status === "resolved") continue;
    const key = asDate(issue.updated_at);
    if (!byDate.has(key)) {
      byDate.set(key, {
        conflict_count: 0,
        execution_speed: [],
        governance_discipline: [],
        repair_attempts: [],
        gate_score: [],
      });
    }
    byDate.get(key)!.conflict_count += 1;
  }

  const days: string[] = [];
  for (let i = 89; i >= 0; i -= 1) {
    const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    days.push(day);
    if (!byDate.has(day)) {
      byDate.set(day, {
        conflict_count: 0,
        execution_speed: [],
        governance_discipline: [],
        repair_attempts: [],
        gate_score: [],
      });
    }
  }

  const trendRows = days.map((date) => {
    const metricBucket = byDate.get(date)!;

    const executionSpeed = metricBucket.execution_speed.length
      ? metricBucket.execution_speed.reduce((sum, v) => sum + v, 0) / metricBucket.execution_speed.length
      : 0;

    const governanceRaw = metricBucket.governance_discipline.length
      ? metricBucket.governance_discipline.reduce((sum, v) => sum + v, 0) /
        metricBucket.governance_discipline.length
      : metricBucket.gate_score.length
      ? metricBucket.gate_score.reduce((sum, v) => sum + v, 0) / metricBucket.gate_score.length
      : 0;

    const repair = metricBucket.repair_attempts.length
      ? metricBucket.repair_attempts.reduce((sum, v) => sum + v, 0) / metricBucket.repair_attempts.length
      : 0;

    const governanceDiscipline = Math.max(0, Math.min(100, governanceRaw - repair * 6));

    const dateEnd = new Date(`${date}T23:59:59.999Z`);
    const interventionsToDate = interventions.filter(
      (row) => new Date(row.created_at).getTime() <= dateEnd.getTime()
    );

    const completedToDate = interventionsToDate.filter((row) => {
      if (!row.completed_at) return false;
      return new Date(row.completed_at).getTime() <= dateEnd.getTime();
    });

    const completionRate = interventionsToDate.length
      ? (completedToDate.length / interventionsToDate.length) * 100
      : 0;

    const latencyHours = Math.max(0, (dateEnd.getTime() - openedAt.getTime()) / (1000 * 60 * 60));

    return {
      date,
      conflict_count: metricBucket.conflict_count,
      execution_speed: executionSpeed,
      intervention_completion_rate: completionRate,
      decision_latency: latencyHours,
      governance_discipline: governanceDiscipline,
    };
  });

  return calculateDsiTrendFromDailyFactors(trendRows);
}

export async function getGovernanceOverviewByOrganization(organizationId: string): Promise<
  Array<{
    decision_cycle_id: string;
    cycle_key: string;
    title: string;
    status: string;
    dsi_score: number | null;
    risk_index: number | null;
    execution_index: number | null;
    compliance_index: number | null;
    captured_at: string | null;
  }>
> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .schema("cd")
    .from("v_decision_cycle_overview")
    .select(
      "decision_cycle_id,cycle_key,title,status,dsi_score,dsi_captured_at"
    )
    .eq("organization_id", organizationId)
    .order("opened_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Failed to load governance overview: ${error.message}`);
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((entry) => ({
    decision_cycle_id: String(entry.decision_cycle_id),
    cycle_key: String(entry.cycle_key),
    title: String(entry.title),
    status: String(entry.status),
    dsi_score: entry.dsi_score == null ? null : Number(entry.dsi_score),
    risk_index: null,
    execution_index: null,
    compliance_index: null,
    captured_at: entry.dsi_captured_at == null ? null : String(entry.dsi_captured_at),
  }));
}
