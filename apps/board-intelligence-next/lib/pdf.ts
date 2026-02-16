import puppeteer from "puppeteer";

export async function renderPdfFromHtml(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18mm",
        right: "14mm",
        bottom: "18mm",
        left: "14mm",
      },
    });

    return Buffer.from(pdfData);
  } finally {
    await browser.close();
  }
}
