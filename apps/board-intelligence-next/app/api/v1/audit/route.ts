import { NextRequest, NextResponse } from "next/server";
import { listAuditByOrganization } from "@/lib/cd-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const limitRaw = request.nextUrl.searchParams.get("limit");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const limit = limitRaw ? Number(limitRaw) : 300;
    const items = await listAuditByOrganization(
      organizationId,
      Number.isFinite(limit) ? Math.min(1000, Math.max(1, limit)) : 300
    );

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
