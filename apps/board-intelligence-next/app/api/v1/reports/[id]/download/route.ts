import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: reportData, error: reportError } = await supabase
      .schema("cd")
      .from("report_document")
      .select("*")
      .eq("id", id)
      .single();

    if (reportError || !reportData) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reportData as {
      report_format: "html" | "pdf" | "markdown";
      title: string;
      html_content: string | null;
      storage_path: string | null;
    };

    if (report.report_format === "html" || report.report_format === "markdown") {
      return new NextResponse(report.html_content ?? "", {
        status: 200,
        headers: {
          "Content-Type": report.report_format === "html" ? "text/html; charset=utf-8" : "text/markdown; charset=utf-8",
          "Content-Disposition": `inline; filename=\"${report.title.replace(/\s+/g, "-").toLowerCase()}.${report.report_format}\"`,
        },
      });
    }

    if (!report.storage_path) {
      return NextResponse.json({ error: "Report PDF path is empty" }, { status: 409 });
    }

    const storagePath = report.storage_path.includes("/")
      ? report.storage_path.split("/").slice(1).join("/")
      : report.storage_path;

    const { data: binaryData, error: downloadError } = await supabase.storage
      .from("analysis-uploads")
      .download(storagePath);

    if (downloadError || !binaryData) {
      return NextResponse.json(
        {
          error: `Unable to download PDF from storage: ${downloadError?.message ?? "not found"}`,
        },
        { status: 404 }
      );
    }

    const buffer = await binaryData.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
