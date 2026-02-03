// src/api/saveAureliusReport.ts
import { supabase } from "../lib/supabaseClient";

export async function saveAureliusReport(
  type: string,
  company: string,
  result: any
) {
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: auth.user.id,
      analysis_type: `aurelius-${type}`,
      analysis_name: `Aurelius 3.5 – ${type}`,
      company_name: company,
      result,
      status: "completed",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { success: false, error };

  return { success: true, data };
}
