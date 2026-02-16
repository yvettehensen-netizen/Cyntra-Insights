export type AnalysisStatus = "pending" | "running" | "done" | "failed";

export interface AnalysisInputPayload {
  organization_name: string;
  description: string;
  context: Record<string, unknown>;
  uploads?: Array<{
    upload_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    extracted_text?: string | null;
  }>;
  requested_at: string;
}

export interface ScoreEntry {
  name: string;
  value: number;
  trend: "up" | "flat" | "down";
}

export interface AnalysisResultPayload {
  model: string;
  executive_summary: string;
  key_findings: string[];
  risks: string[];
  opportunities: string[];
  actions: string[];
  scores: ScoreEntry[];
  generated_at: string;
  raw_response?: unknown;
}

export interface AnalysisRow {
  id: string;
  organization_id: string;
  status: AnalysisStatus;
  input_payload: AnalysisInputPayload;
  result_payload: AnalysisResultPayload | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  analysis_id: string;
  organization_id: string;
  title: string;
  summary: string;
  html_content: string;
  pdf_path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisUploadRow {
  id: string;
  organization_id: string;
  analysis_id: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewAnalysisRequest {
  organizationId?: string;
  organization?: string;
  description: string;
  context?: Record<string, unknown>;
  uploadIds?: string[];
  runImmediately?: boolean;
}

export function normalizeAnalysisRow(input: any): AnalysisRow {
  return {
    id: String(input.id),
    organization_id: String(input.organization_id),
    status: input.status as AnalysisStatus,
    input_payload: input.input_payload as AnalysisInputPayload,
    result_payload: (input.result_payload as AnalysisResultPayload | null) ?? null,
    error_message: input.error_message ? String(input.error_message) : null,
    started_at: input.started_at ? String(input.started_at) : null,
    finished_at: input.finished_at ? String(input.finished_at) : null,
    created_at: String(input.created_at),
    updated_at: String(input.updated_at),
  };
}

export function normalizeReportRow(input: any): ReportRow {
  return {
    id: String(input.id),
    analysis_id: String(input.analysis_id),
    organization_id: String(input.organization_id),
    title: String(input.title),
    summary: String(input.summary),
    html_content: String(input.html_content),
    pdf_path: input.pdf_path ? String(input.pdf_path) : null,
    metadata: (input.metadata as Record<string, unknown>) ?? {},
    created_at: String(input.created_at),
    updated_at: String(input.updated_at),
  };
}

export function normalizeUploadRow(input: any): AnalysisUploadRow {
  return {
    id: String(input.id),
    organization_id: String(input.organization_id),
    analysis_id: input.analysis_id ? String(input.analysis_id) : null,
    file_name: String(input.file_name),
    mime_type: String(input.mime_type),
    size_bytes: Number(input.size_bytes),
    storage_path: String(input.storage_path),
    extracted_text:
      typeof input.extracted_text === "string" ? input.extracted_text : null,
    created_at: String(input.created_at),
    updated_at: String(input.updated_at),
  };
}
