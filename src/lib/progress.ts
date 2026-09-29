import type { Client, Measurement } from '@/db/schema';

import { isSuccess } from './calc/types';
import { compositionFor } from './measurements';

export type ProgressMetricId =
  | 'weight'
  | 'bodyFat'
  | 'fatMass'
  | 'leanMass'
  | 'skeletalMuscle'
  | 'bmi'
  | 'waist'
  | 'hips'
  | 'chest'
  | 'neck'
  | 'arm'
  | 'thigh'
  | 'calf';

export type ProgressMetric = {
  id: ProgressMetricId;
  unit: 'kg' | 'cm' | 'percent' | 'none';
  /** Что считается улучшением */
  direction: 'up' | 'down' | 'neutral';
};

export const progressMetrics: readonly ProgressMetric[] = [
  { id: 'weight', unit: 'kg', direction: 'neutral' },
  { id: 'bodyFat', unit: 'percent', direction: 'down' },
  { id: 'fatMass', unit: 'kg', direction: 'down' },
  { id: 'leanMass', unit: 'kg', direction: 'up' },
  { id: 'skeletalMuscle', unit: 'kg', direction: 'up' },
  { id: 'bmi', unit: 'none', direction: 'neutral' },
  { id: 'waist', unit: 'cm', direction: 'neutral' },
  { id: 'hips', unit: 'cm', direction: 'neutral' },
  { id: 'chest', unit: 'cm', direction: 'neutral' },
  { id: 'neck', unit: 'cm', direction: 'neutral' },
  { id: 'arm', unit: 'cm', direction: 'neutral' },
  { id: 'thigh', unit: 'cm', direction: 'neutral' },
  { id: 'calf', unit: 'cm', direction: 'neutral' },
];

export type ProgressPoint = { date: string; value: number };

export type ProgressSeries = {
  points: ProgressPoint[];
  /** Для % жира и масс от него — каким методом посчитаны все точки */
  method: 'jp3' | 'navy' | null;
};

/**
 * Ряд значений для графика, от старых к новым (замеры приходят новыми сверху).
 * % жира и массы от него считаем одним методом — тем, которым посчитан последний замер,
 * иначе на графике будут скачки из-за смены метода, а не из-за тела.
 */
export function progressSeries(
  measurements: Measurement[],
  client: Pick<Client, 'gender' | 'birthDate'>,
  metric: ProgressMetricId,
): ProgressSeries {
  const oldestFirst = [...measurements].reverse();
  const compositions = oldestFirst.map((m) => compositionFor(m, client));

  let method: ProgressSeries['method'] = null;
  if (metric === 'bodyFat' || metric === 'fatMass' || metric === 'leanMass') {
    const latest = [...compositions].reverse().find((c) => isSuccess(c.bodyFat));
    method = latest ? (latest.bodyFat.method === 'jp3' ? 'jp3' : 'navy') : null;
  }

  const points: ProgressPoint[] = [];
  oldestFirst.forEach((m, index) => {
    const composition = compositions[index];
    let value: number | null = null;
    if (metric === 'weight') {
      value = m.weight;
    } else if (metric === 'bodyFat' || metric === 'fatMass' || metric === 'leanMass') {
      const bodyFat = method ? composition.bodyFatByMethod[method] : null;
      if (bodyFat && isSuccess(bodyFat)) {
        const fatMass = (m.weight * bodyFat.value) / 100;
        value = metric === 'bodyFat' ? bodyFat.value : metric === 'fatMass' ? fatMass : m.weight - fatMass;
      }
    } else if (metric === 'skeletalMuscle' || metric === 'bmi') {
      value = composition[metric].value;
    } else {
      value = m[metric];
    }
    if (value !== null) {
      points.push({ date: m.date, value });
    }
  });

  return { points, method };
}

/** Круглый шаг шкалы: 1, 2, 2,5 или 5 × 10ⁿ */
function niceStep(rough: number): number {
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/**
 * Шкала оси Y с круглыми делениями вокруг данных: от `min` с шагом `step`, `sections` делений.
 * Ось не обязана начинаться с нуля — для веса 70–72 кг ноль сделал бы линию плоской.
 */
export function niceScale(values: number[], sectionsWanted = 4): { min: number; step: number; sections: number } {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || Math.max(Math.abs(high) * 0.05, 1);
  const step = niceStep(span / sectionsWanted);
  // Для положительных данных ось не уходит ниже нуля
  const min = Math.max(Math.floor((low - span * 0.1) / step) * step, low >= 0 ? 0 : -Infinity);
  const max = Math.ceil((high + span * 0.1) / step) * step;
  return { min, step, sections: Math.max(1, Math.round((max - min) / step)) };
}
