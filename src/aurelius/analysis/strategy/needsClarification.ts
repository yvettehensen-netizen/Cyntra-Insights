import type { ClarificationQuestion } from '../core/types';

export type StrategyInputContext = {
  companyName?: string;
  situation?: string;
  goals?: string;
  market?: string;
  revenueModel?: string;
};

export function needsStrategyClarification(
  input: StrategyInputContext
): { ok: true } | { ok: false; questions: ClarificationQuestion[] } {
  const questions: ClarificationQuestion[] = [];

  if (!input.goals?.trim()) {
    questions.push({
      id: 'goals',
      question: 'Wat is het primaire strategische doel?',
      required: true,
      type: 'text',
    });
  }

  if (!input.market?.trim()) {
    questions.push({
      id: 'market',
      question: 'In welke markt opereert de organisatie?',
      required: true,
      type: 'text',
    });
  }

  if (!input.revenueModel?.trim()) {
    questions.push({
      id: 'revenue',
      question: 'Wat is het dominante verdienmodel?',
      required: true,
      type: 'text',
    });
  }

  return questions.length === 0
    ? { ok: true }
    : { ok: false, questions };
}
