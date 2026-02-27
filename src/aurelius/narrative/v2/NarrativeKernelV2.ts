import { callAI } from "@/aurelius/engine/utils/callAI";
import {
  generateBoardroomNarrative,
  type BoardroomInput,
} from "@/aurelius/narrative/generateBoardroomNarrative";
import { BOARDROOM_NARRATIVE_PROMPT } from "@/aurelius/narrative/boardroomPrompt";
import {
  HGBCO_MCKINSEY_SYSTEM_INJECT,
  HGBCO_MCKINSEY_USER_INJECT,
} from "@/aurelius/narrative/guards/hgbcoMcKinseySpec";
import { hardenNarrativeCandidate } from "@/aurelius/narrative/harden/hardenNarrativeCandidate";
import { validateNarrativeV2 } from "@/aurelius/narrative/v2/NarrativeValidatorV2";
import { getPreviousReport, setPreviousReport } from "@/aurelius/narrative/tools/reportStore";

function stableKey(input: BoardroomInput): string {
  const source = [input.analysis_id, input.company_name, input.company_context]
    .filter(Boolean)
    .join("|");
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 33 + source.charCodeAt(i)) >>> 0;
  }
  return `narrative_${hash.toString(16)}`;
}

function sectionBody(text: string, number: number): string {
  const source = String(text ?? "");
  const matches = [...source.matchAll(/^###\s*(\d+)\.\s*[^\n]+$/gm)];
  const idx = matches.findIndex((m) => Number(m[1] || 0) === number);
  if (idx < 0) return "";
  const start = (matches[idx].index ?? 0) + matches[idx][0].length;
  const end = matches[idx + 1]?.index ?? source.length;
  return source.slice(start, end).replace(/^\n+/, "").trim();
}

function replaceSectionBody(text: string, number: number, newBody: string): string {
  const source = String(text ?? "");
  const matches = [...source.matchAll(/^###\s*(\d+)\.\s*[^\n]+$/gm)];
  const idx = matches.findIndex((m) => Number(m[1] || 0) === number);
  if (idx < 0) return source;

  const start = (matches[idx].index ?? 0) + matches[idx][0].length;
  const end = matches[idx + 1]?.index ?? source.length;
  return `${source.slice(0, start)}\n${newBody.trim()}\n${source.slice(end)}`.trim();
}

function systemPrompt(): string {
  return [
    HGBCO_MCKINSEY_SYSTEM_INJECT,
    BOARDROOM_NARRATIVE_PROMPT,
    "Gebruik uitsluitend anchors uit context; geen nieuwe feiten.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function regenerateFullNarrative(params: {
  mode: string;
  directive: string;
  input: BoardroomInput;
  previousNarrative: string;
}): Promise<string> {
  const context = String(params.input.company_context ?? "");
  const prompt = `
${HGBCO_MCKINSEY_USER_INJECT}
MODE: ${params.mode}
REPAIR DIRECTIVE: ${params.directive}

CONTEXT (LEIDEND):
${context}

VORIGE OUTPUT (NIET HERHALEN):
${params.previousNarrative.slice(0, 7000)}

HARD:
- Geen nieuwe feiten buiten context.
- Minimaal 15 interventies in sectie 8.
- Minimaal 3 causale ketens per sectie.
- Exact 9 headings.
`.trim();

  const out = await callAI(
    "gpt-4o",
    [
      { role: "system", content: systemPrompt() },
      { role: "user", content: prompt },
    ],
    { temperature: 0.28, max_tokens: 12_000 }
  );

  return typeof out === "string" ? out.trim() : "";
}

async function rewriteSection8Only(params: {
  directive: string;
  input: BoardroomInput;
  previousNarrative: string;
}): Promise<string> {
  const section8 = sectionBody(params.previousNarrative, 8);
  const prompt = `
${HGBCO_MCKINSEY_USER_INJECT}
SECTION8_REWRITE_MODE
DIRECTIVE: ${params.directive}

CONTEXT (LEIDEND):
${String(params.input.company_context ?? "")}

HUIDIGE SECTIE 8:
${section8}

HERBOUW ALLEEN SECTIE 8 volgens regels, start direct met:
MAAND 1 (dag 1–30): STABILISEREN EN KNOPEN DOORHAKKEN
`.trim();

  const out = await callAI(
    "gpt-4o",
    [
      { role: "system", content: systemPrompt() },
      { role: "user", content: prompt },
    ],
    { temperature: 0.22, max_tokens: 7000 }
  );

  const rewritten = typeof out === "string" ? out.trim() : "";
  return replaceSectionBody(params.previousNarrative, 8, rewritten || section8);
}

export async function runNarrativeKernelV2(
  input: BoardroomInput,
  options?: {
    minWords?: number;
    maxWords?: number;
    temperature?: number;
  }
): Promise<{
  text: string;
  metrics: Record<string, unknown>;
  gateLogs: Array<Record<string, unknown>>;
}> {
  const base = await generateBoardroomNarrative(input, options);
  const key = stableKey(input);
  const previous = getPreviousReport(key);

  console.info("[narrative_start]", { key });
  console.info("[harden_start]", { key });

  const hardened = await hardenNarrativeCandidate({
    candidate: base.text,
    context: String(input.company_context ?? ""),
    previousOutput: previous,
    regenerateFull: ({ mode, directive, previousNarrative }) =>
      regenerateFullNarrative({
        mode,
        directive,
        input,
        previousNarrative,
      }),
    rewriteSection8: ({ directive, previousNarrative }) =>
      rewriteSection8Only({
        directive,
        input,
        previousNarrative,
      }),
  });

  const finalValidation = validateNarrativeV2({
    narrativeText: hardened.narrative,
    context: String(input.company_context ?? ""),
    previousOutput: previous,
  });

  console.info("[harden_end]", {
    key,
    passed: finalValidation.passed,
    firstFailure: finalValidation.firstFailure?.code,
  });
  console.info("[narrative_end]", { key });

  setPreviousReport(key, hardened.narrative);

  return {
    text: hardened.narrative,
    metrics: {
      ...base.metrics,
      hardenAttempts: hardened.logs.length,
      gatePassed: finalValidation.passed,
    },
    gateLogs: hardened.logs,
  };
}

export const generateStrictBoardroomNarrative = runNarrativeKernelV2;
