import { Link } from "react-router-dom";

export default function RootSidebar() {
  const items = [
    { to: "/root", label: "Dashboard" },
    { to: "/root/analyses", label: "Analyses" },
    { to: "/root/users", label: "Gebruikers" },
    { to: "/root/engine", label: "Engine" },
  ];

  return (
    <aside className="min-h-screen w-64 border-r border-white/[0.06] bg-[#08111b] p-6 text-white">
      <h2 className="mb-6 text-lg font-semibold tracking-[-0.02em] text-white">Aurelius Admin</h2>

      <nav className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-[40px] items-center rounded-[12px] px-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
          >
            <span className="inline-flex h-[18px] w-[18px] rounded-full border border-white/[0.1] bg-white/[0.03]" />
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
