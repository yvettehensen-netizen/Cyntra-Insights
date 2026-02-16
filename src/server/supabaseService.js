import { createClient } from "@supabase/supabase-js";

function readEnv(...keys) {
  for (const key of keys) {
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
}

const SUPABASE_URL = readEnv(
  "SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "VITE_SUPABASE_URL"
);

const SUPABASE_SERVICE_KEY = readEnv(
  "SUPABASE_SERVICE_ROLE_KEY",
  "SERVICE_ROLE_KEY"
);

export const supabaseService =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export const supabaseServiceConfig = {
  hasUrl: Boolean(SUPABASE_URL),
  hasServiceRoleKey: Boolean(SUPABASE_SERVICE_KEY),
};

if (!supabaseService && process.env.NODE_ENV !== "test") {
  console.warn(
    "[supabaseService] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SERVICE_ROLE_KEY. Backend DB routes are disabled."
  );
}

