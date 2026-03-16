import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { retryAnalysisRun } from "@/lib/cd-repository";

export const runtime = "nodejs";

const retrySchema = z.object({
  actor: z.string().min(2).max(160),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = retrySchema.parse(await request.json());

    const run = await retryAnalysisRun(id, payload.actor);
    return NextResponse.json({ run }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    const status = message.toLowerCase().includes("only failed") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
