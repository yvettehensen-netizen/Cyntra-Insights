// ============================================================
// src/aurelius/utils/saveReport.ts
// AURELIUS — REPORT PERSISTENCE (CANON)
// ============================================================

import { supabase } from "../../lib/supabaseClient";

/* =========================
   TYPES
========================= */

export interface SaveReportInput {
  slug: string;
  title: string;
  content: unknown;
}

export interface SavedReport {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  content: unknown;
  created_at: string;
}

/* =========================
   SAVE REPORT
========================= */

export async function saveReport(
  input: SaveReportInput
): Promise<SavedReport[]> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Failed to retrieve auth session");
  }

  const user = session?.user;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("reports")
    .insert([
      {
        user_id: user.id,
        slug: input.slug,
        title: input.title,
        content: input.content,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data as SavedReport[];
}
