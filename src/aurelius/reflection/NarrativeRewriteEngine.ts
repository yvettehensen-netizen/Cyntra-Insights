import { composeBoardroomNarrative } from "@/aurelius/narrative/BoardroomNarrativeComposer";
import type { StrategicCritique } from "./StrategicCritiqueAgent";

export type NarrativeRewriteInput = {
  boardroomReport: string;
  critique: StrategicCritique;
};

export type NarrativeRewriteResult = {
  rewrittenReport: string;
  changesApplied: string[];
};

function extractSection(text: string, heading: string): string {
  const source = String(text ?? "");
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`, "i"));
  return match?.[1]?.trim() ?? "";
}

function replaceSection(text: string, heading: string, body: string): string {
  const source = String(text ?? "");
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(escaped, "i").test(source)) return source;
  return source.replace(
    new RegExp(`${escaped}\\n([\\s\\S]*?)(?=\\n###\\s*\\d+\\.|$)`, "i"),
    `${heading}\n\n${String(body ?? "").trim()}\n`
  );
}

function hasExplicitDecisionPressure(text: string): boolean {
  return (
    /\bZonder\b[\s\S]{0,120}\bbinnen\s+\d+\s*(?:dagen|maanden)\b/i.test(text) ||
    /\bgeen nieuw initiatief zonder\b/i.test(text) ||
    /\bDe Raad van Bestuur committeert zich aan\b/i.test(text)
  );
}

function enforceDecisionPressure(report: string): { text: string; changed: boolean } {
  if (hasExplicitDecisionPressure(report)) {
    return { text: report, changed: false };
  }

  const heading = "### 12. BESLUITKADER";
  const section = extractSection(report, heading);
  if (!section) {
    return {
      text: `${report.trim()}\n\nZonder consolidatie binnen 12 maanden verdwijnt structureel behandelcapaciteit en neemt liquiditeitsdruk toe.`.trim(),
      changed: true,
    };
  }

  const addition =
    "Zonder consolidatie binnen 12 maanden verdwijnt structureel behandelcapaciteit en neemt liquiditeitsdruk toe.";
  const next = `${section.trim()} ${addition}`.replace(/\s+/g, " ").trim();
  return {
    text: replaceSection(report, heading, next).trim(),
    changed: true,
  };
}

export function runNarrativeRewriteEngine(
  input: NarrativeRewriteInput
): NarrativeRewriteResult {
  const changesApplied: string[] = [];
  let rewritten = String(input.boardroomReport ?? "").trim();

  const requiresDisciplineRewrite =
    input.critique.narrativeClarity.status === "WARN" ||
    input.critique.mechanismValidation.status === "WARN";

  if (requiresDisciplineRewrite) {
    const composed = composeBoardroomNarrative({ text: rewritten });
    rewritten = composed.composedText;
    changesApplied.push("Narratieve discipline hersteld via Context->Spanning->Mechanisme->Bestuurlijke implicatie.");
  }

  const decisionPressureResult = enforceDecisionPressure(rewritten);
  rewritten = decisionPressureResult.text;
  if (decisionPressureResult.changed) {
    changesApplied.push("Expliciete beslisdruk toegevoegd in besluitkader.");
  }

  return {
    rewrittenReport: rewritten.trim(),
    changesApplied,
  };
}

