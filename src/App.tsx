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
import PortalErrorBoundary from "./components/PortalErrorBoundary";

/* ============================================================
   GUARDS
============================================================ */
import PortalGuard from "./aurelius/guards/PortalGuard";

/* ============================================================
   PUBLIC PAGES
============================================================ */
const HomePage = lazy(() => import("./pages/marketing/HomePage"));
const AureliusPage = lazy(() => import("./pages/marketing/AureliusPage"));
const HowItWorksPage = lazy(() => import("./pages/marketing/HowItWorksPage"));
const PricingPage = lazy(() => import("./pages/marketing/PricingPage"));
const SectorenPage = lazy(() => import("./pages/marketing/SectorenPage"));
const DemoPage = lazy(() => import("./pages/marketing/DemoPage"));
const StrategicQuickscan = lazy(() => import("./pages/StrategicQuickscan"));
const Contact = lazy(() => import("./pages/Contact"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const Bedankt = lazy(() => import("./pages/Bedankt"));

/* ============================================================
   AUTH
============================================================ */
import {
  AUTH_DEFAULT_AFTER_LOGIN_PATH,
  AUTH_FALLBACK_FORGOT_PASSWORD_PATH,
  AUTH_FALLBACK_LOGIN_PATH,
  AUTH_LOGIN_PATH,
  AUTH_RESET_PASSWORD_PATH,
  AUTH_SIGNUP_PATH,
} from "./auth/authPaths";
import {
  PORTAL_ANALYSIS_PATH,
  PORTAL_BENCHMARK_PATH,
  PORTAL_CASES_PATH,
  PORTAL_DATASET_PATH,
  PORTAL_DASHBOARD_PATH,
  PORTAL_INTERVENTIONS_PATH,
  PORTAL_ORGANIZATION_SCANNER_PATH,
  PORTAL_REPORT_PATH,
  PORTAL_REPORT_LIBRARY_PATH,
  PORTAL_SECTOR_INSIGHTS_PATH,
  PORTAL_SETTINGS_PATH,
  PORTAL_SIGNALS_PATH,
} from "./pages/portal/portalPaths";
const LoginPage = lazy(() => import("./auth/LoginPage"));

/* ============================================================
   PORTAL CORE
============================================================ */
const PortalHomePage = lazy(() => import("./pages/portal/PortalHomePage"));
const InstellingenPage = lazy(() => import("./pages/portal/InstellingenPage"));
const BoardTestPage = lazy(() => import("./pages/aurelius/BoardTestPage"));
const BoardEvaluationPage = lazy(() => import("./pages/aurelius/BoardEvaluationPage"));
const ExecutionDashboard = lazy(() => import("./execution/components/ExecutionDashboard"));
const StrategischeAnalyseSaaSPage = lazy(() => import("./pages/portal/saas/StrategischeAnalyseSaaSPage"));
const CyntraSaaSDashboardPage = lazy(() => import("./pages/portal/saas/CyntraSaaSDashboardPage"));

/* ============================================================
   AURELIUS ENGINE PAGES
============================================================ */
const EngineTest = lazy(() => import("./core/EngineTest"));

/* ============================================================
   PDF
============================================================ */
import { defaultWhiteLabel } from "./aurelius/pdf/whiteLabelConfig";

const UnifiedAnalysisPage = lazy(
  () => import("./aurelius/pages/analysis/UnifiedAnalysisPage")
);
const ControlSurface = lazy(() => import("./pages/aurelius/ControlSurface"));
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

function LegacyPortalReportRoute() {
  const { id } = useParams<{ id: string }>();
  return <StrategischRapportSaaSPage key={id ?? "report"} />;
}

function RedirectToCanonicalAnalysis() {
  return <Navigate to={PORTAL_ANALYSIS_PATH} replace />;
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
        <Route path="/analysis" element={<RedirectToCanonicalAnalysis />} />
        <Route path="/analysis/new" element={<RedirectToCanonicalAnalysis />} />
        <Route path="/analysis/session/:id" element={<RedirectToCanonicalAnalysis />} />
        <Route path="/aurelius" element={<AureliusPage />} />
        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
        <Route path="/scan" element={<StrategicQuickscan />} />
        <Route path="/prijzen" element={<PricingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/portal/login" element={<Navigate to={AUTH_LOGIN_PATH} replace />} />
        <Route path="/sectoren" element={<SectorenPage />} />
        <Route path="/besluitdocument" element={<DemoPage />} />
        <Route path={AUTH_LOGIN_PATH} element={<LoginPage />} />
        <Route path={AUTH_FALLBACK_LOGIN_PATH} element={<Navigate to={AUTH_LOGIN_PATH} replace />} />
        <Route path="/quickscan" element={<StrategicQuickscan />} />
        <Route path={AUTH_SIGNUP_PATH} element={<SignupPage />} />
        <Route path={AUTH_RESET_PASSWORD_PATH} element={<ResetPasswordPage />} />
        <Route
          path={AUTH_FALLBACK_FORGOT_PASSWORD_PATH}
          element={<Navigate to={AUTH_RESET_PASSWORD_PATH} replace />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/bedankt" element={<Bedankt />} />
      </Route>

      {/* PORTAL */}
      <Route element={<PortalGuard />}>
        <Route element={<PortalErrorBoundary><PortalLayout /></PortalErrorBoundary>}>
          <Route path="/portal/aurelius/intake/:type" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analys" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analys/:slug" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analyse" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analyse/:slug" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analysis" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/analysis/:slug" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal" element={<Navigate to={PORTAL_DASHBOARD_PATH} replace />} />
          <Route path="/portal/home" element={<PortalHomePage />} />
          <Route path={PORTAL_DASHBOARD_PATH} element={<CyntraSaaSDashboardPage />} />
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
          <Route path={PORTAL_ANALYSIS_PATH} element={<StrategischeAnalyseSaaSPage />} />
          <Route path={PORTAL_REPORT_LIBRARY_PATH} element={<StrategischRapportSaaSPage />} />
          <Route path={`${PORTAL_REPORT_PATH}/:id`} element={<LegacyPortalReportRoute />} />
          <Route path={PORTAL_INTERVENTIONS_PATH} element={<InterventiesSaaSPage />} />
          <Route path={PORTAL_CASES_PATH} element={<HistorischeCasesSaaSPage />} />
          <Route path={PORTAL_BENCHMARK_PATH} element={<BenchmarkSaaSPage />} />
          <Route path={PORTAL_SECTOR_INSIGHTS_PATH} element={<BrancheAnalyseSaaSPage />} />
          <Route path={PORTAL_SIGNALS_PATH} element={<SignalenSaaSPage />} />
          <Route path={PORTAL_DATASET_PATH} element={<DatasetSaaSPage />} />
          <Route path={PORTAL_ORGANIZATION_SCANNER_PATH} element={<OrganisatieScannerSaaSPage />} />
          <Route path={PORTAL_SETTINGS_PATH} element={<InstellingenSaaSPlatformPage />} />
          <Route path="/portal/rapporten/:id" element={<LegacyPortalReportRoute />} />
          <Route path="/portal/saas" element={<CyntraSaaSDashboardPage />} />
          <Route path="/portal/saas/analysis" element={<RedirectToCanonicalAnalysis />} />
          <Route path="/portal/saas/rapporten" element={<Navigate to={PORTAL_REPORT_LIBRARY_PATH} replace />} />
          <Route path="/portal/saas/interventies" element={<Navigate to={PORTAL_INTERVENTIONS_PATH} replace />} />
          <Route path="/portal/saas/cases" element={<Navigate to={PORTAL_CASES_PATH} replace />} />
          <Route path="/portal/saas/branche-analyse" element={<Navigate to={PORTAL_SECTOR_INSIGHTS_PATH} replace />} />
          <Route path="/portal/saas/sector-radar" element={<SectorRadarPage />} />
          <Route path="/portal/saas/organisatie-scanner" element={<Navigate to={PORTAL_ORGANIZATION_SCANNER_PATH} replace />} />
          <Route path="/portal/saas/autopilot" element={<AutopilotPage />} />
          <Route path="/portal/saas/ai-agent" element={<AIAgentPage />} />
          <Route path="/portal/saas/strategy-copilot" element={<StrategyCopilotPage />} />
          <Route path="/portal/saas/besluit-simulator" element={<BesluitSimulatorPage />} />
          <Route path="/portal/saas/boardroom" element={<BoardroomPage />} />
          <Route path="/portal/saas/strategische-kennis" element={<StrategischeKennisPage />} />
          <Route path="/portal/saas/benchmark" element={<Navigate to={PORTAL_BENCHMARK_PATH} replace />} />
          <Route path="/portal/saas/dataset" element={<Navigate to={PORTAL_DATASET_PATH} replace />} />
          <Route path="/portal/saas/voorspellingen" element={<VoorspellingenPage />} />
          <Route path="/portal/saas/signalen" element={<Navigate to={PORTAL_SIGNALS_PATH} replace />} />
          <Route path="/portal/saas/instellingen" element={<Navigate to={PORTAL_SETTINGS_PATH} replace />} />
          <Route path="/analyse" element={<Navigate to={PORTAL_ANALYSIS_PATH} replace />} />
          <Route path="/rapporten" element={<Navigate to={PORTAL_REPORT_LIBRARY_PATH} replace />} />
          <Route path="/interventies" element={<Navigate to={PORTAL_INTERVENTIONS_PATH} replace />} />
          <Route path="/historische-cases" element={<Navigate to={PORTAL_CASES_PATH} replace />} />
          <Route path="/benchmark" element={<Navigate to={PORTAL_BENCHMARK_PATH} replace />} />
          <Route path="/sector-radar" element={<Navigate to="/portal/saas/sector-radar" replace />} />
          <Route path="/signalen" element={<Navigate to={PORTAL_SIGNALS_PATH} replace />} />
          <Route path="/voorspellingen" element={<Navigate to="/portal/saas/voorspellingen" replace />} />
          <Route path="/organisatie-scanner" element={<Navigate to={PORTAL_ORGANIZATION_SCANNER_PATH} replace />} />
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
