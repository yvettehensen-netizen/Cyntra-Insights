import { generateAureliusPDF } from "./pdf";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, result } = body;

    if (!title || !result) {
      return new Response("Missing title or result", { status: 400 });
    }

    const pdfBlob = generateAureliusPDF(title, result);

    return new Response(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="aurelius-report.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF route error:", err);
    return new Response("PDF generation failed", { status: 500 });
  }
}

