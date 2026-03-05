import { callAI } from "@/aurelius/engine/utils/callAI";
import { BOARDROOM_NARRATIVE_PROMPT } from "@/aurelius/narrative/boardroomPrompt";
import {
  HGBCO_MCKINSEY_SYSTEM_INJECT,
  HGBCO_MCKINSEY_USER_INJECT,
} from "@/aurelius/narrative/guards/hgbcoMcKinseySpec";
import { hardenNarrativeCandidate } from "@/aurelius/narrative/harden/hardenNarrativeCandidate";
import { buildStructuralSkeleton } from "@/aurelius/narrative/harden/buildStructuralSkeleton";
import { validateNarrativeV2 } from "@/aurelius/narrative/v2/NarrativeValidatorV2";
import { getPreviousReport, setPreviousReport } from "@/aurelius/narrative/tools/reportStore";
import { extractAnchors, anchorValues } from "@/aurelius/narrative/anchors/anchorExtractor";

export type BoardroomInput = {
  analysis_id?: string;
  company_name?: string;
  company_context?: string;
  documents?: Array<{ id: string; filename: string; content: string }>;
  questions?: Record<string, string | undefined>;
  meta?: Record<string, unknown>;
};

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

function buildContext(input: BoardroomInput): string {
  const base = String(input.company_context ?? "").trim();
  const questionBlock = Object.entries(input.questions ?? {})
    .filter(([, value]) => String(value ?? "").trim())
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");
  const docs = (input.documents ?? [])
    .map((doc) => `${doc.filename}\n${doc.content.slice(0, 3000)}`)
    .join("\n\n");

  return [base, questionBlock, docs].filter(Boolean).join("\n\n").trim();
}

function systemPrompt(): string {
  return [HGBCO_MCKINSEY_SYSTEM_INJECT, BOARDROOM_NARRATIVE_PROMPT].filter(Boolean).join("\n\n");
}

async function generateCyntraNarrative(params: {
  input: BoardroomInput;
  mode: string;
  directive: string;
  previousOutput?: string;
}): Promise<string> {
  const context = buildContext(params.input);
  const anchors = anchorValues(extractAnchors(context)).slice(0, 30);
  const prompt = `
${HGBCO_MCKINSEY_USER_INJECT}
MODE: ${params.mode}
REPAIR DIRECTIVE: ${params.directive}

CONTEXT (LEIDEND):
${context}

ALLOWED ANCHORS:
${anchors.join(" | ")}

STRUCTURAL SKELETON (EXACT VOLGEN):
${buildStructuralSkeleton()}

${params.previousOutput ? `VORIGE OUTPUT (NIET HERHALEN):\n${params.previousOutput.slice(0, 6000)}` : ""}

HARD:
- Gebruik exact 8 secties met exact de headings uit het skeleton.
- Geen bullets buiten sectie 7 en 8.
- Geen nieuwe feiten buiten anchors/context.
- Geen verboden woorden.
`.trim();

  const out = await callAI(
    "gpt-4o",
    [
      { role: "system", content: systemPrompt() },
      { role: "user", content: prompt },
    ],
    { temperature: 0.22, max_tokens: 12000 }
  );

  return typeof out === "string" ? out.trim() : "";
}

async function rewriteSection7Only(params: {
  directive: string;
  input: BoardroomInput;
  previousNarrative: string;
}): Promise<string> {
  const section7 = sectionBody(params.previousNarrative, 7);
  const context = buildContext(params.input);
  const anchors = anchorValues(extractAnchors(context)).slice(0, 30);

  const prompt = `
${HGBCO_MCKINSEY_USER_INJECT}
MODE: SECTION7_REWRITE
DIRECTIVE: ${params.directive}

CONTEXT:
${context}

ALLOWED ANCHORS:
${anchors.join(" | ")}

HUIDIGE SECTIE 7:
${section7}

HERBOUW ALLEEN SECTIE 7 MET:
- MAAND 1 (1-30)
- MAAND 2 (31-60)
- MAAND 3 (61-90)
- Minimaal 6 kerninterventies totaal (2 per maand)
- Elk blok met exact velden:
  Actie:
  Eigenaar:
  Deadline:
  KPI:
  Escalatiepad:
  Direct zichtbaar effect (<=7 dagen):
  Casus-anker:
- Expliciete Dag 30 / Dag 60 / Dag 90 gates.
`.trim();

  const out = await callAI(
    "gpt-4o",
    [
      { role: "system", content: systemPrompt() },
      { role: "user", content: prompt },
    ],
    { temperature: 0.2, max_tokens: 7000 }
  );

  const rewritten = typeof out === "string" ? out.trim() : "";
  return replaceSectionBody(params.previousNarrative, 7, rewritten || section7);
}

export async function runNarrativeKernelV2(
  input: BoardroomInput,
  _options?: {
    minWords?: number;
    maxWords?: number;
    temperature?: number;
  }
): Promise<{
  text: string;
  metrics: Record<string, unknown>;
  gateLogs: Array<Record<string, unknown>>;
}> {
  const key = stableKey(input);
  const previous = getPreviousReport(key);

  console.info("[narrative_start]", { key });

  const baseText = await generateCyntraNarrative({
    input,
    mode: "NORMAL",
    directive: "Genereer een CYNTRA-native executive decision report volgens het exacte 8-blokken skelet.",
    previousOutput: previous,
  });

  console.info("[harden_start]", { key });

  const hardened = await hardenNarrativeCandidate({
    candidate: baseText,
    context: buildContext(input),
    previousOutput: previous,
    regenerateFull: ({ mode, directive, previousNarrative }) =>
      generateCyntraNarrative({
        input,
        mode,
        directive,
        previousOutput: previousNarrative,
      }),
    rewriteSection8: ({ directive, previousNarrative }) =>
      rewriteSection7Only({
        directive,
        input,
        previousNarrative,
      }),
  });

  const finalValidation = validateNarrativeV2({
    narrativeText: hardened.narrative,
    context: buildContext(input),
    previousOutput: previous,
  });

  console.info("[harden_end]", {
    key,
    passed: finalValidation.passed,
    firstFailure: finalValidation.firstFailure?.code,
    executivePressureIndex: finalValidation.diagnostics.executivePressureIndex,
    besluitdwangScore: finalValidation.diagnostics.besluitdwangScore,
    interventieRealiteitScore: finalValidation.diagnostics.interventieRealiteitScore,
    organisatieFrictieScore: finalValidation.diagnostics.organisatieFrictieScore,
  });
  console.info("[narrative_end]", { key });

  setPreviousReport(key, hardened.narrative);

  return {
    text: hardened.narrative,
    metrics: {
      hardenAttempts: hardened.logs.length,
      gatePassed: finalValidation.passed,
      executivePressureIndex: finalValidation.diagnostics.executivePressureIndex,
      besluitdwangScore: finalValidation.diagnostics.besluitdwangScore,
      interventieRealiteitScore: finalValidation.diagnostics.interventieRealiteitScore,
      organisatieFrictieScore: finalValidation.diagnostics.organisatieFrictieScore,
    },
    gateLogs: hardened.logs,
  };
}

export const generateStrictBoardroomNarrative = runNarrativeKernelV2;
