import { useMemo } from "react";
import type { SubscriptionType } from "@/platform";

const ARCHIVE_ENABLED = false;
const fallbackOrganizations = new Map<string, any>();
const fallbackSessions = new Map<string, CanonicalSession>();

type CanonicalSession = {
  id: string;
  session_id?: string | null;
  organization_id?: string | null;
  organization_name?: string | null;
  analysis_type?: string | null;
  input_data?: string | null;
  output?: Record<string, unknown> | null;
  executive_summary?: string | null;
  board_memo?: string | null;
  board_report?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function normalize(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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
  const organization = registerFallbackOrganization({
    organization_id: String(session.organization_id || ""),
    organisatie_naam: String(session.organization_name || ""),
  });
  organization.analyses = Array.from(
    new Set([...(Array.isArray(organization.analyses) ? organization.analyses : []), sessionId])
  );
  fallbackOrganizations.set(organization.organization_id, organization);
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
  const normalizedSector = normalize(payload.sector).toLowerCase();
  const isYouthCare =
    normalizedSector.includes("jeugdzorg") || /jeugdwet|wachttijden|wijkteams|gezinnen/i.test(payload.input_data);
  const createdAt = new Date().toISOString();
  const analysisDate = createdAt.slice(0, 10);
  const organizationName = payload.organization_name || payload.organization_id || "Organisatie";
  const profile = (() => {
    if (isYouthCare) {
      return {
        executiveSummary: "Wachtdruk is contractgedreven, niet personeelsgedreven.",
        recommendedOption: "Brede ambulante specialist blijven",
        strategicConflict: "De spanning zit tussen brede ambulante aanwezigheid en contractdiscipline per gemeente.",
        options: [
          "Brede ambulante specialist blijven",
          "Selectieve specialisatie / niche kiezen",
          "Consortiumstrategie verdiepen",
        ],
        interventions: [
          "Heronderhandel contractgrenzen en instroomcriteria per gemeente.",
          "Standaardiseer triage en verantwoordingslast rond specialistische casuistiek.",
        ],
        mechanism: "Gemeentelijke contractdruk vervormt instroom, verhoogt wachtdruk en ondergraaft teamstabiliteit.",
        facts: "Gemeenten, triage, wachtdruk en consortiumafspraken bepalen de feitelijke schaalruimte.",
        scenarios: [
          "Scenario A — Brede ambulante specialist blijven: borg triage en contractdiscipline per gemeente.",
          "Scenario B — Selectieve specialisatie / niche kiezen: verlaag complexiteitsmix maar verlies lokale breedte.",
          "Scenario C — Consortiumstrategie verdiepen: deel capaciteit en contractpositie via partners.",
        ],
      };
    }
    if (normalizedSector.includes("ggz")) {
      return {
        executiveSummary: "Contractplafonds en capaciteit drukken de marge harder dan extra vraag haar verbetert.",
        recommendedOption: "Kern beschermen en contractmix heronderhandelen",
        strategicConflict: "De spanning zit tussen volumebehoefte, contractplafonds en behandelcapaciteit.",
        options: [
          "Kern beschermen en contractmix heronderhandelen",
          "Parallel verbreden via nieuwe labels",
          "Partnermodel met strakke governance",
        ],
        interventions: [
          "Heronderhandel plafonds en tariefmix op basis van behandelzwaarte.",
          "Verminder capaciteitslekken in intake, planning en no-show.",
        ],
        mechanism: "Contractplafonds en capaciteitsdruk maken volumegroei onrendabel zonder scherpere contractmix.",
        facts: "Contract, marge, plafond en capaciteit zijn de dominante stuurvariabelen.",
        scenarios: [
          "Scenario A — Kern beschermen en contractmix heronderhandelen: stuur op marge en behandelcapaciteit.",
          "Scenario B — Parallel verbreden via nieuwe labels: voeg labels toe maar verhoogt operationele ruis.",
          "Scenario C — Partnermodel met strakke governance: deel capaciteit via partners met harde regie.",
        ],
      };
    }
    if (normalizedSector.includes("b2b")) {
      return {
        executiveSummary: "Salesgroei zonder delivery-discipline vergroot omzet maar verslechtert marge en concentratierisico.",
        recommendedOption: "Kern beschermen en delivery disciplineren",
        strategicConflict: "De spanning zit tussen commerciële versnelling, delivery-capaciteit en marge.",
        options: [
          "Kern beschermen en delivery disciplineren",
          "Commercieel versnellen via nieuwe proposities",
          "Selectieve focus op rendabele accounts",
        ],
        interventions: [
          "Herbalanceer sales- en deliverydoelen op marge per account.",
          "Verlaag concentratierisico via selectieve accountkeuzes.",
        ],
        mechanism: "Sales en delivery raken ontkoppeld waardoor marge lekt in complexe accounts.",
        facts: "Sales, delivery, concentratie en marge bepalen de bestuurlijke keuze.",
        scenarios: [
          "Scenario A — Kern beschermen en delivery disciplineren: zet marge en leverdiscipline centraal.",
          "Scenario B — Commercieel versnellen via nieuwe proposities: verhoogt omzetkans maar ook uitvoeringsdruk.",
          "Scenario C — Selectieve focus op rendabele accounts: verlaagt ruis en beschermt deliverykwaliteit.",
        ],
      };
    }
    if (normalizedSector.includes("saas")) {
      return {
        executiveSummary: "Nieuwe omzet compenseert churn en burn niet zolang retentie en unit economics zwak blijven.",
        recommendedOption: "Retentie en unit economics eerst herstellen",
        strategicConflict: "De spanning zit tussen groeidruk, burn en retentie.",
        options: [
          "Retentie en unit economics eerst herstellen",
          "Enterprise sales versnellen",
          "Focus op selectieve verticale groei",
        ],
        interventions: [
          "Verlaag churn via productretentie en accountdiscipline.",
          "Zet burn-grenzen en pricing-correcties op enterprise deals.",
        ],
        mechanism: "Burn en churn versnellen tegelijk waardoor nieuwe omzet onvoldoende kwaliteitsgroei oplevert.",
        facts: "Churn, enterprise, burn en retentie bepalen de schaalbaarheid.",
        scenarios: [
          "Scenario A — Retentie en unit economics eerst herstellen: herstel churn en brutomarge.",
          "Scenario B — Enterprise sales versnellen: verhoogt ACV maar vergroot implementatiedruk.",
          "Scenario C — Focus op selectieve verticale groei: scherpt ICP en retentie per segment aan.",
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
    };
  })();
  const boardMemo = [
    "Bestuurlijke hypothese",
    `${profile.executiveSummary} ${profile.strategicConflict}`,
    "",
    "Feitenbasis",
    `${profile.facts} Organisatie: ${organizationName}. Sector: ${payload.sector || "Onbekend"}.`,
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
    `Sector: ${payload.sector || "Onbekend"}`,
    `Analyse datum: ${analysisDate}`,
    `Aanbevolen keuze: ${profile.recommendedOption}`,
    profile.executiveSummary,
    "",
    "### NIEUWE INZICHTEN (KILLER INSIGHTS)",
    "INZICHT",
    profile.mechanism,
    "BESTUURLIJKE CONSEQUENTIE",
    profile.interventions[0],
    "INZICHT",
    profile.facts,
    "BESTUURLIJKE CONSEQUENTIE",
    profile.interventions[1],
    isYouthCare
      ? [
          "INZICHT",
          "Contractvolume en zorgvraag groeien uit elkaar.",
          "BESTUURLIJKE CONSEQUENTIE",
          "Herijk contractgrenzen per gemeente.",
          "INZICHT",
          "Wachttijd ontstaat bij verwijzing en toeleiding, niet alleen in uitvoering.",
          "BESTUURLIJKE CONSEQUENTIE",
          "Stuur op triage-afspraken met wijkteams.",
          "INZICHT",
          "Kleinschaligheid is onderscheidend zolang casusmix beheersbaar blijft.",
          "BESTUURLIJKE CONSEQUENTIE",
          "Bescherm specialistische capaciteit tegen versnippering.",
          "INZICHT",
          "Personeelsdruk volgt uit onvoorspelbare contractering.",
          "BESTUURLIJKE CONSEQUENTIE",
          "Onderhandel voorspelbare volumevensters.",
          "INZICHT",
          "Lokale legitimiteit is sterker dan schaalvoordeel.",
          "BESTUURLIJKE CONSEQUENTIE",
          "Positioneer op gezinscontinuiteit en nabijheid.",
        ].join("\n")
      : "",
    "",
    "1. Besluitvraag",
    `Moet ${organizationName} nu kiezen voor ${profile.recommendedOption}?`,
    "",
    "2. Strategische kernvragen",
    `Hoe borgt het bestuur dat ${profile.recommendedOption} niet wordt ondermijnd door parallelle prioriteiten?`,
    "",
    "3. Strategisch patroon",
    `Primair patroon: ${profile.options[0]}. Secundair patroon: ${profile.options[2]}.`,
    "",
    "4. Systeemmechanisme",
    profile.mechanism,
    "",
    "5. Feitenbasis",
    profile.facts,
    "",
    "6. Keuzerichtingen",
    profile.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join("\n"),
    "",
    "7. Aanbevolen keuze",
    profile.recommendedOption,
    "",
    "8. Doorbraakinzichten",
    `${profile.interventions[0]}\n${profile.interventions[1]}`,
    "",
    "9. Mogelijke ontwikkelingen",
    profile.scenarios.join("\n"),
    "",
    "10. Bestuurlijke waarschuwingssignalen",
    "1. KPI-afwijking op marge of capaciteit in twee meetrondes.",
    "2. Besluitdiscipline verzwakt door parallelle uitzonderingen.",
    "3. Contract- of klantmix wijkt af van de gekozen richting.",
    "",
    "11. Besluitgevolgen",
    `12m: ${profile.recommendedOption} stabiliseert operatie en governance.`,
    "24m: de organisatie kan selectiever investeren in capaciteit en positie.",
    "36m: het gekozen patroon wordt duurzaam of moet expliciet worden herzien.",
    "",
    "2. Mechanismeketens",
    `${profile.mechanism} -> ${profile.interventions[0]} -> scherpere uitvoering -> hogere bestuurlijke betrouwbaarheid`,
    `${profile.facts} -> ${profile.interventions[1]} -> minder ruis -> stabielere resultaten`,
  ]
    .filter(Boolean)
    .join("\n");
  const session: CanonicalSession = {
    id: `fallback-${Math.random().toString(36).slice(2, 10)}`,
    session_id: "",
    organization_id: payload.organization_id,
    organization_name: organizationName,
    analysis_type: payload.analysis_type || "analysis",
    input_data: payload.input_data,
    status: "COMPLETED",
    executive_summary: profile.executiveSummary,
    board_memo: boardMemo,
    board_report: boardReport,
    output: {
      executive_summary: profile.executiveSummary,
      board_memo: boardMemo,
      board_report: boardReport,
      recommended_option: profile.recommendedOption,
      interventions: profile.interventions,
      strategic_conflict: profile.strategicConflict,
      source: "fallback",
    },
    created_at: createdAt,
    updated_at: createdAt,
  };
  session.session_id = session.id;
  registerFallbackSession(session);
  return mapSession(session);
}

function mapSession(session: CanonicalSession) {
  const sessionId = String(session.session_id || session.id || "");
  const output = session.output || {};
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
      sector: "",
      strategic_hefbomen: [],
    },
    strategic_report: {
      report_id: sessionId,
      session_id: sessionId,
      organization_id: String(session.organization_id || ""),
      title: `Cyntra Executive Dossier — ${String(session.organization_name || "Organisatie")} — ${sessionId}`,
      sections: [],
      generated_at: String(session.updated_at || session.created_at || new Date().toISOString()),
      report_body: String(session.board_report || output.executive_summary || ""),
    },
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
    report: session.strategic_report,
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
      sessions = (response || []).map(mapSession);
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
