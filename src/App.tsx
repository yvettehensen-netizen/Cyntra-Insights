// ============================================================
// src/App.tsx
// CYNTRA ROUTER — COMPLETE • STABLE • DECISION-READY
//
// GARANTIES:
// - GEEN DOWNGRADE
// - ADD ONLY
// - Aurelius Intake Wizard actief en bereikbaar
// - Zorgscan + Aurelius + PDF flows intact
// ============================================================

import {
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";

import "./styles/print.css";

/* ============================================================
   LAYOUTS
============================================================ */
import PublicLayout from "./layouts/PublicLayout";
import PortalLayout from "./layouts/PortalLayout";
import AureliusLayout from "./layouts/AureliusLayout";

/* ============================================================
   GUARDS
============================================================ */
import PortalGuard from "./aurelius/guards/PortalGuard";
import UnifiedSurfaceGuard from "./aurelius/guards/UnifiedSurfaceGuard";

/* ============================================================
   PUBLIC PAGES
============================================================ */
import HomePage from "./pages/marketing/HomePage";
import HowItWorksPage from "./pages/marketing/HowItWorksPage";
import PricingPage from "./pages/marketing/PricingPage";
import VoorConsultantsPage from "./pages/marketing/VoorConsultantsPage";
import DemoPage from "./pages/marketing/DemoPage";
import AureliusPreview from "./pages/marketing/solutions/AureliusPreview";
import ZorgScanPreviewPage from "./pages/marketing/ZorgScanPreviewPage";
import {
  SectorZorgPage,
  SectorScaleupPage,
  SectorOverheidPage,
} from "./pages/marketing/SectorPages";
import StrategicQuickscan from "./pages/StrategicQuickscan";
import Contact from "./pages/Contact";
import SignupPage from "./pages/SignupPage";
import Bedankt from "./pages/Bedankt";
import DemoReportPage from "./pages/demo/DemoReportPage";
import VitalFitPage from "./pages/marketing/VitalFitPage";

/* ============================================================
   AUTH
============================================================ */
import LoginPage from "./auth/LoginPage";

/* ============================================================
   PORTAL CORE
============================================================ */
import PortalHomePage from "./pages/portal/PortalHomePage";
import RapportenPage from "./pages/portal/RapportenPage";
import RapportDetailPage from "./pages/portal/RapportDetailPage";
import InstellingenPage from "./pages/portal/InstellingenPage";
import ControlSurface from "./pages/aurelius/ControlSurface";
import BoardTestPage from "./pages/aurelius/BoardTestPage";

/* ============================================================
   AURELIUS ENGINE PAGES
============================================================ */
import UnifiedAnalysisPage from "./aurelius/pages/analysis/UnifiedAnalysisPage";
import IntakeWizardAurelius from "./aurelius/IntakeWizardAurelius";

/* ============================================================
   ZORGSCAN PRODUCTS
============================================================ */
import ZorgScanPage from "./pages/portal/ZorgScanPage";
import ZorgScanResultPage from "./pages/portal/ZorgScanResultPage";
import ZorgSpanningPage from "./pages/portal/ZorgSpanningPage";
import ZorgSpanningResultPage from "./pages/portal/ZorgSpanningResultPage";
import PemVrrScanPage from "./pages/portal/PemVrrScanPage";
import PemVrrResultPage from "./pages/portal/PemVrrResultPage";
import PemImposterScanPage from "./pages/portal/PemImposterScanPage";
import PemImposterResultPage from "./pages/portal/PemImposterResultPage";
import PemFitsHubPage from "./pages/portal/PemFitsHubPage";
import PemDynamicScanPage from "./pages/portal/PemDynamicScanPage";
import PemDynamicResultPage from "./pages/portal/PemDynamicResultPage";
import ScaleupScanPage from "./pages/portal/ScaleupScanPage";
import ScaleupScanResultPage from "./pages/portal/ScaleupScanResultPage";
import BoardTensionScanPage from "./pages/portal/BoardTensionScanPage";
import BoardTensionResultPage from "./pages/portal/BoardTensionResultPage";

/* ============================================================
   PDF
============================================================ */
import { AureliusReportPDF } from "./aurelius/pdf/AureliusReportPDF";
import AureliusReportTransitionPage from "./aurelius/pdf/AureliusReportTransitionPage";
import { defaultWhiteLabel } from "./aurelius/pdf/whiteLabelConfig";
import { ENABLE_UNIFIED_SURFACE } from "./config/featureFlags";

/* ============================================================
   PDF ROUTES
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
   APP ROUTER — CANONICAL
============================================================ */

export default function App() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC
      ====================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
        <Route path="/prijzen" element={<PricingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/voor-consultants" element={<VoorConsultantsPage />} />
        <Route path="/consultants" element={<VoorConsultantsPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/demo-report" element={<DemoReportPage />} />
        <Route path="/aurelius" element={<AureliusPreview />} />
        <Route path="/aurelius/login" element={<LoginPage />} />
        <Route path="/zorgscan" element={<ZorgScanPreviewPage />} />
        <Route path="/vitalfit" element={<VitalFitPage />} />
        <Route path="/vitalfit-scan" element={<VitalFitPage />} />
        <Route path="/zorg" element={<SectorZorgPage />} />
        <Route path="/scaleups" element={<SectorScaleupPage />} />
        <Route path="/overheid" element={<SectorOverheidPage />} />
        <Route path="/quickscan" element={<StrategicQuickscan />} />
        <Route path="/quickscan-gratis" element={<StrategicQuickscan />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bedankt" element={<Bedankt />} />
        <Route element={<UnifiedSurfaceGuard />}>
          <Route path="/analysis/*" element={<Navigate to="/aurelius/control-surface" replace />} />
        </Route>
      </Route>

      {/* ======================================================
          PORTAL (AUTH)
      ====================================================== */}
      <Route element={<PortalGuard />}>
        <Route element={<PortalLayout />}>
          <Route
            path="/portal"
            element={
              ENABLE_UNIFIED_SURFACE ? (
                <Navigate to="/aurelius/control-surface" replace />
              ) : (
                <PortalHomePage />
              )
            }
          />
        </Route>

        <Route element={<AureliusLayout />}>
          <Route path="/aurelius/control-surface" element={<ControlSurface />} />
          <Route path="/aurelius/board-test" element={<BoardTestPage />} />
          <Route path="/executive" element={<Navigate to="/aurelius/control-surface" replace />} />
          <Route path="/executive/aurelius" element={<Navigate to="/aurelius/control-surface" replace />} />
          <Route path="/portal/dashboard" element={<Navigate to="/aurelius/control-surface" replace />} />

          {/* ================= AURELIUS ================= */}
          {/* ✅ ADD ONLY — Intake Wizard (Decision-aware) */}
          <Route
            path="/portal/aurelius/intake/:type"
            element={
              ENABLE_UNIFIED_SURFACE ? (
                <Navigate to="/aurelius/control-surface" replace />
              ) : (
                <IntakeWizardAurelius />
              )
            }
          />

          <Route
            path="/portal/analyse/:slug"
            element={
              ENABLE_UNIFIED_SURFACE ? (
                <Navigate to="/aurelius/control-surface" replace />
              ) : (
                <UnifiedAnalysisPage />
              )
            }
          />
          <Route
            path="/portal/analysis/:slug"
            element={<Navigate to="/aurelius/control-surface" replace />}
          />
          <Route
            path="/portal/nieuwe-analyse"
            element={
              ENABLE_UNIFIED_SURFACE ? (
                <Navigate to="/aurelius/control-surface" replace />
              ) : (
                <Navigate to="/portal/aurelius/intake/strategy" replace />
              )
            }
          />

          {/* ================= ZORG ================= */}
          <Route path="/portal/zorg-scan" element={<ZorgScanPage />} />
          <Route
            path="/portal/zorg-scan/result/:id"
            element={<ZorgScanResultPage />}
          />
          <Route path="/portal/zorg-spanning" element={<ZorgSpanningPage />} />
          <Route
            path="/portal/zorg-spanning/result/:id"
            element={<ZorgSpanningResultPage />}
          />
          <Route path="/portal/pem-vrr-scan" element={<PemVrrScanPage />} />
          <Route
            path="/portal/pem-vrr/result/:id"
            element={<PemVrrResultPage />}
          />
          <Route
            path="/portal/pem-imposter-scan"
            element={<PemImposterScanPage />}
          />
          <Route
            path="/portal/pem-imposter/result/:id"
            element={<PemImposterResultPage />}
          />
          <Route path="/portal/fits" element={<PemFitsHubPage />} />
          <Route
            path="/portal/fits/:scanId"
            element={<PemDynamicScanPage />}
          />
          <Route
            path="/portal/fits/:scanId/result/:id"
            element={<PemDynamicResultPage />}
          />
          <Route path="/portal/scaleup-scan" element={<ScaleupScanPage />} />
          <Route
            path="/portal/scaleup-scan/result/:id"
            element={<ScaleupScanResultPage />}
          />
          <Route
            path="/portal/board-tension-scan"
            element={<BoardTensionScanPage />}
          />
          <Route
            path="/portal/board-tension-scan/result/:id"
            element={<BoardTensionResultPage />}
          />

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

          {/* ================= SETTINGS ================= */}
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
