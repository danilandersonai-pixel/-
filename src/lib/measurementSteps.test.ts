import { fieldPurposes, fieldUnit, measurementSteps } from './measurementSteps';

describe('шаги замера', () => {
  it('женщинам бёдра и складки для JP3 идут раньше', () => {
    const [, girths, skinfolds] = measurementSteps('female');
    expect(girths.fields.slice(0, 3)).toEqual(['neck', 'waist', 'hips']);
    expect(skinfolds.fields.slice(0, 3)).toEqual(['skinfoldTriceps', 'skinfoldSuprailiac', 'skinfoldThigh']);
  });

  it('назначение полей зависит от пола', () => {
    expect(fieldPurposes('hips', 'male')).toEqual([]);
    expect(fieldPurposes('hips', 'female')).toEqual(['bodyFat']);
    expect(fieldPurposes('skinfoldThigh', 'male')).toEqual(['bodyFat', 'muscle']);
    expect(fieldPurposes('skinfoldChest', 'female')).toEqual([]);
    expect(fieldPurposes('arm', null)).toEqual(['muscle']);
  });

  it('единицы', () => {
    expect(fieldUnit('weight')).toBe('kg');
    expect(fieldUnit('waist')).toBe('cm');
    expect(fieldUnit('skinfoldCalf')).toBe('mm');
    expect(fieldUnit('restingHeartRate')).toBe('bpm');
  });
});
