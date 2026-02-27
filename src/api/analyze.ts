// ============================================================
// AURELIUS ANALYZE — LOCAL API ROUTE (MAXIMAL • CANON)
// SUPPORTS:
// - Zorgscan
// - Aurelius Boardroom Narrative
// - 5 vragen
// - 20+ documenten
// ============================================================

// @ts-nocheck
import { generateBoardroomNarrative } from "@/aurelius/narrative/generateBoardroomNarrative";

/* ============================================================
   ENTRY
============================================================ */

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return json({ success: false, error: "Invalid body" }, 400);
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return json(
        { success: false, error: "OPENAI_API_KEY ontbreekt" },
        500
      );
    }

    /* ============================================================
       ZORGSCAN MODE (ONGEWIJZIGD)
    ============================================================ */
    if (body.mode === "zorgscan") {
      if (!body.company_context?.details) {
        return json(
          { success: false, error: "company_context.details ontbreekt" },
          400
        );
      }

      const raw = await callOpenAI(
        OPENAI_API_KEY,
        `
Je bent CYNTRA ZORGSCAN.
Je output ALLEEN geldig JSON.
Gebruik HGBCO en VIBAAAN.
`,
        body.company_context.details,
        true
      );

      const parsed = safeParseJSON(raw);
      if (!parsed) {
        return json(
          { success: false, error: "Invalid JSON from Zorgscan" },
          500
        );
      }

      return json({
        success: true,
        type: "zorgscan",
        report: parsed,
      });
    }

    /* ============================================================
       AURELIUS BOARDROOM MODE (NIEUW, CANON)
    ============================================================ */

    const {
      analysis_type = "strategy",
      company_name,
      questions,
      documents = [],
      sector_selected,
    } = body;

    if (
      !questions ||
      typeof questions !== "object" ||
      !questions.q1 ||
      !questions.q2 ||
      !questions.q3 ||
      !questions.q4 ||
      !questions.q5
    ) {
      return json(
        { success: false, error: "5 kernvragen ontbreken" },
        400
      );
    }

    if (!Array.isArray(documents)) {
      return json(
        { success: false, error: "documents moet een array zijn" },
        400
      );
    }

    const normalizedDocs = documents.map((d, i) => ({
      id: d.id ?? String(i + 1),
      filename: d.filename ?? `document-${i + 1}`,
      content: d.content ?? "",
    }));

    const narrativeResult = await generateBoardroomNarrative({
      analysis_id: crypto.randomUUID(),
      company_name,
      questions,
      documents: normalizedDocs,
      sector_selected,
      meta: {
        sector_selected,
      },
    });

    return json({
      success: true,
      type: "aurelius-boardroom",
      report: {
        analysis_type,
        company_name,
        narrative: narrativeResult.text,
        metrics: narrativeResult.metrics,
      },
    });
  } catch (err: any) {
    console.error("[AURELIUS API ERROR]", err);
    return json(
      { success: false, error: String(err?.message ?? err) },
      500
    );
  }
}

/* ============================================================
   HELPERS
============================================================ */

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  forceJson = false
): Promise<string> {
  const body: any = {
    model: "gpt-4o",
    temperature: 0.25,
    max_tokens: 7000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (forceJson) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI ${res.status}: ${txt}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function safeParseJSON(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
