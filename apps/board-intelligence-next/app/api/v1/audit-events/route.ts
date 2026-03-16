import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditEvent } from "@/lib/cd-repository";

export const runtime = "nodejs";

const schema = z.object({
  organizationId: z.string().uuid(),
  decisionCycleId: z.string().uuid().optional().nullable(),
  entityType: z.string().min(1).max(120),
  entityId: z.string().uuid().optional().nullable(),
  action: z.string().min(1).max(120),
  actor: z.string().min(2).max(160),
  reason: z.string().max(2000).optional().nullable(),
  requestId: z.string().max(200).optional().nullable(),
  details: z
    .array(
      z.object({
        fieldName: z.string().min(1).max(120),
        oldValue: z.string().max(4000).optional().nullable(),
        newValue: z.string().max(4000).optional().nullable(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = schema.parse(await request.json());

    const audit = await appendAuditEvent({
      ...payload,
      details: payload.details,
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
