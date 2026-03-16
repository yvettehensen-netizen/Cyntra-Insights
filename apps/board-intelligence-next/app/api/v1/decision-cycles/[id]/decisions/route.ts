import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDecisionRecord, listDecisionRecords } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  organizationId: z.string().uuid(),
  selectedAnalysisRunId: z.string().uuid().optional().nullable(),
  decisionCode: z.string().min(2).max(160),
  decisionStatement: z.string().min(8).max(4000),
  outcome: z.enum(["approved", "rejected", "deferred", "conditional"]),
  rationale: z.string().min(8).max(8000),
  approvedBy: z.string().min(2).max(160),
  approvedAt: z.string().datetime().optional(),
  effectiveFrom: z.string().date().optional().nullable(),
  effectiveTo: z.string().date().optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const items = await listDecisionRecords(id);
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

    const record = await createDecisionRecord({
      decisionCycleId: id,
      organizationId: payload.organizationId,
      selectedAnalysisRunId: payload.selectedAnalysisRunId,
      decisionCode: payload.decisionCode,
      decisionStatement: payload.decisionStatement,
      outcome: payload.outcome,
      rationale: payload.rationale,
      approvedBy: payload.approvedBy,
      approvedAt: payload.approvedAt,
      effectiveFrom: payload.effectiveFrom,
      effectiveTo: payload.effectiveTo,
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
