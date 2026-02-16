import { expect, test } from "@playwright/test";
import path from "node:path";

test("start analysis and download pdf", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Organisatie").fill("Demo BV");
  await page
    .getByLabel("Analysebeschrijving")
    .fill("Bestuurlijke Intelligentielaag Analyse voor kwartaalplanning en risicobeheersing.");

  const fixturePath = path.join(
    process.cwd(),
    "tests/e2e/fixtures/context.txt"
  );
  await page.getByLabel("Upload bronbestanden").setInputFiles(fixturePath);
  await page.getByRole("button", { name: "Upload bestanden" }).click();
  await expect(page.getByText("Geüpload: 1 bestand(en)")).toBeVisible();

  await page.getByRole("button", { name: "Start Analyse" }).click();

  await expect(page.getByText("done", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("executive_summary")).toBeVisible({ timeout: 30_000 });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("executive-report-");
});
