import { findMissing, isSuccess, missing, ok, type CalcOutput, type Sex } from './types';

/** Безжировая масса из % жира: LBM = вес × (1 − BF/100). Погрешность — из погрешности % жира. */
export function leanMassFromBodyFat(weightKg: number, bodyFat: CalcOutput): CalcOutput {
  if (!isSuccess(bodyFat)) {
    return { ...bodyFat, method: 'fromBodyFat' };
  }
  const margin = bodyFat.errorMargin === null ? null : (weightKg * bodyFat.errorMargin) / 100;
  return ok('fromBodyFat', weightKg * (1 - bodyFat.value / 100), margin);
}

/** Жировая масса = вес − безжировая масса */
export function fatMassFromLeanMass(weightKg: number, leanMass: CalcOutput): CalcOutput {
  if (!isSuccess(leanMass)) {
    return leanMass;
  }
  return ok(leanMass.method, weightKg - leanMass.value, leanMass.errorMargin);
}

/** Безжировая масса по росту и весу — формула Boer (1984), когда % жира неизвестен. Грубая оценка. */
export function boerLeanMass({
  sex,
  weightKg,
  heightCm,
}: {
  sex: Sex | null;
  weightKg: number | null;
  heightCm: number | null;
}): CalcOutput {
  const lacking = findMissing({ sex, weight: weightKg, height: heightCm });
  if (lacking.length > 0 || !sex || !weightKg || !heightCm) {
    return missing('boer', lacking);
  }
  const lean = sex === 'male' ? 0.407 * weightKg + 0.267 * heightCm - 19.2 : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  return ok('boer', lean, null);
}
