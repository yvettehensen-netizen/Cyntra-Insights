import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addGovernanceMetricObservation } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  organizationId: z.string().uuid(),
  metricCode: z.string().min(1).max(120),
  observedValue: z.number(),
  observedAt: z.string().datetime().optional(),
  sourceAnalysisRunId: z.string().uuid().optional().nullable(),
  sourceSystem: z.string().min(1).max(120),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const payload = createSchema.parse(await request.json());

    const observation = await addGovernanceMetricObservation({
      decisionCycleId: id,
      organizationId: payload.organizationId,
      metricCode: payload.metricCode,
      observedValue: payload.observedValue,
      observedAt: payload.observedAt,
      sourceAnalysisRunId: payload.sourceAnalysisRunId,
      sourceSystem: payload.sourceSystem,
    });

    return NextResponse.json({ observation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
