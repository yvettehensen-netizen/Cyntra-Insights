"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthUser {
  id: string;
  name: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      try {
        const response = await fetch("/api/v1/auth/me", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to resolve auth context");
        }

        if (!cancelled) {
          setUser(payload.user as AuthUser);
        }
      } catch (authError) {
        if (!cancelled) {
          const message = authError instanceof Error ? authError.message : String(authError);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasRole = useCallback((role: string) => !!user?.roles.includes(role), [user]);
  const hasPermission = useCallback(
    (permission: string) => !!user?.permissions.includes(permission),
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, error, hasRole, hasPermission }),
    [user, loading, error, hasRole, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
