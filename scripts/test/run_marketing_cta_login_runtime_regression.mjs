#!/usr/bin/env node
import { chromium } from "playwright";
import { getLocalReportBaseUrl } from "./shared/getLocalReportBaseUrl.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const LOGIN_PATH = "/aurelius/login";
const SCAN_PATH = "/scan";

const marketingPages = [
  {
    path: "/",
    name: "homepage",
    scanLabel: /Start analyse/i,
    loginLabel: /Login naar dashboard|Login/i,
  },
  {
    path: "/hoe-het-werkt",
    name: "how-it-works",
    scanLabel: /Start korte scan/i,
    loginLabel: /Login volledig rapport/i,
  },
  {
    path: "/besluitdocument",
    name: "demo",
    scanLabel: /Start korte scan/i,
    loginLabel: /Login volledig rapport/i,
  },
  {
    path: "/prijzen",
    name: "pricing",
    scanLabel: /Start analyse/i,
  },
  {
    path: "/sectoren",
    name: "sectoren",
    scanLabel: /Start korte scan/i,
    loginLabel: /Login volledig rapport/i,
  },
];

async function expectLoginScreen(page) {
  await page.waitForURL(new RegExp(`${LOGIN_PATH.replace("/", "\\/")}`), { timeout: 30000 });
  await page.locator("#login-email").waitFor({ state: "visible", timeout: 30000 });
  await page.locator("#login-password").waitFor({ state: "visible", timeout: 30000 });
  await page.getByText(/Besloten toegang/i).waitFor({ state: "visible", timeout: 30000 });
}

async function openMarketingPage(page, baseUrl, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  await page.locator("body").waitFor({ state: "visible" });
}

async function verifyLoginCta(page, baseUrl, route, label) {
  await openMarketingPage(page, baseUrl, route);
  await page.getByRole("link", { name: label }).first().click();
  await expectLoginScreen(page);
}

async function verifyScanCta(page, baseUrl, route, label) {
  await openMarketingPage(page, baseUrl, route);
  await page.getByRole("link", { name: label }).first().click();
  await page.waitForURL(new RegExp(`${SCAN_PATH.replace("/", "\\/")}`), { timeout: 30000 });
  await page.getByRole("heading", { name: /Geen vragenlijst\./i }).waitFor({ state: "visible" });
}

async function verifyScanSubmitToLogin(page, baseUrl) {
  await openMarketingPage(page, baseUrl, SCAN_PATH);
  await page.getByLabel("Organisatie").fill("Jeugdzorg ZIJN");
  await page.getByLabel("Sector").selectOption("Zorg");
  await page.getByLabel("Kernuitdaging").fill(
    "De organisatie zoekt bestuurlijke focus terwijl wachtdruk en teamdruk oplopen."
  );
  await page.getByRole("button", { name: /Genereer korte output/i }).click();
  await expectLoginScreen(page);
}

async function main() {
  const baseUrl = getLocalReportBaseUrl();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleMessages = [];

  page.on("console", (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });

  for (const route of marketingPages) {
    if (route.loginLabel) {
      await verifyLoginCta(page, baseUrl, route.path, route.loginLabel);
    }

    if (route.scanLabel) {
      await verifyScanCta(page, baseUrl, route.path, route.scanLabel);
    }
  }

  await verifyScanSubmitToLogin(page, baseUrl);

  const currentUrl = page.url();
  assert(currentUrl.includes(LOGIN_PATH), `scan submit eindigde niet op login: ${currentUrl}`);

  await context.close();
  await browser.close();

  console.log("marketing CTA login runtime regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
