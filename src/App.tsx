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
  Navigate,
} from "react-router-dom";

import "./styles/print.css";

/* ============================================================
   LAYOUTS
============================================================ */
import PublicLayout from "./layouts/PublicLayout";
import PortalLayout from "./layouts/PortalLayout";

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
import SectorenPage from "./pages/marketing/SectorenPage";
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
import DashboardDecisionOS from "./pages/portal/DashboardDecisionOS";
import ExecutionDashboard from "./execution/components/ExecutionDashboard";

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
const CyntraSaaSDashboardPage = lazy(
  () => import("./pages/portal/saas/CyntraSaaSDashboardPage")
);
const StrategischeAnalyseSaaSPage = lazy(
  () => import("./pages/portal/saas/StrategischeAnalyseSaaSPage")
);
const StrategischRapportSaaSPage = lazy(
  () => import("./pages/portal/saas/StrategischRapportSaaSPage")
);
const InterventiesSaaSPage = lazy(
  () => import("./pages/portal/saas/InterventiesSaaSPage")
);
const HistorischeCasesSaaSPage = lazy(
  () => import("./pages/portal/saas/HistorischeCasesSaaSPage")
);
const BrancheAnalyseSaaSPage = lazy(
  () => import("./pages/portal/saas/BrancheAnalyseSaaSPage")
);
const BenchmarkSaaSPage = lazy(
  () => import("./pages/portal/saas/BenchmarkSaaSPage")
);
const OrganisatieScannerSaaSPage = lazy(
  () => import("./pages/portal/saas/OrganisatieScannerSaaSPage")
);
const AutopilotPage = lazy(
  () => import("./pages/portal/saas/AutopilotPage")
);
const AIAgentPage = lazy(
  () => import("./pages/portal/saas/AIAgentPage")
);
const StrategyCopilotPage = lazy(
  () => import("./pages/portal/saas/StrategyCopilotPage")
);
const BesluitSimulatorPage = lazy(
  () => import("./pages/portal/saas/BesluitSimulatorPage")
);
const BoardroomPage = lazy(
  () => import("./pages/portal/saas/BoardroomPage")
);
const StrategischeKennisPage = lazy(
  () => import("./pages/portal/saas/StrategischeKennisPage")
);
const SectorRadarPage = lazy(
  () => import("./pages/portal/saas/SectorRadarPage")
);
const DatasetSaaSPage = lazy(
  () => import("./pages/portal/saas/DatasetSaaSPage")
);
const VoorspellingenPage = lazy(
  () => import("./pages/portal/saas/VoorspellingenPage")
);
const SignalenSaaSPage = lazy(
  () => import("./pages/portal/saas/SignalenSaaSPage")
);
const InstellingenSaaSPlatformPage = lazy(
  () => import("./pages/portal/saas/InstellingenSaaSPlatformPage")
);
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
        <div className="min-h-screen bg-cyntra-primary text-cyntra-secondary flex items-center justify-center">
          Executive omgeving wordt geladen...
        </div>
      }
    >
      <Routes>
        <Route path="/__health" element={<div>Gezondheid OK — Cyntra v4.0 live</div>} />
        <Route path="/__engine-test" element={<EngineTest />} />

      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
        <Route path="/scan" element={<StrategicQuickscan />} />
        <Route path="/prijzen" element={<PricingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/voor-consultants" element={<VoorConsultantsPage />} />
        <Route path="/sectoren" element={<SectorenPage />} />
        <Route path="/besluitdocument" element={<DemoPage />} />
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

      {/* PORTAL */}
      <Route element={<PortalGuard />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal/aurelius/intake/:type" element={<UnifiedAnalysisPage />} />
          <Route path="/portal/analyse/:slug" element={<UnifiedAnalysisPage />} />
          <Route path="/portal/analysis/:slug" element={<UnifiedAnalysisPage />} />
          <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="/portal/home" element={<PortalHomePage />} />
          <Route path="/portal/dashboard" element={<DashboardDecisionOS />} />
          <Route path="/aurelius/control-surface" element={<ControlSurface />} />
          <Route path="/aurelius/gebruikersinvoer" element={<BoardTestPage />} />
          <Route
            path="/aurelius/board-test"
            element={<Navigate to="/aurelius/gebruikersinvoer" replace />}
          />
          <Route
            path="/aurelius/board-evaluation"
            element={<BoardEvaluationPage />}
          />
          <Route path="/portal/rapporten" element={<RapportenPage />} />
          <Route path="/portal/rapporten/:id" element={<RapportDetailPage />} />
          <Route path="/portal/saas" element={<CyntraSaaSDashboardPage />} />
          <Route path="/portal/saas/analyse" element={<StrategischeAnalyseSaaSPage />} />
          <Route path="/portal/saas/rapporten" element={<StrategischRapportSaaSPage />} />
          <Route path="/portal/saas/interventies" element={<InterventiesSaaSPage />} />
          <Route path="/portal/saas/cases" element={<HistorischeCasesSaaSPage />} />
          <Route path="/portal/saas/branche-analyse" element={<BrancheAnalyseSaaSPage />} />
          <Route path="/portal/saas/sector-radar" element={<SectorRadarPage />} />
          <Route path="/portal/saas/organisatie-scanner" element={<OrganisatieScannerSaaSPage />} />
          <Route path="/portal/saas/autopilot" element={<AutopilotPage />} />
          <Route path="/portal/saas/ai-agent" element={<AIAgentPage />} />
          <Route path="/portal/saas/strategy-copilot" element={<StrategyCopilotPage />} />
          <Route path="/portal/saas/besluit-simulator" element={<BesluitSimulatorPage />} />
          <Route path="/portal/saas/boardroom" element={<BoardroomPage />} />
          <Route path="/portal/saas/strategische-kennis" element={<StrategischeKennisPage />} />
          <Route path="/portal/saas/benchmark" element={<BenchmarkSaaSPage />} />
          <Route path="/portal/saas/dataset" element={<DatasetSaaSPage />} />
          <Route path="/portal/saas/voorspellingen" element={<VoorspellingenPage />} />
          <Route path="/portal/saas/signalen" element={<SignalenSaaSPage />} />
          <Route path="/portal/saas/instellingen" element={<InstellingenSaaSPlatformPage />} />
          <Route path="/analyse" element={<Navigate to="/portal/saas/analyse" replace />} />
          <Route path="/rapporten" element={<Navigate to="/portal/saas/rapporten" replace />} />
          <Route path="/interventies" element={<Navigate to="/portal/saas/interventies" replace />} />
          <Route path="/historische-cases" element={<Navigate to="/portal/saas/cases" replace />} />
          <Route path="/benchmark" element={<Navigate to="/portal/saas/benchmark" replace />} />
          <Route path="/sector-radar" element={<Navigate to="/portal/saas/sector-radar" replace />} />
          <Route path="/signalen" element={<Navigate to="/portal/saas/signalen" replace />} />
          <Route path="/voorspellingen" element={<Navigate to="/portal/saas/voorspellingen" replace />} />
          <Route path="/organisatie-scanner" element={<Navigate to="/portal/saas/organisatie-scanner" replace />} />
          <Route path="/strategy-copilot" element={<Navigate to="/portal/saas/strategy-copilot" replace />} />
          <Route
            path="/portal/rapporten/:id/pdf"
            element={<AureliusReportTransitionRoute />}
          />
          <Route
            path="/portal/rapporten/:id/pdf/render"
            element={<AureliusReportPDFRoute />}
          />
          <Route path="/portal/instellingen" element={<InstellingenPage />} />
          <Route path="/execution" element={<ExecutionDashboard />} />
        </Route>
      </Route>

      {/* FALLBACK */}
        <Route path="*" element={<div>404 — Route niet gevonden</div>} />
      </Routes>
    </Suspense>
  );
}
