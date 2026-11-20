import { parseBusinessConfigs } from '../businesses/businesses.service.js';
import consultorioConfig from '../businesses/configs/consultorio.json' with { type: 'json' };
import type { Classification } from '../classifier/classifier.service.js';
import {
  parseEvalCases,
  percentile,
  summarize,
  type EvalOutcome,
} from './metrics.js';

const consultorio = [...parseBusinessConfigs([consultorioConfig]).values()][0];

function outcome(
  expected: { category: string; needsHuman: boolean },
  result: Partial<Classification>,
): EvalOutcome {
  return {
    expected: { text: 'Hola', ...expected },
    result: {
      category: expected.category,
      priority: 'normal',
      extracted: {},
      suggestedReply: null,
      needsHuman: expected.needsHuman,
      confidence: 1,
      model: 'test-model',
      latencyMs: 100,
      ...result,
    },
  };
}

describe('parseEvalCases', () => {
  it('parses each non-blank line', () => {
    const jsonl = [
      '{"text":"Cancelen mi turno","category":"cancel-appointment","needsHuman":true}',
      '',
      '  {"text":"Gracias","category":"general","needsHuman":false}  ',
    ].join('\n');

    expect(parseEvalCases(jsonl, consultorio)).toEqual([
      {
        text: 'Cancelen mi turno',
        category: 'cancel-appointment',
        needsHuman: true,
      },
      { text: 'Gracias', category: 'general', needsHuman: false },
    ]);
  });

  it('names the line that is not JSON', () => {
    const jsonl =
      '{"text":"Hola","category":"general","needsHuman":false}\n{oops';

    expect(() => parseEvalCases(jsonl, consultorio)).toThrow(
      'Line 2: not valid JSON',
    );
  });

  it('rejects a case without its label', () => {
    expect(() =>
      parseEvalCases('{"text":"Hola","category":"general"}', consultorio),
    ).toThrow(/Line 1: .*needsHuman/s);
  });

  it('rejects a category the business does not have', () => {
    expect(() =>
      parseEvalCases(
        '{"text":"Hola","category":"refund","needsHuman":true}',
        consultorio,
      ),
    ).toThrow('Line 1: unknown category "refund" for business "consultorio"');
  });
});

describe('percentile', () => {
  it('uses the nearest rank', () => {
    const values = Array.from({ length: 20 }, (_, i) => 20 - i);

    expect(percentile(values, 95)).toBe(19);
    expect(percentile(values, 50)).toBe(10);
  });

  it('returns the only value of a single-element list', () => {
    expect(percentile([42], 95)).toBe(42);
  });

  it('rejects an empty list', () => {
    expect(() => percentile([], 95)).toThrow('empty list');
  });
});

describe('summarize', () => {
  it('reports accuracy, needsHuman accuracy, fallbacks, latency and per-category hits', () => {
    const report = summarize([
      outcome({ category: 'crisis', needsHuman: true }, { latencyMs: 100 }),
      outcome(
        { category: 'crisis', needsHuman: true },
        { category: 'general', latencyMs: 200 },
      ),
      outcome(
        { category: 'general', needsHuman: false },
        { needsHuman: true, latencyMs: 300 },
      ),
      outcome(
        { category: 'billing', needsHuman: true },
        { category: null, model: null, latencyMs: 400 },
      ),
    ]);

    expect(report).toEqual({
      total: 4,
      accuracy: 0.5,
      answeredAccuracy: 2 / 3,
      needsHumanAccuracy: 0.75,
      fallbacks: 1,
      avgLatencyMs: 250,
      p95LatencyMs: 400,
      byCategory: {
        crisis: { total: 2, correct: 1 },
        general: { total: 1, correct: 1 },
        billing: { total: 1, correct: 0 },
      },
    });
  });

  it('has no answered accuracy when every message fell back', () => {
    const report = summarize([
      outcome({ category: 'crisis', needsHuman: true }, { category: null }),
    ]);

    expect(report).toMatchObject({
      accuracy: 0,
      answeredAccuracy: null,
      fallbacks: 1,
    });
  });

  it('rejects an empty run', () => {
    expect(() => summarize([])).toThrow('empty eval run');
  });
});
