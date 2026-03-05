import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeReportRow } from "@/lib/types";
import { getReportByAnalysisIdInMemory, isMemoryBackendEnabled } from "@/lib/dev-memory-backend";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ analysisId: string }> }
): Promise<NextResponse> {
  try {
    const { analysisId } = await context.params;
    if (isMemoryBackendEnabled()) {
      const report = getReportByAnalysisIdInMemory(analysisId);
      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      return NextResponse.json({ report }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("analysis_id", analysisId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report: normalizeReportRow(data) }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
