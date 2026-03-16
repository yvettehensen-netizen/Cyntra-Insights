import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createIntervention, listInterventions } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  organizationId: z.string().uuid(),
  decisionRecordId: z.string().uuid().optional().nullable(),
  interventionCode: z.string().min(2).max(160),
  name: z.string().min(2).max(240),
  ownerName: z.string().min(2).max(180),
  ownerRole: z.string().max(160).optional().nullable(),
  status: z.enum(["proposed", "active", "paused", "completed", "cancelled", "failed"]).optional(),
  targetDate: z.string().date().optional().nullable(),
  budgetAmount: z.number().optional(),
  expectedImpactScore: z.number().min(0).max(100).optional().nullable(),
  createdBy: z.string().min(2).max(160),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const items = await listInterventions(id);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = createSchema.parse(await request.json());

    const intervention = await createIntervention({
      decisionCycleId: id,
      organizationId: payload.organizationId,
      decisionRecordId: payload.decisionRecordId,
      interventionCode: payload.interventionCode,
      name: payload.name,
      ownerName: payload.ownerName,
      ownerRole: payload.ownerRole,
      status: payload.status,
      targetDate: payload.targetDate,
      budgetAmount: payload.budgetAmount,
      expectedImpactScore: payload.expectedImpactScore,
      createdBy: payload.createdBy,
    });

    return NextResponse.json({ intervention }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
