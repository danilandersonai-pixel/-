import { findMissing, invalid, missing, ok, type CalcOutput, type Sex } from './types';

/** Правдоподобный диапазон % жира. Всё, что вне его, — почти наверняка ошибка замера. */
const MIN_BODY_FAT = 2;
const MAX_BODY_FAT = 70;

function checkPlausible(method: 'navy' | 'jp3', bodyFat: number, errorMargin: number): CalcOutput {
  if (!Number.isFinite(bodyFat) || bodyFat < MIN_BODY_FAT || bodyFat > MAX_BODY_FAT) {
    return invalid(method, 'implausibleResult');
  }
  return ok(method, bodyFat, errorMargin);
}

type NavyInput = {
  sex: Sex | null;
  heightCm: number | null;
  neckCm: number | null;
  waistCm: number | null;
  /** Нужны только женщинам */
  hipsCm: number | null;
};

/**
 * % жира по обхватам — метод ВМС США (Hodgdon–Beckett, 1984). Погрешность ±3–4 %.
 * У очень мускулистых людей завышает результат.
 */
export function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipsCm }: NavyInput): CalcOutput {
  const lacking = findMissing({
    sex,
    height: heightCm,
    neck: neckCm,
    waist: waistCm,
    ...(sex === 'female' ? { hips: hipsCm } : {}),
  });
  if (lacking.length > 0 || !sex || !heightCm || !neckCm || !waistCm) {
    return missing('navy', lacking);
  }

  if (sex === 'male') {
    if (waistCm <= neckCm) {
      return invalid('navy', 'waistNotAboveNeck');
    }
    const bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
    return checkPlausible('navy', bodyFat, 4);
  }

  const hips = hipsCm ?? 0;
  if (waistCm + hips <= neckCm) {
    return invalid('navy', 'waistNotAboveNeck');
  }
  const bodyFat =
    495 / (1.29579 - 0.35004 * Math.log10(waistCm + hips - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  return checkPlausible('navy', bodyFat, 4);
}

export type Skinfolds = {
  chest: number | null;
  abdomen: number | null;
  thigh: number | null;
  triceps: number | null;
  suprailiac: number | null;
};

/** Плотность тела по Jackson–Pollock (3 точки). sum — сумма складок, мм. */
export function jacksonPollockDensity(sex: Sex, sum: number, age: number): number {
  if (sex === 'male') {
    return 1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * age;
  }
  return 1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * age;
}

/** Формула Siri: % жира из плотности тела */
export function siriBodyFat(density: number): number {
  return 495 / density - 450;
}

/**
 * % жира по складкам — Jackson–Pollock, 3 точки + формула Siri. Погрешность около ±3,5 %.
 * Мужчины: грудь, живот, бедро. Женщины: трицепс, над подвздошной костью, бедро.
 */
export function jacksonPollock3({
  sex,
  age,
  skinfolds,
}: {
  sex: Sex | null;
  age: number | null;
  skinfolds: Skinfolds;
}): CalcOutput {
  const sites =
    sex === 'female'
      ? { skinfoldTriceps: skinfolds.triceps, skinfoldSuprailiac: skinfolds.suprailiac, skinfoldThigh: skinfolds.thigh }
      : { skinfoldChest: skinfolds.chest, skinfoldAbdomen: skinfolds.abdomen, skinfoldThigh: skinfolds.thigh };
  const lacking = findMissing({ sex, age, ...sites });
  if (lacking.length > 0 || !sex || !age) {
    return missing('jp3', lacking);
  }
  const sum = Object.values(sites).reduce<number>((total, value) => total + (value ?? 0), 0);
  return checkPlausible('jp3', siriBodyFat(jacksonPollockDensity(sex, sum, age)), 3.5);
}
