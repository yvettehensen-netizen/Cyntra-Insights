#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildSeededReportBody() {
  return [
    "BESTUURLIJKE BESLISKAART",
    "Organisatie",
    "Jeugdzorg ZIJN",
    "",
    "Sector",
    "Jeugdzorg",
    "",
    "Analyse datum",
    "13 maart 2026",
    "",
    "KERNPROBLEEM",
    "De spanning zit tussen brede ambulante specialist blijven binnen consortium- en contractdiscipline en selectieve specialisatie kiezen.",
    "",
    "KERNSTELLING",
    "Behoud brede ambulante positie; stuur gemeenten op marge, bereikbaarheid en contractzekerheid, en koppel consortiumtriage direct aan capaciteitsgrenzen.",
    "",
    "AANBEVOLEN KEUZE",
    "Brede ambulante specialist blijven binnen consortium- en contractdiscipline.",
    "",
    "WAAROM DEZE KEUZE",
    "De organisatie spreidt volume en relaties over circa 35 gemeenten.",
    "Instroom loopt deels via consortiumtriage.",
    "De rendabiliteitsnorm van circa 80% begrenst verbreding.",
    "",
    "GROOTSTE RISICO BIJ UITSTEL",
    "Gemeentelijke contractdruk, hogere zorgzwaarte en personeelsschaarste versterken elkaar.",
    "",
    "STOPREGEL",
    "Herzie direct als wachttijd > 12 weken gedurende twee meetperiodes.",
    "",
    "BESTUURLIJKE KERNSAMENVATTING",
    "De organisatie werkt met circa 35 gemeenten, waardoor contractmix en bereikbaarheid direct op marge en uitvoerbaarheid drukken.",
    "",
    "BESLUITVRAAG",
    "Welke keuze verlaagt nu het structurele risico zonder kwaliteit, teamstabiliteit en contractdiscipline te schaden?",
    "",
    "KERNSTELLING VAN HET RAPPORT",
    "Behoud brede ambulante positie; stuur gemeenten op marge, bereikbaarheid en contractzekerheid, en koppel consortiumtriage direct aan capaciteitsgrenzen.",
    "",
    "FEITENBASIS",
    "De organisatie werkt met circa 35 gemeenten.",
    "Instroom loopt via consortium- en triageafspraken.",
    "De organisatie stuurt op circa 80% rendabiliteit.",
    "",
    "KEUZERICHTINGEN",
    "Brede ambulante specialist blijven binnen consortium- en contractdiscipline.",
    "Selectieve specialisatie kiezen.",
    "",
    "AANBEVOLEN KEUZE",
    "Brede ambulante specialist blijven binnen consortium- en contractdiscipline.",
    "",
    "DOORBRAAKINZICHTEN",
    "Inzicht 1",
    "KERNINZICHT — De organisatie stuurt op een gemeentenportfolio, niet op één markt.",
    "MECHANISME — Tarieven, reistijd en no-show verschillen per gemeente.",
    "BESTUURLIJK GEVOLG — Rangschik gemeenten op marge, bereikbaarheid en contractzekerheid.",
    "",
    "BESTUURLIJK ACTIEPLAN",
    "Actie 1",
    "ACTIE — Standaardiseer triage en wekelijkse capaciteitssturing",
    "MECHANISME — Consortiumtriage kan meer casussen toewijzen dan teams binnen de caseloadnorm kunnen dragen.",
    "BESTUURLIJK BESLUIT — Veranker triage en capaciteit in een vast ritme.",
    "VERANTWOORDELIJKE — Bestuur • Dag 15",
    "KPI — Wachtdruk en caseload blijven binnen norm.",
    "",
    "BESTUURLIJKE STRESSTEST",
    "Als het bestuur niet kiest, versterken contractdruk en personeelsschaarste elkaar.",
    "",
    "MOGELIJKE ONTWIKKELINGEN",
    "Scenario 1",
    "MECHANISME — Behoud brede ambulante positie, maar stop verbreding buiten rendabele gemeenten.",
    "RISICO — Teamdruk stijgt als discipline ontbreekt.",
    "BESTUURLIJKE IMPLICATIE — Stel een expliciete gemeentenmix vast.",
    "",
    "OPEN STRATEGISCHE VRAGEN",
    "Waarom niet optie B?",
    "Omdat deze route regionale relevantie en instroombasis aantast.",
    "",
    "BESLUITGEVOLGEN",
    "OPERATIONEEL GEVOLG — Instroom en wachtdruk lopen uit de pas zodra consortiumtriage meer casuistiek toewijst dan teams kunnen dragen.",
    "",
    "TECHNISCHE ANALYSE",
    "Inhoudscheck",
    "Niveau: hoog",
    "• These is mechanistisch",
    "• Scenario's aanwezig",
    "",
    "SCENARIOANALYSE",
    "Scenario 1",
    "MECHANISME — Behoud brede ambulante positie binnen contractdiscipline.",
    "RISICO — Overbelasting bij gebrek aan caseloadgrenzen.",
    "BESTUURLIJKE IMPLICATIE — Stel stopreviews in.",
  ].join("\n");
}

async function main() {
  const baseUrl = process.env.REPORT_E2E_BASE_URL || "http://127.0.0.1:4173";
  const sessionId = "sess-runtime-regression";
  const reportId = "rpt-runtime-regression";
  const downloadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "cyntra-report-download-"));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true, downloadsPath: downloadsDir });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on("console", (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });

  await page.addInitScript(({ sessionId, reportId, reportBody }) => {
    window.localStorage.setItem("cyntra_portal_dev_auth_bypass", "1");
    window.localStorage.setItem(
      "cyntra_reports",
      JSON.stringify([
        {
          id: reportId,
          sessionId,
          organizationName: "Jeugdzorg ZIJN",
          savedAt: "2026-03-13T11:44:01.000Z",
          report: {
            report_id: reportId,
            session_id: sessionId,
            organization_id: "Jeugdzorg ZIJN",
            title: "Jeugdzorg ZIJN",
            generated_at: "2026-03-13T11:44:01.000Z",
            sections: [
              "Bestuurlijke besliskaart",
              "Bestuurlijke kernsamenvatting",
              "Besluitvraag",
            ],
            report_body: reportBody,
          },
        },
      ])
    );
  }, { sessionId, reportId, reportBody: buildSeededReportBody() });

  await page.goto(`${baseUrl}/portal/rapporten`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /RPT-SESS-RUNTIME-REGRESSION/i }).waitFor({ state: "visible" });

  const reportCardButton = page.locator("article button.w-full").first();
  await reportCardButton.click();

  await page.getByRole("button", { name: "Kort dossier", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Bestuurlijk overzicht", exact: true }).waitFor({ state: "visible" });
  await page.getByText("Rapportacties").waitFor({ state: "visible" });
  const actionBar = page.locator("div").filter({ hasText: "Rapportacties" }).first();

  await actionBar.getByRole("button", { name: "Bekijk PDF" }).first().click();
  await page.waitForTimeout(10000);
  const previewVisible = await page.locator('iframe[src^="blob:"]').isVisible().catch(() => false);
  if (!previewVisible) {
    const hintText = (await page.locator("text=/PDF .*mislukt|PDF preview geopend|PDF gegenereerd|Rapport niet gevonden/").allTextContents().catch(() => []))
      .join(" | ");
    const bodyText = await page.locator("body").innerText();
    throw new Error(`inline preview niet zichtbaar. Hint: ${hintText || "geen"} Console: ${consoleMessages.join(" || ") || "geen"} Body: ${bodyText.slice(0, 800)}`);
  }

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    actionBar.getByRole("button", { name: /Download .*\.pdf/ }).first().click(),
  ]);
  const suggestedFilename = download.suggestedFilename();
  assert(/Strategische analyse/i.test(suggestedFilename), `onverwachte downloadnaam: ${suggestedFilename}`);
  assert(/Kort dossier|Bestuurlijk overzicht|Strategisch rapport/i.test(suggestedFilename), `onverwachte documentvariant in bestandsnaam: ${suggestedFilename}`);

  const savedPath = path.join(downloadsDir, suggestedFilename);
  await download.saveAs(savedPath);
  const stats = fs.statSync(savedPath);
  assert(stats.size > 1000, "gedownloade PDF is leeg of te klein");

  await page.getByRole("button", { name: "Volledig dossier", exact: true }).click();
  await page.getByRole("button", { name: "Strategisch rapport", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Scenario simulatie", exact: true }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Technische analyse", exact: true }).waitFor({ state: "visible" });

  await page.getByRole("button", { name: "Scenario simulatie", exact: true }).click();
  await page.getByText(/^(Stressproef|Bestuurlijke stresstest)$/).waitFor({ state: "visible" });
  await page.getByText(/^(Scenario-overzicht|Mogelijke ontwikkelingen)$/).waitFor({ state: "visible" });

  await page.getByRole("button", { name: "Technische analyse", exact: true }).click();
  await page.getByText(/^(Uitvoerings- en kwaliteitsanalyse|Technische analyse)$/).waitFor({ state: "visible" });
  await page.getByText("Inhoudscheck", { exact: true }).waitFor({ state: "visible" });

  await context.close();
  await browser.close();

  console.log(`report runtime download regression passed: ${savedPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
