// Backend/backend routes/api/saveAureliusReport.ts

import { supabase } from '../../../src/lib/supabaseClient';
import { generateAureliusPDF } from '../../../src/api/pdfClient';

export async function saveAureliusReport(
  type: string,
  companyName: string,
  result: any
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // 1. Opslaan van de analyse in Supabase
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        type,
        company_name: companyName,
        status: "completed",
        result_json: result,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error };
    }

    // 2. PDF genereren
    const pdf = await generateAureliusPDF(result);

    // 3. PDF URL opslaan in de database (alleen bij succes)
    if (pdf.success && pdf.download_url) {
      await supabase
        .from("analyses")
        .update({ pdf_url: pdf.download_url })
        .eq("id", data.id);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Fout in saveAureliusReport:", err);
    return { success: false, error: err.message || "Onbekende fout" };
  }
}