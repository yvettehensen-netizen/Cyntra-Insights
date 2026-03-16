#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const repoRoot = process.cwd();
  const baseUrl = process.env.REPORT_E2E_BASE_URL || "http://127.0.0.1:4174";
  const sourcePath = path.join(repoRoot, "scripts/test/fixtures/jeugdzorg_zijn_source.txt");
  const sourceText = fs.readFileSync(sourcePath, "utf8");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleMessages = [];

  page.on("console", (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });

  await page.addInitScript(() => {
    window.localStorage.setItem("cyntra_portal_dev_auth_bypass", "1");
  });

  await page.goto(`${baseUrl}/portal/analyse/strategy`, { waitUntil: "networkidle" });
  await page.locator("#analysis-organisation-name").waitFor({ state: "visible" });

  await page.locator("#analysis-organisation-name").fill("Jeugdzorg ZIJN");
  await page.locator("#analysis-sector").fill("Jeugdzorg");
  await page.locator("#analysis-organisation-size").fill("Middelgroot");
  await page.locator("#analysis-subscription").selectOption("Professional");
  await page.locator("#analysis-input").fill(sourceText);

  await page.getByRole("button", { name: "Analyse starten", exact: true }).click();

  await page.waitForURL(/\/portal\/rapport\//, { timeout: 90000 });
  await page.getByText(/BESTUURLIJKE BESLISKAART/i).waitFor({ state: "visible", timeout: 90000 });
  await page.getByText(/HGBCO/i).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Volledig dossier", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Kort dossier", exact: true }).waitFor({ state: "visible" });

  const bodyText = await page.locator("body").innerText();
  assert(/Jeugdzorg/.test(bodyText), "rapportpagina mist sectorspecifieke inhoud");
  assert(/Brede ambulante specialist blijven binnen consortium- en contractdiscipline/i.test(bodyText), "aanbevolen keuze ontbreekt in rapport");
  assert(!/Analysekwaliteit onder publicatiedrempel/i.test(bodyText), "rapport wordt nog geblokkeerd door publicatiegate");

  await context.close();
  await browser.close();

  console.log("jeugdzorg analysis ui regression passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
