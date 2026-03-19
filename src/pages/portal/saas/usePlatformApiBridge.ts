import { useMemo } from "react";
import type { SubscriptionType } from "@/platform";
import type { StrategicReport as PlatformStrategicReport } from "@/platform/types";
import { assertEngineOutputIntegrity } from "@/engine/contentIntegrityGuard";
import type { StrategicReport } from "@/types/StrategicReport";
import { synthesizeStrategicReport } from "@/engine/reportSynthesizer";
import { validateStrategicReport } from "@/engine/reportValidator";

const ARCHIVE_ENABLED = false;
const fallbackOrganizations = new Map<string, any>();
const fallbackSessions = new Map<string, CanonicalSession>();
const FALLBACK_SESSIONS_STORAGE_KEY = "cyntra.fallback_sessions.v1";

type CanonicalSession = {
  id: string;
  session_id?: string | null;
  organization_id?: string | null;
  organization_name?: string | null;
  sector?: string | null;
  analysis_type?: string | null;
  input_data?: string | null;
  output?: Record<string, unknown> | null;
  executive_summary?: string | null;
  board_memo?: string | null;
  board_report?: string | null;
  strategic_report?: PlatformStrategicReport | null;
  engine_mode?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadPersistedFallbackSessions() {
  if (!canUseStorage()) return;
  try {
    const raw = window.localStorage.getItem(FALLBACK_SESSIONS_STORAGE_KEY);
    const rows = raw ? (JSON.parse(raw) as CanonicalSession[]) : [];
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      const sessionId = String(row?.session_id || row?.id || "").trim();
      if (!sessionId) return;
      fallbackSessions.set(sessionId, { ...row, id: sessionId, session_id: sessionId });
    });
  } catch {
    // Ignore corrupted local fallback state.
  }
}

function persistFallbackSessions() {
  if (!canUseStorage()) return;
  try {
    const rows = Array.from(fallbackSessions.values()).slice(0, 50);
    window.localStorage.setItem(FALLBACK_SESSIONS_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // Ignore storage write errors.
  }
}

function registerFallbackOrganization(payload: {
  organization_id?: string;
  organisatie_naam?: string;
  sector?: string;
  organisatie_grootte?: string;
  abonnementstype?: SubscriptionType;
}) {
  const organization_id =
    normalize(payload.organization_id) || normalize(payload.organisatie_naam) || "organisatie";
  const organization = {
    organization_id,
    organisatie_naam: String(payload.organisatie_naam || organization_id),
    sector: String(payload.sector || ""),
    organisatie_grootte: String(payload.organisatie_grootte || ""),
    abonnementstype: payload.abonnementstype || "Starter",
    analyses: [],
  };
  fallbackOrganizations.set(organization_id, organization);
  return organization;
}

function registerFallbackSession(session: CanonicalSession) {
  const sessionId = String(session.session_id || session.id || "");
  if (!sessionId) return;
  fallbackSessions.set(sessionId, { ...session, id: sessionId, session_id: sessionId });
  persistFallbackSessions();
  const organization = registerFallbackOrganization({
    organization_id: String(session.organization_id || ""),
    organisatie_naam: String(session.organization_name || ""),
  });
  organization.analyses = Array.from(
    new Set([...(Array.isArray(organization.analyses) ? organization.analyses : []), sessionId])
  );
  fallbackOrganizations.set(organization.organization_id, organization);
}

loadPersistedFallbackSessions();

type CanonicalReportResult = {
  report?: StrategicReport;
  error?: string;
};

function buildCanonicalReport(session: CanonicalSession): CanonicalReportResult {
  const output = session.output || {};
  const hasOutput = Boolean(Object.keys(output).length);
  if (!hasOutput) {
    return { report: session.strategic_report };
  }
  try {
    assertEngineOutputIntegrity(output);
    const synthesized = synthesizeStrategicReport(output);
    validateStrategicReport(synthesized);
    return { report: synthesized };
  } catch (error) {
    if ((error as Error).name === "INVALID_REPORT_STRUCTURE") {
      return {
        report: session.strategic_report,
        error: "INVALID_REPORT_STRUCTURE",
      };
    }
    throw error;
  }
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof (json as { error?: unknown }).error === "string"
        ? (json as { error: string }).error
        : "API verzoek mislukt";
    throw new Error(message);
  }
  return json as T;
}

async function platformJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiJson<{ success: boolean; data: T }>(`/api/platform${path}`, init);
  return response.data;
}

function buildFallbackSession(payload: {
  organization_id: string;
  input_data: string;
  analysis_type?: string;
  organization_name?: string;
  sector?: string;
}) {
  const explicitSector = normalize(payload.sector).toLowerCase();
  const inferredSector = normalize(payload.input_data).toLowerCase();
  const normalizedSector = explicitSector || inferredSector;
  const isYouthCare = explicitSector
    ? explicitSector.includes("jeugdzorg")
    : /jeugdzorg|jeugdwet|wijkteams|gezinnen|opvoed|jongeren/i.test(payload.input_data);
  const createdAt = new Date().toISOString();
  const analysisDate = createdAt.slice(0, 10);
  const organizationName = payload.organization_name || payload.organization_id || "Organisatie";
  const sectorLabel = isYouthCare
    ? "Jeugdzorg"
    : normalizedSector.includes("ggz")
      ? "GGZ"
      : normalizedSector.includes("saas")
        ? "SaaS"
        : normalizedSector.includes("b2b")
          ? "B2B Dienstverlening"
          : String(payload.sector || "Onbekend");
  const profile = (() => {
    if (isYouthCare) {
      return {
        executiveSummary:
          "Een breed gemeentenportfolio legt meer variatie in contractcondities en instroom op de organisatie dan vaste teams operationeel kunnen absorberen.",
        recommendedOption: "Gemeentenportfolio rationaliseren en sturen op kern-, behoud- en uitstapgemeenten",
        strategicConflict:
          "De spanning zit tussen regionale relevantie voor gemeenten en operationele uitvoerbaarheid binnen vaste teams en consortiuminstroom.",
        options: [
          "Gemeentenportfolio rationaliseren",
          "Operationele schaal vergroten binnen vaste teams en flexibele schil",
          "Zorgmodel en instroomroute veranderen",
        ],
        interventions: [
          "Stel een gemeentenmatrix vast met kern-, behoud- en uitstapgemeenten.",
          "Koppel consortiumtriage en instroom wekelijks aan caseload- en wachttijdsturing.",
          "Bescherm cultuurkapitaal met een bestuurlijke grens voor flexratio en groeitempo.",
        ],
        mechanism:
          "Tarief, reistijd, no-show en consortiumtriage bepalen samen de effectieve marge en de planbare druk op vaste teams.",
        facts:
          "Circa 35 gemeenten, consortiumtoegang, rendabiliteitsdruk en retentie van vaste professionals bepalen samen de schaalruimte.",
        scenarios: [
          "Scenario A — Gemeentenportfolio rationaliseren: prioriteer kern-, behoud- en uitstapgemeenten.",
          "Scenario B — Operationele schaal vergroten: vergroot capaciteit binnen harde grenzen voor caseload en flexratio.",
          "Scenario C — Zorgmodel en instroomroute veranderen: herontwerp toegang, triage en routering.",
        ],
        stopRules: [
          "caseload > 18",
          "wachttijd > 12 weken",
          "marge < 4%",
        ],
      };
    }
    if (normalizedSector.includes("ggz")) {
      return {
        executiveSummary:
          "Contractplafonds, zorgzwaarte en behandelcapaciteit drukken de marge harder dan extra vraag haar kan herstellen.",
        recommendedOption: "Kern beschermen en contractmix heronderhandelen",
        strategicConflict:
          "De spanning zit tussen volumegroei, contractplafonds en behandelcapaciteit binnen een rendabele productmix.",
        options: [
          "Kern beschermen en contractmix heronderhandelen",
          "Selectief groeien in rendabele zorgpaden",
          "Netwerkzorg via partners en doorverwijzing verdiepen",
        ],
        interventions: [
          "Heronderhandel plafonds en tariefmix op basis van behandelzwaarte.",
          "Verminder capaciteitslekken in intake, planning en no-show.",
          "Bevries niet-kerninitiatieven totdat marge en wachttijd stabiliseren.",
        ],
        mechanism:
          "Behandelmix, contractplafonds en no-show bepalen samen de effectieve margeruimte per zorgpad.",
        facts:
          "Contract, zorgzwaarte, wachttijd en behandelaarcapaciteit zijn de dominante stuurvariabelen in de GGZ-kern.",
        scenarios: [
          "Scenario A — Kern beschermen en contractmix heronderhandelen: stuur op marge en behandelcapaciteit.",
          "Scenario B — Selectief groeien in rendabele zorgpaden: verhoog behandelvolume alleen waar contract en capaciteit dat toelaten.",
          "Scenario C — Netwerkzorg verdiepen: verschuif vraag via partners en doorverwijzing met harde governance.",
        ],
        stopRules: [
          "wachttijd > 14 weken",
          "bezettingsgraad > 92%",
          "marge < 5%",
        ],
      };
    }
    if (normalizedSector.includes("b2b")) {
      return {
        executiveSummary:
          "Commerciële groei verhoogt omzet, maar zonder delivery-discipline en accountselectie verslechteren marge en uitvoerbaarheid tegelijk.",
        recommendedOption: "Kern beschermen en delivery disciplineren",
        strategicConflict:
          "De spanning zit tussen commerciële versnelling, delivery-capaciteit en marge per account.",
        options: [
          "Kern beschermen en delivery disciplineren",
          "Commercieel versnellen via nieuwe proposities",
          "Selectieve focus op rendabele accounts en sectoren",
        ],
        interventions: [
          "Herbalanceer sales- en deliverydoelen op marge per account.",
          "Verlaag concentratierisico via selectieve accountkeuzes.",
          "Stop uitzonderingsdeals die deliverydruk verhogen zonder prijsdiscipline.",
        ],
        mechanism:
          "Salesmix, uitzonderingswerk en deliverybelasting bepalen samen de effectieve marge en leverbetrouwbaarheid per account.",
        facts:
          "Accountconcentratie, deliverybezetting en marge per klantsegment bepalen de bestuurlijke keuze in B2B-dienstverlening.",
        scenarios: [
          "Scenario A — Kern beschermen en delivery disciplineren: zet marge en leverdiscipline centraal.",
          "Scenario B — Commercieel versnellen via nieuwe proposities: verhoogt omzetkans maar ook uitvoeringsdruk.",
          "Scenario C — Selectieve focus op rendabele accounts en sectoren: verlaagt ruis en beschermt deliverykwaliteit.",
        ],
        stopRules: [
          "delivery utilization > 90%",
          "gross margin < 30%",
          "top-3 accounts > 55% omzet",
        ],
      };
    }
    if (normalizedSector.includes("saas")) {
      return {
        executiveSummary:
          "Nieuwe omzet compenseert churn en burn niet zolang retentie, pricing en implementatiedruk de unit economics blijven ondermijnen.",
        recommendedOption: "Retentie en unit economics eerst herstellen",
        strategicConflict:
          "De spanning zit tussen groeidruk, burn, retentie en implementeerbare klantkwaliteit.",
        options: [
          "Retentie en unit economics eerst herstellen",
          "Enterprise sales versnellen",
          "Focus op selectieve verticale groei met scherpere ICP",
        ],
        interventions: [
          "Verlaag churn via productretentie en accountdiscipline.",
          "Zet burn-grenzen en pricing-correcties op enterprise deals.",
          "Vertraag acquisitie buiten ICP totdat implementatie en payback binnen norm vallen.",
        ],
        mechanism:
          "Churn, CAC-payback en implementatiebelasting bepalen samen of groei werkelijk bijdraagt aan brutomarge en runway.",
        facts:
          "Net revenue retention, burn multiple en implementatiecapaciteit bepalen de schaalbaarheid van de SaaS-kern.",
        scenarios: [
          "Scenario A — Retentie en unit economics eerst herstellen: herstel churn en brutomarge.",
          "Scenario B — Enterprise sales versnellen: verhoogt ACV maar vergroot implementatiedruk.",
          "Scenario C — Focus op selectieve verticale groei met scherpere ICP: verhoogt retentie per segment en verlaagt ruis.",
        ],
        stopRules: [
          "NRR < 100%",
          "burn multiple > 2.0",
          "CAC payback > 18 maanden",
        ],
      };
    }
    return {
      executiveSummary: `Analyse gereed voor ${organizationName}.`,
      recommendedOption: "Consolideer de gekozen koers en vertaal die naar expliciete stuurgrenzen.",
      strategicConflict: "De spanning zit tussen groeiambitie en bestuurlijke uitvoerbaarheid.",
      options: [
        "Consolideer de gekozen koers en vertaal die naar expliciete stuurgrenzen.",
        "Versnel groei via nieuwe proposities.",
        "Versmal focus op de meest rendabele kern.",
      ],
      interventions: [
        "Leg expliciete stuurgrenzen vast voor de gekozen koers.",
        "Beperk parallelle prioriteiten in uitvoering en governance.",
      ],
      mechanism: "Parallelle prioriteiten verlagen bestuurlijke focus en vertragen executie.",
      facts: "Kernfocus, marge en uitvoerbaarheid bepalen de haalbare richting.",
      scenarios: [
        "Scenario A — Consolideer de gekozen koers: herstel focus en besluitdiscipline.",
        "Scenario B — Versnel groei via nieuwe proposities: verhoogt complexiteit en uitvoeringseisen.",
        "Scenario C — Versmal focus op de meest rendabele kern: beschermt marge en uitvoerbaarheid.",
      ],
      stopRules: [
        "marge onder norm",
        "capaciteit boven grens",
        "besluitdiscipline verzwakt",
      ],
    };
  })();
  const boardMemo = [
    "Bestuurlijke hypothese",
    `${profile.executiveSummary} ${profile.strategicConflict}`,
    "",
    "Feitenbasis",
    `${profile.facts} Organisatie: ${organizationName}. Sector: ${sectorLabel}.`,
    "",
    "Besluitvoorstel",
    `Besluit: kies ${profile.recommendedOption}.`,
    `Owner: bestuur en directie.`,
    `Deadline: ${analysisDate}.`,
    "KPI: voortgang zichtbaar in marge, capaciteit en besluitdiscipline.",
  ].join("\n");
  const boardReport = [
    "0. Boardroom summary",
    `Organisatie: ${organizationName}`,
    `Sector: ${sectorLabel}`,
    `Analyse datum: ${analysisDate}`,
    `Aanbevolen keuze: ${profile.recommendedOption}`,
    profile.executiveSummary,
    "",
    "1. Executive Decision Card",
    `CORE PROBLEM\n${profile.executiveSummary}`,
    "",
    `STRATEGIC TENSION\n${profile.strategicConflict}`,
    "",
    `RECOMMENDED DECISION\n${profile.recommendedOption}`,
    "",
    `WHY THIS DECISION\n${profile.facts}`,
    "",
    `STOP RULES\n${profile.stopRules.join("\n")}`,
    "",
    "2. Strategisch Verhaal",
    `SITUATIE\n${profile.facts}`,
    "",
    `SPANNING\n${profile.strategicConflict}`,
    "",
    `DYNAMIEK\n${profile.mechanism}`,
    "",
    `KEUZE\n${profile.recommendedOption}`,
    "",
    `BESTUURLIJKE OPGAVE\n${profile.interventions[0]}`,
    "",
    "3. Scenariovergelijking",
    profile.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join("\n"),
    "",
    profile.scenarios.join("\n"),
    "",
    "4. Mechanisme Analyse",
    profile.mechanism,
    "",
    "5. Bestuurlijke Acties",
    profile.interventions.map((item, index) => `Actie ${index + 1}\n${item}`).join("\n\n"),
    "",
    "6. Verdieping",
    `KILLER INSIGHTS\n${profile.mechanism}`,
    "",
    `EARLY SIGNALS\n${profile.stopRules.join("\n")}`,
    "",
    `BOARDROOM STRESSTEST\nWat besluit het bestuur als ${profile.stopRules[0]} terwijl de gekozen richting blijft doorlopen?`,
  ]
    .filter(Boolean)
    .join("\n");
  const session: CanonicalSession = {
    id: `fallback-${Math.random().toString(36).slice(2, 10)}`,
    session_id: "",
    organization_id: payload.organization_id,
    organization_name: organizationName,
    sector: sectorLabel,
    analysis_type: payload.analysis_type || "analysis",
    input_data: payload.input_data,
    status: "COMPLETED",
    executive_summary: profile.executiveSummary,
    board_memo: boardMemo,
    board_report: boardReport,
    strategic_report: {
      report_id: `report-${Date.now()}`,
      session_id: "",
      organization_id: payload.organization_id,
      title: `Cyntra Executive Dossier — ${organizationName}`,
      sections: boardReport.split(/\n{2,}/).filter(Boolean),
      generated_at: createdAt,
      report_body: boardReport,
    },
    engine_mode: "fallback",
    output: {
      executive_summary: profile.executiveSummary,
      board_memo: boardMemo,
      board_report: boardReport,
      recommended_option: profile.recommendedOption,
      interventions: profile.interventions,
      strategic_conflict: profile.strategicConflict,
      sector: sectorLabel,
      source: "fallback",
    },
    created_at: createdAt,
    updated_at: createdAt,
  };
  session.session_id = session.id;
  if (session.strategic_report) {
    session.strategic_report = {
      ...session.strategic_report,
      report_id: session.id,
      session_id: session.id,
    };
  }
  registerFallbackSession(session);
  return mapSession(session);
}

function mapSession(session: CanonicalSession) {
  const sessionId = String(session.session_id || session.id || "");
  const output = session.output || {};
  const { report: canonicalReport, error: canonicalReportError } = buildCanonicalReport(session);
  const legacyStrategicReport = session.strategic_report || {
    report_id: sessionId,
    session_id: sessionId,
    organization_id: String(session.organization_id || ""),
    title: `Cyntra Executive Dossier — ${String(session.organization_name || "Organisatie")} — ${sessionId}`,
    sections: String(session.board_report || output.executive_summary || "").split(/\n{2,}/).filter(Boolean),
    generated_at: String(session.updated_at || session.created_at || new Date().toISOString()),
    report_body: String(session.board_report || output.executive_summary || ""),
  };
  return {
    session_id: sessionId,
    organization_id: session.organization_id || null,
    organization_name: String(session.organization_name || "Organisatie"),
    analysis_type: String(session.analysis_type || "analysis"),
    input_data: String(session.input_data || ""),
    output,
    executive_summary: String(session.executive_summary || output.executive_summary || ""),
    board_memo: String(session.board_memo || output.executive_summary || ""),
    board_report: String(session.board_report || output.executive_summary || ""),
    engine_mode: String(session.engine_mode || "fallback"),
    status: String(session.status || "COMPLETED"),
    analyse_datum: String(session.created_at || ""),
    updated_at: String(session.updated_at || session.created_at || ""),
    quality_score: 0,
    quality_tier: "",
    quality_flags: [],
    intervention_predictions: Array.isArray(output.actions)
      ? output.actions.map((action) => ({ interventie: String(action) }))
      : [],
    strategic_metadata: {
      sector: String(session.sector || output.sector || ""),
      strategic_hefbomen: [],
    },
    strategic_report: legacyStrategicReport,
    canonicalReport,
    canonicalReportError: canonicalReportError ?? "",
    report: legacyStrategicReport,
  };
}

async function runCanonicalAnalysis(payload: {
  organization_id: string;
  input_data: string;
  analysis_type?: string;
  organization_name?: string;
  sector?: string;
  organisatie_grootte?: string;
  abonnementstype?: SubscriptionType;
}) {
  let session;
  try {
    const created = await platformJson<CanonicalSession>("/sessions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organization_id: payload.organization_id,
        input_data: payload.input_data,
        analysis_type: payload.analysis_type || "analysis",
      }),
    });
    registerFallbackSession(created);
    session = mapSession(created);
  } catch {
    session = buildFallbackSession(payload);
  }

  return {
    id: session.session_id,
    reportId: session.session_id,
    sessionId: session.session_id,
    organizationName: session.organization_name || "",
    createdAt: session.updated_at || session.analyse_datum || new Date().toISOString(),
    report: session.canonicalReport
      ? {
          ...session.canonicalReport,
          report_id: session.session_id,
          session_id: session.session_id,
        }
      : session.strategic_report,
    result: session.output,
    session,
  };
}

export const platformApiBridge = {
  health: async () => ({ status: "ok", service: "analysis_sessions" }),

  listOrganizations: async () => {
    try {
      const rows = await platformJson<any[]>("/organizations");
      (rows || []).forEach(registerFallbackOrganization);
      return rows || [];
    } catch {
      return Array.from(fallbackOrganizations.values());
    }
  },

  upsertOrganization: async (payload: {
    organization_id?: string;
    organisatie_naam: string;
    sector: string;
    organisatie_grootte: string;
    abonnementstype: SubscriptionType;
  }) => {
    try {
      const row = await platformJson<any>("/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      registerFallbackOrganization(row);
      return row;
    } catch {
      return registerFallbackOrganization(payload);
    }
  },

  listSessions: async (organization_id?: string) => {
    let sessions;
    try {
      const query = organization_id ? `?organization_id=${encodeURIComponent(organization_id)}` : "";
      const response = await platformJson<CanonicalSession[]>(`/sessions${query}`);
      (response || []).forEach(registerFallbackSession);
      const merged = new Map<string, ReturnType<typeof mapSession>>();
      Array.from(fallbackSessions.values()).forEach((row) => {
        const mapped = mapSession(row);
        merged.set(String(mapped.session_id), mapped);
      });
      (response || []).forEach((row) => {
        const mapped = mapSession(row);
        merged.set(String(mapped.session_id), mapped);
      });
      sessions = Array.from(merged.values());
    } catch {
      sessions = Array.from(fallbackSessions.values()).map(mapSession);
    }
    return organization_id
      ? sessions.filter((row) => normalize(row.organization_id) === normalize(organization_id))
      : sessions;
  },

  listReports: async () => {
    return platformApiBridge.listSessions();
  },

  getReport: async (sessionId: string) => {
    try {
      const response = await platformJson<CanonicalSession>(`/sessions/${encodeURIComponent(sessionId)}`);
      registerFallbackSession(response);
      return mapSession(response);
    } catch {
      const session = fallbackSessions.get(sessionId);
      if (!session) {
        throw new Error("Rapport niet gevonden.");
      }
      return mapSession(session);
    }
  },

  getLatestReport: async () => {
    const sessions = await platformApiBridge.listSessions();
    if (!sessions.length) throw new Error("Rapport niet gevonden.");
    return sessions[0];
  },

  archiveOldSessions: async (keepLatest?: number) => ({
    archived: 0,
    kept: keepLatest ?? 0,
    total: 0,
    disabled: !ARCHIVE_ENABLED,
  }),

  archiveReport: async (sessionId: string) => ({
    stored: false,
    live: false,
    disabled: !ARCHIVE_ENABLED,
    sessionId,
  }),

  restoreReport: async (sessionId: string) => ({
    stored: false,
    live: false,
    disabled: !ARCHIVE_ENABLED,
    sessionId,
  }),

  deleteReport: async (sessionId: string) => ({
    removed: false,
    disabled: true,
    sessionId,
  }),

  startSession: async (payload: {
    organization_id: string;
    input_data: string;
    analysis_type?: string;
    organization_name?: string;
    sector?: string;
    organisatie_grootte?: string;
    abonnementstype?: SubscriptionType;
  }) => {
    const analysis = await runCanonicalAnalysis(payload);
    return analysis.session;
  },

  runAnalysis: async (payload: {
    organization_id: string;
    input_data: string;
    analysis_type?: string;
    organization_name?: string;
    sector?: string;
    organisatie_grootte?: string;
    abonnementstype?: SubscriptionType;
  }) => {
    return runCanonicalAnalysis(payload);
  },

  buildStrategicBrainReport: async () => {
    throw new Error("Strategic brain preview is gedeactiveerd in consolidation mode.");
  },

  buildStrategicBrainReportForSession: async () => {
    throw new Error("Strategic brain preview is gedeactiveerd in consolidation mode.");
  },

  discovery: async (params?: { sector?: string; zoekterm?: string }) => {
    const search = new URLSearchParams();
    if (params?.sector) search.set("sector", params.sector);
    if (params?.zoekterm) search.set("zoekterm", params.zoekterm);
    try {
      return await platformJson<any[]>(`/discovery${search.size ? `?${search.toString()}` : ""}`);
    } catch {
      return [];
    }
  },
  scanAnalyze: async (payload: Record<string, unknown>) => {
    return platformJson<any>("/scanner/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  executiveSummary: async (sessionId: string) => {
    const session = await platformApiBridge.getReport(sessionId);
    return {
      session_id: session.session_id,
      filename: `${session.session_id}-executive-summary.txt`,
      content: session.executive_summary || "",
      mime_type: "text/plain",
    };
  },

  boardMemo: async (sessionId: string) => {
    const session = await platformApiBridge.getReport(sessionId);
    return {
      session_id: session.session_id,
      filename: `${session.session_id}-board-memo.txt`,
      content: session.board_memo || "",
      mime_type: "text/plain",
    };
  },

  pdf: async (sessionId: string) => {
    return platformJson<any>(`/reports/${encodeURIComponent(sessionId)}/pdf`);
  },

  datasetRecords: async () => {
    try {
      return await platformJson<any[]>("/dataset/records");
    } catch {
      return [];
    }
  },
  interventions: async () => {
    try {
      return await platformJson<any[]>("/interventions");
    } catch {
      return [];
    }
  },
  cases: async () => {
    try {
      return await platformJson<any[]>("/cases");
    } catch {
      return [];
    }
  },
  datasetBenchmark: async (sector?: string) => {
    const search = new URLSearchParams();
    if (sector) search.set("sector", sector);
    try {
      return await platformJson<any>(`/dataset/benchmark${search.size ? `?${search.toString()}` : ""}`);
    } catch {
      return { sector: sector || "", totaal_cases: 0, dominante_problemen: [] };
    }
  },
  signalen: async () => {
    try {
      return await platformJson<any[]>("/signalen");
    } catch {
      return [];
    }
  },
  decisionMemory: async (organization_id?: string) => {
    const search = new URLSearchParams();
    if (organization_id) search.set("organization_id", organization_id);
    try {
      return await platformJson<any[]>(`/decision-memory${search.size ? `?${search.toString()}` : ""}`);
    } catch {
      return [];
    }
  },
  earlyWarnings: async (organization_id?: string) => {
    const search = new URLSearchParams();
    if (organization_id) search.set("organization_id", organization_id);
    try {
      return await platformJson<any[]>(`/early-warnings${search.size ? `?${search.toString()}` : ""}`);
    } catch {
      return [];
    }
  },
  caseSignals: async () => [],
  sectorIntelligence: async () => [],
  benchmarkFromCases: async () => [],
  predictions: async () => [],
  listStrategicCases: async () => [],

  exportReport: async () => {
    throw new Error("Export loopt tijdelijk buiten de canonieke consolidatieflow.");
  },
  exportInterventions: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
  exportDataset: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
  exportCases: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
  exportBenchmark: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
  exportDecisionMemory: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
  exportEarlyWarnings: async () => {
    throw new Error("Export gedeactiveerd in consolidation mode.");
  },
};

export function usePlatformApiBridge() {
  return useMemo(() => platformApiBridge, []);
}
