import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { runAnalysisJob } from "@/lib/run-analysis";
import { normalizeAnalysisRow, type NewAnalysisRequest } from "@/lib/types";
import { linkUploadsToAnalysis, resolveUploadsById } from "@/lib/uploads";
import { createAnalysisInMemory, isMemoryBackendEnabled } from "@/lib/dev-memory-backend";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    organizationId: z.string().uuid().optional(),
    organization: z.string().min(2).max(140).optional(),
    description: z.string().min(8).max(8000),
    context: z.record(z.unknown()).optional(),
    uploadIds: z.array(z.string().uuid()).optional(),
    runImmediately: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.organizationId && !value.organization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide organizationId or organization",
      });
    }
  });

async function resolveOrganizationId(payload: NewAnalysisRequest): Promise<string> {
  const supabase = getSupabaseAdmin();

  if (payload.organizationId) {
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", payload.organizationId)
      .single();

    if (error || !data) {
      throw new Error(`Organization not found: ${payload.organizationId}`);
    }

    return String(data.id);
  }

  const organizationName = payload.organization?.trim();
  if (!organizationName) {
    throw new Error("Organization name is required when organizationId is missing.");
  }

  const { data, error } = await supabase
    .from("organizations")
    .upsert({ name: organizationName }, { onConflict: "name" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Unable to create or resolve organization: ${error?.message ?? "unknown"}`);
  }

  return String(data.id);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const raw = await request.json();
    const parsed = requestSchema.parse(raw);

    if (isMemoryBackendEnabled()) {
      const analysis = await createAnalysisInMemory({
        organizationId: parsed.organizationId,
        organization: parsed.organization,
        description: parsed.description,
        context: parsed.context,
        uploadIds: parsed.uploadIds,
        runImmediately:
          parsed.runImmediately ?? process.env.ANALYSIS_INLINE_PROCESSING === "true",
      });
      return NextResponse.json({ analysis }, { status: 201 });
    }

    const supabase = getSupabaseAdmin();

    const organizationId = await resolveOrganizationId(parsed);
    const organizationName = parsed.organization?.trim() ?? "Organization";
    const uploadIds = parsed.uploadIds ?? [];
    const uploads = uploadIds.length
      ? await resolveUploadsById({ organizationId, uploadIds, supabase })
      : [];

    const inputPayload = {
      organization_name: organizationName,
      description: parsed.description.trim(),
      context: parsed.context ?? {},
      uploads: uploads.map((upload) => ({
        upload_id: upload.id,
        file_name: upload.file_name,
        mime_type: upload.mime_type,
        size_bytes: upload.size_bytes,
        extracted_text: upload.extracted_text,
      })),
      requested_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        organization_id: organizationId,
        type: "board_intelligence",
        payload: inputPayload,
        status: "pending",
        input_payload: inputPayload,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create analysis: ${error?.message ?? "unknown"}`);
    }

    if (uploadIds.length) {
      await linkUploadsToAnalysis({
        uploadIds,
        analysisId: String(data.id),
        supabase,
      });
    }

    const runImmediately =
      parsed.runImmediately ?? process.env.ANALYSIS_INLINE_PROCESSING === "true";

    if (runImmediately) {
      const done = await runAnalysisJob(String(data.id), supabase);
      return NextResponse.json({ analysis: done }, { status: 201 });
    }

    return NextResponse.json({ analysis: normalizeAnalysisRow(data) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
