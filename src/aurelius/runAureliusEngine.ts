import { supabase } from "@/lib/supabaseClient";
import { v4 as uuid } from "uuid";

/* ✅ ADDITION — SUPABASE JSON SAFE TYPE */
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface AureliusResult {
  executive_summary: string;
  insights: string[];
  risks: string[];
  opportunities: string[];
  roadmap_90d: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  confidence_score?: number;
}

export type EngineSuccess = {
  success: true;
  result: AureliusResult;
};

export type EngineFailure = {
  success: false;
  error: { message: string };
};

export async function runAureliusEngine(input: {
  analysis_type: string;
  company_context: string;
  document_data?: string;
}): Promise<EngineSuccess | EngineFailure> {
  try {
    const id = uuid();

    const result: AureliusResult = {
      executive_summary:
        "De organisatie bevindt zich op een kantelpunt waarbij doorgroeien zonder herstructurering leidt tot strategische erosie.",

      insights: [
        "Het MT opereert reactief in plaats van richtinggevend.",
        "Besluitvorming is informeel en vertraagd.",
      ],

      risks: [
        "Talentverlies",
        "Strategische versnippering",
        "Afname executiekracht",
      ],

      opportunities: [
        "Heldere governance",
        "Versnellen besluitvorming",
        "Betere strategische focus",
      ],

      roadmap_90d: {
        month1: ["Strategische prioriteiten herijken"],
        month2: ["MT-structuur herdefiniëren"],
        month3: ["Executiekracht borgen"],
      },

      confidence_score: 0.82,
    };

    /* ✅ ADDITION — JSON SAFE SERIALIZATION */
    const safeResult = result as unknown as Json;

    const { error } = await supabase.from("analyses").insert({
      id,
      analysis_type: input.analysis_type,

      /* ✅ ADDITION — SUPABASE SAFE JSON */
      result: safeResult,

      input_data: {
        company_context: input.company_context,
        document_data: input.document_data ?? null,
      },

      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true, result };
  } catch (e: any) {
    return {
      success: false,
      error: { message: e.message ?? "Analyse engine fout" },
    };
  }
}
