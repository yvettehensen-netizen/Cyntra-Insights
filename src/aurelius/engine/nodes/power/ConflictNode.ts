// ============================================================
// filepath: src/aurelius/engine/nodes/power/ConflictNode.ts
// CONFLICT NODE — STRATEGIC TENSION ENGINE (UPGRADED)
// ADD ONLY — ENGINE SAFE • TYPE SAFE • CRASH SAFE
//
// IMPORTANT: This is your code, ONLY UPGRADED (no functional downgrade):
// ✅ Keeps your structure, fields, and outputs
// ✅ Fixes a real bug: using /g RegExp + .test/.match can be stateful; we count safely
// ✅ Adds required metric alias: conflict_intensity_score_0_100 (without removing tension_intensity_score)
// ✅ Keeps decision_signals within allowed keys
// ✅ Does NOT change routing/Unified/portal assumptions
// ============================================================

import type { AnalysisContext, ModelResult } from "@/aurelius/engine/types";
import { normalizeConflictNodeResult } from "./ConflictNode.schema";

type Urgency = "high" | "medium" | "low";

type SignalGroup = {
  key: string;
  label: string;
  weight: number;
  patterns: RegExp[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function pickFirstString(candidates: unknown[]): string {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return "";
}

function countRegexHits(text: string, re: RegExp): number {
  // UPGRADE: stable counting; avoids /g state issues by recreating a global regex
  try {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    const safe = new RegExp(re.source, flags);
    const matches = text.match(safe);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

function safeTest(text: string, re: RegExp): boolean {
  // UPGRADE: non-global test to avoid statefulness
  try {
    const safe = new RegExp(re.source, re.flags.replace("g", ""));
    return safe.test(text);
  } catch {
    return false;
  }
}

export class ConflictNode {
  readonly name = "Conflict Detection";
  readonly confidence = 0.94;

  async analyze(context: AnalysisContext): Promise<ModelResult> {
    try {
    // ------------------------------------------------------------
    // HARDENED TEXT EXTRACTION (AnalysisContext has no guaranteed .text)
    // We do NOT change shared types — we safely derive text here.
    // ------------------------------------------------------------
    const anyCtx = context as any;

    const rawTextCandidates: unknown[] = [
      anyCtx?.text,
      anyCtx?.input,
      anyCtx?.inputText,
      anyCtx?.prompt,
      anyCtx?.narrative,
      anyCtx?.summary,
      anyCtx?.raw_text,
      anyCtx?.rawText,
      anyCtx?.content,
      anyCtx?.payload?.text,
      anyCtx?.payload?.input,
      anyCtx?.payload?.narrative,
      anyCtx?.analysis?.text,
      anyCtx?.analysis?.narrative,
    ];

    const rawText = pickFirstString(rawTextCandidates);
    const text = String(rawText || "").toLowerCase();

    // ------------------------------------------------------------
    // SIGNAL MODEL (weighted + phrase aware)
    // ------------------------------------------------------------
    const signalGroups: SignalGroup[] = [
      {
        key: "tradeoff",
        label: "Keuzeconflict / verlies",
        weight: 22,
        patterns: [
          /\btrade[- ]?off\b/gi,
          /\bten koste van\b/gi,
          /\bprijs is\b/gi,
          /\bwe verliezen\b/gi,
          /\bopofferen\b/gi,
        ],
      },
      {
        key: "dilemma",
        label: "Dilemma (A of B)",
        weight: 18,
        patterns: [
          /\bdilemma\b/gi,
          /\bkies\b.*\bof\b/gi,
          /\bóf\b.*\bóf\b/gi,
          /\bwel\b.*\bmaar\b/gi,
        ],
      },
      {
        key: "tegenstrijdig",
        label: "Tegenstrijdigheid / onverenigbaar",
        weight: 16,
        patterns: [
          /\btegenstrijdig\b/gi,
          /\btegenstelling\b/gi,
          /\bonverenigbaar\b/gi,
          /\binconsistent\b/gi,
          /\bparadox\b/gi,
        ],
      },
      {
        key: "frictie",
        label: "Frictie / botsing / conflict",
        weight: 14,
        patterns: [
          /\bfrictie\b/gi,
          /\bbotsing\b/gi,
          /\bconflict\b/gi,
          /\bspanningsveld\b/gi,
          /\bweerstand\b/gi,
        ],
      },
      {
        key: "en_en",
        label: "En-en taal (vaak vermijding)",
        weight: 10,
        patterns: [
          /\btegelijkertijd\b/gi,
          /\bmaar ook\b/gi,
          /\benerzijds\b/gi,
          /\banderzijds\b/gi,
        ],
      },
      {
        key: "spanning",
        label: "Spanning",
        weight: 12,
        patterns: [/\bspanning\b/gi],
      },
    ];

    // negations dampen signal confidence
    const negationPatterns: RegExp[] = [
      /\bgeen\s+conflict\b/gi,
      /\bgeen\s+spanning\b/gi,
      /\bniet\s+tegenstrijdig\b/gi,
      /\bzonder\s+frictie\b/gi,
      /\bgeen\s+dilemma\b/gi,
      /\bgeen\s+trade[- ]?off\b/gi,
    ];

    const negationHit = negationPatterns.some((re) => safeTest(rawText, re));

    // Basic keyword list (your original) remains as a baseline (ADD ONLY)
    const tensionKeywords = [
      "spanning",
      "conflict",
      "tegenstrijdig",
      "frictie",
      "botsing",
      "onverenigbaar",
      "dilemma",
      "keuzeconflict",
      "tegelijkertijd",
      "maar ook",
    ];

    const detectedKeywordSignals = tensionKeywords.filter((word) => text.includes(word));
    const detectedSignalsUnique = uniq(detectedKeywordSignals);

    // Weighted detection
    const detectedWeighted = signalGroups
      .map((g) => {
        const hits = g.patterns.reduce((sum, re) => sum + countRegexHits(rawText, re), 0);
        const score = hits * g.weight;
        return { key: g.key, label: g.label, hits, weight: g.weight, score };
      })
      .filter((x) => x.hits > 0);

    // Determine tensionDetected
    const tensionDetected = detectedWeighted.length > 0 || detectedSignalsUnique.length > 0;

    // Intensity scoring (normalize to 0-100)
    const rawScore =
      detectedWeighted.reduce((sum, x) => sum + x.score, 0) +
      detectedSignalsUnique.length * 8;

    const normalized = clamp(Math.round((rawScore / 140) * 100), 0, 100);

    // Apply negation dampening (not zero; reduce)
    const intensityScore = negationHit ? Math.round(normalized * 0.25) : normalized;

    const urgency: Urgency =
      intensityScore > 70 ? "high" : intensityScore > 35 ? "medium" : "low";

    // Dominant tensions
    const dominantTensions = detectedWeighted
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.key);

    // ------------------------------------------------------------
    // BOARDROOM OUTPUT (non-fluffy)
    // ------------------------------------------------------------
    const insights = tensionDetected
      ? [
          `Spanning gedetecteerd via ${detectedWeighted.length} signaalgroepen + ${detectedSignalsUnique.length} keyword-hits.`,
          dominantTensions.length
            ? `Dominante spanningen: ${dominantTensions.join(", ")}.`
            : `Gedetecteerde keywords: ${detectedSignalsUnique.join(", ")}.`,
          `Intensiteitsscore (0-100): ${intensityScore}. Urgentie: ${urgency}.`,
          negationHit
            ? "Let op: tekst bevat ontkenningen van conflict/spanning; score is gedempt."
            : "Geen ontkennende conflict-taal gedetecteerd.",
        ]
      : [
          "Geen duidelijke spanningssignalen gedetecteerd.",
          "Dit duidt vaak op impliciete conflict-vermijding of onvoldoende explicitering van keuzeconflicten.",
          `Intensiteitsscore (0-100): ${intensityScore}. Urgentie: ${urgency}.`,
        ];

    const risks = tensionDetected
      ? [
          "Onuitgesproken spanning → besluitvorming vertraagt (stil veto).",
          "En-en formuleringen → scope creep en execution drift.",
          "Zonder expliciete keuzeconflict kan niemand ownership nemen over het verlies.",
        ]
      : ["Schijnbare harmonie kan het echte conflict maskeren (politiek/angst/ambigue doelen)."];

    const recommendations = tensionDetected
      ? [
          "Formuleer 1 niet-onderhandelbare keuzeconflict: wat wint en wat verliest.",
          "Maak 2-3 opties expliciet inclusief impact (tijd/kosten/risico).",
          "Wijs een DRI (decision responsible individual) toe + beslis-deadline.",
          "Kies de dominante prioriteit en communiceer de prijs (verlies) hardop.",
        ]
      : [
          "Forceer minimaal één A-of-B dilemma (geen en-en).",
          "Leg twee conflicterende doelen naast elkaar en benoem wat structureel botst.",
          "Wijs een DRI toe die het verlies durft te dragen en timebox het besluit.",
        ];

    const conflictSummary = tensionDetected
      ? `Strategische spanning aanwezig (score ${intensityScore}). Zonder expliciete keuzeconflict blijft executie driften.`
      : `Geen harde spanningssignalen (score ${intensityScore}). Grote kans op impliciet conflict: forceer een dilemma.`;

    // ------------------------------------------------------------
    // IMPORTANT: ModelResult.decision_signals only allows known props.
    // So we keep ONLY allowed keys there, and move extra signals to metadata.
    // ------------------------------------------------------------
    const result: ModelResult = {
      section: "power_conflict",
      model: "ConflictNode",

      insights,
      risks,
      opportunities: [],
      recommendations,

      confidence: this.confidence,

      decision_signals: {
        has_clear_decision: false,
        tradeoffs_identified:
          detectedSignalsUnique.includes("keuzeconflict") ||
          dominantTensions.includes("tradeoff") ||
          /\btrade[- ]?off\b/i.test(rawText) ||
          /\bten koste van\b/i.test(rawText),
        irreversible_choices_present: false,
        ownership_assigned: false,
        decision_urgency: urgency,
      },

      metadata: {
        lens: "conflict_detection",
        version: "2026.5",
        upgrade_policy: "add_only",

        // extra conflict signals (kept OUT of decision_signals for type safety)
        conflict_detected: tensionDetected && !negationHit,

        // backward compatible metric + REQUIRED alias
        tension_intensity_score: intensityScore,
        conflict_intensity_score_0_100: intensityScore,

        // original-style signals (kept)
        detected_signals: detectedSignalsUnique,

        // upgraded signals
        negation_hit: negationHit,
        dominant_tensions: dominantTensions,
        conflict_summary: conflictSummary,
        weighted_signals: detectedWeighted.map((x) => ({
          key: x.key,
          label: x.label,
          hits: x.hits,
          weight: x.weight,
          score: x.score,
        })),

        // debug-friendly (optional but useful)
        raw_score: rawScore,
        normalized_score: normalized,
        text_length: rawText.length,
      },
    };
    return normalizeConflictNodeResult(result);
    } catch (error) {
      return normalizeConflictNodeResult({
        section: "power_conflict",
        model: "ConflictNode",
        insights: [
          "Conflict-analyse is fail-safe teruggevallen om output-garantie te behouden.",
        ],
        risks: [
          "Conflict detectie kon niet volledig worden uitgevoerd; valideer keuzeconflicten handmatig.",
        ],
        opportunities: [],
        recommendations: [
          "Forceer een A-of-B keuze, wijs één eigenaar toe en zet een harde deadline.",
        ],
        confidence: 0.75,
        decision_signals: {
          has_clear_decision: false,
          tradeoffs_identified: false,
          irreversible_choices_present: false,
          ownership_assigned: false,
          decision_urgency: "medium",
        },
        metadata: {
          lens: "conflict_detection",
          version: "2026.5",
          upgrade_policy: "add_only",
          conflict_detected: false,
          tension_intensity_score: 0,
          conflict_intensity_score_0_100: 0,
          detected_signals: [],
          negation_hit: false,
          dominant_tensions: [],
          conflict_summary: "Fallback geactiveerd door runtime-exception.",
          weighted_signals: [],
          raw_score: 0,
          normalized_score: 0,
          text_length: 0,
          runtime_error:
            error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
