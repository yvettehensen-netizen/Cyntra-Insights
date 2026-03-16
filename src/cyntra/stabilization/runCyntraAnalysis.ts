import { DecisionInfrastructureError, sha256, stableSerialize } from "./decisionInfrastructure";

export const MAX_REPAIR_ATTEMPTS = 0;

type CanonicalRunOptions = {
  accessToken?: string;
};

type CanonicalResponse = {
  success?: boolean;
  report?: unknown;
  [key: string]: unknown;
};

function resolveFunctionsBaseUrl(): string {
  const direct = String(import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || "").trim();
  if (direct) return direct.replace(/\/+$/, "");

  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
  if (supabaseUrl) return `${supabaseUrl.replace(/\/+$/, "")}/functions/v1`;

  throw new DecisionInfrastructureError("VITE_SUPABASE_FUNCTIONS_URL ontbreekt");
}

function buildLegacyReportEnvelope(source: any) {
  const report =
    source?.report ||
    source?.data?.report ||
    source?.result?.report ||
    source?.analysis?.report ||
    source?.payload?.report ||
    source;

  return {
    id: report?.id || crypto.randomUUID(),
    title: report?.title || "Cyntra rapport",
    summary: report?.summary || report?.executive_summary || "",
    content: report?.content || report?.narrative || "",
    sections: Array.isArray(report?.sections) ? report.sections : [],
    raw: report,
  };
}

export function adaptCanonicalToLegacyResponse(canonical: CanonicalResponse) {
  return {
    success: canonical?.success !== false,
    report: buildLegacyReportEnvelope(canonical),
    raw: canonical,
  };
}

export async function runCyntraAnalysis(payload: Record<string, unknown>, options: CanonicalRunOptions = {}) {
  const url = `${resolveFunctionsBaseUrl()}/aurelius-analyze`;
  const serializedPayload = stableSerialize(payload);
  const payload_hash = await sha256(serializedPayload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
        ...(import.meta.env.VITE_SUPABASE_ANON_KEY
          ? { apikey: String(import.meta.env.VITE_SUPABASE_ANON_KEY) }
          : {}),
      },
      body: JSON.stringify({
        ...payload,
        meta: {
          ...(payload.meta && typeof payload.meta === "object" ? (payload.meta as Record<string, unknown>) : {}),
          payload_hash,
          single_call_mode: true,
          repair_attempts: MAX_REPAIR_ATTEMPTS,
        },
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new DecisionInfrastructureError(
        data?.error || data?.message || `Cyntra analyse mislukt (${response.status})`
      );
    }

    return data as CanonicalResponse;
  } catch (error) {
    if (error instanceof DecisionInfrastructureError) throw error;
    throw new DecisionInfrastructureError(
      error instanceof Error ? error.message : "Onbekende fout tijdens Cyntra analyse"
    );
  }
}
