// src/layouts/AureliusLayout.tsx
import { Outlet } from "react-router-dom";
import AureliusNavbar from "@/aurelius/components/AureliusNavbar";

export default function AureliusLayout() {
  const generatedDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="portal-theme min-h-screen bg-cyntra-primary text-cyntra-primary">
      {/* FIXED NAVBAR */}
      <AureliusNavbar />

      {/* CONTENT MOET ONDER NAVBAR BEGINNEN */}
      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <div className="card-cyntra !py-3 !px-4 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.12em] text-cyntra-secondary">
            <span className="text-cyntra-gold font-semibold">Bestuurlijk Vertrouwelijk</span>
            <span>Document-ID: CYNTRA-EXEC-001</span>
            <span>Datum gegenereerd: {generatedDate}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
