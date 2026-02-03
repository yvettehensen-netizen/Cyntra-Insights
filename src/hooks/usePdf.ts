export function usePdf() {
  async function generatePdf(report: any) {
    const res = await fetch("/api/report/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report }),
    });

    if (!res.ok) {
      throw new Error("PDF generatie mislukt");
    }

    return await res.blob();
  }

  return { generatePdf };
}
