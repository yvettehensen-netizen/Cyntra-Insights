import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDecisionCycleDetail, updateDecisionCycle } from "@/lib/cd-repository";

export const runtime = "nodejs";

const updateSchema = z.object({
  title: z.string().min(3).max(240).optional(),
  scope: z.string().min(3).max(2000).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  status: z
    .enum([
      "draft",
      "pending_analysis",
      "running_analysis",
      "decision_pending",
      "decision_registered",
      "intervention_active",
      "closed",
      "cancelled",
      "failed",
    ])
    .optional(),
  targetDecisionAt: z.string().datetime().nullable().optional(),
  updatedBy: z.string().min(2).max(160).default("system"),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = await getDecisionCycleDetail(id);
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    const status = message.toLowerCase().includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = updateSchema.parse(await request.json());

    const cycle = await updateDecisionCycle(id, {
      title: payload.title,
      scope: payload.scope,
      priority: payload.priority,
      status: payload.status,
      target_decision_at: payload.targetDecisionAt,
      updated_by: payload.updatedBy,
    });

    return NextResponse.json({ cycle }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    const status = message.toLowerCase().includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
