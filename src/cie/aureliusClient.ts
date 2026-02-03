// src/cie/aureliusClient.ts

import type {
  AureliusInput,
  AureliusResponse,
} from "@/aurelius/types/aureliusEngine";

/**
 * Client voor het aanroepen van de Aurelius Supabase Edge Function.
 *
 * Verantwoordelijkheden:
 * - Transport (HTTP)
 * - Error-afhandeling
 * - GEEN normalisatie (dat doet de normalizer)
 */
export async function runAureliusEngine(
  payload: AureliusInput
): Promise<AureliusResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      success: false,
      error: {
        message:
          "Missing Supabase configuration (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)",
      },
    };
  }

  const url = `${supabaseUrl}/functions/v1/aurelius-orchestrator`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = { message: "Invalid JSON response from Aurelius engine" };
    }

    if (!res.ok) {
      return {
        success: false,
        error:
          (data as any)?.error ??
          (data as any) ??
          { message: `HTTP ${res.status}` },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "Onbekende netwerkfout",
      },
    };
  }
}

