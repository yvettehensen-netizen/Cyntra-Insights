import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateIntervention } from "@/lib/cd-repository";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["proposed", "active", "paused", "completed", "cancelled", "failed"]).optional(),
  ownerName: z.string().min(2).max(180).optional(),
  ownerRole: z.string().max(160).optional().nullable(),
  targetDate: z.string().date().optional().nullable(),
  actualImpactScore: z.number().min(0).max(100).optional().nullable(),
  updatedBy: z.string().min(2).max(160).default("system"),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = patchSchema.parse(await request.json());

    const intervention = await updateIntervention(id, {
      status: payload.status,
      owner_name: payload.ownerName,
      owner_role: payload.ownerRole,
      target_date: payload.targetDate,
      actual_impact_score: payload.actualImpactScore,
      updated_by: payload.updatedBy,
    });

    return NextResponse.json({ intervention }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
