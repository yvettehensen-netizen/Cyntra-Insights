// src/layouts/PublicLayout.tsx
import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/layouts/Footer";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
