import { NextRequest, NextResponse } from "next/server";
import { getDsiTrend } from "@/lib/cd-repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const trend = await getDsiTrend(id);
    return NextResponse.json({ decisionCycleId: id, days: 90, trend }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
