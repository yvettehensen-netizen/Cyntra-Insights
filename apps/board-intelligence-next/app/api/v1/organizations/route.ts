import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { listOrganizations } from "@/lib/cd-repository";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(2).max(200),
});

export async function GET(): Promise<NextResponse> {
  try {
    const organizations = await listOrganizations();
    return NextResponse.json({ items: organizations }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = createSchema.parse(await request.json());

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("organizations")
      .upsert({ name: payload.name.trim() }, { onConflict: "name" })
      .select("id,name")
      .single();

    if (error || !data) {
      throw new Error(`Failed to create organization: ${error?.message ?? "unknown"}`);
    }

    return NextResponse.json(
      {
        organization: {
          id: String(data.id),
          name: String(data.name),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
