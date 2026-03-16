import { NextRequest, NextResponse } from "next/server";
import { listAnalysisRunsByOrganization } from "@/lib/cd-repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const status = request.nextUrl.searchParams.get("status") as
      | "pending"
      | "running"
      | "done"
      | "failed"
      | "cancelled"
      | null;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const items = await listAnalysisRunsByOrganization({ organizationId, status, limit: 300 });
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
