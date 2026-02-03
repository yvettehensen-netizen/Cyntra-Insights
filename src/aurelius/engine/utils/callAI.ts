// ============================================================
// CALLAI v4.7 — AURELIUS EXECUTIVE LONGFORM LOCK (UPGRADED)
// • BACKWARDS COMPATIBLE
// • TPM-AWARE
// • AUTO RETRY (429 SAFE)
// • NO DOWNGRADES
// ============================================================

import type { AIMessage } from "./ai.types";

export interface CallAIOptions {
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  signal?: AbortSignal | null;
}

const DEFAULT_TIMEOUT_MS = 180_000;

/* ================= TARGETS ================= */

const TARGET_MIN_WORDS = 1250;
const MAX_CONTINUE_LOOPS = 2;

/* ================= RATE LIMIT SAFETY ================= */

const TPM_LIMIT = 30_000;
const TPM_SAFE_MARGIN = 4_000;
const MAX_TOKENS_PER_CALL = 6_000;
const RETRY_WAIT_MS = 15_000;
const MAX_RETRIES = 5;

/* ================= SAMPLING ================= */

const DEFAULT_TEMPERATURE = 0.25;
const DEFAULT_TOP_P = 0.95;
const DEFAULT_FREQUENCY_PENALTY = 0.25;

/* ================= UTILS ================= */

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  signal: AbortSignal | null
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI call timeout")), ms);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("AI call aborted"));
      });
    }

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** conservatieve token-inschatting (veilig) */
function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.35);
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ================= PROMPT GUARD ================= */

function addBoardroomLongformGuard(
  messages: AIMessage[],
  minWords: number
): AIMessage[] {
  const guard: AIMessage = {
    role: "system",
    content: [
      "AURELIUS LONGFORM CONTRACT (NON-NEGOTIABLE):",
      `1) Target output length: at least ${minWords} words.`,
      "2) NO markdown. No bullets. No asterisks. No lists.",
      "3) Write in structured paragraphs with clear plain-text headings.",
      "4) Keep EXACT section order and naming used in Cyntra board reports.",
      "5) Each section must include diagnosis, logic, implications, decision.",
      "6) Finish the CURRENT SECTION before stopping.",
    ].join("\n"),
  };

  return [guard, ...messages];
}

function addContinueInstruction(
  baseMessages: AIMessage[],
  currentText: string,
  minWords: number
): AIMessage[] {
  return [
    ...baseMessages,
    { role: "assistant", content: currentText },
    {
      role: "user",
      content: [
        "CONTINUE OUTPUT.",
        `- Target length: ${minWords} words.`,
        "- Continue EXACTLY where you stopped.",
        "- Finish the CURRENT SECTION completely.",
        "- Do NOT repeat earlier text.",
        "- No markdown, bullets, symbols or lists.",
        "- Maintain identical structure and tone.",
      ].join("\n"),
    },
  ];
}

/* ================= CORE POST (TPM SAFE) ================= */

async function postToAurelius(
  messages: AIMessage[],
  options: CallAIOptions,
  meta?: Record<string, unknown>,
  attempt = 1
): Promise<string> {
  const company_context = messages
    .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
    .join("\n\n");

  const estimatedPromptTokens = estimateTokens(company_context);
  const availableTokens =
    TPM_LIMIT - TPM_SAFE_MARGIN - estimatedPromptTokens;

  const safeMaxTokens = Math.max(
    1500,
    Math.min(
      options.max_tokens ?? MAX_TOKENS_PER_CALL,
      availableTokens,
      MAX_TOKENS_PER_CALL
    )
  );

  const payload: Record<string, unknown> = {
    company_context,
    max_tokens: safeMaxTokens,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    top_p: options.top_p ?? DEFAULT_TOP_P,
    frequency_penalty:
      options.frequency_penalty ?? DEFAULT_FREQUENCY_PENALTY,
    meta: {
      engine: "Aurelius",
      version: "4.7",
      generated_at: new Date().toISOString(),
      ...meta,
    },
  };

  const response = await withTimeout(
    fetch(
      `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/aurelius-analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
        signal: options.signal ?? null,
      }
    ),
    DEFAULT_TIMEOUT_MS,
    options.signal ?? null
  );

  if (!response.ok) {
    const raw = await response.text();

    if (response.status === 429 && attempt <= MAX_RETRIES) {
      console.warn(
        `[AURELIUS] TPM limit geraakt — retry ${attempt}/${MAX_RETRIES} in ${
          RETRY_WAIT_MS / 1000
        }s`
      );
      await sleep(RETRY_WAIT_MS);
      return postToAurelius(
        messages,
        options,
        meta,
        attempt + 1
      );
    }

    throw new Error(`AI HTTP ${response.status}: ${raw}`);
  }

  const json = await response.json();

  /* ================= STRUCTURED OUTPUT NORMALIZATION ================= */

  let text: unknown = json?.report;

  if (typeof text === "object" && text !== null) {
    if (typeof (text as any).narrative === "string") {
      text = (text as any).narrative;
    }
  }

  if (typeof text !== "string") {
    const fallback =
      json?.report?.narrative ??
      json?.narrative ??
      json?.text ??
      null;

    if (typeof fallback === "string" && fallback.trim()) {
      text = fallback;
    }
  }

  if (typeof text !== "string" || !text.trim()) {
    console.error("[AURELIUS RAW RESPONSE]", json);
    throw new Error("AI returned empty or invalid content");
  }

  return text;
}

/* ================= PUBLIC API ================= */

export async function callAI(
  _model: string,
  messages: AIMessage[],
  options: CallAIOptions = {}
): Promise<string> {
  const base = addBoardroomLongformGuard(messages, TARGET_MIN_WORDS);

  let text = await postToAurelius(base, options, { phase: "initial" });
  let count = wordCount(text);

  let loops = 0;
  while (count < TARGET_MIN_WORDS && loops < MAX_CONTINUE_LOOPS) {
    loops++;

    const continued = addContinueInstruction(
      base,
      text,
      TARGET_MIN_WORDS
    );

    const next = await postToAurelius(
      continued,
      {
        ...options,
        temperature:
          typeof options.temperature === "number"
            ? options.temperature
            : 0.18,
      },
      { phase: "continue", loop: loops }
    );

    text = `${text}\n\n${next}`;
    count = wordCount(text);
  }

  if (count < TARGET_MIN_WORDS) {
    console.warn(
      `[AURELIUS NOTICE] Output below target length (${count} < ${TARGET_MIN_WORDS}).`
    );
  }

  return text;
}
