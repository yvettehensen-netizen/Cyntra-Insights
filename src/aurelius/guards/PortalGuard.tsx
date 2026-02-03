// src/aurelius/guards/PortalGuard.tsx
// ✅ FINAL ROUTING CANON — STATE.FROM SUPPORT

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function PortalGuard() {
  const location = useLocation(); // ✅ ADD ONLY

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  /* ============================================================
     ✅ BOOTSTRAP SESSION
  ============================================================ */
  async function bootstrapSession() {
    const { data } = await supabase.auth.getSession();
    setAuthenticated(!!data.session);
    setLoading(false);
  }

  useEffect(() => {
    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ============================================================
     LOADING SCREEN
  ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  /* ============================================================
     ✅ NOT LOGGED IN → LOGIN WITH RETURN PATH
  ============================================================ */
  if (!authenticated) {
    return (
      <Navigate
        to="/aurelius/login"
        replace
        state={{
          from: location.pathname, // ✅ KEY FIX
        }}
      />
    );
  }

  /* ============================================================
     ✅ OK → CONTINUE
  ============================================================ */
  return <Outlet />;
}
