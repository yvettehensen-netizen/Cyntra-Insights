import { Router } from "express";
import OpenAI from "openai";
import { jsPDF } from "jspdf";
import multer from "multer";
import { supabaseService } from "./supabaseService.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const UPLOAD_BUCKET = "analysis-uploads";

const supabase = supabaseService;

const ORGANIZATION_TABLES = ["organizations", "organisations"];
const EPHEMERAL_UPLOADS = new Map();
const EPHEMERAL_ANALYSES = new Map();

function errorMessage(error) {
  if (!error) return "unknown";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String(error.message || "unknown");
  }
  return String(error);
}

function sanitizeErrorForClient(rawMessage) {
  return String(rawMessage || "")
    .replace(/\b(?:sk|proj)-[A-Za-z0-9_-]+\b/g, "[redacted-key]")
    .replace(/(api key provided:)\s*[^.]+/gi, "$1 [redacted]");
}

function isSchemaMismatchError(error) {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("relation") && message.includes("does not exist") ||
    message.includes("column") && message.includes("does not exist")
  );
}

function isRlsError(error) {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("insufficient privileges")
  );
}

function hasResultShape(value) {
  if (!value || typeof value !== "object") return false;
  return (
    "executive_summary" in value ||
    "key_findings" in value ||
    "risks" in value ||
    "opportunities" in value ||
    "actions" in value ||
    "scores" in value
  );
}

function randomId(prefix) {
  const fallback = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  if (
    globalThis.crypto &&
    typeof globalThis.crypto === "object" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${fallback}`;
}

function base64UrlEncode(input) {
  return Buffer.from(String(input), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const value = String(input || "").replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (value.length % 4 || 4)) % 4;
  const padded = `${value}${"=".repeat(padLength)}`;
  return Buffer.from(padded, "base64").toString("utf8");
}

function buildStorageTokenUpload({
  organizationId,
  file,
  storagePath,
  extractedText,
  createdAt,
}) {
  const payload = {
    v: 1,
    organization_id: organizationId || null,
    file_name: String(file.originalname || "upload.bin"),
    mime_type: String(file.mimetype || "application/octet-stream"),
    size_bytes: Number(file.size || 0),
    storage_path: storagePath,
    extracted_text: extractedText ? String(extractedText).slice(0, 1600) : null,
    created_at: createdAt || new Date().toISOString(),
  };

  const id = `upltok_${base64UrlEncode(JSON.stringify(payload))}`;
  return {
    id,
    analysis_id: null,
    organization_id: payload.organization_id,
    file_name: payload.file_name,
    mime_type: payload.mime_type,
    size_bytes: payload.size_bytes,
    storage_path: payload.storage_path,
    extracted_text: payload.extracted_text,
    created_at: payload.created_at,
    persistence: "storage_token",
  };
}

function parseStorageTokenUpload(uploadId) {
  const id = String(uploadId || "");
  if (!id.startsWith("upltok_")) return null;
  try {
    const decoded = JSON.parse(base64UrlDecode(id.slice("upltok_".length)));
    if (!decoded || typeof decoded !== "object") return null;
    return {
      id,
      analysis_id: null,
      organization_id: decoded.organization_id || null,
      file_name: decoded.file_name || "upload.bin",
      mime_type: decoded.mime_type || "application/octet-stream",
      size_bytes: Number(decoded.size_bytes || 0),
      storage_path: decoded.storage_path || null,
      extracted_text: decoded.extracted_text || null,
      created_at: decoded.created_at || new Date().toISOString(),
      persistence: "storage_token",
    };
  } catch {
    return null;
  }
}

function extractInputPayloadFromAnalysisRow(row) {
  if (row?.input_payload && typeof row.input_payload === "object") {
    return row.input_payload;
  }
  if (row?.payload && typeof row.payload === "object") {
    return row.payload;
  }
  if (
    row?.result &&
    typeof row.result === "object" &&
    row.result.input_payload &&
    typeof row.result.input_payload === "object"
  ) {
    return row.result.input_payload;
  }
  return {};
}

function extractResultPayloadFromAnalysisRow(row) {
  if (row?.result_payload && typeof row.result_payload === "object") {
    return row.result_payload;
  }
  if (hasResultShape(row?.result)) {
    return row.result;
  }
  return null;
}

function normalizeAnalysisForResponse(row) {
  if (!row || typeof row !== "object") return row;

  const input_payload = extractInputPayloadFromAnalysisRow(row);
  const result_payload = extractResultPayloadFromAnalysisRow(row);
  const organization_id =
    row.organization_id || row.organisation_id || row.company_id || null;

  return {
    ...row,
    organization_id,
    input_payload,
    result_payload,
  };
}

function createEphemeralUpload({ organizationId, file, extractedText, storagePath = null }) {
  const id = randomId("upl");
  const row = {
    id,
    analysis_id: null,
    organization_id: organizationId || null,
    file_name: String(file.originalname || "upload.bin"),
    mime_type: String(file.mimetype || "application/octet-stream"),
    size_bytes: Number(file.size || 0),
    storage_path: storagePath,
    extracted_text: extractedText,
    created_at: new Date().toISOString(),
    persistence: "ephemeral",
  };
  EPHEMERAL_UPLOADS.set(id, row);
  return row;
}

function createEphemeralAnalysis({
  id,
  organizationId,
  inputPayload,
  status,
  resultPayload = null,
  errorText = null,
}) {
  const analysisId = id || randomId("analysis");
  const row = {
    id: analysisId,
    organization_id: organizationId || null,
    analysis_type: "board_intelligence",
    status,
    input_payload: inputPayload,
    result_payload: resultPayload,
    error_message: errorText,
    created_at: new Date().toISOString(),
    finished_at: status === "done" || status === "failed" ? new Date().toISOString() : null,
    persistence: "ephemeral",
  };
  EPHEMERAL_ANALYSES.set(analysisId, row);
  return row;
}

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
        reason: `openai_error:${sanitizeErrorForClient(message)}`,
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

function buildReportRecord({
  analysisId,
  organizationId,
  organizationName,
  result,
  uploads = [],
}) {
  const title = `Executive Rapport · ${new Date().toLocaleDateString("nl-NL")}`;
  const html_content = reportHtml({
    title,
    analysisId,
    organizationName,
    result,
    uploads,
  });

  return {
    analysis_id: analysisId,
    organization_id: organizationId || null,
    title,
    summary: String(result?.executive_summary || ""),
    html_content,
    metadata: {
      model: result?.model || OPENAI_MODEL,
      generated_at: result?.generated_at || new Date().toISOString(),
      score_count: Array.isArray(result?.scores) ? result.scores.length : 0,
      upload_count: uploads.length,
    },
  };
}

async function upsertReportMaybe(reportRecord) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("reports")
    .upsert(reportRecord, { onConflict: "analysis_id" })
    .select("*")
    .maybeSingle();

  if (error) {
    if (isSchemaMismatchError(error) || isRlsError(error)) {
      return null;
    }
    throw new Error(`Rapport opslaan mislukt: ${error.message}`);
  }

  return data || null;
}

async function updateAnalysisWithFallback(analysisId, payloads) {
  if (!supabase) return null;
  const seen = new Set();
  let lastError = null;

  for (const payload of payloads) {
    const key = JSON.stringify(Object.keys(payload).sort());
    if (seen.has(key)) continue;
    seen.add(key);

    const { data, error } = await supabase
      .from("analyses")
      .update(payload)
      .eq("id", analysisId)
      .select("*")
      .maybeSingle();

    if (!error) {
      return data || null;
    }

    lastError = error;
    if (isSchemaMismatchError(error)) {
      continue;
    }

    if (isRlsError(error)) {
      break;
    }
  }

  if (lastError && !isSchemaMismatchError(lastError) && !isRlsError(lastError)) {
    throw new Error(`Analysis update failed: ${errorMessage(lastError)}`);
  }

  return null;
}

async function insertAnalysisWithFallback({ organizationId, inputPayload }) {
  if (!supabase) {
    throw new Error("Supabase is not configured on server.");
  }

  const pendingRows = [];

  if (organizationId) {
    pendingRows.push({
      organization_id: organizationId,
      type: "board_intelligence",
      payload: inputPayload,
      status: "pending",
      input_payload: inputPayload,
    });
    pendingRows.push({
      organisation_id: organizationId,
      type: "board_intelligence",
      payload: inputPayload,
      status: "pending",
      input_payload: inputPayload,
    });
    pendingRows.push({
      company_id: organizationId,
      type: "board_intelligence",
      payload: inputPayload,
      status: "pending",
      input_payload: inputPayload,
    });
  }

  pendingRows.push({
    analysis_type: "board_intelligence",
    status: "pending",
    result: { input_payload: inputPayload },
  });

  if (organizationId) {
    pendingRows.push({
      analysis_type: "board_intelligence",
      status: "pending",
      result: { input_payload: inputPayload },
      organization_id: organizationId,
    });
    pendingRows.push({
      analysis_type: "board_intelligence",
      status: "pending",
      result: { input_payload: inputPayload },
      organisation_id: organizationId,
    });
  }

  let lastError = null;
  for (const row of pendingRows) {
    const { data, error } = await supabase
      .from("analyses")
      .insert(row)
      .select("*")
      .single();

    if (!error && data) {
      return { analysis: data, persistence: "database" };
    }

    lastError = error;
    if (isSchemaMismatchError(error)) {
      continue;
    }
    break;
  }

  const message = errorMessage(lastError);
  if (isRlsError(lastError)) {
    const ephemeral = createEphemeralAnalysis({
      organizationId,
      inputPayload,
      status: "pending",
      errorText: "Persisted storage denied by RLS. Analysis returned in ephemeral mode.",
    });
    return { analysis: ephemeral, persistence: "ephemeral", warning: message };
  }

  if (isSchemaMismatchError(lastError)) {
    const ephemeral = createEphemeralAnalysis({
      organizationId,
      inputPayload,
      status: "pending",
      errorText: "Persisted storage schema mismatch. Analysis returned in ephemeral mode.",
    });
    return { analysis: ephemeral, persistence: "ephemeral", warning: message };
  }

  throw new Error(message || "Analysis insert failed");
}

async function resolveOrganizationId({ organizationId, organization }) {
  if (!supabase) {
    throw new Error("Supabase is not configured on server.");
  }

  const requestedId = String(organizationId || "").trim();
  if (requestedId) {
    for (const table of ORGANIZATION_TABLES) {
      const { data, error } = await supabase
        .from(table)
        .select("id")
        .eq("id", requestedId)
        .maybeSingle();

      if (!error && data?.id) {
        return String(data.id);
      }

      if (error && !isSchemaMismatchError(error)) {
        break;
      }
    }

    // Fallback: accepteer expliciet meegegeven ID als tabellen afwijken.
    return requestedId;
  }

  const name = String(organization || "").trim();
  if (!name) {
    throw new Error("organization of organizationId is verplicht");
  }

  let lastError = null;
  for (const table of ORGANIZATION_TABLES) {
    const { data: existing, error: existingError } = await supabase
      .from(table)
      .select("id")
      .eq("name", name)
      .limit(1)
      .maybeSingle();

    if (!existingError && existing?.id) {
      return String(existing.id);
    }

    if (existingError && !isSchemaMismatchError(existingError)) {
      lastError = existingError;
      if (!isRlsError(existingError)) {
        break;
      }
    }

    const { data, error } = await supabase
      .from(table)
      .insert({ name })
      .select("id")
      .single();

    if (!error && data?.id) {
      return String(data.id);
    }

    lastError = error;
    if (error && !isSchemaMismatchError(error)) {
      break;
    }
  }

  throw new Error(`Kon organisatie niet aanmaken/ophalen: ${errorMessage(lastError)}`);
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
  const extractedText = extractTextFromFileBuffer(file);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = String(file.originalname || "upload.bin").replace(/\s+/g, "_");
  const storagePath = `${organizationId || "organisatie"}/${timestamp}-${safeName}`;
  const createdAt = new Date().toISOString();

  let storedPath = null;
  try {
    await ensureUploadBucket();
    const { error: storageError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, file.buffer, {
        upsert: false,
        contentType: file.mimetype || "application/octet-stream",
      });

    if (storageError) {
      throw storageError;
    }
    storedPath = storagePath;
  } catch (storageError) {
    return createEphemeralUpload({
      organizationId,
      file,
      extractedText,
      storagePath: null,
    });
  }

  const metadataRows = [];
  if (organizationId) {
    metadataRows.push({
      organization_id: organizationId,
      file_name: String(file.originalname || "upload.bin"),
      mime_type: String(file.mimetype || "application/octet-stream"),
      size_bytes: Number(file.size || 0),
      storage_path: storedPath,
      extracted_text: extractedText,
    });
    metadataRows.push({
      organisation_id: organizationId,
      file_name: String(file.originalname || "upload.bin"),
      mime_type: String(file.mimetype || "application/octet-stream"),
      size_bytes: Number(file.size || 0),
      storage_path: storedPath,
      extracted_text: extractedText,
    });
  } else {
    metadataRows.push({
      file_name: String(file.originalname || "upload.bin"),
      mime_type: String(file.mimetype || "application/octet-stream"),
      size_bytes: Number(file.size || 0),
      storage_path: storedPath,
      extracted_text: extractedText,
    });
  }

  let lastError = null;
  for (const row of metadataRows) {
    const { data, error } = await supabase
      .from("analysis_uploads")
      .insert(row)
      .select("*")
      .single();

    if (!error && data) {
      return data;
    }

    lastError = error;
    if (isSchemaMismatchError(error)) {
      continue;
    }
    break;
  }

  if (lastError && !isSchemaMismatchError(lastError) && !isRlsError(lastError)) {
    throw new Error(`Upload metadata insert failed: ${errorMessage(lastError)}`);
  }

  return buildStorageTokenUpload({
    organizationId,
    file,
    storagePath: storedPath,
    extractedText,
    createdAt,
  });
}

async function resolveUploadsById({ organizationId, uploadIds }) {
  if (!Array.isArray(uploadIds) || !uploadIds.length) return [];

  const uploadIdSet = new Set(uploadIds.map(String));
  const tokenRows = Array.from(uploadIdSet)
    .map((id) => parseStorageTokenUpload(id))
    .filter(Boolean)
    .filter((row) => {
      if (!organizationId) return true;
      const rowOrg = row.organization_id || row.organisation_id || row.company_id || null;
      return !rowOrg || rowOrg === organizationId;
    });

  const ephemeralRows = Array.from(uploadIdSet)
    .map((id) => EPHEMERAL_UPLOADS.get(id))
    .filter(Boolean)
    .filter((row) => {
      if (!organizationId) return true;
      const rowOrg = row.organization_id || row.organisation_id || row.company_id || null;
      return !rowOrg || rowOrg === organizationId;
    });

  const { data, error } = await supabase
    .from("analysis_uploads")
    .select("*")
    .in("id", Array.from(uploadIdSet));

  if (error && !isSchemaMismatchError(error) && !isRlsError(error)) {
    throw new Error(`Resolve uploads failed: ${error.message}`);
  }

  const dbRows = (data || []).filter((row) => {
    if (!organizationId) return true;
    const rowOrg = row.organization_id || row.organisation_id || row.company_id || null;
    return !rowOrg || rowOrg === organizationId;
  });

  const merged = new Map();
  for (const row of [...dbRows, ...tokenRows, ...ephemeralRows]) {
    merged.set(String(row.id), row);
  }

  return Array.from(merged.values());
}

async function linkUploadsToAnalysis({ analysisId, uploadIds }) {
  if (!Array.isArray(uploadIds) || !uploadIds.length) return;

  const updateCandidates = [
    { analysis_id: analysisId },
    { analysisId: analysisId },
  ];

  let linkedInDb = false;
  let lastError = null;
  for (const updateBody of updateCandidates) {
    const { error } = await supabase
      .from("analysis_uploads")
      .update(updateBody)
      .in("id", uploadIds);

    if (!error) {
      linkedInDb = true;
      break;
    }

    lastError = error;
    if (isSchemaMismatchError(error)) {
      continue;
    }
    break;
  }

  for (const uploadId of uploadIds) {
    const existing = EPHEMERAL_UPLOADS.get(String(uploadId));
    if (!existing) continue;
    EPHEMERAL_UPLOADS.set(String(uploadId), {
      ...existing,
      analysis_id: analysisId,
    });
  }

  if (!linkedInDb && lastError && !isSchemaMismatchError(lastError) && !isRlsError(lastError)) {
    throw new Error(`Link uploads failed: ${errorMessage(lastError)}`);
  }
}

async function processAnalysisInline(analysisId) {
  const ephemeral = EPHEMERAL_ANALYSES.get(String(analysisId));
  if (ephemeral) {
    const result = await runOpenAiAnalysis(ephemeral.input_payload || {});
    const done = {
      ...ephemeral,
      status: "done",
      result_payload: result,
      finished_at: new Date().toISOString(),
    };
    EPHEMERAL_ANALYSES.set(String(analysisId), done);
    return normalizeAnalysisForResponse(done);
  }

  if (!supabase) {
    throw new Error("Supabase is not configured on server.");
  }

  const { data: analysisData, error: selectError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .maybeSingle();

  if (selectError || !analysisData) {
    throw new Error(`Analysis ${analysisId} niet gevonden`);
  }

  await updateAnalysisWithFallback(String(analysisId), [
    { status: "running", error_message: null },
    { status: "running" },
  ]);

  const inputPayload = extractInputPayloadFromAnalysisRow(analysisData);

  try {
    const result = await runOpenAiAnalysis(inputPayload);
    const legacyResultPayload = {
      ...result,
      input_payload: inputPayload,
    };
    const organizationId =
      analysisData.organization_id ||
      analysisData.organisation_id ||
      analysisData.company_id ||
      null;
    const reportRecord = buildReportRecord({
      analysisId: String(analysisId),
      organizationId,
      organizationName: String(inputPayload.organization_name || "Organisatie"),
      result,
      uploads: Array.isArray(inputPayload.uploads) ? inputPayload.uploads : [],
    });

    await upsertReportMaybe(reportRecord);

    const doneData = await updateAnalysisWithFallback(String(analysisId), [
      {
        status: "done",
        result_payload: result,
        error_message: null,
        finished_at: new Date().toISOString(),
      },
      {
        status: "done",
        result: legacyResultPayload,
        finished_at: new Date().toISOString(),
      },
      {
        status: "done",
        result: legacyResultPayload,
      },
    ]);

    return normalizeAnalysisForResponse(
      doneData || {
        ...analysisData,
        status: "done",
        result_payload: result,
        finished_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    const message = errorMessage(error);

    await updateAnalysisWithFallback(String(analysisId), [
      {
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      },
      {
        status: "failed",
        result: { error: message, input_payload: inputPayload },
        finished_at: new Date().toISOString(),
      },
      {
        status: "failed",
        result: { error: message, input_payload: inputPayload },
      },
    ]);

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
    let resolvedOrganizationId = null;
    try {
      resolvedOrganizationId = await resolveOrganizationId({
        organizationId,
        organization,
      });
    } catch (orgError) {
      const explicitId = String(organizationId || "").trim();
      resolvedOrganizationId = explicitId || randomId("org");
    }

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

    if (error && !isSchemaMismatchError(error) && !isRlsError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const ephemeralUploads = Array.from(EPHEMERAL_UPLOADS.values())
      .filter((row) => String(row.analysis_id || "") === analysisId)
      .sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));

    const mergedUploads = [...(data || []), ...ephemeralUploads];
    if (mergedUploads.length) {
      return res.json({ uploads: mergedUploads });
    }

    const ephemeralAnalysis = EPHEMERAL_ANALYSES.get(analysisId);
    if (ephemeralAnalysis?.input_payload?.uploads?.length) {
      const fromAnalysis = ephemeralAnalysis.input_payload.uploads.map((upload, index) => ({
        id: String(upload.upload_id || `upl-analysis-${analysisId}-${index}`),
        analysis_id: analysisId,
        organization_id: ephemeralAnalysis.organization_id || null,
        file_name: upload.file_name || "upload.bin",
        mime_type: upload.mime_type || "application/octet-stream",
        size_bytes: Number(upload.size_bytes || 0),
        storage_path: upload.storage_path || null,
        extracted_text: upload.extracted_text || null,
        created_at: new Date().toISOString(),
        persistence: "analysis_payload",
      }));
      return res.json({ uploads: fromAnalysis });
    }

    const { data: analysisData, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .maybeSingle();

    if (analysisError && !isSchemaMismatchError(analysisError) && !isRlsError(analysisError)) {
      return res.status(500).json({ error: analysisError.message });
    }

    const normalized = normalizeAnalysisForResponse(analysisData);
    const payloadUploads = Array.isArray(normalized?.input_payload?.uploads)
      ? normalized.input_payload.uploads
      : [];

    const fallbackUploads = payloadUploads.map((upload, index) => ({
      id: String(upload.upload_id || `upl-analysis-${analysisId}-${index}`),
      analysis_id: analysisId,
      organization_id: normalized?.organization_id || null,
      file_name: upload.file_name || "upload.bin",
      mime_type: upload.mime_type || "application/octet-stream",
      size_bytes: Number(upload.size_bytes || 0),
      storage_path: upload.storage_path || null,
      extracted_text: upload.extracted_text || null,
      created_at: new Date().toISOString(),
      persistence: "analysis_payload",
    }));

    return res.json({ uploads: fallbackUploads });
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

    let resolvedOrganizationId = null;
    let organizationWarning = null;
    try {
      resolvedOrganizationId = await resolveOrganizationId({
        organizationId,
        organization,
      });
    } catch (orgError) {
      const explicitId = String(organizationId || "").trim();
      if (explicitId) {
        resolvedOrganizationId = explicitId;
      } else {
        resolvedOrganizationId = null;
        organizationWarning = errorMessage(orgError);
      }
    }

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
        storage_path: uploadRow.storage_path || null,
        extracted_text: uploadRow.extracted_text,
      })),
      requested_at: new Date().toISOString(),
    };

    const created = await insertAnalysisWithFallback({
      organizationId: resolvedOrganizationId,
      inputPayload: input_payload,
    });

    await linkUploadsToAnalysis({
      analysisId: String(created.analysis.id),
      uploadIds: Array.isArray(uploadIds) ? uploadIds : [],
    });

    const shouldRunInline =
      typeof runImmediately === "boolean" ? runImmediately : true;

    if (!shouldRunInline) {
      return res.status(201).json({
        analysis: normalizeAnalysisForResponse(created.analysis),
        persistence: created.persistence,
        warning: created.warning || organizationWarning,
      });
    }

    const done = await processAnalysisInline(String(created.analysis.id));
    return res.status(201).json({
      analysis: normalizeAnalysisForResponse(done),
      persistence: created.persistence,
      warning: created.warning || organizationWarning,
    });
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

  const ephemeral = EPHEMERAL_ANALYSES.get(analysisId);
  if (ephemeral) {
    const normalized = normalizeAnalysisForResponse(ephemeral);
    const result = extractResultPayloadFromAnalysisRow(normalized);
    const report = result
      ? buildReportRecord({
          analysisId,
          organizationId: normalized.organization_id || null,
          organizationName: String(
            normalized.input_payload?.organization_name || "Organisatie"
          ),
          result,
          uploads: Array.isArray(normalized.input_payload?.uploads)
            ? normalized.input_payload.uploads
            : [],
        })
      : null;
    return res.json({ analysis: normalized, report });
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .maybeSingle();

  if (analysisError && !isSchemaMismatchError(analysisError) && !isRlsError(analysisError)) {
    return res.status(500).json({ error: analysisError.message });
  }

  if (!analysis) {
    return res.status(404).json({ error: "Analyse niet gevonden" });
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id,analysis_id,title,summary,created_at,updated_at")
    .eq("analysis_id", analysisId)
    .maybeSingle();

  if (reportError && !isSchemaMismatchError(reportError) && !isRlsError(reportError)) {
    return res.status(500).json({ error: reportError.message });
  }

  const normalized = normalizeAnalysisForResponse(analysis);
  if (report) {
    return res.json({ analysis: normalized, report });
  }

  const fallbackResult = extractResultPayloadFromAnalysisRow(normalized);
  const fallbackReport = fallbackResult
    ? buildReportRecord({
        analysisId,
        organizationId: normalized.organization_id || null,
        organizationName: String(
          normalized.input_payload?.organization_name || "Organisatie"
        ),
        result: fallbackResult,
        uploads: Array.isArray(normalized.input_payload?.uploads)
          ? normalized.input_payload.uploads
          : [],
      })
    : null;

  return res.json({ analysis: normalized, report: fallbackReport });
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

  if (error && !isSchemaMismatchError(error) && !isRlsError(error)) {
    return res.status(500).json({ error: error.message });
  }

  if (data) {
    return res.json({ report: data });
  }

  const ephemeral = EPHEMERAL_ANALYSES.get(analysisId);
  if (ephemeral) {
    const normalized = normalizeAnalysisForResponse(ephemeral);
    const result = extractResultPayloadFromAnalysisRow(normalized);
    if (!result) {
      return res.status(404).json({ error: "Rapport niet gevonden" });
    }

    const report = buildReportRecord({
      analysisId,
      organizationId: normalized.organization_id || null,
      organizationName: String(
        normalized.input_payload?.organization_name || "Organisatie"
      ),
      result,
      uploads: Array.isArray(normalized.input_payload?.uploads)
        ? normalized.input_payload.uploads
        : [],
    });
    return res.json({ report });
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .maybeSingle();

  if (analysisError && !isSchemaMismatchError(analysisError) && !isRlsError(analysisError)) {
    return res.status(500).json({ error: analysisError.message });
  }

  const normalized = normalizeAnalysisForResponse(analysis);
  const result = extractResultPayloadFromAnalysisRow(normalized);
  if (!result) {
    return res.status(404).json({ error: "Rapport niet gevonden" });
  }

  const report = buildReportRecord({
    analysisId,
    organizationId: normalized.organization_id || null,
    organizationName: String(
      normalized.input_payload?.organization_name || "Organisatie"
    ),
    result,
    uploads: Array.isArray(normalized.input_payload?.uploads)
      ? normalized.input_payload.uploads
      : [],
  });

  return res.json({ report });
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

  if (error && !isSchemaMismatchError(error) && !isRlsError(error)) {
    return res.status(500).json({ error: error.message });
  }

  let effectiveReport = report || null;

  if (!effectiveReport) {
    const ephemeral = EPHEMERAL_ANALYSES.get(analysisId);
    const normalizedEphemeral = normalizeAnalysisForResponse(ephemeral);
    const ephemeralResult = extractResultPayloadFromAnalysisRow(normalizedEphemeral);
    if (ephemeralResult) {
      effectiveReport = buildReportRecord({
        analysisId,
        organizationId: normalizedEphemeral.organization_id || null,
        organizationName: String(
          normalizedEphemeral.input_payload?.organization_name || "Organisatie"
        ),
        result: ephemeralResult,
        uploads: Array.isArray(normalizedEphemeral.input_payload?.uploads)
          ? normalizedEphemeral.input_payload.uploads
          : [],
      });
    }
  }

  if (!effectiveReport) {
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .maybeSingle();

    if (analysisError && !isSchemaMismatchError(analysisError) && !isRlsError(analysisError)) {
      return res.status(500).json({ error: analysisError.message });
    }

    const normalized = normalizeAnalysisForResponse(analysis);
    const result = extractResultPayloadFromAnalysisRow(normalized);
    if (result) {
      effectiveReport = buildReportRecord({
        analysisId,
        organizationId: normalized.organization_id || null,
        organizationName: String(
          normalized.input_payload?.organization_name || "Organisatie"
        ),
        result,
        uploads: Array.isArray(normalized.input_payload?.uploads)
          ? normalized.input_payload.uploads
          : [],
      });
    }
  }

  if (!effectiveReport) {
    return res.status(404).json({ error: "Rapport niet gevonden" });
  }

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(effectiveReport.title || "Executive Rapport", 40, y);

  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Analyse ID: ${analysisId}`, 40, y);

  y += 22;
  doc.setFontSize(12);
  doc.text("Samenvatting", 40, y);

  y += 16;
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(String(effectiveReport.summary || ""), 510);
  doc.text(summaryLines, 40, y);

  y += summaryLines.length * 12 + 16;
  doc.setFontSize(11);
  doc.text("Metadata", 40, y);

  y += 14;
  doc.setFontSize(10);
  const metadata = effectiveReport.metadata || {};
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
