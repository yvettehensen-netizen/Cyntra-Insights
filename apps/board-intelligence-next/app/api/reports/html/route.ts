import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeAnalysisRow } from "@/lib/types";
import { upsertReportFromAnalysis } from "@/lib/run-analysis";

export const runtime = "nodejs";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const analysisId = request.nextUrl.searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json({ error: "analysisId query param is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const analysis = normalizeAnalysisRow(data);
    if (!analysis.result_payload) {
      return NextResponse.json(
        { error: "Analysis has no result_payload yet" },
        { status: 409 }
      );
    }

    const report = await upsertReportFromAnalysis(analysis, analysis.result_payload, supabase);

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
