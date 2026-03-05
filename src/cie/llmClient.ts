import OpenAI from "openai";

/* ============================================================
   OPENAI CLIENT — CYNTRA ENTERPRISE
============================================================ */

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is niet ingesteld.");
}

const openai = new OpenAI({
  apiKey,
  timeout: 120_000,
  maxRetries: 0, // retries doen we zelf
});

/* ============================================================
   TYPES
============================================================ */

export type ConsultantPhase =
  | "diagnose"
  | "spanning"
  | "opties"
  | "tradeoffs"
  | "besluit"
  | "review";

export interface CallLLMArgs {
  system: string;
  user: string;

  json?: boolean;
  temperature?: number;
  model?: string;

  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;

  language?: "nl" | "en";
  phase?: ConsultantPhase;
  consultantName?: string;
  memoryContext?: string;
}

/* ============================================================
   HELPERS
============================================================ */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i === maxRetries) break;

      const backoff =
        800 * Math.pow(2, i) + Math.floor(Math.random() * 300);
      await sleep(backoff);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError));
}

function buildSystemPrompt(args: CallLLMArgs): string {
  const language = args.language ?? "nl";

  const languageLock =
    language === "nl"
      ? "Schrijf uitsluitend in het Nederlands. Gebruik nooit Engels."
      : "Write exclusively in English.";

  const identity = args.consultantName
    ? `Je bent ${args.consultantName}, senior boardroom strategy consultant.`
    : "Je bent Cyntra, senior boardroom strategy consultant.";

  const phase =
    args.phase
      ? `Huidige fase: ${args.phase.toUpperCase()}. Werk deze fase volledig uit.`
      : "Volg strikt: diagnose → spanning → opties → keuzeconflicten → besluit.";

  const agency =
    "Neem expliciete positie. Adviseer alsof jij eindverantwoordelijk bent.";

  const memory = args.memoryContext
    ? `Context (state):\n${args.memoryContext}`
    : "";

  return [
    identity,
    languageLock,
    phase,
    agency,
    memory,
    args.system.trim(),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/* ============================================================
   CORE — CALL LLM (PRODUCTION SAFE)
============================================================ */

export async function callLLM<T = string>(
  args: CallLLMArgs
): Promise<T> {
  const system = args.system?.trim();
  const user = args.user?.trim();

  if (!system) throw new Error("callLLM: system ontbreekt");
  if (!user) throw new Error("callLLM: user ontbreekt");

  const model = args.model ?? "gpt-4o";
  const temperature = args.temperature ?? 0.25;
  const max_tokens = args.maxTokens ?? 4096;
  const top_p = args.topP ?? 1;
  const frequency_penalty = args.frequencyPenalty ?? 0;

  const finalSystemPrompt = buildSystemPrompt(args);

  return retry(async () => {
    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: user },
      ],

      // ✅ CRUCIAAL: alleen toevoegen ALS json=true
      ...(args.json
        ? { response_format: { type: "json_object" } }
        : {}),
    });

    const content =
      response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Lege response van OpenAI");
    }

    if (args.json) {
      try {
        return JSON.parse(content) as T;
      } catch {
        throw new Error("LLM retourneerde ongeldige JSON");
      }
    }

    return content as T;
  }, 2);
}
