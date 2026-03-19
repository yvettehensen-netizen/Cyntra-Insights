#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

const app = read("src/App.tsx");
const quickscan = read("src/pages/StrategicQuickscan.tsx");

const marketingFiles = [
  "src/pages/marketing/HomePage.tsx",
  "src/pages/marketing/HowItWorksPage.tsx",
  "src/pages/marketing/PricingPage.tsx",
  "src/pages/marketing/DemoPage.tsx",
  "src/pages/marketing/SectorenPage.tsx",
  "src/pages/marketing/analysis/AnalysisOverviewPage.tsx",
  "src/pages/marketing/analysis/AnalysisDetailPage.tsx",
  "src/pages/marketing/solutions/StrategyPage.tsx",
  "src/pages/marketing/solutions/TeamPage.tsx",
  "src/pages/marketing/solutions/OnderstroomPage.tsx",
  "src/pages/marketing/solutions/FinancePage.tsx",
  "src/pages/marketing/solutions/GrowthPage.tsx",
];

const marketingSources = marketingFiles.map((file) => ({ file, source: read(file) }));

assert(
  app.includes('path={AUTH_LOGIN_PATH} element={<LoginPage />}'),
  "router mist canonical login route voor marketing CTA's"
);

for (const { file, source } of marketingSources) {
  assert(
    source.includes('to="/scan"') ||
      source.includes('to="/aurelius/login"') ||
      source.includes('to: "/scan"') ||
      source.includes('to: "/aurelius/login"') ||
      source.includes("AUTH_LOGIN_PATH"),
    `${file} mist marketing CTA naar scan of login`
  );
  assert(
    !source.includes('to="/login"'),
    `${file} gebruikt nog verouderde /login route`
  );
}

assert(
  quickscan.includes("const navigate = useNavigate();"),
  "quickscan mist navigate-hook voor login handoff"
);

assert(
  quickscan.includes("navigate(AUTH_LOGIN_PATH, {") &&
    quickscan.includes('source: "marketing-scan"') &&
    quickscan.includes("from: AUTH_DEFAULT_AFTER_LOGIN_PATH"),
  "quickscan stuurt submit niet door naar login met marketing scan context"
);

assert(
  quickscan.includes("event.preventDefault();") &&
    quickscan.includes("setSubmitted(true);"),
  "quickscan submitflow is niet meer expliciet"
);

console.log("marketing CTA login regression passed");
