import { noPromptLeakage } from "@/aurelius/validators/no_prompt_leakage";
import { noFragmentEndings } from "@/aurelius/validators/no_fragment_endings";

export type BoardMemoQualityReport = {
  score: number;
  findings: string[];
};

export function scoreBoardMemoQuality(text: string): BoardMemoQualityReport {
  const source = String(text ?? "");
  const findings: string[] = [];
  let score = 100;

  for (const required of [/Bestuurlijke hypothese/i, /Feitenbasis/i, /Besluitvoorstel/i]) {
    if (!required.test(source)) {
      score -= 15;
      findings.push(`Ontbrekende memo-sectie: ${required}`);
    }
  }

  const leakage = noPromptLeakage(source);
  if (!leakage.pass) {
    score -= leakage.matches.length * 20;
    findings.push(`Prompt-lekkage: ${leakage.matches.join(", ")}`);
  }

  const fragments = noFragmentEndings(source);
  if (!fragments.pass) {
    score -= fragments.matches.length * 10;
    findings.push(`Fragment-eindes: ${fragments.matches.join(", ")}`);
  }

  if (!/\b(Besluit|kies|stopregel|owner|eigenaar|deadline|KPI)\b/i.test(source)) {
    score -= 15;
    findings.push("Memo mist besluit- of executiehardheid.");
  }

  if (/\bSamenvatting gesprekverslag|ACTION ITEMS|BLOCKERS|FYI|Fireflies\b/i.test(source)) {
    score -= 25;
    findings.push("Memo bevat ruwe bronblokken in plaats van bestuurlijke selectie.");
  }

  if (/Laat het bestuur besluiten hoe/i.test(source)) {
    score -= 20;
    findings.push("Memo bevat placeholder-besluittaal.");
  }

  if (/\b(mogelijk|wellicht|zou kunnen|het lijkt erop)\b/i.test(source)) {
    score -= 10;
    findings.push("Memo bevat zachte taal.");
  }

  return {
    score: Math.max(0, score),
    findings,
  };
}
