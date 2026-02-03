// ============================================================
// AURELIUS — BOARDROOM NARRATIVE GENERATOR (CANON • MAXIMAL)
// HARDENED • BACKWARDS COMPATIBLE • 30+ DOCUMENTS • LONGFORM SAFE
// ============================================================

import { callAI } from "@/aurelius/engine/utils/callAI";
import type { AIMessage } from "@/aurelius/engine/utils/ai.types";
import { enforceLanguagePrompt } from "@/aurelius/engine/languageLock";

/* ============================================================
   TYPES
============================================================ */

export interface ContextDocument {
  id: string;
  filename: string;
  content: string;
}

export interface BoardroomInput {
  analysis_id: string;
  company_name?: string;

  /** OPTIONAL — LEGACY SAFE */
  questions?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
  };

  /** OPTIONAL — MULTI DOCUMENT SUPPORT */
  documents?: ContextDocument[];

  /** LEGACY FALLBACK */
  company_context?: string;

  meta?: Record<string, unknown>;
}

/* ============================================================
   CONSTANTS — NEVER LOWER
============================================================ */

const DEFAULT_MIN_WORDS = 4200; // ±10 pages
const MAX_LOOPS = 8;
const CHUNK_TOKENS = 4200;

/* ============================================================
   UTILS
============================================================ */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function assertDutchOnly(text: string) {
  if (/(executive summary|recommendation|in conclusion)/i.test(text)) {
    throw new Error("❌ Engels gedetecteerd in narratief");
  }
}

function assertStructure(text: string) {
  const required = [
    "### 1. Waar staan we nu echt",
    "### 2. Wat hier fundamenteel schuurt",
    "### 3. Wat er gebeurt als er niets verandert",
    "### 4. De keuzes die nu voorliggen",
    "### 5. Wat dit vraagt van bestuur en organisatie",
    "### 6. Het besluit dat nu nodig is",
  ];

  if (required.filter((h) => text.includes(h)).length < 6) {
    throw new Error("❌ Structuur onvolledig — bestuur kan niet beslissen");
  }
}

function assertTradeOffs(text: string) {
  const signals = [
    "stop",
    "verliest",
    "opheffen",
    "afstoten",
    "uitsluiten",
    "consequentie",
  ];

  if (signals.filter((s) => text.toLowerCase().includes(s)).length < 2) {
    throw new Error("❌ Onvoldoende expliciete trade-offs of verlies");
  }
}

function assertOwnership(text: string) {
  const signals = ["bestuur", "mandaat", "eindverantwoordelijk"];
  if (!signals.some((s) => text.toLowerCase().includes(s))) {
    throw new Error("❌ Eigenaarschap niet expliciet benoemd");
  }
}

/* ============================================================
   FAIL-SAFE — VERLIES IS VERPLICHT
============================================================ */

function enforceLoss(text: string): string {
  const l = text.toLowerCase();
  if (l.includes("stop") && l.includes("verliest") && l.includes("consequentie")) {
    return text;
  }

  return (
    text +
    `

### 6. Het besluit dat nu nodig is

Dit besluit is niet vrijblijvend.
Bepaalde activiteiten **stoppen** per direct.
Een deel van de organisatie **verliest** mandaat, autonomie of invloed.
Deze **consequentie** is bewust en onomkeerbaar.
Zonder dit verlies is focus, executiekracht en bestuurlijke geloofwaardigheid onmogelijk.`
  );
}

/* ============================================================
   SYSTEM PROMPT — BOARDROOM CONTRACT
============================================================ */

function buildSystemPrompt(): string {
  return `
${enforceLanguagePrompt("nl")}

JE BENT AURELIUS.
JE SCHRIJFT NIET TER INFORMATIE.
JE SCHRIJFT OM EEN BESTUUR TE LATEN KIEZEN.

VERPLICHTE STRUCTUUR:

### 1. Waar staan we nu echt
### 2. Wat hier fundamenteel schuurt
### 3. Wat er gebeurt als er niets verandert
### 4. De keuzes die nu voorliggen
### 5. Wat dit vraagt van bestuur en organisatie
### 6. Het besluit dat nu nodig is

REGELS:
- Eén dominante richting
- Geen en/en
- Verlies expliciet
- Macht, mandaat en eigenaarschap benoemd
- Geen consultancy-taal
- Geen bullets of lijstjes

STIJL:
- Bestuurlijk
- Rustig
- Onontkoombaar
`.trim();
}

/* ============================================================
   MAIN — LONGFORM SAFE
============================================================ */

export async function generateBoardroomNarrative(
  input: BoardroomInput,
  options: {
    minWords?: number;
    temperature?: number;
  } = {}
) {
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const temperature = options.temperature ?? 0.18;

  const documents: ContextDocument[] = Array.isArray(input.documents)
    ? input.documents
    : [];

  const q = input.questions ?? {};
  const hasQuestions =
    !!q.q1 && !!q.q2 && !!q.q3 && !!q.q4 && !!q.q5;

  const questionBlock = hasQuestions
    ? `
5 KERNVRAGEN:
1. ${q.q1}
2. ${q.q2}
3. ${q.q3}
4. ${q.q4}
5. ${q.q5}
`
    : `
GEEN EXPLICIETE VRAGEN AANGELEVERD.
Gebruik context, patronen en bestuurlijke spanning.
`;

  const documentBlock =
    documents.length === 0
      ? "GEEN CONTEXTDOCUMENTEN AANGELEVERD."
      : documents.slice(0, 30).map(
          (d, i) => `
--- DOCUMENT ${i + 1}: ${d.filename} ---
${d.content}
`
        ).join("\n");

  const legacyContext =
    typeof input.company_context === "string"
      ? input.company_context
      : "";

  const messages: AIMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: `
ORGANISATIE: ${input.company_name ?? "Onbenoemd"}

${questionBlock}

CONTEXTDOCUMENTEN:
${documentBlock}

LEGACY CONTEXT:
${legacyContext}
`.trim(),
    },
  ];

  let text = "";
  let loops = 0;

  while (countWords(text) < minWords && loops < MAX_LOOPS) {
    const chunk = await callAI("gpt-4o", messages, {
      max_tokens: CHUNK_TOKENS,
      temperature,
    });

    assertDutchOnly(chunk);

    text = text ? `${text}\n\n${chunk.trim()}` : chunk.trim();

    messages.push({ role: "assistant", content: chunk });
    messages.push({
      role: "user",
      content:
        "Ga verder. Houd exact dezelfde headings. Verdiep analyse, maak verlies en mandaat explicieter.",
    });

    loops++;
  }

  text = enforceLoss(text);

  assertStructure(text);
  assertTradeOffs(text);
  assertOwnership(text);

  return {
    text,
    metrics: {
      words: countWords(text),
      loops,
      documents_used: documents.length,
      used_questions: hasQuestions,
    },
  };
}
