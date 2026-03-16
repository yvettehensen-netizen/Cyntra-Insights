export type ReasoningBucket = {
  entries: string[];
};

export type ReasoningState = {
  context_state: ReasoningBucket;
  diagnosis: ReasoningBucket;
  mechanisms: ReasoningBucket;
  strategic_tension: ReasoningBucket;
  strategic_options: ReasoningBucket;
  insights: ReasoningBucket;
  decision: ReasoningBucket;
  narrative: ReasoningBucket;
};

export type ReasoningStatePatch = Partial<{
  context_state: string | string[];
  diagnosis: string | string[];
  mechanisms: string | string[];
  strategic_tension: string | string[];
  strategic_options: string | string[];
  insights: string | string[];
  decision: string | string[];
  narrative: string | string[];
}>;

function toEntries(value: string | string[] | undefined): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  return [];
}

function appendUnique(target: string[], values: string[]) {
  const seen = new Set(target);
  for (const value of values) {
    if (!seen.has(value)) {
      target.push(value);
      seen.add(value);
    }
  }
}

export function createReasoningState(): ReasoningState {
  return {
    context_state: { entries: [] },
    diagnosis: { entries: [] },
    mechanisms: { entries: [] },
    strategic_tension: { entries: [] },
    strategic_options: { entries: [] },
    insights: { entries: [] },
    decision: { entries: [] },
    narrative: { entries: [] },
  };
}

export function extendReasoningState(
  state: ReasoningState,
  patch: ReasoningStatePatch
): ReasoningState {
  appendUnique(state.context_state.entries, toEntries(patch.context_state));
  appendUnique(state.diagnosis.entries, toEntries(patch.diagnosis));
  appendUnique(state.mechanisms.entries, toEntries(patch.mechanisms));
  appendUnique(state.strategic_tension.entries, toEntries(patch.strategic_tension));
  appendUnique(state.strategic_options.entries, toEntries(patch.strategic_options));
  appendUnique(state.insights.entries, toEntries(patch.insights));
  appendUnique(state.decision.entries, toEntries(patch.decision));
  appendUnique(state.narrative.entries, toEntries(patch.narrative));
  return state;
}
