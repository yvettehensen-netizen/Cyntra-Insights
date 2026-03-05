// src/layouts/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";

export default function PublicLayout() {
  return (
    <div className="public-theme">
      <PublicNavbar />
      <main className="pt-20 bg-cyntra-primary text-cyntra-primary">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
