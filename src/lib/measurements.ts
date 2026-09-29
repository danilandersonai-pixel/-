import type { Client, Measurement } from '@/db/schema';
import { ageOn } from '@/utils/date';

import {
  calculateComposition,
  compositionDelta,
  type BodyMeasurements,
  type Composition,
  type Person,
} from './calc/composition';

/** Пол и возраст на дату замера — возраст именно на тот день, а не сегодняшний */
export function personOnDate(client: Pick<Client, 'gender' | 'birthDate'>, dateIso: string): Person {
  return {
    sex: client.gender,
    age: client.birthDate ? ageOn(client.birthDate, dateIso) : null,
  };
}

export function toBodyMeasurements(m: Measurement): BodyMeasurements {
  return {
    weight: m.weight,
    height: m.height,
    neck: m.neck,
    waist: m.waist,
    hips: m.hips,
    arm: m.arm,
    thigh: m.thigh,
    calf: m.calf,
    skinfoldChest: m.skinfoldChest,
    skinfoldAbdomen: m.skinfoldAbdomen,
    skinfoldThigh: m.skinfoldThigh,
    skinfoldTriceps: m.skinfoldTriceps,
    skinfoldSuprailiac: m.skinfoldSuprailiac,
    skinfoldCalf: m.skinfoldCalf,
  };
}

export function compositionFor(m: Measurement, client: Pick<Client, 'gender' | 'birthDate'>): Composition {
  return calculateComposition(toBodyMeasurements(m), personOnDate(client, m.date));
}

/** Замеры по подопечным. Порядок внутри группы сохраняется (новые сверху). */
export function groupByClient(measurements: Measurement[]): Map<string, Measurement[]> {
  const groups = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const group = groups.get(m.clientId) ?? [];
    group.push(m);
    groups.set(m.clientId, group);
  }
  return groups;
}

export type BodyFatTrend = { value: number; delta: number | null };

/**
 * Последний посчитанный % жира и изменение к предыдущему замеру (замеры — новые сверху).
 * Изменение — только если прошлый замер посчитан тем же методом.
 */
export function bodyFatTrend(
  measurements: Measurement[],
  client: Pick<Client, 'gender' | 'birthDate'>,
): BodyFatTrend | null {
  const compositions = measurements.map((m) => compositionFor(m, client));
  const latestIndex = compositions.findIndex((composition) => composition.bodyFat.value !== null);
  if (latestIndex < 0) {
    return null;
  }
  const latest = compositions[latestIndex];
  const previous = compositions.slice(latestIndex + 1).find((composition) => composition.bodyFat.value !== null);
  return { value: latest.bodyFat.value ?? 0, delta: compositionDelta('bodyFat', latest, previous) };
}
