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
import { AUTH_LOGIN_PATH } from "@/auth/authPaths";

const AUTH_BOOTSTRAP_TIMEOUT_MS = 4000;
const DEV_PORTAL_AUTH_BYPASS_KEY = "cyntra_portal_dev_auth_bypass";

export default function PortalGuard() {
  const location = useLocation(); // ✅ ADD ONLY

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const isAureliusIntakeRoute = location.pathname.startsWith("/portal/aurelius/");
  const allowDevBypass =
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(DEV_PORTAL_AUTH_BYPASS_KEY) === "1";

  /* ============================================================
     ✅ BOOTSTRAP SESSION
  ============================================================ */
  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      setBootstrapError(null);

      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error("Authenticatie bootstrap timeout"));
          }, AUTH_BOOTSTRAP_TIMEOUT_MS);
        });

        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        if (!active) return;
        setAuthenticated(!!data.session);
      } catch (error) {
        if (!active) return;
        console.error("[PortalGuard] bootstrap failed", error);
        setAuthenticated(false);
        setBootstrapError("Authenticatie kon niet stabiel worden geladen.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthenticated(!!session);
      setBootstrapError(null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ============================================================
     LOADING SCREEN
  ============================================================ */
  if (loading) {
    if (allowDevBypass) {
      return <Outlet />;
    }
    if (isAureliusIntakeRoute) {
      return <Outlet />;
    }

    return (
      <div className="portal-theme flex min-h-screen items-center justify-center px-6">
        <div className="portal-card max-w-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
            <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
          </div>
          <p className="portal-kicker mt-6">Portal bootstrap</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">De werkomgeving wordt veilig geladen</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Als authenticatie of routing vertraagt, blijft de portal in een herstelpad in plaats van
            op een zwart scherm hangen.
          </p>
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    if (allowDevBypass) {
      return <Outlet />;
    }
    return (
      <div className="portal-theme flex min-h-screen items-center justify-center px-6">
        <div className="portal-card max-w-xl p-8">
          <p className="portal-kicker">Portal recovery</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Authenticatie herstelde niet schoon</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            De portal stuurt gecontroleerd terug naar login in plaats van wit of zwart te blijven.
          </p>
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-400">
            {bootstrapError}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={AUTH_LOGIN_PATH}
              className="portal-button-primary"
            >
              Opnieuw inloggen
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="portal-button-secondary"
            >
              Herladen
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ✅ NOT LOGGED IN → LOGIN WITH RETURN PATH
  ============================================================ */
  if (!authenticated) {
    if (allowDevBypass) {
      return <Outlet />;
    }
    if (isAureliusIntakeRoute) {
      return <Outlet />;
    }

    return (
      <Navigate
        to={AUTH_LOGIN_PATH}
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
