"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextValue {
  organizations: Organization[];
  organizationId: string | null;
  organizationName: string | null;
  loading: boolean;
  error: string | null;
  setOrganizationId: (organizationId: string) => void;
}

const STORAGE_KEY = "cyntra.selectedOrganizationId";
const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      try {
        const response = await fetch("/api/v1/organizations", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load organizations");
        }

        const items = (payload.items as Organization[]) ?? [];
        if (cancelled) return;

        setOrganizations(items);

        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const initial = items.find((entry) => entry.id === stored)?.id ?? items[0]?.id ?? null;
        setOrganizationIdState(initial);
      } catch (fetchError) {
        if (!cancelled) {
          const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
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

  const setOrganizationId = useCallback((nextId: string) => {
    setOrganizationIdState(nextId);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextId);
    }
  }, []);

  const organizationName = useMemo(
    () => organizations.find((entry) => entry.id === organizationId)?.name ?? null,
    [organizations, organizationId]
  );

  const value = useMemo(
    () => ({
      organizations,
      organizationId,
      organizationName,
      loading,
      error,
      setOrganizationId,
    }),
    [organizations, organizationId, organizationName, loading, error, setOrganizationId]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}
