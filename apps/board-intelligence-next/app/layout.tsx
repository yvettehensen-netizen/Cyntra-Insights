import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Board Intelligence Pipeline",
  description: "Bestuurlijke intelligentie pipeline met Supabase, OpenAI en PDF-rapportage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
