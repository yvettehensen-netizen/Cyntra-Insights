import { defineConfig, loadEnv } from "vite";
import type { ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createServer as createNodeServer } from "./src/server/server.js";

function normalizeBaseUrl(value: string) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/(?:rest|auth|storage)\/v1$/i, "");
}

function toFunctionsBase(value: string) {
  const base = normalizeBaseUrl(value).replace(/\/aurelius-analyze$/i, "");
  if (!base) return "";
  if (/\/functions\/v\d+$/i.test(base)) return base;
  if (/\/functions$/i.test(base)) return `${base}/v1`;
  if (/\.functions\.supabase\.co\/v\d+$/i.test(base)) return base;
  if (/\.functions\.supabase\.co$/i.test(base)) return `${base}/v1`;
  return `${base}/functions/v1`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = normalizeBaseUrl(
    env.VITE_SUPABASE_URL || env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || ""
  );
  const supabaseFunctionsUrl = toFunctionsBase(
    env.VITE_SUPABASE_FUNCTIONS_URL ||
      env.SUPABASE_FUNCTIONS_URL ||
      env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ||
      env.VITE_SUPABASE_FUNCTION_URL ||
      env.SUPABASE_FUNCTION_URL ||
      env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
      env.FUNCTIONS_URL ||
      env.FUNCTION_URL ||
      supabaseUrl
  );
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return {
    plugins: [
      react(),
      {
        name: "cyntra-backend-middleware",
        configureServer(server: ViteDevServer) {
          const app = createNodeServer();
          server.middlewares.use("/api", app);
        },
      },
    ],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_FUNCTIONS_URL": JSON.stringify(supabaseFunctionsUrl),
      "import.meta.env.VITE_SUPABASE_FUNCTION_URL": JSON.stringify(supabaseFunctionsUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            supabase: [
              "@supabase/supabase-js",
              "@supabase/auth-helpers-react",
              "@supabase/postgrest-js",
              "@supabase/realtime-js",
            ],
            pdf: [
              "jspdf",
              "jspdf-autotable",
              "html2canvas",
              "html2pdf.js",
              "@react-pdf/renderer",
            ],
            charts: ["chart.js", "react-chartjs-2", "recharts"],
            ui: ["framer-motion", "lucide-react"],
          },
        },
      },
    },
  };
});
