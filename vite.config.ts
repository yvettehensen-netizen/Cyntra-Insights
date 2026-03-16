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
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
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
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("/react/") ||
                id.includes("/react-dom/") ||
                id.includes("/react-router-dom/")
              ) {
                return "react";
              }
              if (
                id.includes("@supabase/supabase-js") ||
                id.includes("@supabase/auth-helpers-react") ||
                id.includes("@supabase/postgrest-js") ||
                id.includes("@supabase/realtime-js")
              ) {
                return "supabase";
              }
              if (id.includes("@react-pdf/renderer")) {
                return "react-pdf-renderer";
              }
              if (id.includes("@react-pdf/layout") || id.includes("@react-pdf/textkit")) {
                return "react-pdf-layout";
              }
              if (
                id.includes("@react-pdf/font")
              ) {
                return "react-pdf-font";
              }
              if (
                id.includes("/fontkit/") ||
                id.includes("/unicode-properties/") ||
                id.includes("/unicode-trie/") ||
                id.includes("/linebreak/")
              ) {
                return "react-pdf-fontkit";
              }
              if (id.includes("@react-pdf/pdfkit")) {
                return "react-pdf-pdfkit";
              }
              if (id.includes("@react-pdf/render")) {
                return "react-pdf-render";
              }
              if (id.includes("@react-pdf/reconciler")) {
                return "react-pdf-reconciler";
              }
              if (id.includes("@react-pdf/image")) {
                return "react-pdf-image";
              }
              if (id.includes("@react-pdf/stylesheet")) {
                return "react-pdf-stylesheet";
              }
              if (id.includes("@react-pdf/primitives")) {
                return "react-pdf-primitives";
              }
              if (id.includes("@react-pdf/fns")) {
                return "react-pdf-fns";
              }
              if (id.includes("@react-pdf/png-js")) {
                return "react-pdf-png";
              }
              if (id.includes("@react-pdf/types")) {
                return "react-pdf-types";
              }
              if (id.includes("/yoga-layout/")) {
                return "react-pdf-yoga";
              }
              if (
                id.includes("/jspdf/") ||
                id.includes("jspdf-autotable")
              ) {
                return "pdf-jspdf";
              }
              if (id.includes("/html2canvas/") || id.includes("/html2pdf.js/")) {
                return "pdf-html";
              }
              if (
                id.includes("/chart.js/") ||
                id.includes("/react-chartjs-2/") ||
                id.includes("/recharts/")
              ) {
                return "charts";
              }
              if (id.includes("/framer-motion/") || id.includes("/lucide-react/")) {
                return "ui";
              }
            }

            if (id.includes("/src/pages/marketing/")) return "marketing-pages";
            if (id.includes("/src/aurelius/pages/analysis/")) return "aurelius-analysis";
            if (id.includes("/src/aurelius/pdf/")) return "aurelius-pdf";
            if (id.includes("/src/components/reports/")) return "report-components";

            return undefined;
          },
        },
      },
    },
  };
});
