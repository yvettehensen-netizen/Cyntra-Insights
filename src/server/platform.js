import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DB_PATH = path.resolve(__dirname, "../../tmp/platform-runtime-db.json");

function baselineOrganizations() {
  const now = new Date().toISOString();
  return [
    {
      organization_id: "project-cyntra-insights",
      organisatie_naam: "Cyntra Insights",
      sector: "AI / Strategisch analyseplatform",
      organisatie_grootte: "Kernplatform",
      abonnementstype: "Enterprise",
      analyses: [],
      created_at: now,
      updated_at: now,
    },
    {
      organization_id: "project-7",
      organisatie_naam: "Project 7",
      sector: "AI / Strategisch analyseplatform",
      organisatie_grootte: "Nieuwste versie",
      abonnementstype: "Enterprise",
      analyses: [],
      created_at: now,
      updated_at: now,
    },
  ];
}

function ensureBaselineOrganizations(rows = []) {
  const byName = new Map(
    (Array.isArray(rows) ? rows : []).map((row) => [normalize(row?.organisatie_naam).toLowerCase(), row])
  );
  for (const baseline of baselineOrganizations()) {
    const key = normalize(baseline.organisatie_naam).toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, baseline);
    }
  }
  return Array.from(byName.values());
}

function createEmptyDb() {
  return {
    organizations: ensureBaselineOrganizations([]),
    sessions: [],
    datasetRecords: [],
    interventions: [],
    cases: [],
  };
}

function readPersistedDb() {
  try {
    if (!fs.existsSync(PLATFORM_DB_PATH)) return createEmptyDb();
    const raw = fs.readFileSync(PLATFORM_DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createEmptyDb();
    return {
      organizations: ensureBaselineOrganizations(Array.isArray(parsed.organizations) ? parsed.organizations : []),
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      datasetRecords: Array.isArray(parsed.datasetRecords) ? parsed.datasetRecords : [],
      interventions: Array.isArray(parsed.interventions) ? parsed.interventions : [],
      cases: Array.isArray(parsed.cases) ? parsed.cases : [],
    };
  } catch {
    return createEmptyDb();
  }
}

function persistDb() {
  try {
    fs.mkdirSync(path.dirname(PLATFORM_DB_PATH), { recursive: true });
    fs.writeFileSync(PLATFORM_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Runtime continuity store is best-effort and must not break requests.
  }
}

const db = readPersistedDb();

export function resetPlatformRuntimeStore() {
  db.organizations.splice(0, db.organizations.length);
  db.sessions.splice(0, db.sessions.length);
  db.datasetRecords.splice(0, db.datasetRecords.length);
  db.interventions.splice(0, db.interventions.length);
  db.cases.splice(0, db.cases.length);
  try {
    fs.rmSync(PLATFORM_DB_PATH, { force: true });
  } catch {
    // ignore
  }
}

export function getPlatformRuntimeStorePath() {
  return PLATFORM_DB_PATH;
}

const discoveryDirectory = [
  { organisation_name: "GGZ Voor Jou", sector: "Zorg/GGZ", website: "https://ggzvoorbeeld.nl", location: "Ede" },
  { organisation_name: "Vallei Zorgcollectief", sector: "Zorg/GGZ", website: "https://valleizorg.example", location: "Wageningen" },
  { organisation_name: "Delta Maakindustrie", sector: "Industrie", website: "https://delta-industrie.example", location: "Rotterdam" },
  { organisation_name: "NoordData Services", sector: "Zakelijke dienstverlening", website: "https://noorddata.example", location: "Groningen" },
  { organisation_name: "Stad Logistics", sector: "Logistiek", website: "https://stadlogistics.example", location: "Utrecht" },
];

const planLimits = {
  Starter: 3,
  Professional: 10,
  Enterprise: null,
};

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function isSessionCompletedStatus(status) {
  return status === "voltooid" || status === "completed";
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `${prefix}-${stamp}-${rand}`;
}

function jsonOk(res, data) {
  return res.status(200).json({ success: true, data });
}

function jsonErr(res, status, message) {
  return res.status(status).json({ success: false, error: String(message || "Onbekende fout") });
}

function listSessionsByOrg(organization_id) {
  return db.sessions.filter((row) => row.organization_id === organization_id);
}

function monthlyUsage(organization_id) {
  const current = new Date();
  return listSessionsByOrg(organization_id).filter((row) => {
    const d = new Date(row.analyse_datum);
    return d.getUTCFullYear() === current.getUTCFullYear() && d.getUTCMonth() === current.getUTCMonth();
  }).length;
}

function buildReportForSession(session, organization) {
  const sector = normalize(organization?.sector) || "Onbekende sector";
  const problemType = /marge|cash|liquiditeit|kostprijs|tarief/i.test(session.input_data)
    ? "financiële druk"
    : /capaciteit|wachtlijst|fte|planning/i.test(session.input_data)
      ? "capaciteitsprobleem"
      : /contract|plafond|verzekeraar/i.test(session.input_data)
        ? "contractbeperking"
        : "strategische versnippering";

  const options = [
    "A. Consolideren van de kernactiviteiten",
    "B. Versneld verbreden met nieuwe initiatieven",
    "C. Gefaseerde strategie met harde stopregels",
  ];

  const report = [
    "1. Besluitvraag",
    `Welke strategische keuze verlaagt het hoogste structurele risico voor ${organization?.organisatie_naam || "de organisatie"}?`,
    "",
    "2. Bestuurlijke these",
    "Zonder heldere volgorde tussen consolideren en verbreden nemen margedruk en uitvoeringsrisico tegelijk toe.",
    "",
    "3. Feitenbasis",
    `Sector: ${sector}. Inputsignalen: ${session.input_data.slice(0, 280)}.`,
    "",
    "4. Strategische opties",
    options.join("\n"),
    "",
    "5. Aanbevolen keuze",
    "Aanbevolen keuze: C (gefaseerde strategie met kernstabilisatie eerst).",
    "",
    "6. Besluitregels",
    "Geen nieuwe initiatieven zonder margevalidatie, capaciteitsimpact en expliciete eigenaar.",
    "",
    "7. 90-dagen interventieplan",
    "1. Margetransparantie per product.\n2. Contractdiscipline per verzekeraar.\n3. Wekelijks KPI-ritme met escalatie.",
    "",
    "8. KPI monitoring",
    "Cash-runway, margeontwikkeling, capaciteit, plafondbenutting, interventie-slaagratio.",
    "",
    "9. Besluittekst",
    "Het bestuur kiest voor gefaseerde uitvoering met harde stopregels en maandelijkse herbeoordeling.",
    "",
    "### SECTOR BENCHMARK",
    "Sectorpatronen",
    "Contractdruk, capaciteitsfrictie en prioriteringsruis keren terug in vergelijkbare organisaties.",
    "",
    "Vergelijkbare organisaties",
    "GGZ Voor Jou, Vallei Zorgcollectief.",
    "",
    "Strategische positie",
    "Positie: kernstabilisatie met gecontroleerde verbreding.",
  ].join("\n");

  return {
    report,
    problemType,
    strategic_options: options,
    gekozen_strategie: "C",
    interventions: [
      "contractheronderhandeling",
      "portfolio rationalisatie",
      "capaciteitsherstructurering",
    ],
  };
}

function upsertOrganization(payload) {
  const now = nowIso();
  const organization_id = normalize(payload.organization_id) || randomId("org");
  const idx = db.organizations.findIndex((row) => row.organization_id === organization_id);
  const base = idx >= 0 ? db.organizations[idx] : null;

  const row = {
    organization_id,
    organisatie_naam: normalize(payload.organisatie_naam) || "Onbekende organisatie",
    sector: normalize(payload.sector) || "Onbekende sector",
    organisatie_grootte: normalize(payload.organisatie_grootte) || "Onbekende grootte",
    abonnementstype: ["Starter", "Professional", "Enterprise"].includes(payload.abonnementstype)
      ? payload.abonnementstype
      : "Starter",
    analyses: Array.isArray(base?.analyses) ? base.analyses : [],
    created_at: base?.created_at || now,
    updated_at: now,
  };

  if (idx >= 0) db.organizations[idx] = row;
  else db.organizations.push(row);
  persistDb();
  return row;
}

function addDatasetRecord(session, organization, resultMeta) {
  const record = {
    record_id: randomId("ds"),
    session_id: session.session_id,
    sector: normalize(resultMeta?.sector) || normalize(organization?.sector) || "Onbekende sector",
    probleemtype: normalize(resultMeta?.probleemtype) || "overig",
    mechanismen: resultMeta?.mechanismen || [],
    interventies: resultMeta?.interventies || [],
    strategische_opties: resultMeta?.strategische_opties || [],
    gekozen_strategie: normalize(resultMeta?.gekozen_strategie) || "onbekend",
    created_at: nowIso(),
  };
  db.datasetRecords.push(record);
  persistDb();
  return record;
}

function confidenceToNumber(value) {
  if (value === "hoog") return 0.85;
  if (value === "laag") return 0.45;
  return 0.65;
}

function benchmarkRowsFromCases(rows, sector) {
  const scoped = rows.filter((row) => {
    if (!sector) return true;
    return normalize(row.sector).toLowerCase() === normalize(sector).toLowerCase();
  });
  const groei = Math.round(
    scoped.reduce((sum, row) => sum + (Array.isArray(row.interventions) && row.interventions.length >= 2 ? 65 : 45), 0) /
      Math.max(scoped.length, 1)
  );
  const marge = Math.round(
    scoped.reduce((sum, row) => sum + (/financ|marge|tarief/i.test(row.report || "") ? 42 : 58), 0) /
      Math.max(scoped.length, 1)
  );
  const capaciteit = Math.round(
    scoped.reduce((sum, row) => sum + (/capaciteit|planning|wacht/i.test(row.report || "") ? 40 : 60), 0) /
      Math.max(scoped.length, 1)
  );
  const risico = Math.round(
    scoped.reduce((sum, row) => sum + (/contract|plafond|verzekeraar/i.test(row.report || "") ? 68 : 52), 0) /
      Math.max(scoped.length, 1)
  );
  return {
    sector: sector || "Alle sectoren",
    totaal_cases: scoped.length,
    metrics: { groei, marge, capaciteit, risico },
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const keys = Array.from(
    rows.reduce((acc, row) => {
      Object.keys(row || {}).forEach((key) => acc.add(key));
      return acc;
    }, new Set())
  );
  const header = keys.join(",");
  const body = rows.map((row) => keys.map((key) => csvEscape(row?.[key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

function extractInterventionsFromReport(report) {
  function normalizeKey(value) {
    return normalize(value).toLowerCase().replace(/[^a-z0-9\s-]+/g, "").replace(/\s+/g, " ").trim();
  }

  function isNoiseLine(line) {
    const text = normalize(line);
    if (!text) return true;
    if (text.length < 3 || text.length > 140) return true;
    if (/^placeholder toegevoegd door narrativestructureguard/i.test(text)) return true;
    if (/^(?:\d+\.?\s*)?(besluitvraag|bestuurlijke these|feitenbasis|strategische opties|aanbevolen keuze|besluitregels|kpi monitoring|besluittekst|sector benchmark|vergelijkbare organisaties|strategische positie)$/i.test(text)) return true;
    if (/^(?:\d+\.?\s*)?(context layer|diagnosis layer|mechanism layer|decision layer|output 1|board memo|executive summary)$/i.test(text)) return true;
    if (/[.:]\s/.test(text) && text.split(/[.!?]+/).filter((part) => normalize(part)).length > 2) return true;
    return false;
  }

  function looksLikeIntervention(line) {
    const text = normalize(line);
    if (!text) return false;
    const hasActionWord = /(heronderhandeling|reductie|stabilisatie|herstructurering|formaliseren|afdwingen|verbreding|discipline|monitoring|escalatie|prioritering|rationalisatie|optimalisatie|verbetering|interventie)/i.test(text);
    const hasDomainNoun = /(contract|marge|capaciteit|portfolio|mandaat|kpi|governance|planning|cash|kosten|risico|uitvoering|strategie)/i.test(text);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return wordCount >= 2 && wordCount <= 18 && (hasActionWord || hasDomainNoun);
  }

  const sourceCase = normalize(report?.source_case_id || report?.case_id || report?.session_id) || "case-onbekend";
  const baseLines = []
    .concat(report?.sections?.dominante_these || [])
    .concat(report?.sections?.kernspanning || [])
    .concat(report?.sections?.trade_offs || [])
    .concat(report?.sections?.price_of_delay || [])
    .concat(report?.recommendations || [])
    .concat(report?.actions || [])
    .concat(report?.interventionPlan || []);

  const lineItems = baseLines
    .flatMap((item) => String(item ?? "").split("\n"))
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);

  const boardText = String(report?.board_report || report?.report || "");
  const fromReport = boardText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(?:\d+[.)]|[-*])\s+/.test(line))
    .map((line) => line.replace(/^(?:\d+[.)]|[-*])\s+/, "").trim())
    .filter(Boolean);

  const combined = Array.from(new Set([...lineItems, ...fromReport]))
    .filter((line) => !isNoiseLine(line))
    .filter((line) => looksLikeIntervention(line));
  const dedup = new Set();
  const unique = [];
  for (const line of combined) {
    const key = normalizeKey(line);
    if (!key || dedup.has(key)) continue;
    dedup.add(key);
    unique.push(line);
  }
  return unique.slice(0, 12).map((line, index) => ({
    id: randomId(`int${index + 1}`),
    title: line.length > 96 ? `${line.slice(0, 93)}...` : line,
    description: line,
    owner: "",
    deadline: "",
    impact: /marge|cash|liquiditeit|tarief|kostprijs/i.test(line) ? "hoog" : "middel",
    risk: /contract|verzekeraar|plafond/i.test(line) ? "hoog" : "middel",
    confidence: 0.7,
    source_case: sourceCase,
    source_case_id: sourceCase,
    created_at: nowIso(),
  }));
}

function saveCaseSnapshot(session, organization, extractedInterventions) {
  const confidence =
    Array.isArray(session.intervention_predictions) && session.intervention_predictions.length
      ? session.intervention_predictions
          .map((item) => confidenceToNumber(item.confidence))
          .reduce((sum, value) => sum + value, 0) / session.intervention_predictions.length
      : 0.65;

  const row = {
    case_id: session.session_id,
    session_id: session.session_id,
    organization_id: session.organization_id,
    organisation_name: organization?.organisatie_naam || session.organization_name || session.organization_id,
    sector: session.strategic_metadata?.sector || organization?.sector || "Onbekende sector",
    probleemtype: session.strategic_metadata?.probleemtype || "overig",
    dominante_these: session.executive_summary || "",
    gekozen_strategie: session.strategic_metadata?.gekozen_strategie || "onbekend",
    analyse_input: session.input_data || "",
    report: session.board_report || "",
    interventions: (extractedInterventions || []).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      impact: item.impact,
      risk: item.risk,
      confidence: item.confidence,
    })),
    confidence: Number(confidence.toFixed(2)),
    created_at: session.analyse_datum || nowIso(),
    updated_at: session.updated_at || nowIso(),
  };

  const idx = db.cases.findIndex((item) => item.case_id === row.case_id);
  if (idx >= 0) db.cases[idx] = row;
  else db.cases.push(row);
  persistDb();
  return row;
}

function startSessionCore(payload) {
  const organization_id = normalize(payload?.organization_id);
  const organization = db.organizations.find((row) => row.organization_id === organization_id);
  if (!organization) {
    return { ok: false, status: 404, error: "Organisatie niet gevonden." };
  }

  const limit = planLimits[organization.abonnementstype] ?? null;
  if (limit != null && monthlyUsage(organization_id) >= limit) {
    return {
      ok: false,
      status: 403,
      error: `Analysequotum bereikt voor ${organization.abonnementstype} (${limit}/maand).`,
    };
  }

  const session_id = randomId("sess");
  const session = {
    session_id,
    organization_id,
    organization_name: organization.organisatie_naam,
    analyse_datum: nowIso(),
    input_data: normalize(payload?.input_data),
    board_report: "",
    status: "draait",
    analysis_type: normalize(payload?.analysis_type) || "Strategische analyse",
    updated_at: nowIso(),
  };

  const analysisResult = buildReportForSession(session, organization);
  const intervention_predictions = analysisResult.interventions.map((name) => ({
    interventie: name,
    impact: "Positieve impact verwacht op marge- en uitvoeringsstabiliteit.",
    risico: "Implementatierisico bij beperkte capaciteit of mandaat.",
    kpi_effect: "Verbetering op marge, capaciteit en besluitritme.",
    confidence: "middel",
  }));
  session.board_report = analysisResult.report;
  session.status = "completed";
  session.executive_summary = "Gefaseerde strategie aanbevolen met kernstabilisatie als eerste prioriteit.";
  session.board_memo = "Board memo: focus op besluitdiscipline, margeherstel en capaciteitsstabilisatie.";
  session.strategic_agent = {
    request_id: randomId("req"),
    organisation_id: organization.organization_id,
    session_id,
    executed_at: nowIso(),
    pipeline: [
      "ContextIngestionModule",
      "DataExtractionModule",
      "SignalDetectionModule",
      "StakeholderMapModule",
      "PatternRecognitionModule",
      "CoreMechanismEngine",
      "StrategicParadoxEngine",
      "EcosystemStrategyEngine",
      "ReplicationLogicEngine",
      "StrategicThreatEngine",
      "KillerInsightGenerator",
      "StrategyOptionGenerator",
      "TradeOffEngine",
      "DecisionEngine",
      "InterventionGenerator",
      "KPIImpactModel",
      "ImplementationRoadmap",
      "RiskMitigationEngine",
      "BoardMemoGenerator",
      "BoardroomQuestionEngine",
    ],
  };
  session.intervention_predictions = intervention_predictions;
  session.strategic_metadata = {
    sector: organization.sector,
    probleemtype: analysisResult.problemType,
    mechanismen: ["margedruk", "contractbeperking", "executiefrictie"],
    interventies: Array.from(new Set([...analysisResult.interventions, ...intervention_predictions.map((item) => item.interventie)])),
    strategische_opties: analysisResult.strategic_options,
    gekozen_strategie: analysisResult.gekozen_strategie,
  };
  session.strategic_report = {
    report_id: randomId("report"),
    session_id,
    organization_id: organization.organization_id,
    title: `Strategisch rapport ${session_id}`,
    sections: (session.board_report || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\.\s+/.test(line) || /^###\s+/.test(line))
      .slice(0, 20),
    generated_at: nowIso(),
    report_body: session.board_report,
  };
  session.updated_at = nowIso();

  db.sessions.push(session);
  organization.analyses = Array.from(new Set([...(organization.analyses || []), session_id]));
  organization.updated_at = nowIso();
  addDatasetRecord(session, organization, session.strategic_metadata);
  const extractedInterventions = extractInterventionsFromReport({
      case_id: session.session_id,
      source_case_id: session.session_id,
      sector: session.strategic_metadata?.sector,
      sections: {
        dominante_these: [session.executive_summary],
        kernspanning: [session.board_memo],
        trade_offs: session.strategic_metadata?.strategische_opties || [],
        price_of_delay: [session.input_data],
      },
      recommendations: session.strategic_metadata?.interventies || [],
      actions: analysisResult.interventions,
      interventionPlan: intervention_predictions.map((item) => item.interventie),
      board_report: session.board_report,
    });
  db.interventions.push(...extractedInterventions);
  saveCaseSnapshot(session, organization, extractedInterventions);
  persistDb();

  return { ok: true, status: 200, data: session };
}

router.get("/platform/health", (_req, res) => {
  jsonOk(res, { status: "ok", service: "platform-api" });
});

router.get("/platform/organizations", (_req, res) => {
  jsonOk(res, db.organizations);
});

router.post("/platform/organizations", (req, res) => {
  try {
    const row = upsertOrganization(req.body || {});
    return jsonOk(res, row);
  } catch (error) {
    return jsonErr(res, 500, error instanceof Error ? error.message : String(error));
  }
});

router.get("/platform/sessions", (req, res) => {
  const organization_id = normalize(req.query.organization_id);
  const rows = organization_id
    ? db.sessions.filter((row) => row.organization_id === organization_id)
    : db.sessions;
  return jsonOk(res, rows);
});

router.get("/platform/sessions/:sessionId", (req, res) => {
  const row = db.sessions.find((item) => item.session_id === req.params.sessionId);
  if (!row) return jsonErr(res, 404, "Sessie niet gevonden.");
  return jsonOk(res, row);
});

router.post("/platform/sessions/start", (req, res) => {
  try {
    const result = startSessionCore(req.body || {});
    if (!result.ok) return jsonErr(res, result.status, result.error);
    return jsonOk(res, result.data);
  } catch (error) {
    return jsonErr(res, 500, error instanceof Error ? error.message : String(error));
  }
});

router.get("/platform/reports/:sessionId/executive-summary", (req, res) => {
  const session = db.sessions.find((item) => item.session_id === req.params.sessionId);
  if (!session) return jsonErr(res, 404, "Sessie niet gevonden.");

  const content = session.executive_summary || "Executive summary niet beschikbaar.";
  return jsonOk(res, {
    session_id: session.session_id,
    filename: `${session.session_id}-executive-summary.txt`,
    mime_type: "text/plain",
    content,
    generated_at: nowIso(),
  });
});

router.get("/platform/reports/:sessionId/board-memo", (req, res) => {
  const session = db.sessions.find((item) => item.session_id === req.params.sessionId);
  if (!session) return jsonErr(res, 404, "Sessie niet gevonden.");

  const content = session.board_memo || "Board memo niet beschikbaar.";
  return jsonOk(res, {
    session_id: session.session_id,
    filename: `${session.session_id}-board-memo.txt`,
    mime_type: "text/plain",
    content,
    generated_at: nowIso(),
  });
});

router.get("/platform/reports/:sessionId/pdf", (req, res) => {
  const session = db.sessions.find((item) => item.session_id === req.params.sessionId);
  if (!session) return jsonErr(res, 404, "Sessie niet gevonden.");

  return jsonOk(res, {
    session_id: session.session_id,
    filename: `${session.session_id}-strategisch-rapport.pdf`,
    mime_type: "text/plain",
    content: session.board_report || "Geen rapportinhoud beschikbaar.",
    generated_at: nowIso(),
  });
});

router.get("/platform/dataset/records", (_req, res) => {
  return jsonOk(res, db.datasetRecords);
});

router.get("/platform/interventions", (_req, res) => {
  if (db.interventions.length) return jsonOk(res, db.interventions);
  const fallbackRows = db.datasetRecords.flatMap((record, index) =>
    (record.interventies || []).map((interventie, subIdx) => ({
      id: `int-${index + 1}-${subIdx + 1}`,
      title: interventie,
      description: interventie,
      owner: "",
      deadline: "",
      impact: "middel",
      risk: "middel",
      confidence: 0.65,
      source_case: record.session_id,
      source_case_id: record.session_id,
      created_at: record.created_at,
      sector: record.sector,
      probleemtype: record.probleemtype,
      interventie,
    }))
  );
  return jsonOk(res, fallbackRows);
});

function decisionMemoryFeedRows(organizationId = "") {
  const org = normalize(organizationId);
  return db.sessions
    .filter((row) => isSessionCompletedStatus(row.status))
    .filter((row) => (!org ? true : normalize(row.organization_id) === org))
    .map((row) => {
      const memory = row.strategic_metadata?.decision_memory || {};
      const alignment = memory.decision_alignment || {};
      const record = memory.decision_record || {};
      return {
        session_id: row.session_id,
        organization_id: row.organization_id,
        organization_name: row.organization_name,
        analyse_datum: row.analyse_datum,
        chosen_strategy: record.gekozen_strategie || row.strategic_metadata?.gekozen_strategie || "",
        alignment_status: alignment.status || "consistent",
        board_alert: memory.boardroom_alert || "",
      };
    })
    .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
}

function earlyWarningFeedRows(organizationId = "") {
  const org = normalize(organizationId);
  return db.sessions
    .filter((row) => isSessionCompletedStatus(row.status))
    .filter((row) => (!org ? true : normalize(row.organization_id) === org))
    .map((row) => {
      const ews = row.strategic_metadata?.early_warning_system || {};
      return {
        session_id: row.session_id,
        organization_id: row.organization_id,
        organization_name: row.organization_name,
        analyse_datum: row.analyse_datum,
        risk_signals: Array.isArray(ews.risk_signals) ? ews.risk_signals : [],
        warning_indicators: Array.isArray(ews.warning_indicators) ? ews.warning_indicators : [],
        board_alert: ews.boardroom_alert || "",
      };
    })
    .sort((a, b) => (a.analyse_datum < b.analyse_datum ? 1 : -1));
}

router.get("/platform/decision-memory", (req, res) => {
  const organizationId = normalize(req.query.organization_id);
  return jsonOk(res, decisionMemoryFeedRows(organizationId));
});

router.get("/platform/early-warnings", (req, res) => {
  const organizationId = normalize(req.query.organization_id);
  return jsonOk(res, earlyWarningFeedRows(organizationId));
});

function sendExportPayload(res, filenameBase, format, rows) {
  const safeFormat = normalize(format).toLowerCase() || "json";
  if (safeFormat === "csv") {
    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filenameBase}.csv\"`);
    return res.status(200).send(csv);
  }
  if (safeFormat === "pdf") {
    const text = Array.isArray(rows) ? JSON.stringify(rows, null, 2) : String(rows ?? "");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filenameBase}.pdf\"`);
    return res.status(200).send(`Cyntra Export\n\n${text}`);
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filenameBase}.json\"`);
  return res.status(200).send(JSON.stringify(rows, null, 2));
}

function mountExportRoutes(basePath) {
  router.get(`${basePath}/export/report`, (req, res) => {
    const format = req.query.format;
    const resource = normalize(req.query.resource) || "report";
    const sessionId = normalize(req.query.session_id);
      const target =
        db.sessions.find((item) => item.session_id === sessionId) ||
        db.sessions
          .filter((item) => isSessionCompletedStatus(item.status))
        .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))[0];
    if (!target) return jsonErr(res, 404, "Geen rapport beschikbaar.");

    if (resource.toLowerCase() === "analysis") {
      return sendExportPayload(res, `${target.session_id}-analysis`, format, {
        session_id: target.session_id,
        analysis_type: target.analysis_type,
        executive_summary: target.executive_summary,
        updated_at: target.updated_at,
      });
    }
    return sendExportPayload(res, `${target.session_id}-report`, format, {
      session_id: target.session_id,
      report: target.board_report || "",
      executive_summary: target.executive_summary || "",
      board_memo: target.board_memo || "",
      updated_at: target.updated_at,
    });
  });

  router.get(`${basePath}/export/interventions`, (req, res) => {
    const format = req.query.format;
    const sourceCase = normalize(req.query.source_case_id);
    const rows = sourceCase
      ? db.interventions.filter((item) => item.source_case_id === sourceCase)
      : db.interventions;
    return sendExportPayload(res, "interventions", format, rows);
  });

  router.get(`${basePath}/export/cases`, (req, res) => {
    const format = req.query.format;
    return sendExportPayload(res, "cases", format, db.cases);
  });

  router.get(`${basePath}/export/benchmark`, (req, res) => {
    const format = req.query.format;
    const sector = normalize(req.query.sector);
    const benchmark = benchmarkRowsFromCases(db.cases, sector);
    return sendExportPayload(res, "benchmark", format, benchmark);
  });

  router.get(`${basePath}/export/dataset`, (req, res) => {
    const format = req.query.format;
    const resource = normalize(req.query.resource) || "dataset";
    if (resource.toLowerCase() === "sector-patterns") {
      const patternMap = new Map();
      for (const record of db.datasetRecords) {
        const key = `${record.sector}__${record.probleemtype}`;
        const count = patternMap.get(key) ?? 0;
        patternMap.set(key, count + 1);
      }
      const rows = Array.from(patternMap.entries()).map(([key, count]) => {
        const [sector, probleemtype] = key.split("__");
        return { sector, probleemtype, count };
      });
      return sendExportPayload(res, "sector-patterns", format, rows);
    }
    return sendExportPayload(res, "dataset", format, db.datasetRecords);
  });

  router.get(`${basePath}/export/decision-memory`, (req, res) => {
    const format = req.query.format;
    const organizationId = normalize(req.query.organization_id);
    return sendExportPayload(res, "decision-memory", format, decisionMemoryFeedRows(organizationId));
  });

  router.get(`${basePath}/export/early-warnings`, (req, res) => {
    const format = req.query.format;
    const organizationId = normalize(req.query.organization_id);
    return sendExportPayload(res, "early-warnings", format, earlyWarningFeedRows(organizationId));
  });
}

mountExportRoutes("");

router.get("/platform/cases", (_req, res) => {
  const rows = db.cases.length
    ? db.cases
    : db.sessions
        .filter((session) => isSessionCompletedStatus(session.status))
        .map((session) => ({
          case_id: session.session_id,
          session_id: session.session_id,
          organization_id: session.organization_id,
          organisation_name: session.organization_name || session.organization_id,
          sector: session.strategic_metadata?.sector || "Onbekende sector",
          analyse_input: session.input_data || "",
          report: session.board_report || "",
          interventions: (session.strategic_metadata?.interventies || []).map((item, index) => ({
            id: `int-${session.session_id}-${index + 1}`,
            title: item,
            description: item,
          })),
          confidence: 0.65,
          created_at: session.analyse_datum,
          updated_at: session.updated_at,
        }));
  return jsonOk(res, rows);
});

router.get("/platform/dataset/benchmark", (req, res) => {
  const sector = normalize(req.query.sector);
  const scoped = db.datasetRecords.filter((row) => {
    if (!sector) return true;
    return normalize(row.sector).toLowerCase() === sector.toLowerCase();
  });

  const countTop = (values) => {
    const map = new Map();
    for (const value of values) {
      const key = normalize(value);
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return jsonOk(res, {
    sector: sector || "Alle sectoren",
    totaal_cases: scoped.length,
    dominante_problemen: countTop(scoped.map((row) => row.probleemtype)).map((item) => ({
      probleemtype: item.label,
      count: item.count,
    })),
    dominante_interventies: countTop(scoped.flatMap((row) => row.interventies)).map((item) => ({
      interventie: item.label,
      count: item.count,
    })),
    strategische_posities: countTop(scoped.map((row) => row.gekozen_strategie)).map((item) => ({
      strategie: item.label,
      count: item.count,
    })),
  });
});

router.get("/platform/signalen", (_req, res) => {
  const source = db.datasetRecords
    .map((row) => `${row.probleemtype} ${(row.mechanismen || []).join(" ")} ${(row.interventies || []).join(" ")}`)
    .join(" ")
    .toLowerCase();

  const signals = [];

  if (/(markt|concurrent|vraag)/.test(source)) {
    signals.push({
      type: "marktverandering",
      severity: "middel",
      bewijs: "Signalen van veranderende marktdynamiek in dataset.",
      implicatie: "Herijk positionering en prioriteiten.",
    });
  }
  if (/(tarief|marge|kostprijs|contract|verzekeraar)/.test(source)) {
    signals.push({
      type: "tariefdruk",
      severity: "hoog",
      bewijs: "Herhaalde tarief- en margedruk in cases.",
      implicatie: "Versnel contractdiscipline en margeherstel.",
    });
  }
  if (/(capaciteit|planning|productiviteit|wachtlijst)/.test(source)) {
    signals.push({
      type: "capaciteitsdruk",
      severity: "hoog",
      bewijs: "Frequentie van capaciteitsfrictie in cases.",
      implicatie: "Verscherp capaciteitssturing en ritme.",
    });
  }
  if (/(regelgeving|compliance|wet)/.test(source)) {
    signals.push({
      type: "regelgeving",
      severity: "middel",
      bewijs: "Indicaties van veranderende compliance context.",
      implicatie: "Borg governance en contractchecks.",
    });
  }
  if (!signals.length) {
    signals.push({
      type: "marktverandering",
      severity: "laag",
      bewijs: "Nog beperkt signaalvolume in huidige dataset.",
      implicatie: "Blijf monitoren en verrijk de dataset.",
    });
  }

  return jsonOk(res, signals.slice(0, 6));
});

router.get("/platform/discovery", (req, res) => {
  const sector = normalize(req.query.sector).toLowerCase();
  const zoekterm = normalize(req.query.zoekterm).toLowerCase();

  const rows = discoveryDirectory.filter((row) => {
    const haystack = `${row.organisation_name} ${row.sector} ${row.location}`.toLowerCase();
    const sectorMatch = !sector || row.sector.toLowerCase().includes(sector);
    const queryMatch = !zoekterm || haystack.includes(zoekterm);
    return sectorMatch && queryMatch;
  });

  return jsonOk(res, rows.length ? rows : discoveryDirectory.slice(0, 5));
});

router.post("/platform/scanner/analyze", (req, res) => {
  const organisation_name = normalize(req.body?.organisation_name);
  const sector = normalize(req.body?.sector) || "Onbekende sector";
  if (!organisation_name) return jsonErr(res, 400, "organisation_name is verplicht.");

  const org = upsertOrganization({
    organisatie_naam: organisation_name,
    sector,
    organisatie_grootte: normalize(req.body?.organisatie_grootte) || "25-120",
    abonnementstype: req.body?.abonnementstype || "Starter",
  });

  const strategicContext = [
    `Organisatie: ${organisation_name}`,
    `Sector: ${sector}`,
    "Strategische spanningen:",
    "1. Groeiambitie versus uitvoerbare capaciteit",
    "2. Kwaliteit versus marge- en contractdruk",
    "3. Lokale autonomie versus centrale besluitdiscipline",
  ].join("\n");

  const result = startSessionCore({
    ...req.body,
    organization_id: org.organization_id,
    input_data: strategicContext,
    analysis_type: "Organisatie scanner analyse",
  });

  if (!result.ok) return jsonErr(res, result.status, result.error);
  return jsonOk(res, result.data);
});

export default router;
