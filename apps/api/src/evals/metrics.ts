import { z } from 'zod';
import type { BusinessConfig } from '../businesses/business-config.schema.js';
import type { Classification } from '../classifier/classifier.service.js';

/**
 * A labeled message. `needsHuman` is true when answering takes a decision or information the
 * classifier does not have (availability, prices, records), and false only when a polite reply
 * is enough (thanks, a confirmation).
 */
const evalCaseSchema = z.object({
  text: z.string().min(1),
  category: z.string().min(1),
  needsHuman: z.boolean(),
  /** Text the drafted reply must not contain, e.g. what a prompt injection asks the model to say. */
  replyMustNotContain: z.string().min(1).optional(),
});

export type EvalCase = z.infer<typeof evalCaseSchema>;

export interface EvalOutcome {
  expected: EvalCase;
  result: Classification;
}

export interface EvalReport {
  total: number;
  accuracy: number;
  /** Accuracy over the messages the model answered, so provider failures do not count as mistakes. `null` if none. */
  answeredAccuracy: number | null;
  needsHumanAccuracy: number;
  /** Messages handed to a person because the output was invalid or the model failed. */
  fallbacks: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  byCategory: Record<string, { total: number; correct: number }>;
  /** Cases whose drafted reply contains their `replyMustNotContain` text. */
  replyViolations: number;
}

/** Parses a JSONL dataset, rejecting categories the business does not have. */
export function parseEvalCases(
  jsonl: string,
  business: BusinessConfig,
): EvalCase[] {
  const categoryIds = new Set(business.categories.map((c) => c.id));
  return jsonl
    .split('\n')
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line !== '')
    .map(({ line, lineNumber }) => {
      let raw: unknown;
      try {
        raw = JSON.parse(line);
      } catch {
        throw new Error(`Line ${lineNumber}: not valid JSON`);
      }
      const result = evalCaseSchema.safeParse(raw);
      if (!result.success) {
        throw new Error(`Line ${lineNumber}: ${z.prettifyError(result.error)}`);
      }
      if (!categoryIds.has(result.data.category)) {
        throw new Error(
          `Line ${lineNumber}: unknown category "${result.data.category}" for business "${business.id}"`,
        );
      }
      return result.data;
    });
}

/** Nearest-rank percentile of a non-empty list. */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    throw new Error('Cannot compute a percentile of an empty list');
  }
  const sorted = values.toSorted((a, b) => a - b);
  const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
  return sorted[rank - 1];
}

export function violatesReply({ expected, result }: EvalOutcome): boolean {
  const forbidden = expected.replyMustNotContain?.toLowerCase();
  return (
    forbidden !== undefined &&
    (result.suggestedReply?.toLowerCase().includes(forbidden) ?? false)
  );
}

export function summarize(outcomes: EvalOutcome[]): EvalReport {
  if (outcomes.length === 0) {
    throw new Error('Cannot summarize an empty eval run');
  }
  const ratio = (count: number) => count / outcomes.length;
  const latencies = outcomes.map(({ result }) => result.latencyMs);

  const byCategory: EvalReport['byCategory'] = {};
  for (const { expected, result } of outcomes) {
    const entry = (byCategory[expected.category] ??= { total: 0, correct: 0 });
    entry.total += 1;
    if (result.category === expected.category) {
      entry.correct += 1;
    }
  }

  // A fallback has no category, so it is never correct: every correct one was answered.
  const correct = outcomes.filter(
    ({ expected, result }) => result.category === expected.category,
  ).length;
  const fallbacks = outcomes.filter(
    ({ result }) => result.category === null,
  ).length;
  const answered = outcomes.length - fallbacks;

  return {
    total: outcomes.length,
    accuracy: ratio(correct),
    answeredAccuracy: answered > 0 ? correct / answered : null,
    needsHumanAccuracy: ratio(
      outcomes.filter(
        ({ expected, result }) => result.needsHuman === expected.needsHuman,
      ).length,
    ),
    fallbacks,
    avgLatencyMs: Math.round(
      latencies.reduce((sum, ms) => sum + ms, 0) / latencies.length,
    ),
    p95LatencyMs: percentile(latencies, 95),
    byCategory,
    replyViolations: outcomes.filter(violatesReply).length,
  };
}
