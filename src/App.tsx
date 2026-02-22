// ============================================================
// src/App.tsx
// CYNTRA ROUTER — COMPLETE • STABLE • DECISION-READY
// ============================================================

import { Suspense, lazy } from "react";
import {
  Routes,
  Route,
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
  SectorScaleupPage,
  SectorOverheidPage,
} from "./pages/marketing/SectorPages";
import StrategicQuickscan from "./pages/StrategicQuickscan";
import Contact from "./pages/Contact";
import SignupPage from "./pages/SignupPage";
import Bedankt from "./pages/Bedankt";
import DemoReportPage from "./pages/demo/DemoReportPage";

/* ============================================================
   AUTH
============================================================ */
import LoginPage from "./auth/LoginPage";

/* ============================================================
   PORTAL CORE
============================================================ */
import PortalHomePage from "./pages/portal/PortalHomePage";
import InstellingenPage from "./pages/portal/InstellingenPage";
import BoardTestPage from "./pages/aurelius/BoardTestPage";
import BoardEvaluationPage from "./pages/aurelius/BoardEvaluationPage";

/* ============================================================
   AURELIUS ENGINE PAGES
============================================================ */
import EngineTest from "./core/EngineTest";

/* ============================================================
   PDF
============================================================ */
import { defaultWhiteLabel } from "./aurelius/pdf/whiteLabelConfig";

const UnifiedAnalysisPage = lazy(
  () => import("./aurelius/pages/analysis/UnifiedAnalysisPage")
);
const ControlSurface = lazy(() => import("./pages/aurelius/ControlSurface"));
const RapportenPage = lazy(() => import("./pages/portal/RapportenPage"));
const RapportDetailPage = lazy(() => import("./pages/portal/RapportDetailPage"));
const AureliusReportTransitionPage = lazy(
  () => import("./aurelius/pdf/AureliusReportTransitionPage")
);
const AureliusReportPDF = lazy(() =>
  import("./aurelius/pdf/AureliusReportPDF").then((module) => ({
    default: module.AureliusReportPDF,
  }))
);

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
    return (
      <div className="mx-auto max-w-3xl p-8 text-white">
        Rapportcontext ontbreekt. Open het rapport opnieuw via de rapportenlijst.
      </div>
    );
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
   APP ROUTER
============================================================ */

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090d] text-white/70 flex items-center justify-center">
          Executive omgeving wordt geladen...
        </div>
      }
    >
      <Routes>
        <Route path="/__health" element={<div>Gezondheid OK</div>} />
        <Route path="/__engine-test" element={<EngineTest />} />

      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
        <Route path="/prijzen" element={<PricingPage />} />
        <Route path="/voor-consultants" element={<VoorConsultantsPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/demo-report" element={<DemoReportPage />} />
        <Route path="/aurelius" element={<AureliusPreview />} />
        <Route path="/aurelius/login" element={<LoginPage />} />
        <Route path="/zorgscan" element={<ZorgScanPreviewPage />} />
        <Route path="/scaleups" element={<SectorScaleupPage />} />
        <Route path="/overheid" element={<SectorOverheidPage />} />
        <Route path="/quickscan" element={<StrategicQuickscan />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bedankt" element={<Bedankt />} />
      </Route>

      {/* UNIFIED EXECUTIVE FLOW — NO HIDDEN GUARDS */}
      <Route element={<AureliusLayout />}>
        <Route path="/aurelius/control-surface" element={<ControlSurface />} />
        <Route path="/portal/aurelius/intake/:type" element={<UnifiedAnalysisPage />} />
        <Route path="/portal/analyse/:slug" element={<UnifiedAnalysisPage />} />
      </Route>

      {/* PORTAL */}
      <Route element={<PortalGuard />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<PortalHomePage />} />
        </Route>

        <Route element={<AureliusLayout />}>
          <Route path="/aurelius/board-test" element={<BoardTestPage />} />
          <Route
            path="/aurelius/board-evaluation"
            element={<BoardEvaluationPage />}
          />

          {/* RAPPORTEN */}
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

          {/* SETTINGS */}
          <Route path="/portal/instellingen" element={<InstellingenPage />} />
        </Route>
      </Route>

      {/* FALLBACK */}
        <Route path="*" element={<div>404 — Route niet gevonden</div>} />
      </Routes>
    </Suspense>
  );
}
