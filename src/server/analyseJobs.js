import { Router } from "express";

const router = Router();
const ANALYSIS_JOBS = new Map();

function nowIso() {
  return new Date().toISOString();
}

function normalizeEdgeResult(json) {
  return {
    report: json?.report,
    confidence: json?.confidence ?? "high",
    created_at: json?.created_at ?? nowIso(),
    intelligence_layer: json?.intelligence_layer,
    decision_layer: json?.decision_layer,
    linguistic_signals: json?.linguistic_signals,
  };
}

function buildDeterministicFallback(payload) {
  const context = String(payload?.company_context || "").trim();
  const compactContext = context.replace(/\s+/g, " ").slice(0, 1600);
  const narrative = [
    "Strategische fallback-analyse (lokale continuiteitsmodus).",
    "Kernbeeld: er is voldoende context om bestuurlijke spanning, prioriteiten en risico's te structureren.",
    "Aanbevolen focus: maak binnen 14 dagen een expliciet besluitkader met eigenaarschap, KPI-ritme en escalatieregel.",
    "Top-risico: besluituitstel door onduidelijk mandaat en conflicterende prioriteiten.",
    "Top-interventie: sluit een 90-dagenplan met weekdoelen, verantwoordelijke eigenaar en meetbare voortgang.",
    compactContext ? `Broncontext (samenvatting): ${compactContext}` : "Broncontext: niet aangeleverd.",
  ].join("\n\n");

  return {
    report: {
      title: "Aurelius Intelligence Report",
      narrative,
      analysis_type: payload?.analysis_type ?? "strategy",
    },
    confidence: "low",
    created_at: nowIso(),
  };
}

async function runLocalFallback(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildDeterministicFallback(payload);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        temperature: 0.25,
        max_tokens: 7000,
        messages: [
          {
            role: "system",
            content:
              "Je bent AURELIUS. Schrijf een diepgaande bestuursanalyse in het Nederlands. Geen markdown.",
          },
          {
            role: "user",
            content: String(payload?.company_context || ""),
          },
        ],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`OpenAI fallback ${response.status}: ${txt}`);
    }

    const json = await response.json();
    const narrative = json?.choices?.[0]?.message?.content;
    if (!narrative || !String(narrative).trim()) {
      throw new Error("OpenAI fallback gaf geen analyse terug");
    }

    return {
      report: {
        title: "Aurelius Intelligence Report",
        narrative: String(narrative),
        analysis_type: payload?.analysis_type ?? "strategy",
      },
      confidence: "medium",
      created_at: nowIso(),
    };
  } catch {
    return buildDeterministicFallback(payload);
  }
}

async function executeJob(runId) {
  const job = ANALYSIS_JOBS.get(runId);
  if (!job) return;

  try {
    job.status = "running";
    job.progress = 15;

    const baseUrl = process.env.VITE_SUPABASE_FUNCTIONS_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    let normalized;
    if (baseUrl && anonKey) {
      const edgeRes = await fetch(`${baseUrl}/aurelius-analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify(job.payload),
      });

      if (edgeRes.ok) {
        const edgeJson = await edgeRes.json();
        if (edgeJson?.success === false) {
          throw new Error(edgeJson?.error || "Edge analyse mislukt");
        }
        normalized = normalizeEdgeResult(edgeJson);
      } else {
        const reason = await edgeRes.text();
        throw new Error(`Edge analyse faalde (${edgeRes.status}): ${reason}`);
      }
    } else {
      normalized = await runLocalFallback(job.payload);
    }

    job.progress = 100;
    job.status = "completed";
    job.result = normalized;
    job.updatedAt = nowIso();
  } catch (error) {
    const fallbackAllowed = !ANALYSIS_JOBS.get(runId)?.result;
    if (fallbackAllowed) {
      try {
        const fallback = await runLocalFallback(job.payload);
        job.progress = 100;
        job.status = "completed";
        job.result = fallback;
        job.updatedAt = nowIso();
        return;
      } catch {
        // continue to hard failure
      }
    }

    job.status = "error";
    job.error = error instanceof Error ? error.message : String(error);
    job.updatedAt = nowIso();
  }
}

router.post("/analyse", async (req, res) => {
  try {
    const runId = String(req.body?.runId || "").trim();
    const payload = req.body?.payload;

    if (!runId) {
      return res.status(400).json({ error: "runId ontbreekt" });
    }

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "payload ontbreekt" });
    }

    const existing = ANALYSIS_JOBS.get(runId);
    if (existing) {
      return res.status(202).json({
        runId,
        status: existing.status,
        progress: existing.progress,
      });
    }

    ANALYSIS_JOBS.set(runId, {
      runId,
      status: "running",
      progress: 5,
      result: null,
      error: null,
      payload,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    void executeJob(runId);

    return res.status(202).json({ runId, status: "running", progress: 5 });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get("/analyse/status/:runId", (req, res) => {
  const runId = String(req.params.runId || "").trim();
  if (!runId) {
    return res.status(400).json({ error: "runId ontbreekt" });
  }

  const job = ANALYSIS_JOBS.get(runId);
  if (!job) {
    return res.status(404).json({ error: "Run niet gevonden" });
  }

  if (job.status === "error") {
    return res.json({
      status: "error",
      progress: job.progress,
      result: null,
      error: job.error || "Analyse mislukt",
    });
  }

  if (job.status === "completed") {
    return res.json({
      status: "completed",
      progress: 100,
      result: job.result,
    });
  }

  return res.json({
    status: "running",
    progress: Number(job.progress) || 0,
    result: null,
  });
});

export default router;
