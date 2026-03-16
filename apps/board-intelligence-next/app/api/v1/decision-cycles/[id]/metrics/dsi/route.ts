import { NextRequest, NextResponse } from "next/server";
import { getDsiResponse } from "@/lib/cd-repository";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const dsi = await getDsiResponse(id);
    return NextResponse.json(dsi, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
