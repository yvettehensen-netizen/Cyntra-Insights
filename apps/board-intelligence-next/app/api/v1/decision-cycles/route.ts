import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDecisionCycle, listDecisionCycles } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  organizationId: z.string().uuid(),
  cycleKey: z.string().min(3).max(120),
  title: z.string().min(3).max(240),
  scope: z.string().min(3).max(2000),
  priority: z.number().int().min(1).max(5).optional(),
  targetDecisionAt: z.string().datetime().optional().nullable(),
  createdBy: z.string().min(2).max(160),
  context: z
    .object({
      decisionDomain: z.string().min(2).max(200),
      businessUnit: z.string().max(200).optional().nullable(),
      geography: z.string().max(200).optional().nullable(),
      regulatoryRegime: z.string().max(200).optional().nullable(),
      riskAppetiteScore: z.number().min(0).max(100).optional().nullable(),
      materialityLevel: z.number().int().min(1).max(5).optional().nullable(),
      baselineRevenueImpact: z.number().optional().nullable(),
      baselineCostImpact: z.number().optional().nullable(),
    })
    .optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const status = request.nextUrl.searchParams.get("status");
    const limitRaw = request.nextUrl.searchParams.get("limit");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const limit = limitRaw ? Number(limitRaw) : 100;

    const items = await listDecisionCycles({
      organizationId,
      status,
      limit: Number.isFinite(limit) ? Math.min(200, Math.max(1, limit)) : 100,
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = createSchema.parse(await request.json());
    const cycle = await createDecisionCycle(payload);
    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
