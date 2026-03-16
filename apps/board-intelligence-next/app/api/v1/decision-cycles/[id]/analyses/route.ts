import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAnalysisRun, listAnalysisRuns } from "@/lib/cd-repository";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const parameterSchema = z.object({
  parameterName: z.string().min(1).max(200),
  parameterType: z.enum(["text", "number", "boolean", "date", "enum"]),
  ordinal: z.number().int().min(0).max(200).optional(),
  unit: z.string().max(40).optional().nullable(),
  textValue: z.string().optional().nullable(),
  numericValue: z.number().optional().nullable(),
  booleanValue: z.boolean().optional().nullable(),
  dateValue: z.string().date().optional().nullable(),
  enumValue: z.string().optional().nullable(),
});

const createSchema = z.object({
  organizationId: z.string().uuid(),
  requestId: z.string().max(200).optional().nullable(),
  idempotencyKey: z.string().max(200).optional().nullable(),
  analysisKind: z.string().min(2).max(120),
  promptTemplate: z.string().min(2).max(400),
  promptVersion: z.string().min(1).max(120),
  modelProvider: z.string().min(1).max(120),
  modelName: z.string().min(1).max(120),
  modelVersion: z.string().min(1).max(120),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(64000).optional(),
  inputParameters: z.array(parameterSchema).min(1),
  requestedBy: z.string().min(2).max(160),
});

async function verifyCycleOwnership(decisionCycleId: string, organizationId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("cd")
    .from("decision_cycle")
    .select("id")
    .eq("id", decisionCycleId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !data) {
    throw new Error("Decision cycle does not exist for organization");
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const items = await listAnalysisRuns(id);
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

    await verifyCycleOwnership(id, payload.organizationId);

    const detail = await createAnalysisRun({
      decisionCycleId: id,
      ...payload,
    });

    return NextResponse.json(detail, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    const status = message.toLowerCase().includes("does not exist") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
