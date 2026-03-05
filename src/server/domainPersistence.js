import { Router } from "express";
import { supabaseService } from "./supabaseService.js";

const router = Router();

const supabase = supabaseService;

const BOARD_TYPES = ["board_evaluation_result", "board_evaluation"];
const BOARD_INDEX_TYPES = ["board_index_snapshot"];
const PERFORMANCE_BASELINE_TYPES = ["performance_baseline"];
const PERFORMANCE_SNAPSHOT_TYPES = ["performance_snapshot"];
const REPORT_STORAGE_TYPES = ["stored_report"];

const memoryBoardIndexSnapshots = new Map();
const memoryStoredReports = new Map();

function errorMessage(error) {
  if (!error) return "unknown";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String(error.message || "unknown");
  }
  return String(error);
}

function isSchemaMismatchError(error) {
  const lowered = errorMessage(error).toLowerCase();
  return (
    lowered.includes("could not find the table") ||
    lowered.includes("schema cache") ||
    lowered.includes("relation") && lowered.includes("does not exist") ||
    lowered.includes("column") && lowered.includes("does not exist")
  );
}

function toNumber(value) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const factor = Math.pow(10, digits);
  return Math.round(toNumber(value) * factor) / factor;
}

function extractAnalysisPayload(row) {
  if (row?.result_payload && typeof row.result_payload === "object") {
    return row.result_payload;
  }
  if (row?.result && typeof row.result === "object") {
    return row.result;
  }
  if (row?.payload && typeof row.payload === "object") {
    return row.payload;
  }
  if (row?.input_payload && typeof row.input_payload === "object") {
    return row.input_payload;
  }
  return {};
}

function readObjectOrEmpty(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeBoardIndexSnapshot(input) {
  const payload = readObjectOrEmpty(input);
  const analysisId = String(payload.analysisId || "").trim();
  if (!analysisId) return null;
  return {
    ...payload,
    analysisId,
    createdAt: String(payload.createdAt || new Date().toISOString()),
    organisationId:
      payload.organisationId == null
        ? undefined
        : String(payload.organisationId || "").trim() || undefined,
  };
}

function normalizeStoredReport(input) {
  const payload = readObjectOrEmpty(input);
  const id = String(payload.id || payload.analysisId || "").trim();
  const analysisId = String(payload.analysisId || id).trim();
  if (!id || !analysisId) return null;
  return {
    id,
    analysisId,
    title: String(payload.title || "Ongetiteld rapport"),
    date: String(payload.date || new Date().toISOString()),
    baliScore: round(clamp(toNumber(payload.baliScore), 0, 10), 2),
    betrouwbaarheid: round(clamp(toNumber(payload.betrouwbaarheid), 0, 100), 2),
    interventionStatus: String(payload.interventionStatus || "onbekend"),
    pdfUrl: payload.pdfUrl ? String(payload.pdfUrl) : undefined,
    analysisRoute: payload.analysisRoute ? String(payload.analysisRoute) : undefined,
  };
}

function sortReportsByDateDesc(rows) {
  return [...rows].sort((a, b) => {
    const at = new Date(a?.date || 0).getTime();
    const bt = new Date(b?.date || 0).getTime();
    return bt - at;
  });
}

async function insertAnalysisFallbackRecord(type, payload) {
  const insertCandidates = [
    { analysis_type: type, status: "done", result: payload },
    {
      type,
      status: "done",
      payload,
      input_payload: payload,
      result_payload: payload,
    },
  ];

  let lastError = null;
  for (const insertRow of insertCandidates) {
    const { data, error } = await supabase
      .from("analyses")
      .insert(insertRow)
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

  throw new Error(`Analysis fallback insert failed: ${errorMessage(lastError)}`);
}

async function fetchAnalysisFallbackRows(types, limit = 1000) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Analysis fallback read failed: ${error.message}`);
  }

  return (data || [])
    .filter((row) => {
      const typeValue = String(row.analysis_type || row.type || "").trim();
      return types.includes(typeValue);
    })
    .map((row) => ({
      id: String(row.id),
      created_at: String(row.created_at || new Date().toISOString()),
      payload: extractAnalysisPayload(row),
    }));
}

function normalizeBoardRow(input) {
  const clarity = clamp(toNumber(input.clarity_score), 0, 10);
  const certainty = clamp(toNumber(input.decision_certainty), 0, 10);
  const risk = clamp(toNumber(input.risk_understanding), 0, 10);
  const trust = clamp(toNumber(input.governance_trust), 0, 10);
  const instrument = clamp(toNumber(input.instrument_perception), 0, 10);
  const overall = round((clarity + certainty + risk + trust + instrument) / 5, 2);

  return {
    board_member_id: String(input.board_member_id || ""),
    organisation_id: String(input.organisation_id || ""),
    clarity_score: round(clarity, 2),
    decision_certainty: round(certainty, 2),
    risk_understanding: round(risk, 2),
    governance_trust: round(trust, 2),
    instrument_perception: round(instrument, 2),
    overall_score: overall,
    created_at: String(input.created_at || new Date().toISOString()),
  };
}

async function fetchBoardRowsFallback(organisationId, limit) {
  const rows = await fetchAnalysisFallbackRows(BOARD_TYPES, Math.max(limit * 4, 400));
  return rows
    .map((row) => ({
      id: row.id,
      ...normalizeBoardRow(row.payload || {}),
      created_at: String(
        row.payload?.created_at || row.created_at || new Date().toISOString()
      ),
    }))
    .filter((row) => row.organisation_id === organisationId)
    .slice(0, limit);
}

function normalizeBaselinePayload(input) {
  return {
    organisation_id: String(input.organisation_id || ""),
    baseline_dsi: round(clamp(toNumber(input.baseline_dsi), 0, 10), 2),
    baseline_timestamp: String(input.baseline_timestamp || new Date().toISOString()),
    baseline_sri: round(clamp(toNumber(input.baseline_sri), 0, 100), 2),
    baseline_execution_score: round(
      clamp(toNumber(input.baseline_execution_score), 0, 100),
      2
    ),
  };
}

function normalizeSnapshotPayload(input) {
  const snapshot_timestamp = String(input.snapshot_timestamp || new Date().toISOString());
  return {
    organisation_id: String(input.organisation_id || ""),
    measurement_date: snapshot_timestamp.slice(0, 10),
    snapshot_timestamp,
    dsi: round(clamp(toNumber(input.dsi), 0, 10), 2),
    execution_score: round(clamp(toNumber(input.execution_score), 0, 100), 2),
    decision_velocity: round(clamp(toNumber(input.decision_velocity), 0, 100), 2),
  };
}

async function fetchBaselineFallbackByOrganisationId(organisationId) {
  const rows = await fetchAnalysisFallbackRows(PERFORMANCE_BASELINE_TYPES, 2000);
  const filtered = rows
    .map((row) => normalizeBaselinePayload(row.payload || {}))
    .filter((row) => row.organisation_id === organisationId)
    .sort((a, b) => b.baseline_timestamp.localeCompare(a.baseline_timestamp));

  return filtered[0] || null;
}

async function fetchSnapshotsFallbackByOrganisationId(organisationId, days = 120) {
  const fromDate = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const rows = await fetchAnalysisFallbackRows(PERFORMANCE_SNAPSHOT_TYPES, 4000);
  const filtered = rows
    .map((row) => normalizeSnapshotPayload(row.payload || {}))
    .filter(
      (row) => row.organisation_id === organisationId && row.measurement_date >= fromDate
    )
    .sort((a, b) => b.snapshot_timestamp.localeCompare(a.snapshot_timestamp));

  const byDay = new Map();
  for (const row of filtered) {
    if (byDay.has(row.measurement_date)) continue;
    byDay.set(row.measurement_date, row);
  }

  return Array.from(byDay.values()).sort((a, b) =>
    a.measurement_date.localeCompare(b.measurement_date)
  );
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

async function computeBenchmarkFallback() {
  const baselineRows = (await fetchAnalysisFallbackRows(PERFORMANCE_BASELINE_TYPES, 5000)).map(
    (row) => normalizeBaselinePayload(row.payload || {})
  );
  const snapshotRows = (await fetchAnalysisFallbackRows(PERFORMANCE_SNAPSHOT_TYPES, 10000)).map(
    (row) => normalizeSnapshotPayload(row.payload || {})
  );

  const latestSnapshotByOrg = new Map();
  for (const snapshot of snapshotRows.sort((a, b) =>
    b.snapshot_timestamp.localeCompare(a.snapshot_timestamp)
  )) {
    if (!snapshot.organisation_id || latestSnapshotByOrg.has(snapshot.organisation_id)) {
      continue;
    }
    latestSnapshotByOrg.set(snapshot.organisation_id, snapshot);
  }

  const latestBaselineByOrg = new Map();
  for (const baseline of baselineRows.sort((a, b) =>
    b.baseline_timestamp.localeCompare(a.baseline_timestamp)
  )) {
    if (!baseline.organisation_id || latestBaselineByOrg.has(baseline.organisation_id)) {
      continue;
    }
    latestBaselineByOrg.set(baseline.organisation_id, baseline);
  }

  const improvements = [];
  for (const [organisationId, baseline] of latestBaselineByOrg.entries()) {
    const current = latestSnapshotByOrg.get(organisationId)?.dsi ?? baseline.baseline_dsi;
    const improvement =
      baseline.baseline_dsi > 0
        ? round(((current - baseline.baseline_dsi) / baseline.baseline_dsi) * 100, 2)
        : 0;
    improvements.push(improvement);
  }

  if (!improvements.length) {
    return {
      gemiddelde_dsi_verbetering_pct: 0,
      top_25_pct_grens: 0,
      mediaan_verbetering_pct: 0,
      stagnatie_pct: 0,
      organisatie_aantal: 0,
    };
  }

  const stagnationCount = improvements.filter((value) => value < 1).length;
  const average =
    improvements.reduce((acc, value) => acc + value, 0) / improvements.length;

  return {
    gemiddelde_dsi_verbetering_pct: round(average, 2),
    top_25_pct_grens: round(percentile(improvements, 0.75), 2),
    mediaan_verbetering_pct: round(percentile(improvements, 0.5), 2),
    stagnatie_pct: round((stagnationCount / improvements.length) * 100, 2),
    organisatie_aantal: improvements.length,
  };
}

router.get("/board-evaluations", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const organisationId = String(req.query.organisationId || "").trim();
    const limit = Math.max(1, Math.min(2000, Number(req.query.limit || 500)));
    if (!organisationId) {
      return res.status(400).json({ error: "organisationId query parameter ontbreekt" });
    }

    const { data, error } = await supabase
      .from("board_evaluation_results")
      .select(
        [
          "id",
          "board_member_id",
          "organisation_id",
          "clarity_score",
          "decision_certainty",
          "risk_understanding",
          "governance_trust",
          "instrument_perception",
          "overall_score",
          "created_at",
        ].join(",")
      )
      .eq("organisation_id", organisationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error) {
      return res.json({ rows: data || [] });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const fallbackRows = await fetchBoardRowsFallback(organisationId, limit);
    return res.json({ rows: fallbackRows });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.post("/board-evaluations", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const payload = normalizeBoardRow(req.body || {});
    if (!payload.board_member_id || !payload.organisation_id) {
      return res.status(400).json({
        error: "board_member_id en organisation_id zijn verplicht",
      });
    }

    const insertPayload = {
      board_member_id: payload.board_member_id,
      organisation_id: payload.organisation_id,
      clarity_score: payload.clarity_score,
      decision_certainty: payload.decision_certainty,
      risk_understanding: payload.risk_understanding,
      governance_trust: payload.governance_trust,
      instrument_perception: payload.instrument_perception,
    };

    const { data, error } = await supabase
      .from("board_evaluation_results")
      .insert(insertPayload)
      .select(
        [
          "id",
          "board_member_id",
          "organisation_id",
          "clarity_score",
          "decision_certainty",
          "risk_understanding",
          "governance_trust",
          "instrument_perception",
          "overall_score",
          "created_at",
        ].join(",")
      )
      .single();

    if (!error && data) {
      return res.status(201).json({ evaluation: data, persistence: "table" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: errorMessage(error) });
    }

    const fallbackSaved = await insertAnalysisFallbackRecord(
      BOARD_TYPES[0],
      payload
    );
    return res.status(201).json({
      evaluation: {
        id: String(fallbackSaved.id),
        ...payload,
      },
      persistence: "analyses_fallback",
    });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/performance/baseline", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const organisationId = String(req.query.organisationId || "").trim();
    if (!organisationId) {
      return res.status(400).json({ error: "organisationId query parameter ontbreekt" });
    }

    const { data, error } = await supabase
      .from("organisation_performance_baseline")
      .select(
        "organisation_id,baseline_dsi,baseline_timestamp,baseline_sri,baseline_execution_score"
      )
      .eq("organisation_id", organisationId)
      .maybeSingle();

    if (!error) {
      return res.json({ baseline: data || null, persistence: "table" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const fallback = await fetchBaselineFallbackByOrganisationId(organisationId);
    return res.json({ baseline: fallback, persistence: "analyses_fallback" });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.post("/performance/baseline", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const payload = normalizeBaselinePayload(req.body || {});
    if (!payload.organisation_id) {
      return res.status(400).json({ error: "organisation_id is verplicht" });
    }

    const { data: existing, error: existingError } = await supabase
      .from("organisation_performance_baseline")
      .select(
        "organisation_id,baseline_dsi,baseline_timestamp,baseline_sri,baseline_execution_score"
      )
      .eq("organisation_id", payload.organisation_id)
      .maybeSingle();

    if (!existingError && existing) {
      return res.json({ baseline: existing, persistence: "table" });
    }

    const { data, error } = await supabase
      .from("organisation_performance_baseline")
      .insert(payload)
      .select(
        "organisation_id,baseline_dsi,baseline_timestamp,baseline_sri,baseline_execution_score"
      )
      .single();

    if (!error && data) {
      return res.status(201).json({ baseline: data, persistence: "table" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: errorMessage(error) });
    }

    const saved = await insertAnalysisFallbackRecord(
      PERFORMANCE_BASELINE_TYPES[0],
      payload
    );
    return res.status(201).json({
      baseline: {
        ...payload,
        id: String(saved.id),
      },
      persistence: "analyses_fallback",
    });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/performance/snapshots", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const organisationId = String(req.query.organisationId || "").trim();
    const days = Math.max(1, Math.min(3650, Number(req.query.days || 120)));
    if (!organisationId) {
      return res.status(400).json({ error: "organisationId query parameter ontbreekt" });
    }

    const fromDate = new Date(Date.now() - days * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const { data, error } = await supabase
      .from("organisation_performance_snapshots")
      .select(
        "organisation_id,measurement_date,snapshot_timestamp,dsi,execution_score,decision_velocity"
      )
      .eq("organisation_id", organisationId)
      .gte("measurement_date", fromDate)
      .order("measurement_date", { ascending: true });

    if (!error) {
      return res.json({ rows: data || [], persistence: "table" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const fallbackRows = await fetchSnapshotsFallbackByOrganisationId(
      organisationId,
      days
    );
    return res.json({ rows: fallbackRows, persistence: "analyses_fallback" });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.post("/performance/snapshots", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const payload = normalizeSnapshotPayload(req.body || {});
    if (!payload.organisation_id) {
      return res.status(400).json({ error: "organisation_id is verplicht" });
    }

    const { data, error } = await supabase
      .from("organisation_performance_snapshots")
      .upsert(payload, { onConflict: "organisation_id,measurement_date" })
      .select(
        "organisation_id,measurement_date,snapshot_timestamp,dsi,execution_score,decision_velocity"
      )
      .maybeSingle();

    if (!error) {
      return res.status(201).json({ snapshot: data || payload, persistence: "table" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const saved = await insertAnalysisFallbackRecord(
      PERFORMANCE_SNAPSHOT_TYPES[0],
      payload
    );
    return res.status(201).json({
      snapshot: {
        ...payload,
        id: String(saved.id),
      },
      persistence: "analyses_fallback",
    });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/performance/benchmark", async (_req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase is not configured on server." });
  }

  try {
    const { data, error } = await supabase
      .from("organisation_performance_benchmark")
      .select(
        "gemiddelde_dsi_verbetering_pct,top_25_pct_grens,mediaan_verbetering_pct,stagnatie_pct,organisatie_aantal"
      )
      .maybeSingle();

    if (!error) {
      return res.json({ benchmark: data || null, persistence: "view" });
    }

    if (!isSchemaMismatchError(error)) {
      return res.status(500).json({ error: error.message });
    }

    const benchmark = await computeBenchmarkFallback();
    return res.json({ benchmark, persistence: "analyses_fallback" });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.post("/board-index", async (req, res) => {
  try {
    const snapshot = normalizeBoardIndexSnapshot(req.body || {});
    if (!snapshot) {
      return res.status(400).json({ error: "analysisId is verplicht" });
    }

    memoryBoardIndexSnapshots.set(snapshot.analysisId, snapshot);

    if (supabase) {
      try {
        await insertAnalysisFallbackRecord(BOARD_INDEX_TYPES[0], snapshot);
      } catch {
        // Memory persistence remains the primary dev fallback.
      }
    }

    return res.status(201).json(snapshot);
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/board-index/:analysisId", async (req, res) => {
  try {
    const analysisId = String(req.params.analysisId || "").trim();
    if (!analysisId) {
      return res.status(400).json({ error: "analysisId ontbreekt" });
    }

    const inMemory = memoryBoardIndexSnapshots.get(analysisId);
    if (inMemory) {
      return res.json(inMemory);
    }

    if (supabase) {
      try {
        const fallbackRows = await fetchAnalysisFallbackRows(BOARD_INDEX_TYPES, 3000);
        const match = fallbackRows.find((row) => {
          const payload = normalizeBoardIndexSnapshot(row.payload);
          return payload?.analysisId === analysisId;
        });
        if (match) {
          const payload = normalizeBoardIndexSnapshot(match.payload);
          if (payload) {
            memoryBoardIndexSnapshots.set(payload.analysisId, payload);
            return res.json(payload);
          }
        }
      } catch {
        // Return 404 below when fallback load is unavailable.
      }
    }

    return res.json(null);
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.post("/reports-storage", async (req, res) => {
  try {
    const report = normalizeStoredReport(req.body || {});
    if (!report) {
      return res.status(400).json({ error: "id en analysisId zijn verplicht" });
    }

    memoryStoredReports.set(report.id, report);

    if (supabase) {
      try {
        await insertAnalysisFallbackRecord(REPORT_STORAGE_TYPES[0], report);
      } catch {
        // Memory persistence remains the primary dev fallback.
      }
    }

    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/reports-storage", async (_req, res) => {
  try {
    const combined = new Map(memoryStoredReports);

    if (supabase) {
      try {
        const fallbackRows = await fetchAnalysisFallbackRows(REPORT_STORAGE_TYPES, 5000);
        for (const row of fallbackRows) {
          const report = normalizeStoredReport(row.payload);
          if (!report) continue;
          if (!combined.has(report.id)) combined.set(report.id, report);
        }
      } catch {
        // Serve in-memory rows if fallback read fails.
      }
    }

    return res.json({ reports: sortReportsByDateDesc(Array.from(combined.values())) });
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

router.get("/reports-storage/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) {
      return res.status(400).json({ error: "id ontbreekt" });
    }

    const inMemory = memoryStoredReports.get(id);
    if (inMemory) {
      return res.json(inMemory);
    }

    if (supabase) {
      try {
        const fallbackRows = await fetchAnalysisFallbackRows(REPORT_STORAGE_TYPES, 5000);
        const match = fallbackRows.find((row) => {
          const report = normalizeStoredReport(row.payload);
          return report?.id === id;
        });
        if (match) {
          const report = normalizeStoredReport(match.payload);
          if (report) {
            memoryStoredReports.set(report.id, report);
            return res.json(report);
          }
        }
      } catch {
        // Return 404 below when fallback load is unavailable.
      }
    }

    return res.json(null);
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});

export default router;
