import { findMissing, isSuccess, missing, ok, type CalcOutput } from './types';

/** ИМТ = вес / рост² (рост в метрах) */
export function bodyMassIndex(weightKg: number | null, heightCm: number | null): CalcOutput {
  const lacking = findMissing({ weight: weightKg, height: heightCm });
  if (lacking.length > 0 || !weightKg || !heightCm) {
    return missing('bmi', lacking);
  }
  const heightM = heightCm / 100;
  return ok('bmi', weightKg / heightM ** 2, null);
}

/** FFMI = безжировая масса / рост² — «индекс мышечности», не зависит от жира */
export function fatFreeMassIndex(leanMass: CalcOutput, heightCm: number | null): CalcOutput {
  if (!isSuccess(leanMass)) {
    return { ...leanMass, method: 'ffmi' };
  }
  if (!heightCm || !(heightCm > 0)) {
    return missing('ffmi', ['height']);
  }
  const heightM = heightCm / 100;
  const margin = leanMass.errorMargin === null ? null : leanMass.errorMargin / heightM ** 2;
  return ok('ffmi', leanMass.value / heightM ** 2, margin);
}

/** Нормализованный FFMI = FFMI + 6,1 × (1,8 − рост_м): приводит к росту 180 см, чтобы сравнивать людей */
export function normalizedFatFreeMassIndex(ffmi: CalcOutput, heightCm: number | null): CalcOutput {
  if (!isSuccess(ffmi)) {
    return { ...ffmi, method: 'ffmiNormalized' };
  }
  if (!heightCm || !(heightCm > 0)) {
    return missing('ffmiNormalized', ['height']);
  }
  return ok('ffmiNormalized', ffmi.value + 6.1 * (1.8 - heightCm / 100), ffmi.errorMargin);
}
