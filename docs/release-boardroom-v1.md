## Release Package — Boardroom v1 Production

### Doel
Deze release consolideert de eerste productieklare boardroom-slice van Cyntra Insights.

De scope is beperkt tot:
- boardroom rendering
- memo formatter / rewrite-presentatie
- PDF/UI parity
- marketing CTA → login flow
- release-gates en regressies

Deze release omvat nadrukkelijk niet:
- bredere enginewijzigingen
- platform/storage-refactors
- overige portalwijzigingen buiten deze scope

### Release scope

#### Boardroom rendering
- `src/components/reports/BoardroomView.tsx`
- `src/components/reports/DecisionCockpit.tsx`
- `src/components/reports/StrategyReportView.tsx`
- `src/components/reports/reportViewStyles.ts`
- `src/components/reports/ReportSection.tsx`
- `src/components/reports/DecisionBlock.tsx`
- `src/components/reports/ScenarioBlock.tsx`
- `src/components/reports/ScenarioSection.tsx`
- `src/components/reports/boardroomMemoFormatter.ts`
- `src/components/reports/boardroomMemoRewriter.ts`

#### Boardroom guardrails
- `src/engine/contentIntegrityGuard.ts`
- `src/engine/reportValidator.ts`
- `src/engine/rewriteLayer.ts`
- `src/utils/sanitizeReportOutput.ts`

#### PDF parity
- `src/services/reportPdf.ts`

#### Marketing CTA → login
- `src/App.tsx`
- `src/auth/LoginPage.tsx`
- `src/components/PublicNavbar.tsx`
- `src/layouts/Footer.tsx`
- `src/pages/StrategicQuickscan.tsx`
- `src/pages/marketing/HomePage.tsx`
- `src/pages/marketing/HowItWorksPage.tsx`
- `src/pages/marketing/DemoPage.tsx`
- `src/pages/marketing/PricingPage.tsx`
- `src/pages/marketing/SectorenPage.tsx`
- `src/pages/marketing/solutions/FinancePage.tsx`
- `src/pages/marketing/solutions/GrowthPage.tsx`
- `src/pages/marketing/solutions/OnderstroomPage.tsx`
- `src/pages/marketing/solutions/StrategyPage.tsx`
- `src/pages/marketing/solutions/TeamPage.tsx`

#### Regressies en release-governance
- `scripts/test/run_boardroom_release_gate.mjs`
- `scripts/test/run_marketing_cta_login_regression.mjs`
- `scripts/test/run_marketing_cta_login_runtime_regression.mjs`
- `scripts/test/run_report_render_quality_regression.mjs`
- `scripts/test/run_report_pdf_actions_regression.mjs`
- `scripts/test/run_short_dossier_export_regression.mjs`
- `tests/rapport/boardroom-document-compiler.test.ts`
- `tests/rapport/boardroom-memo-rewriter.test.ts`
- `tests/rapport/content-integrity-guard.test.ts`
- `tests/rapport/short-dossier-canonical-fallback.test.ts`

#### Release documents
- `docs/release-boardroom-checklist.md`
- `docs/go-no-go-boardroom-v1.md`
- `docs/rollback-boardroom-v1.md`
- `docs/release-boardroom-v1.md`

### Niet meenemen in deze release
- alles onder `src/aurelius/engine`
- alles onder `src/aurelius/core`
- `src/pages/portal/saas/usePlatformApiBridge.ts`
- `src/pages/portal/saas/StrategischRapportSaaSPage.tsx`
- `src/platform/AnalysisSessionManager.ts`
- `src/platform/ReportDeliveryService.ts`
- `src/services/exportService.ts`
- `src/services/reportStorage.ts`
- fixture churn, caches, losse rapportartefacten en `.DS_Store`

### Staging-lijst
```bash
git add \
  docs/release-boardroom-checklist.md \
  docs/go-no-go-boardroom-v1.md \
  docs/rollback-boardroom-v1.md \
  docs/release-boardroom-v1.md \
  scripts/test/run_boardroom_release_gate.mjs \
  scripts/test/run_marketing_cta_login_regression.mjs \
  scripts/test/run_marketing_cta_login_runtime_regression.mjs \
  scripts/test/run_report_pdf_actions_regression.mjs \
  scripts/test/run_report_render_quality_regression.mjs \
  scripts/test/run_short_dossier_export_regression.mjs \
  src/App.tsx \
  src/auth/LoginPage.tsx \
  src/components/PublicNavbar.tsx \
  src/components/reports/BoardroomView.tsx \
  src/components/reports/DecisionBlock.tsx \
  src/components/reports/DecisionCockpit.tsx \
  src/components/reports/ReportSection.tsx \
  src/components/reports/ScenarioBlock.tsx \
  src/components/reports/ScenarioSection.tsx \
  src/components/reports/StrategyReportView.tsx \
  src/components/reports/boardroomMemoFormatter.ts \
  src/components/reports/boardroomMemoRewriter.ts \
  src/components/reports/reportViewStyles.ts \
  src/engine/contentIntegrityGuard.ts \
  src/engine/reportValidator.ts \
  src/engine/rewriteLayer.ts \
  src/layouts/Footer.tsx \
  src/pages/StrategicQuickscan.tsx \
  src/pages/marketing/DemoPage.tsx \
  src/pages/marketing/HomePage.tsx \
  src/pages/marketing/HowItWorksPage.tsx \
  src/pages/marketing/PricingPage.tsx \
  src/pages/marketing/SectorenPage.tsx \
  src/pages/marketing/solutions/FinancePage.tsx \
  src/pages/marketing/solutions/GrowthPage.tsx \
  src/pages/marketing/solutions/OnderstroomPage.tsx \
  src/pages/marketing/solutions/StrategyPage.tsx \
  src/pages/marketing/solutions/TeamPage.tsx \
  src/services/reportPdf.ts \
  src/utils/sanitizeReportOutput.ts \
  tests/rapport/boardroom-document-compiler.test.ts \
  tests/rapport/boardroom-memo-rewriter.test.ts \
  tests/rapport/content-integrity-guard.test.ts \
  tests/rapport/short-dossier-canonical-fallback.test.ts
```

### Controle staged scope
```bash
git diff --cached --name-only
```

### Validatie vóór release
```bash
npm run build
node scripts/test/run_boardroom_release_gate.mjs
REPORT_E2E_BASE_URL='http://127.0.0.1:4174' node scripts/test/run_boardroom_release_gate.mjs
```

### Commit message
```bash
git commit -m "Consolidate boardroom rendering, PDF parity, and marketing login flow"
```

### PR samenvatting
- boardroom rendering opgeschoond en memo-first gemaakt
- PDF-uitvoer dichter bij UI gebracht
- marketing CTA-flow naar login hard gemaakt
- regressies en release-gates toegevoegd
- scope bewust beperkt tot rendering/presentation slice

### Go / No-Go
Gebruik:
- `docs/go-no-go-boardroom-v1.md`

### Rollback
Gebruik:
- `docs/rollback-boardroom-v1.md`

### Releasebesluit
Alleen releasen als:
- build groen is
- release-gate groen is
- runtime CTA E2E groen is
- staged scope exact overeenkomt met deze release-slice
