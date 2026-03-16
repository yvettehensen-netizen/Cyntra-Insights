import type { SubscriptionType } from "@/platform";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error || `API fout (${response.status})`);
  }
  return json.data;
}

export const platformApiClient = {
  health: () => apiFetch<{ status: string; service: string }>("/api/platform/health"),

  listOrganizations: () => apiFetch<any[]>("/api/platform/organizations"),
  upsertOrganization: (payload: {
    organization_id?: string;
    organisatie_naam: string;
    sector: string;
    organisatie_grootte: string;
    abonnementstype: SubscriptionType;
  }) => apiFetch<any>("/api/platform/organizations", { method: "POST", body: JSON.stringify(payload) }),

  listSessions: (organization_id?: string) => {
    const q = organization_id ? `?organization_id=${encodeURIComponent(organization_id)}` : "";
    return apiFetch<any[]>(`/api/platform/sessions${q}`);
  },
  getSession: (sessionId: string) => apiFetch<any>(`/api/platform/sessions/${encodeURIComponent(sessionId)}`),
  startSession: (payload: { organization_id: string; input_data: string; analysis_type?: string }) =>
    apiFetch<any>("/api/platform/sessions/start", { method: "POST", body: JSON.stringify(payload) }),

  executiveSummary: (sessionId: string) =>
    apiFetch<any>(`/api/platform/reports/${encodeURIComponent(sessionId)}/executive-summary`),
  boardMemo: (sessionId: string) =>
    apiFetch<any>(`/api/platform/reports/${encodeURIComponent(sessionId)}/board-memo`),
  pdf: (sessionId: string) => apiFetch<any>(`/api/platform/reports/${encodeURIComponent(sessionId)}/pdf`),

  discovery: (payload: { sector: string; zoekterm: string }) =>
    apiFetch<any[]>(
      `/api/platform/discovery?sector=${encodeURIComponent(payload.sector)}&zoekterm=${encodeURIComponent(payload.zoekterm)}`
    ),

  scanAnalyze: (payload: {
    organisation_name: string;
    sector: string;
    organisatie_grootte?: string;
    abonnementstype?: SubscriptionType;
  }) => apiFetch<any>("/api/platform/scanner/analyze", { method: "POST", body: JSON.stringify(payload) }),

  datasetRecords: () => apiFetch<any[]>("/api/platform/dataset/records"),
  interventions: () => apiFetch<any[]>("/api/platform/interventions"),
  cases: () => apiFetch<any[]>("/api/platform/cases"),
  datasetBenchmark: (sector: string) =>
    apiFetch<any>(`/api/platform/dataset/benchmark?sector=${encodeURIComponent(sector)}`),
  signalen: () => apiFetch<any[]>("/api/platform/signalen"),
  decisionMemory: (organization_id?: string) => {
    const q = organization_id ? `?organization_id=${encodeURIComponent(organization_id)}` : "";
    return apiFetch<any[]>(`/api/platform/decision-memory${q}`);
  },
  earlyWarnings: (organization_id?: string) => {
    const q = organization_id ? `?organization_id=${encodeURIComponent(organization_id)}` : "";
    return apiFetch<any[]>(`/api/platform/early-warnings${q}`);
  },

  exportReport: (params?: { format?: "pdf" | "json" | "csv"; session_id?: string; resource?: "analysis" | "report" }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.session_id) query.set("session_id", params.session_id);
    if (params?.resource) query.set("resource", params.resource);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/report${suffix}`);
  },
  exportInterventions: (params?: { format?: "pdf" | "json" | "csv"; source_case_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.source_case_id) query.set("source_case_id", params.source_case_id);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/interventions${suffix}`);
  },
  exportDataset: (params?: { format?: "pdf" | "json" | "csv"; resource?: "dataset" | "sector-patterns" }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.resource) query.set("resource", params.resource);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/dataset${suffix}`);
  },
  exportCases: (params?: { format?: "pdf" | "json" | "csv" }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/cases${suffix}`);
  },
  exportBenchmark: (params?: { format?: "pdf" | "json" | "csv"; sector?: string }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.sector) query.set("sector", params.sector);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/benchmark${suffix}`);
  },
  exportDecisionMemory: (params?: { format?: "pdf" | "json" | "csv"; organization_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.organization_id) query.set("organization_id", params.organization_id);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/decision-memory${suffix}`);
  },
  exportEarlyWarnings: (params?: { format?: "pdf" | "json" | "csv"; organization_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.format) query.set("format", params.format);
    if (params?.organization_id) query.set("organization_id", params.organization_id);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return fetch(`/api/export/early-warnings${suffix}`);
  },
};
