// @ts-nocheck
/* ============================================================
   AURELIUS ANALYZE — SUPABASE EDGE FUNCTION (FINAL CANON)
   ✅ HARDENED: nooit meer empty narrative / invalid json crash
   ✅ ALTIJD NL
   ✅ Backwards compatible report envelope
============================================================ */

declare const Deno: {
  env: { get(key: string): string | undefined };
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, content-type, apikey, x-client-info, x-supabase-client-platform, x-supabase-client-version, cache-control, pragma",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

Object.assign(CORS_HEADERS, {
  "Access-Control-Allow-Credentials": "true",
  Vary: "Origin",
});

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

function logError(err: any) {
  try {
    console.error(
      `[ERROR] ${new Date().toISOString()}: ${err?.message ?? String(err)}\n${
        err?.stack ?? ""
      }`
    );
  } catch {}
}

/* ============================================================
   CANON
============================================================ */

const DECISION_FRAMEWORKS_CANON = [
  "Porter",
  "PESTEL",
  "McKinsey7S",
  "GROW",
  "VIBAAAN",
  "HGBCO",
];

const ACTION_PLAN_90D_CANON = {
  summary:
    "Binnen 90 dagen kan besluitvorming worden geforceerd via ownership, mandaat en closure deadlines per governance-laag.",
  months: [
    { month: 1, phase: "Stabiliseren", actions: [] },
    { month: 2, phase: "Governance Force", actions: [] },
    { month: 3, phase: "Closure", actions: [] },
  ],
};

/* ============================================================
   ADD ONLY — DUTCH LOCK + OUTPUT SCHEMA
============================================================ */

const DUTCH_ONLY_LOCK = `
JE SCHRIJFT ALLEEN NEDERLANDS.
ALS JE 1 ENGELS WOORD SCHRIJFT BEN JE FOUT.
`;

const OUTPUT_SCHEMA = (currentDate: string) => `
Output ALTIJD als JSON met deze exacte structuur:
{
  "narrative": "Lange vorm analyse tekst (min 900 woorden, NL, doorlopend).",
  "failure_maps": [
    { "title": "...", "description": "...", "risk_level": "high|medium|low", "impact_areas": ["finance","operations"] }
  ],
  "roadmap_cards": [
    { "owner": "CEO", "intervention": "...", "deadline": "${currentDate}" }
  ],
  "action_plan_90d": {
    "summary": "...",
    "months": [
      { "month": 1, "phase": "...", "actions": ["..."] },
      { "month": 2, "phase": "...", "actions": ["..."] },
      { "month": 3, "phase": "...", "actions": ["..."] }
    ]
  },
  "decision_card": {
    "executive_thesis": "...",
    "central_tension": "...",
    "confidence_level": 0,
    "irreversibility_deadline": "${currentDate}"
  },
  "framework_metadata": {
    "used_frameworks": ["Porter","PESTEL","McKinsey7S","GROW","VIBAAAN","HGBCO"],
    "insights_per_framework": { "Porter": "...", "PESTEL": "...", "McKinsey7S": "...", "GROW": "...", "VIBAAAN": "...", "HGBCO": "..." }
  }
}
Regels:
- Vul ALLE velden.
- narrative is NOOIT leeg.
- used_frameworks bevat ALLE canon frameworks.
- Current date: ${currentDate}.
`;

const ANALYSIS_ROLE_PROMPTS: Record<string, string> = {
  strategy:
    "Je maakt een STRATEGISCHE analyse. Focus op keuzes, keuzeconflicten, stop-besluiten en governance-spanning.",
  finance:
    "Je maakt een FINANCIËLE analyse. Focus op geldstromen, runway, value leakage, risico's en harde keuzes.",
  leadership:
    "Je maakt een LEIDERSCHAP/GOVERNANCE analyse. Focus op mandaat, eigenaarschap, besluitvorming en escalaties.",
  onderstroom:
    "Je maakt een ONDERSTROOM analyse. Focus op macht, angst, vermijding, informele coalities en impliciete patronen.",
  operations:
    "Je maakt een OPERATIONELE analyse. Focus op bottlenecks, procesfrictie, schaalbaarheid en structurele oorzaken.",
  risk:
    "Je maakt een RISICO analyse. Focus op bedreigingen, failure modes, mitigatie-gaten en irreversibiliteit.",
  swot:
    "Je maakt een strikte SWOT. Maar: je levert nog steeds het JSON schema op (narrative + metadata).",
};

/* ============================================================
   OPENAI CALL
============================================================ */

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  forceJson: boolean,
  model = "gpt-4o",
  temperature = 0.25,
  maxTokens = 8000
) {
  const body: any = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (forceJson) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
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

/* ============================================================
   ADD ONLY — HARD NORMALIZER (CRITICAL)
   Doel: report.narrative is ALTIJD non-empty string.
============================================================ */

function coerceNarrative(raw: string, parsed: any): string {
  // 1) perfecte case
  if (parsed && typeof parsed.narrative === "string" && parsed.narrative.trim())
    return parsed.narrative.trim();

  // 2) andere mogelijke velden
  const candidates = [
    parsed?.text,
    parsed?.analysis,
    parsed?.content,
    parsed?.report?.narrative,
    parsed?.data?.narrative,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }

  // 3) als parsed bestaat maar narrative ontbreekt → stringify parsed (niet leeg)
  if (parsed && typeof parsed === "object") {
    const s = JSON.stringify(parsed, null, 2);
    if (s && s.trim()) return s;
  }

  // 4) allerlaatste fallback: raw text (ook als dit geen JSON is)
  if (typeof raw === "string" && raw.trim()) return raw.trim();

  // 5) nooit leeg teruggeven
  return "Analyse-output was leeg. (Fallback narrative ingevuld om crash te voorkomen.)";
}

/* ============================================================
   HANDLER
============================================================ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      return jsonResponse({ success: false, error: "OPENAI_API_KEY ontbreekt" }, 500);
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // =========================
    // ZORGSCAN
    // =========================
    if (body.mode === "zorgscan") {
      const details = body.company_context?.details ?? "";
      const prompt = `${details}\n\nCurrent date: ${currentDate}`;

      const raw = await callOpenAI(
        OPENAI_API_KEY,
        `${DUTCH_ONLY_LOCK}
You are CYNTRA ZORGSCAN.
Decision logic uses HGBCO and VIBAAAN.
You MUST output ONLY valid JSON.`,
        prompt,
        true,
        "gpt-4o",
        0.2,
        6000
      );

      const parsed = safeParseJSON(raw);

      if (!parsed) {
        // ✅ ADD ONLY — nooit 500 om parse
        const report = {
          title: "Cyntra ZorgScan",
          narrative: raw?.trim?.() ? raw.trim() : "ZorgScan output was empty.",
          action_plan_90d: ACTION_PLAN_90D_CANON,
        };

        return jsonResponse({ success: true, type: "zorgscan", report });
      }

      parsed.action_plan_90d = parsed.action_plan_90d ?? ACTION_PLAN_90D_CANON;

      return jsonResponse({
        success: true,
        type: "zorgscan",
        report: parsed,
      });
    }

    // =========================
    // ANALYZE
    // =========================
    if (!body.company_context || typeof body.company_context !== "string") {
      return jsonResponse({ success: false, error: "company_context ontbreekt" }, 400);
    }

    const analysisType = body.analysis_type ?? "strategy";
    const role = ANALYSIS_ROLE_PROMPTS[String(analysisType)] ?? ANALYSIS_ROLE_PROMPTS.strategy;

    const systemPrompt =
      `${DUTCH_ONLY_LOCK}\n` +
      `Je opereert via: ${DECISION_FRAMEWORKS_CANON.join(", ")}.\n` +
      `${role}\n` +
      `Belangrijk: geen marketing. geen bullets. geen markdown. geen raamwerken benoemen.\n\n` +
      OUTPUT_SCHEMA(currentDate);

    const userPrompt = `${body.company_context}\n\nCurrent date: ${currentDate}`;

    const raw = await callOpenAI(
      OPENAI_API_KEY,
      systemPrompt,
      userPrompt,
      true // force json
    );

    const parsed = safeParseJSON(raw);

    // ✅ ADD ONLY — HARDENED: nooit 500 op invalid json
    const narrative = coerceNarrative(raw, parsed);

    const framework_metadata =
      parsed?.framework_metadata?.used_frameworks
        ? parsed.framework_metadata
        : {
            used_frameworks: DECISION_FRAMEWORKS_CANON,
            insights_per_framework: parsed?.framework_metadata?.insights_per_framework ?? {},
          };

    const report = {
      title: "Aurelius Intelligence Report",
      narrative,
      analysis_type: analysisType,
      decision_frameworks: framework_metadata.used_frameworks ?? DECISION_FRAMEWORKS_CANON,
      action_plan_90d: parsed?.action_plan_90d ?? ACTION_PLAN_90D_CANON,
      failure_maps: parsed?.failure_maps ?? [],
      roadmap_cards: parsed?.roadmap_cards ?? [],
      decision_card:
        parsed?.decision_card ?? {
          executive_thesis: "",
          central_tension: "",
          confidence_level: null,
          irreversibility_deadline: null,
        },
      framework_metadata,
    };

    return jsonResponse({ success: true, type: "aurelius-report", report });
  } catch (err: any) {
    logError(err);
    // ✅ ADD ONLY — ook hier: probeer nooit “leeg”
    return jsonResponse(
      { success: false, error: err?.message ? String(err.message) : String(err) },
      500
    );
  }
});
