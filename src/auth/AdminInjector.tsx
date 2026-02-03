import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const FOUNDER_ID = "wmefvknhldcplpudwwxi";

export function AdminInjector() {
  useEffect(() => {
    async function promoteIfFounder() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) return;

      if (user.id === FOUNDER_ID && user.user_metadata?.role !== "admin") {
        await supabase.auth.updateUser({
          data: { role: "admin" },
        });

        console.log("🔥 Founder elevated to ADMIN — Aurelius Root Access granted.");
      }
    }

    promoteIfFounder();
  }, []);

  return null;
}
