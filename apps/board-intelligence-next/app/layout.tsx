import type { Metadata } from "next";
import "@/app/globals.css";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Board Intelligence Pipeline",
  description: "Bestuurlijke intelligentie pipeline met Supabase, OpenAI en PDF-rapportage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
