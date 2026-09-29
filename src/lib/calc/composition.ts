import { jacksonPollock3, navyBodyFat } from './bodyFat';
import { bodyMassIndex, fatFreeMassIndex, normalizedFatFreeMassIndex } from './indices';
import { boerLeanMass, fatMassFromLeanMass, leanMassFromBodyFat } from './mass';
import { leeSkeletalMuscle } from './skeletalMuscle';
import { isSuccess, type CalcOutput, type Sex } from './types';

/** Замер в единицах приложения. null — не измеряли. */
export type BodyMeasurements = {
  weight: number;
  height: number | null;
  neck: number | null;
  waist: number | null;
  hips: number | null;
  arm: number | null;
  thigh: number | null;
  calf: number | null;
  skinfoldChest: number | null;
  skinfoldAbdomen: number | null;
  skinfoldThigh: number | null;
  skinfoldTriceps: number | null;
  skinfoldSuprailiac: number | null;
  skinfoldCalf: number | null;
};

export type Person = {
  sex: Sex | null;
  /** Возраст на дату замера */
  age: number | null;
};

export type Composition = {
  /** Основной % жира: по складкам, если они есть, иначе по обхватам */
  bodyFat: CalcOutput;
  /** Оба метода — чтобы показать, почему выбран основной и чем они отличаются */
  bodyFatByMethod: { jp3: CalcOutput; navy: CalcOutput };
  fatMass: CalcOutput;
  leanMass: CalcOutput;
  skeletalMuscle: CalcOutput;
  bmi: CalcOutput;
  ffmi: CalcOutput;
  ffmiNormalized: CalcOutput;
};

/** Все расчёты по одному замеру. В базе не храним — считаем при показе. */
export function calculateComposition(m: BodyMeasurements, person: Person): Composition {
  const jp3 = jacksonPollock3({
    sex: person.sex,
    age: person.age,
    skinfolds: {
      chest: m.skinfoldChest,
      abdomen: m.skinfoldAbdomen,
      thigh: m.skinfoldThigh,
      triceps: m.skinfoldTriceps,
      suprailiac: m.skinfoldSuprailiac,
    },
  });
  const navy = navyBodyFat({ sex: person.sex, heightCm: m.height, neckCm: m.neck, waistCm: m.waist, hipsCm: m.hips });
  const bodyFat = isSuccess(jp3) || (!isSuccess(navy) && hasAnySkinfold(m)) ? jp3 : navy;

  const leanMass = isSuccess(bodyFat)
    ? leanMassFromBodyFat(m.weight, bodyFat)
    : boerLeanMass({ sex: person.sex, weightKg: m.weight, heightCm: m.height });
  const ffmi = fatFreeMassIndex(leanMass, m.height);

  return {
    bodyFat,
    bodyFatByMethod: { jp3, navy },
    fatMass: fatMassFromLeanMass(m.weight, leanMass),
    leanMass,
    skeletalMuscle: leeSkeletalMuscle({
      sex: person.sex,
      age: person.age,
      heightCm: m.height,
      armCm: m.arm,
      thighCm: m.thigh,
      calfCm: m.calf,
      tricepsMm: m.skinfoldTriceps,
      thighMm: m.skinfoldThigh,
      calfMm: m.skinfoldCalf,
    }),
    bmi: bodyMassIndex(m.weight, m.height),
    ffmi,
    ffmiNormalized: normalizedFatFreeMassIndex(ffmi, m.height),
  };
}

/** Тренер начал мерить складки — тогда подсказываем, каких не хватает для точного метода */
function hasAnySkinfold(m: BodyMeasurements): boolean {
  return [m.skinfoldChest, m.skinfoldAbdomen, m.skinfoldThigh, m.skinfoldTriceps, m.skinfoldSuprailiac].some(
    (value) => value !== null,
  );
}

export type CompositionMetric = keyof Omit<Composition, 'bodyFatByMethod'> | 'weight';

/** Изменение к прошлому замеру: null — одного из значений нет */
export function metricDelta(current: CalcOutput, previous: CalcOutput | undefined): number | null {
  if (!previous || !isSuccess(current) || !isSuccess(previous)) {
    return null;
  }
  return current.value - previous.value;
}

/** Показатели, которые считаются от % жира: их нельзя сравнивать между разными методами */
const dependsOnBodyFat = new Set<CompositionMetric>(['bodyFat', 'fatMass', 'leanMass', 'ffmi', 'ffmiNormalized']);

/**
 * Изменение показателя между двумя замерами. Процент жира по складкам и по обхватам
 * отличается на несколько процентов, поэтому показатели от % жира сравниваем
 * только посчитанные одним методом. % жира берём тем же методом из прошлого замера, если он там есть.
 */
export function compositionDelta(
  metric: Exclude<CompositionMetric, 'weight'>,
  current: Composition,
  previous: Composition | undefined,
): number | null {
  if (!previous) {
    return null;
  }
  if (metric === 'bodyFat') {
    const method = current.bodyFat.method === 'jp3' ? 'jp3' : 'navy';
    return metricDelta(current.bodyFat, previous.bodyFatByMethod[method]);
  }
  if (dependsOnBodyFat.has(metric) && current.leanMass.method !== previous.leanMass.method) {
    return null;
  }
  if (dependsOnBodyFat.has(metric) && current.bodyFat.method !== previous.bodyFat.method) {
    return null;
  }
  return metricDelta(current[metric], previous[metric]);
}

/** Что считается улучшением: 'down' — хорошо, когда уменьшается; 'neutral' — зависит от цели */
export const metricDirection: Record<CompositionMetric, 'up' | 'down' | 'neutral'> = {
  weight: 'neutral',
  bodyFat: 'down',
  fatMass: 'down',
  leanMass: 'up',
  skeletalMuscle: 'up',
  bmi: 'neutral',
  ffmi: 'up',
  ffmiNormalized: 'up',
};
