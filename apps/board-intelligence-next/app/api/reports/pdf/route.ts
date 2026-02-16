import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeAnalysisRow, normalizeReportRow } from "@/lib/types";
import { upsertReportFromAnalysis } from "@/lib/run-analysis";
import { renderPdfFromHtml } from "@/lib/pdf";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const analysisId = request.nextUrl.searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json({ error: "analysisId query param is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let report: ReturnType<typeof normalizeReportRow> | null = null;

    const { data: existingReport, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("analysis_id", analysisId)
      .maybeSingle();

    if (reportError) {
      throw new Error(reportError.message);
    }

    if (existingReport) {
      report = normalizeReportRow(existingReport);
    } else {
      const { data: analysisData, error: analysisError } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", analysisId)
        .single();

      if (analysisError || !analysisData) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }

      const analysis = normalizeAnalysisRow(analysisData);

      if (!analysis.result_payload) {
        return NextResponse.json(
          { error: "Analysis has no results yet" },
          { status: 409 }
        );
      }

      report = await upsertReportFromAnalysis(analysis, analysis.result_payload, supabase);
    }

    const pdfBuffer = await renderPdfFromHtml(report.html_content);
    const pdfBody = Uint8Array.from(pdfBuffer);

    return new NextResponse(pdfBody, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="executive-report-${analysisId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
