// Контрольные примеры из CLAUDE.md: результат должен совпадать с точностью до 0,1.

import { jacksonPollock3, jacksonPollockDensity, navyBodyFat, siriBodyFat } from './bodyFat';
import { calculateComposition, compositionDelta, metricDelta, type BodyMeasurements } from './composition';
import { bodyMassIndex, fatFreeMassIndex, normalizedFatFreeMassIndex } from './indices';
import { boerLeanMass, fatMassFromLeanMass, leanMassFromBodyFat } from './mass';
import { leeSkeletalMuscle } from './skeletalMuscle';
import { ok, type CalcOutput } from './types';

function valueOf(output: CalcOutput): number {
  if (output.value === null) {
    throw new Error(`Не посчиталось: ${JSON.stringify(output.problem)}`);
  }
  return output.value;
}

const noSkinfolds = { chest: null, abdomen: null, thigh: null, triceps: null, suprailiac: null };

describe('контрольные примеры', () => {
  it('ВМС, мужчина: рост 175, шея 38, талия 86 → 17,7 %', () => {
    const result = navyBodyFat({ sex: 'male', heightCm: 175, neckCm: 38, waistCm: 86, hipsCm: null });
    expect(valueOf(result)).toBeCloseTo(17.7, 1);
    expect(result).toMatchObject({ method: 'navy', errorMargin: 4 });
  });

  it('ВМС, женщина: рост 165, шея 33, талия 75, бёдра 100 → 29,4 %', () => {
    const result = navyBodyFat({ sex: 'female', heightCm: 165, neckCm: 33, waistCm: 75, hipsCm: 100 });
    expect(valueOf(result)).toBeCloseTo(29.4, 1);
  });

  it('JP3, мужчина: сумма 60, 30 лет → D 1,0578, 17,9 %', () => {
    const density = jacksonPollockDensity('male', 60, 30);
    expect(density).toBeCloseTo(1.0578, 4);
    expect(siriBodyFat(density)).toBeCloseTo(17.9, 1);
    const result = jacksonPollock3({ sex: 'male', age: 30, skinfolds: { ...noSkinfolds, chest: 20, abdomen: 25, thigh: 15 } });
    expect(valueOf(result)).toBeCloseTo(17.9, 1);
    expect(result).toMatchObject({ method: 'jp3', errorMargin: 3.5 });
  });

  it('JP3, женщина: сумма 70, 30 лет → D 1,0371, 27,3 %', () => {
    const density = jacksonPollockDensity('female', 70, 30);
    expect(density).toBeCloseTo(1.0371, 4);
    const result = jacksonPollock3({
      sex: 'female',
      age: 30,
      skinfolds: { ...noSkinfolds, triceps: 20, suprailiac: 25, thigh: 25 },
    });
    expect(valueOf(result)).toBeCloseTo(27.3, 1);
  });

  it('Boer: мужчина 70 кг / 175 см → 56,0 кг, женщина 60 кг / 165 см → 44,9 кг', () => {
    expect(valueOf(boerLeanMass({ sex: 'male', weightKg: 70, heightCm: 175 }))).toBeCloseTo(56.0, 1);
    expect(valueOf(boerLeanMass({ sex: 'female', weightKg: 60, heightCm: 165 }))).toBeCloseTo(44.9, 1);
  });

  it('LBM из % жира: 70 кг, 17,7 % → 57,6 кг', () => {
    const lean = leanMassFromBodyFat(70, ok('navy', 17.7, 4));
    expect(valueOf(lean)).toBeCloseTo(57.6, 1);
    expect(valueOf(fatMassFromLeanMass(70, lean))).toBeCloseTo(12.4, 1);
    // погрешность переходит из % жира: 70 × 4 % = 2,8 кг
    expect(lean).toMatchObject({ errorMargin: 2.8 });
  });

  it('ИМТ и FFMI: 70 кг, 1,75 м, LBM 57,61 → 22,9 / 18,8 / норм. 19,1', () => {
    expect(valueOf(bodyMassIndex(70, 175))).toBeCloseTo(22.9, 1);
    const ffmi = fatFreeMassIndex(ok('fromBodyFat', 57.61, null), 175);
    expect(valueOf(ffmi)).toBeCloseTo(18.8, 1);
    expect(valueOf(normalizedFatFreeMassIndex(ffmi, 175))).toBeCloseTo(19.1, 1);
  });

  it('Lee, мужчина: 1,75 м, 30 лет; плечо 32/10, бедро 55/15, голень 38/8 → 33,2 кг', () => {
    const result = leeSkeletalMuscle({
      sex: 'male',
      age: 30,
      heightCm: 175,
      armCm: 32,
      tricepsMm: 10,
      thighCm: 55,
      thighMm: 15,
      calfCm: 38,
      calfMm: 8,
    });
    expect(valueOf(result)).toBeCloseTo(33.2, 1);
  });
});

describe('нехватка и ошибки данных — null с причиной, а не NaN', () => {
  it('без пола и роста ВМС сообщает, чего не хватает', () => {
    const result = navyBodyFat({ sex: null, heightCm: null, neckCm: 38, waistCm: 86, hipsCm: null });
    expect(result.value).toBeNull();
    expect(result).toMatchObject({ problem: { kind: 'missing', inputs: ['sex', 'height'] } });
  });

  it('женщинам для ВМС нужны бёдра', () => {
    const result = navyBodyFat({ sex: 'female', heightCm: 165, neckCm: 33, waistCm: 75, hipsCm: null });
    expect(result).toMatchObject({ value: null, problem: { kind: 'missing', inputs: ['hips'] } });
  });

  it('талия не больше шеи — невозможные данные', () => {
    const result = navyBodyFat({ sex: 'male', heightCm: 175, neckCm: 40, waistCm: 38, hipsCm: null });
    expect(result).toMatchObject({ value: null, problem: { kind: 'invalid', code: 'waistNotAboveNeck' } });
  });

  it('JP3 без возраста и одной складки', () => {
    const result = jacksonPollock3({ sex: 'male', age: null, skinfolds: { ...noSkinfolds, chest: 20, thigh: 15 } });
    expect(result).toMatchObject({ value: null, problem: { kind: 'missing', inputs: ['age', 'skinfoldAbdomen'] } });
  });

  it('неправдоподобный результат не показываем', () => {
    const result = navyBodyFat({ sex: 'male', heightCm: 175, neckCm: 38, waistCm: 39, hipsCm: null });
    expect(result).toMatchObject({ value: null, problem: { kind: 'invalid', code: 'implausibleResult' } });
  });

  it('ноль и отрицательные числа считаются отсутствующими', () => {
    expect(bodyMassIndex(70, 0)).toMatchObject({ value: null, problem: { kind: 'missing', inputs: ['height'] } });
  });
});

const base: BodyMeasurements = {
  weight: 70,
  height: 175,
  neck: 38,
  waist: 86,
  hips: null,
  arm: null,
  thigh: null,
  calf: null,
  skinfoldChest: null,
  skinfoldAbdomen: null,
  skinfoldThigh: null,
  skinfoldTriceps: null,
  skinfoldSuprailiac: null,
  skinfoldCalf: null,
};

describe('calculateComposition', () => {
  it('без складок основной метод — ВМС, дальше всё считается от него', () => {
    const result = calculateComposition(base, { sex: 'male', age: 30 });
    expect(result.bodyFat.method).toBe('navy');
    expect(valueOf(result.bodyFat)).toBeCloseTo(17.7, 1);
    expect(result.leanMass.method).toBe('fromBodyFat');
    expect(valueOf(result.leanMass)).toBeCloseTo(57.6, 1);
    expect(valueOf(result.fatMass)).toBeCloseTo(12.4, 1);
    expect(valueOf(result.bmi)).toBeCloseTo(22.9, 1);
    expect(valueOf(result.ffmi)).toBeCloseTo(18.8, 1);
    expect(result.skeletalMuscle.value).toBeNull();
  });

  it('со складками основной метод — JP3', () => {
    const result = calculateComposition(
      { ...base, skinfoldChest: 20, skinfoldAbdomen: 25, skinfoldThigh: 15 },
      { sex: 'male', age: 30 },
    );
    expect(result.bodyFat.method).toBe('jp3');
    expect(valueOf(result.bodyFat)).toBeCloseTo(17.9, 1);
    expect(valueOf(result.bodyFatByMethod.navy)).toBeCloseTo(17.7, 1);
  });

  it('начатые, но неполные складки — показываем, каких не хватает, а не молча берём ВМС', () => {
    const result = calculateComposition({ ...base, skinfoldChest: 20 }, { sex: 'male', age: 30 });
    expect(result.bodyFat.method).toBe('navy');
    expect(result.bodyFatByMethod.jp3).toMatchObject({ value: null, problem: { kind: 'missing' } });
  });

  it('без % жира безжировая масса — по Boer', () => {
    const result = calculateComposition({ ...base, neck: null, waist: null }, { sex: 'male', age: 30 });
    expect(result.bodyFat.value).toBeNull();
    expect(result.leanMass.method).toBe('boer');
    expect(valueOf(result.leanMass)).toBeCloseTo(56.0, 1);
    expect(valueOf(result.fatMass)).toBeCloseTo(14.0, 1);
  });

  it('не сравнивает % жира разными методами', () => {
    const navyOnly = calculateComposition({ ...base, waist: 90 }, { sex: 'male', age: 30 });
    const withSkinfolds = calculateComposition(
      { ...base, skinfoldChest: 20, skinfoldAbdomen: 25, skinfoldThigh: 15 },
      { sex: 'male', age: 30 },
    );
    // основной метод нового замера — складки, а в прошлом складок не было: сравнивать не с чем
    expect(compositionDelta('bodyFat', withSkinfolds, navyOnly)).toBeNull();
    const navyNow = calculateComposition(base, { sex: 'male', age: 30 });
    expect(compositionDelta('bodyFat', navyNow, navyOnly)).toBeLessThan(0);
    // жировая масса от разных методов — не сравниваем
    expect(compositionDelta('fatMass', withSkinfolds, navyOnly)).toBeNull();
    // ИМТ от метода не зависит
    expect(compositionDelta('bmi', withSkinfolds, navyOnly)).toBeCloseTo(0, 5);
  });

  it('разница с прошлым замером', () => {
    expect(metricDelta(ok('navy', 17.7, 4), ok('navy', 19.2, 4))).toBeCloseTo(-1.5, 5);
    expect(metricDelta(ok('navy', 17.7, 4), undefined)).toBeNull();
  });
});
