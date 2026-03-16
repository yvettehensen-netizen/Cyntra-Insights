import { NextRequest, NextResponse } from "next/server";
import { listAuditTimeline } from "@/lib/cd-repository";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const limitRaw = request.nextUrl.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : 200;
    const items = await listAuditTimeline(id, Number.isFinite(limit) ? Math.min(1000, Math.max(1, limit)) : 200);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
