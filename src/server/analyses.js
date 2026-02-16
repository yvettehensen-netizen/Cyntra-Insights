import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { jsPDF } from "jspdf";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const UPLOAD_BUCKET = "analysis-uploads";

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

async function ensureUploadBucket() {
  const { data } = await supabase.storage.getBucket(UPLOAD_BUCKET);
  if (data) return;

  const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (error && !String(error.message).toLowerCase().includes("already exists")) {
    throw new Error(`Ensure upload bucket failed: ${error.message}`);
  }
}

function deterministicFallback(inputPayload) {
  const description = String(inputPayload.description || "").toLowerCase();

  const risks = [
    description.includes("cash") || description.includes("financ")
      ? "Cashflow-spanning beperkt beleidsruimte op korte termijn."
      : "Besluitvorming vertraagt door diffuus eigenaarschap.",
    "KPI-sturing is niet uniform over afdelingen.",
    "Escalatieregels zijn niet consequent toegepast bij afwijkingen.",
  ];

  return {
    model: OPENAI_MODEL,
    executive_summary:
      "De organisatie heeft strategisch potentieel, maar mist op bestuursniveau een scherp, afdwingbaar uitvoeringsritme.",
    key_findings: [
      "Strategische prioriteiten zijn aanwezig, maar governance is onvoldoende operationeel verankerd.",
      "Besluitvorming en uitvoering zijn niet strak gekoppeld aan eigenaarschap en deadlines.",
      "Er is kans op versnelling zodra structuur, ritme en accountability worden aangescherpt.",
    ],
    risks,
    opportunities: [
      "Snelle invoering van vaste bestuursreview-cycli verhoogt executiesnelheid.",
      "Heldere owner-toewijzing reduceert frictie tussen teams.",
      "Datagedreven prioritering verbetert allocatie van middelen.",
    ],
    actions: [
      "Benoem per topprioriteit binnen 5 werkdagen een eindverantwoordelijke.",
      "Plan een tweewekelijkse executive besluitreview met harde stop/go momenten.",
      "Introduceer een risicolog met owner, impact en deadline.",
    ],
    scores: [
      { name: "Strategische helderheid", value: 68, trend: "up" },
      { name: "Executiekracht", value: 57, trend: "flat" },
      { name: "Governance discipline", value: 52, trend: "down" },
      { name: "Risicobeheersing", value: 61, trend: "flat" },
    ],
    generated_at: new Date().toISOString(),
    raw_response: {
      source: "deterministic_fallback",
      reason: "OPENAI_API_KEY missing or unavailable",
    },
  };
}

function safeJson(input) {
  try {
    return JSON.parse(input);
  } catch {
    const first = input.indexOf("{");
    const last = input.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(input.slice(first, last + 1));
    }
    throw new Error("OpenAI response is not valid JSON");
  }
}

async function runOpenAiAnalysis(inputPayload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return deterministicFallback(inputPayload);
  }

  try {
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a board-level strategic analyst. Return valid JSON only with keys: executive_summary,key_findings,risks,opportunities,actions,scores. Scores must be [{name,value,trend}] where trend is up|flat|down.",
        },
        {
          role: "user",
          content: JSON.stringify({
            organization: inputPayload.organization_name,
            description: inputPayload.description,
            context: inputPayload.context || {},
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const parsed = safeJson(content);

    return {
      model: OPENAI_MODEL,
      executive_summary: String(parsed.executive_summary || ""),
      key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings.map(String) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities.map(String)
        : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.map(String) : [],
      scores: Array.isArray(parsed.scores)
        ? parsed.scores
            .map((score) => ({
              name: String(score?.name || "Onbekend"),
              value: Number(score?.value || 0),
              trend: ["up", "flat", "down"].includes(score?.trend)
                ? score.trend
                : "flat",
            }))
            .slice(0, 12)
        : [],
      generated_at: new Date().toISOString(),
      raw_response: parsed,
    };
  } catch (error) {
    const fallback = deterministicFallback(inputPayload);
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...fallback,
      raw_response: {
        source: "deterministic_fallback",
        reason: `openai_error:${message}`,
      },
    };
  }
}

function reportHtml({ title, analysisId, organizationName, result, uploads = [] }) {
  const esc = (v) =>
    String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const list = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${esc(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px; }
        .hero { background: #0f172a; color: white; padding: 20px; border-radius: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .card { background: white; border-radius: 10px; padding: 14px; }
      </style>
    </head>
    <body>
      <section class="hero">
        <h1>${esc(title)}</h1>
        <p>Analyse: ${esc(analysisId)} • Organisatie: ${esc(organizationName)}</p>
      </section>
      <section class="card" style="margin-top:12px;">
        <h2>Executive Summary</h2>
        <p>${esc(result.executive_summary)}</p>
      </section>
      <section class="grid">
        <article class="card"><h3>Kernbevindingen</h3>${list(result.key_findings)}</article>
        <article class="card"><h3>Acties</h3>${list(result.actions)}</article>
        <article class="card"><h3>Risico's</h3>${list(result.risks)}</article>
        <article class="card"><h3>Kansen</h3>${list(result.opportunities)}</article>
      </section>
      ${
        uploads.length
          ? `<section class=\"card\" style=\"margin-top:12px;\"><h3>Bronbestanden</h3>${list(
              uploads.map(
                (upload) =>
                  `${upload.file_name} (${upload.mime_type}, ${upload.size_bytes} bytes)`
              )
            )}</section>`
          : ""
      }
    </body>
  </html>
  `;
}

async function resolveOrganizationId({ organizationId, organization }) {
  if (!supabase) {
    throw new Error("Supabase is not configured on server.");
  }

  if (organizationId) {
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .single();

    if (error || !data) {
      throw new Error(`Organization not found: ${organizationId}`);
    }

    return String(data.id);
  }

  const name = String(organization || "").trim();
  if (!name) {
    throw new Error("organization of organizationId is verplicht");
  }

  const { data, error } = await supabase
    .from("organizations")
    .upsert({ name }, { onConflict: "name" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Kon organisatie niet aanmaken/ophalen: ${error?.message || "unknown"}`);
  }

  return String(data.id);
}

function extractTextFromFileBuffer(file) {
  const textMimeTypes = new Set([
    "text/plain",
    "text/csv",
    "text/markdown",
    "application/json",
    "application/xml",
    "text/xml",
  ]);

  if (!textMimeTypes.has(String(file.mimetype || ""))) {
    return null;
  }

  const value = Buffer.from(file.buffer || Buffer.alloc(0))
    .toString("utf8")
    .replace(/\u0000/g, "")
    .trim();

  if (!value) return null;
  return value.length > 20000 ? `${value.slice(0, 20000)}\n...[truncated]` : value;
}

async function saveUploadToSupabase({ organizationId, file }) {
  await ensureUploadBucket();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = String(file.originalname || "upload.bin").replace(/\s+/g, "_");
  const storagePath = `${organizationId}/${timestamp}-${safeName}`;

  const { error: storageError } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(storagePath, file.buffer, {
      upsert: false,
      contentType: file.mimetype || "application/octet-stream",
    });

  if (storageError) {
    throw new Error(`Upload to storage failed: ${storageError.message}`);
  }

  const extractedText = extractTextFromFileBuffer(file);

  const { data, error } = await supabase
    .from("analysis_uploads")
    .insert({
      organization_id: organizationId,
      file_name: String(file.originalname || "upload.bin"),
      mime_type: String(file.mimetype || "application/octet-stream"),
      size_bytes: Number(file.size || 0),
      storage_path: storagePath,
      extracted_text: extractedText,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Upload metadata insert failed: ${error?.message || "unknown"}`);
  }

  return data;
}

async function resolveUploadsById({ organizationId, uploadIds }) {
  if (!Array.isArray(uploadIds) || !uploadIds.length) return [];

  const { data, error } = await supabase
    .from("analysis_uploads")
    .select("*")
    .eq("organization_id", organizationId)
    .in("id", uploadIds);

  if (error) {
    throw new Error(`Resolve uploads failed: ${error.message}`);
  }

  return data || [];
}

async function linkUploadsToAnalysis({ analysisId, uploadIds }) {
  if (!Array.isArray(uploadIds) || !uploadIds.length) return;

  const { error } = await supabase
    .from("analysis_uploads")
    .update({ analysis_id: analysisId })
    .in("id", uploadIds);

  if (error) {
    throw new Error(`Link uploads failed: ${error.message}`);
  }
}

async function processAnalysisInline(analysisId) {
  if (!supabase) {
    throw new Error("Supabase is not configured on server.");
  }

  const { data: analysisData, error: selectError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (selectError || !analysisData) {
    throw new Error(`Analysis ${analysisId} niet gevonden`);
  }

  await supabase
    .from("analyses")
    .update({ status: "running", error_message: null })
    .eq("id", analysisId);

  try {
    const result = await runOpenAiAnalysis(analysisData.input_payload || {});

    const title = `Executive Rapport · ${new Date().toLocaleDateString("nl-NL")}`;
    const html_content = reportHtml({
      title,
      analysisId,
      organizationName:
        analysisData.input_payload?.organization_name || "Organisatie",
      result,
      uploads: analysisData.input_payload?.uploads || [],
    });

    const metadata = {
      model: result.model,
      generated_at: result.generated_at,
      score_count: result.scores?.length || 0,
      upload_count: (analysisData.input_payload?.uploads || []).length,
    };

    const { error: reportError } = await supabase.from("reports").upsert(
      {
        analysis_id: analysisId,
        organization_id: analysisData.organization_id,
        title,
        summary: result.executive_summary,
        html_content,
        metadata,
      },
      { onConflict: "analysis_id" }
    );

    if (reportError) {
      throw new Error(`Rapport opslaan mislukt: ${reportError.message}`);
    }

    const { data: doneData, error: doneError } = await supabase
      .from("analyses")
      .update({
        status: "done",
        result_payload: result,
        error_message: null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .select("*")
      .single();

    if (doneError || !doneData) {
      throw new Error(`Analysis afronden mislukt: ${doneError?.message || "unknown"}`);
    }

    return doneData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await supabase
      .from("analyses")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    throw error;
  }
}

router.post("/uploads", upload.single("file"), async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "file is verplicht" });
    }

    const { organizationId, organization } = req.body || {};
    const resolvedOrganizationId = await resolveOrganizationId({
      organizationId,
      organization,
    });

    const saved = await saveUploadToSupabase({
      organizationId: resolvedOrganizationId,
      file,
    });

    return res.status(201).json({ upload: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

router.get("/uploads", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const analysisId = String(req.query.analysisId || "").trim();
    if (!analysisId) {
      return res.status(400).json({ error: "analysisId query parameter ontbreekt" });
    }

    const { data, error } = await supabase
      .from("analysis_uploads")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ uploads: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

router.post("/analyses", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({
      error: "Supabase is not configured on server.",
    });
  }

  try {
    const {
      organizationId,
      organization,
      description,
      context,
      uploadIds,
      runImmediately,
    } = req.body || {};

    if (!description || String(description).trim().length < 8) {
      return res.status(400).json({
        error: "description is verplicht en moet minimaal 8 karakters bevatten",
      });
    }

    const resolvedOrganizationId = await resolveOrganizationId({
      organizationId,
      organization,
    });
    const resolvedUploads = await resolveUploadsById({
      organizationId: resolvedOrganizationId,
      uploadIds: Array.isArray(uploadIds) ? uploadIds : [],
    });

    const input_payload = {
      organization_name: String(organization || "Organisatie"),
      description: String(description).trim(),
      context: context && typeof context === "object" ? context : {},
      uploads: resolvedUploads.map((uploadRow) => ({
        upload_id: uploadRow.id,
        file_name: uploadRow.file_name,
        mime_type: uploadRow.mime_type,
        size_bytes: uploadRow.size_bytes,
        extracted_text: uploadRow.extracted_text,
      })),
      requested_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("analyses")
      .insert({
        organization_id: resolvedOrganizationId,
        type: "board_intelligence",
        payload: input_payload,
        status: "pending",
        input_payload,
      })
      .select("*")
      .single();

    if (error || !data) {
      return res.status(500).json({ error: error?.message || "Analysis insert failed" });
    }

    await linkUploadsToAnalysis({
      analysisId: String(data.id),
      uploadIds: Array.isArray(uploadIds) ? uploadIds : [],
    });

    const shouldRunInline =
      typeof runImmediately === "boolean" ? runImmediately : true;

    if (!shouldRunInline) {
      return res.status(201).json({ analysis: data });
    }

    const done = await processAnalysisInline(String(data.id));
    return res.status(201).json({ analysis: done });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

router.get("/analyses/:id", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  const analysisId = String(req.params.id || "");
  if (!analysisId) {
    return res.status(400).json({ error: "analysis id ontbreekt" });
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single();

  if (analysisError || !analysis) {
    return res.status(404).json({ error: "Analyse niet gevonden" });
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id,analysis_id,title,summary,created_at,updated_at")
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (reportError) {
    return res.status(500).json({ error: reportError.message });
  }

  return res.json({ analysis, report: report || null });
});

router.get("/reports/:analysisId", async (req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  const analysisId = String(req.params.analysisId || "");
  if (analysisId.toLowerCase() === "pdf") {
    return next();
  }

  if (!analysisId) {
    return res.status(400).json({ error: "analysisId ontbreekt" });
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Rapport niet gevonden" });
  }

  return res.json({ report: data });
});

router.get("/reports/pdf", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  const analysisId = String(req.query.analysisId || "").trim();
  if (!analysisId) {
    return res.status(400).json({ error: "analysisId query parameter ontbreekt" });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!report) {
    return res.status(404).json({ error: "Rapport niet gevonden" });
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(report.title || "Executive Rapport", 40, y);

  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Analyse ID: ${analysisId}`, 40, y);

  y += 22;
  doc.setFontSize(12);
  doc.text("Samenvatting", 40, y);

  y += 16;
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(String(report.summary || ""), 510);
  doc.text(summaryLines, 40, y);

  y += summaryLines.length * 12 + 16;
  doc.setFontSize(11);
  doc.text("Metadata", 40, y);

  y += 14;
  doc.setFontSize(10);
  const metadata = report.metadata || {};
  const metaLines = Object.entries(metadata).map(
    ([key, value]) => `${key}: ${JSON.stringify(value)}`
  );
  const wrappedMeta = doc.splitTextToSize(metaLines.join("\n"), 510);
  doc.text(wrappedMeta, 40, y);

  const arrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=executive-report-${analysisId}.pdf`
  );
  return res.send(buffer);
});

export default router;
