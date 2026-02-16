export type AnalysisUpload = {
  id: string;
  analysis_id?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  storage_path?: string | null;
  extracted_text?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export type AnalysisRecord = {
  id: string;
  status?: string | null;
  analysis_type?: string | null;
  organization_id?: string | null;
  input_payload?: Record<string, unknown> | null;
  result_payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  error_message?: string | null;
  created_at?: string | null;
  finished_at?: string | null;
  [key: string]: unknown;
};

export type ReportRecord = {
  id?: string;
  analysis_id?: string;
  title?: string;
  summary?: string;
  html_content?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type CreateAnalysisRequest = {
  organizationId?: string;
  organization?: string;
  description: string;
  context?: Record<string, unknown>;
  uploadIds?: string[];
  runImmediately?: boolean;
};

type CreateAnalysisResponse = {
  analysis: AnalysisRecord;
  report?: ReportRecord | null;
  persistence?: string;
  warning?: string | null;
};

type AnalysisDetailsResponse = {
  analysis: AnalysisRecord;
  report?: ReportRecord | null;
};

type ReportResponse = {
  report: ReportRecord;
};

function normalizeErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const err = (body as Record<string, unknown>).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    throw new Error(normalizeErrorMessage(parsed, fallbackMessage));
  }

  return parsed as T;
}

export async function createAnalysis(
  payload: CreateAnalysisRequest
): Promise<CreateAnalysisResponse> {
  const response = await fetch("/api/analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      runImmediately: payload.runImmediately ?? true,
    }),
  });

  return readJsonResponse<CreateAnalysisResponse>(response, "Analyse starten mislukt");
}

export async function getAnalysisDetails(analysisId: string): Promise<AnalysisDetailsResponse> {
  const response = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return readJsonResponse<AnalysisDetailsResponse>(response, "Analyse ophalen mislukt");
}

export async function getReportByAnalysisId(analysisId: string): Promise<ReportResponse> {
  const response = await fetch(`/api/reports/${encodeURIComponent(analysisId)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return readJsonResponse<ReportResponse>(response, "Rapport ophalen mislukt");
}

export function getReportPdfUrl(analysisId: string): string {
  return `/api/reports/pdf?analysisId=${encodeURIComponent(analysisId)}`;
}

export async function uploadAnalysisFile(args: {
  file: File;
  organizationId?: string;
  organization?: string;
}): Promise<{ upload: AnalysisUpload }> {
  const formData = new FormData();
  formData.append("file", args.file);
  if (args.organizationId) formData.append("organizationId", args.organizationId);
  if (args.organization) formData.append("organization", args.organization);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  return readJsonResponse<{ upload: AnalysisUpload }>(response, "Upload mislukt");
}

