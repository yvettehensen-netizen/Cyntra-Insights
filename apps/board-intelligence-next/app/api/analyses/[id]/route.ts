import { NextRequest, NextResponse } from "next/server";
import { getAnalysisWithOptionalReport } from "@/lib/run-analysis";
import {
  getAnalysisWithOptionalReportInMemory,
  isMemoryBackendEnabled,
} from "@/lib/dev-memory-backend";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: analysisId } = await context.params;
    const payload = isMemoryBackendEnabled()
      ? getAnalysisWithOptionalReportInMemory(analysisId)
      : await getAnalysisWithOptionalReport(analysisId);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
