// Сравнение двух любых замеров подопечного: «было → стало» по всем показателям.

import type { Client, Measurement } from '@/db/schema';

import { isSuccess } from './calc/types';
import { compositionFor } from './measurements';
import { progressMetrics, type ProgressMetric } from './progress';

export type CompareRow = ProgressMetric & { from: number | null; to: number | null; delta: number | null };

export type Comparison = {
  older: Measurement;
  newer: Measurement;
  /** Каким методом посчитан % жира в обоих замерах */
  method: 'jp3' | 'navy' | null;
  rows: CompareRow[];
};

/**
 * Замеры упорядочиваются по дате. % жира и массы от него в обоих — одним методом (как у более
 * нового замера), иначе разница показала бы смену метода, а не изменение тела.
 * Показатели, которых нет ни в одном замере, не попадают в список; с разницей — первыми.
 */
export function compareMeasurements(
  a: Measurement,
  b: Measurement,
  client: Pick<Client, 'gender' | 'birthDate'>,
): Comparison {
  const [older, newer] = a.date < b.date || (a.date === b.date && a.createdAt <= b.createdAt) ? [a, b] : [b, a];
  const newerComposition = compositionFor(newer, client);
  const method = isSuccess(newerComposition.bodyFat) ? (newerComposition.bodyFat.method === 'jp3' ? 'jp3' : 'navy') : null;

  const valueOf = (m: Measurement, metric: ProgressMetric['id']): number | null => {
    const composition = m === newer ? newerComposition : compositionFor(m, client);
    switch (metric) {
      case 'weight':
        return m.weight;
      case 'bodyFat':
      case 'fatMass':
      case 'leanMass': {
        const bodyFat = method ? composition.bodyFatByMethod[method] : null;
        if (!bodyFat || !isSuccess(bodyFat)) {
          return null;
        }
        const fatMass = (m.weight * bodyFat.value) / 100;
        return metric === 'bodyFat' ? bodyFat.value : metric === 'fatMass' ? fatMass : m.weight - fatMass;
      }
      case 'skeletalMuscle':
      case 'bmi':
        return composition[metric].value;
      default:
        return m[metric];
    }
  };

  const rows = progressMetrics
    .map((metric) => {
      const from = valueOf(older, metric.id);
      const to = valueOf(newer, metric.id);
      return { ...metric, from, to, delta: from !== null && to !== null ? to - from : null };
    })
    .filter((row) => row.from !== null || row.to !== null)
    // Сначала то, что есть в обоих замерах: по ним видна разница
    .sort((x, y) => Number(y.delta !== null) - Number(x.delta !== null));

  return { older, newer, method, rows };
}
