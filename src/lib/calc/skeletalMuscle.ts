import { findMissing, invalid, missing, ok, type CalcOutput, type Sex } from './types';

/** Поправка на расу в формуле Lee. По умолчанию 0 — европеоидная. */
export const LEE_RACE_ADJUSTMENT = { caucasian: 0, asian: -2, africanAmerican: 1.1 } as const;

type LeeInput = {
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  /** Обхваты, см */
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  /** Складки на тех же местах, мм */
  tricepsMm: number | null;
  thighMm: number | null;
  calfMm: number | null;
  race?: number;
};

/** Обхват без подкожного жира: обхват − π × складка (складка в см) */
function correctedGirth(girthCm: number, skinfoldMm: number): number {
  return girthCm - Math.PI * (skinfoldMm / 10);
}

/**
 * Скелетная мышечная масса — Lee et al. (2000), погрешность около ±2,2 кг.
 * Проверена на людях без ожирения. Мышечная масса — не то же самое, что безжировая.
 */
export function leeSkeletalMuscle(input: LeeInput): CalcOutput {
  const { sex, age, heightCm, armCm, thighCm, calfCm, tricepsMm, thighMm, calfMm } = input;
  const lacking = findMissing({
    sex,
    age,
    height: heightCm,
    arm: armCm,
    thigh: thighCm,
    calf: calfCm,
    skinfoldTriceps: tricepsMm,
    skinfoldThigh: thighMm,
    skinfoldCalf: calfMm,
  });
  if (lacking.length > 0 || !sex || !age || !heightCm || !armCm || !thighCm || !calfCm || !tricepsMm || !thighMm || !calfMm) {
    return missing('lee', lacking);
  }

  const arm = correctedGirth(armCm, tricepsMm);
  const thigh = correctedGirth(thighCm, thighMm);
  const calf = correctedGirth(calfCm, calfMm);
  if (arm <= 0 || thigh <= 0 || calf <= 0) {
    return invalid('lee', 'correctedGirthNotPositive');
  }

  const heightM = heightCm / 100;
  const sexFactor = sex === 'male' ? 1 : 0;
  const race = input.race ?? LEE_RACE_ADJUSTMENT.caucasian;
  const muscle =
    heightM * (0.00744 * arm ** 2 + 0.00088 * thigh ** 2 + 0.00441 * calf ** 2) + 2.4 * sexFactor - 0.048 * age + race + 7.8;
  if (!Number.isFinite(muscle) || muscle <= 0) {
    return invalid('lee', 'implausibleResult');
  }
  return ok('lee', muscle, 2.2);
}
