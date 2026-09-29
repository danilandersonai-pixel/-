// Тексты рекордов, которые собираются из чисел: «70 кг × 3», «1ПМ ≈ 86,7 кг».

import type { BestSet, ExerciseRecord } from '@/lib/records';
import { fill, formatMeasure } from '@/utils/format';

import { ru } from './ru';

const t = ru.records;

export function setText(set: Pick<BestSet, 'weight' | 'reps'>): string {
  return fill(t.set, { weight: formatMeasure(set.weight), reps: set.reps });
}

/** Главное про упражнение одной строкой: лучший подход и расчётный максимум */
export function recordSummary(record: ExerciseRecord): string {
  if (record.bestSet) {
    const parts = [fill(t.bestLine, { set: setText(record.bestSet) })];
    if (record.bestEstimate) {
      parts.push(fill(t.estimateLine, { value: formatMeasure(record.bestEstimate.value) }));
    }
    return parts.join(' · ');
  }
  if (record.maxReps) {
    return fill(t.bestLine, { set: fill(t.repsOnly, { reps: record.maxReps.reps }) });
  }
  return t.noSets;
}
