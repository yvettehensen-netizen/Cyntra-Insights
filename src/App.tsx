// ============================================================
// src/App.tsx
// ✅ CYNTRA ROUTER — COMPLETE + ZORGSCAN PRODUCTS
// ✅ ADD ONLY — NO DOWNGRADE — STABLE
// ============================================================

import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";

import "./styles/print.css";

/* ================= LAYOUTS ================= */
import PublicLayout from "./layouts/PublicLayout";
import PortalLayout from "./layouts/PortalLayout";
import AureliusLayout from "./layouts/AureliusLayout";

/* ================= GUARD ================= */
import PortalGuard from "./aurelius/guards/PortalGuard";

/* ================= PUBLIC ================= */
import HomePage from "./pages/marketing/HomePage";
import HowItWorksPage from "./pages/marketing/HowItWorksPage";
import PricingPage from "./pages/marketing/PricingPage";
import VoorConsultantsPage from "./pages/marketing/VoorConsultantsPage";
import DemoPage from "./pages/marketing/DemoPage";
import AureliusPreview from "./pages/marketing/solutions/AureliusPreview";
import ZorgScanPreviewPage from "./pages/marketing/ZorgScanPreviewPage";

/* ================= AUTH ================= */
import LoginPage from "./auth/LoginPage";

/* ================= PORTAL ================= */
import PortalHomePage from "./pages/portal/PortalHomePage";
import DashboardPage from "./pages/portal/DashboardPage";
import RapportenPage from "./pages/portal/RapportenPage";
import RapportDetailPage from "./pages/portal/RapportDetailPage";
import InstellingenPage from "./pages/portal/InstellingenPage";

/* ================= ANALYSIS ENGINE ================= */
import UnifiedAnalysisPage from "./aurelius/pages/analysis/UnifiedAnalysisPage";

/* ================= ZORGSCAN PRODUCTS ================= */
import ZorgScanPage from "./pages/portal/ZorgScanPage";
import ZorgScanResultPage from "./pages/portal/ZorgScanResultPage";
import ZorgSpanningPage from "./pages/portal/ZorgSpanningPage";
import ZorgSpanningResultPage from "./pages/portal/ZorgSpanningResultPage";

/* ================= PDF ================= */
import { AureliusReportPDF } from "./aurelius/pdf/AureliusReportPDF";
import AureliusReportTransitionPage from "./aurelius/pdf/AureliusReportTransitionPage";
import { defaultWhiteLabel } from "./aurelius/pdf/whiteLabelConfig";

/* ============================================================
   PDF ROUTES (SAFE)
============================================================ */

function AureliusReportTransitionRoute() {
  const { id } = useParams<{ id: string }>();
  return <AureliusReportTransitionPage analysisType={id ?? "Analyse"} />;
}

function AureliusReportPDFRoute() {
  const location = useLocation() as any;

  if (!location.state?.result) {
    return <Navigate to="/portal/rapporten" replace />;
  }

  return (
    <AureliusReportPDF
      title={location.state.title}
      company={location.state.company}
      date={location.state.date}
      result={location.state.result}
      whiteLabel={defaultWhiteLabel}
    />
  );
}

/* ============================================================
   ✅ APP ROUTER — CANONICAL
============================================================ */

export default function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
        <Route path="/prijzen" element={<PricingPage />} />
        <Route path="/voor-consultants" element={<VoorConsultantsPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/aurelius" element={<AureliusPreview />} />
        <Route path="/aurelius/login" element={<LoginPage />} />

        {/* ✅ PUBLIC ZORGSCAN (LEAD GENERATION) */}
        <Route path="/zorgscan" element={<ZorgScanPreviewPage />} />

        {/* ======================================================
           ✅ ADD ONLY — FUTURE PUBLIC ZORG PRODUCTS (PLACEHOLDERS)
        ====================================================== */}

        {/* <Route path="/zorgspanning" element={<ZorgSpanningPreviewPage />} /> */}
        {/* <Route path="/zorgarchitectuur" element={<ZorgArchitectuurPreviewPage />} /> */}
      </Route>

      {/* ======================================================
          PORTAL ROUTES (AUTH REQUIRED)
      ====================================================== */}
      <Route element={<PortalGuard />}>
        {/* Portal shell */}
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<PortalHomePage />} />

          {/* ======================================================
             ✅ ADD ONLY — OPTIONAL DEFAULT PORTAL REDIRECT
             Prevent users landing on empty shell routes
          ====================================================== */}
          {/* <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} /> */}
        </Route>

        {/* Aurelius cockpit */}
        <Route element={<AureliusLayout />}>
          <Route path="/portal/dashboard" element={<DashboardPage />} />

          {/* Core analysis */}
          <Route
            path="/portal/analyse/:slug"
            element={<UnifiedAnalysisPage />}
          />

          {/* ================= ZORG PRODUCTEN ================= */}

          <Route path="/portal/zorg-scan" element={<ZorgScanPage />} />

          <Route
            path="/portal/zorg-scan/result/:id"
            element={<ZorgScanResultPage />}
          />

          {/* ======================================================
             ✅ ADD ONLY — ROUTE GUARD PLACEHOLDER (FUTURE)
             If state missing → backend fetch by scan_id
          ====================================================== */}
          {/*
          <Route
            path="/portal/zorg-scan/result/:id"
            element={<ZorgScanResultPageWithFetch />}
          />
          */}

          <Route path="/portal/zorg-spanning" element={<ZorgSpanningPage />} />
          <Route
            path="/portal/zorg-spanning/result/:id"
            element={<ZorgSpanningResultPage />}
          />

          {/* ======================================================
             ✅ ADD ONLY — FUTURE PORTAL ZORG MODULES
          ====================================================== */}

          {/* <Route path="/portal/zorg-roadmap" element={<ZorgRoadmapPage />} /> */}
          {/* <Route path="/portal/zorg-boardroom" element={<ZorgBoardroomPage />} /> */}

          {/* ================= RAPPORTEN ================= */}
          <Route path="/portal/rapporten" element={<RapportenPage />} />
          <Route path="/portal/rapporten/:id" element={<RapportDetailPage />} />

          <Route
            path="/portal/rapporten/:id/pdf"
            element={<AureliusReportTransitionRoute />}
          />
          <Route
            path="/portal/rapporten/:id/pdf/render"
            element={<AureliusReportPDFRoute />}
          />

          {/* ================= INSTELLINGEN ================= */}
          <Route path="/portal/instellingen" element={<InstellingenPage />} />
        </Route>
      </Route>

      {/* ======================================================
          FALLBACK
      ====================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
