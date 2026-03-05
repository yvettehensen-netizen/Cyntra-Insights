import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getUploadsForAnalysis,
  resolveUploadsById,
  saveUploadToSupabase,
} from "@/lib/uploads";
import {
  isMemoryBackendEnabled,
  resolveUploadsForQueryInMemory,
  saveUploadInMemory,
} from "@/lib/dev-memory-backend";

export const runtime = "nodejs";

async function resolveOrganizationId(payload: {
  organizationId?: string;
  organization?: string;
}): Promise<string> {
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
    throw new Error("organizationId of organization is verplicht");
  }

  const { data, error } = await supabase
    .from("organizations")
    .upsert({ name: organizationName }, { onConflict: "name" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Unable to create/resolve organization: ${error?.message ?? "unknown"}`);
  }

  return String(data.id);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "file is verplicht" }, { status: 400 });
    }

    const organizationIdRaw = formData.get("organizationId");
    const organizationRaw = formData.get("organization");

    if (isMemoryBackendEnabled()) {
      const upload = await saveUploadInMemory({
        organizationId:
          typeof organizationIdRaw === "string" && organizationIdRaw.trim().length
            ? organizationIdRaw
            : undefined,
        organization:
          typeof organizationRaw === "string" && organizationRaw.trim().length
            ? organizationRaw
            : undefined,
        file: fileValue,
      });
      return NextResponse.json({ upload }, { status: 201 });
    }

    const organizationId = await resolveOrganizationId({
      organizationId:
        typeof organizationIdRaw === "string" && organizationIdRaw.trim().length
          ? organizationIdRaw
          : undefined,
      organization:
        typeof organizationRaw === "string" && organizationRaw.trim().length
          ? organizationRaw
          : undefined,
    });

    const upload = await saveUploadToSupabase({ organizationId, file: fileValue });

    return NextResponse.json({ upload }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const analysisId = request.nextUrl.searchParams.get("analysisId");
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const uploadIdsRaw = request.nextUrl.searchParams.get("uploadIds");

    if (isMemoryBackendEnabled()) {
      const uploads = resolveUploadsForQueryInMemory({
        analysisId: analysisId ?? undefined,
        organizationId: organizationId ?? undefined,
        uploadIds: uploadIdsRaw
          ? uploadIdsRaw
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
      });
      if (analysisId || (organizationId && uploadIdsRaw)) {
        return NextResponse.json({ uploads }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Gebruik analysisId of organizationId + uploadIds query params" },
        { status: 400 }
      );
    }

    if (analysisId) {
      const uploads = await getUploadsForAnalysis({ analysisId });
      return NextResponse.json({ uploads }, { status: 200 });
    }

    if (organizationId && uploadIdsRaw) {
      const uploadIds = uploadIdsRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const uploads = await resolveUploadsById({ organizationId, uploadIds });
      return NextResponse.json({ uploads }, { status: 200 });
    }

    return NextResponse.json(
      {
        error: "Gebruik analysisId of organizationId + uploadIds query params",
      },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
