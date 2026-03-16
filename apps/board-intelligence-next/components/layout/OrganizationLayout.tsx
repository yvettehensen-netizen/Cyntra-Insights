"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOrganization } from "@/components/providers/OrganizationProvider";

const navItems = [
  { href: "/organizations", label: "Organizations" },
  { href: "/decision-cycles", label: "Decision Cycles" },
  { href: "/analysis-runs", label: "Analysis Runs" },
  { href: "/interventions", label: "Interventions" },
  { href: "/governance", label: "Governance" },
  { href: "/audit", label: "Audit" },
  { href: "/reports", label: "Reports" },
  { href: "/admin", label: "Admin" },
];

interface OrganizationLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function OrganizationLayout({
  title,
  subtitle,
  children,
  actions,
}: OrganizationLayoutProps) {
  const pathname = usePathname();
  const { organizations, organizationId, organizationName, setOrganizationId, loading } =
    useOrganization();
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/70">
              Cyntra Decision Infrastructure
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{subtitle}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/80 p-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Tenant Scope</p>
            <select
              aria-label="Selected organization"
              value={organizationId ?? ""}
              onChange={(event) => setOrganizationId(event.target.value)}
              disabled={loading || !organizations.length}
              className="w-64 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {organizations.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">
              Active: <span className="text-slate-200">{organizationName ?? "No organization"}</span>
            </p>
            <p className="text-xs text-slate-400">
              Actor: <span className="text-slate-200">{user?.name ?? "Anonymous"}</span>
            </p>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold tracking-wide transition ${
                  active
                    ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-200"
                    : "border-slate-600 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {actions ? <div className="mt-4">{actions}</div> : null}
      </header>

      <section className="mt-6 space-y-5">{children}</section>
    </main>
  );
}
