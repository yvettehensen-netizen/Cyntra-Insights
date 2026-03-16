import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendInterventionEvent, listInterventionEvents } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  eventType: z.enum(["created", "status_changed", "note", "evidence_attached", "closed"]),
  oldStatus: z.enum(["proposed", "active", "paused", "completed", "cancelled", "failed"]).optional().nullable(),
  newStatus: z.enum(["proposed", "active", "paused", "completed", "cancelled", "failed"]).optional().nullable(),
  note: z.string().max(4000).optional().nullable(),
  performedBy: z.string().min(2).max(160),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const items = await listInterventionEvents(id);
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

    const event = await appendInterventionEvent({
      interventionId: id,
      eventType: payload.eventType,
      oldStatus: payload.oldStatus,
      newStatus: payload.newStatus,
      note: payload.note,
      performedBy: payload.performedBy,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
