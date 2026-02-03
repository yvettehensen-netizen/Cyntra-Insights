// src/layouts/AureliusLayout.tsx
import { Outlet } from "react-router-dom";
import AureliusNavbar from "@/aurelius/components/AureliusNavbar";

export default function AureliusLayout() {
  return (
    <div className="min-h-screen bg-[#0A090A] text-white">
      {/* FIXED NAVBAR */}
      <AureliusNavbar />

      {/* CONTENT MOET ONDER NAVBAR BEGINNEN */}
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
}
