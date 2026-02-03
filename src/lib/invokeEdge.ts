// ============================================================
// src/lib/invokeEdge.ts
// ✅ CANONICAL EDGE INVOKE WRAPPER (JWT SAFE)
// ============================================================

import { supabase } from "@/lib/supabaseClient";

export async function invokeEdge(functionName: string, body: any) {
  // ✅ Always fetch current session
  const { data } = await supabase.auth.getSession();

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("❌ No active session — user is not authenticated.");
  }

  // ✅ Invoke Edge Function with required JWT header
  return supabase.functions.invoke(functionName, {
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
