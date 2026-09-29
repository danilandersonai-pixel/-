import type { Measurement } from '@/db/schema';

import { formToMeasurementFields, measurementToFormValues, newMeasurementFormValues } from './measurementForm';

function makeMeasurement(overrides: Partial<Measurement>): Measurement {
  return {
    id: 'm1',
    clientId: 'c1',
    date: '2026-09-01',
    weight: 70,
    height: null,
    neck: null,
    chest: null,
    waist: null,
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
    restingHeartRate: null,
    deletedAt: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('форма замера', () => {
  it('новый замер: сегодняшняя дата и рост из прошлого', () => {
    const values = newMeasurementFormValues('2026-09-29', makeMeasurement({ height: 175.5 }));
    expect(values.date).toBe('29.09.2026');
    expect(values.height).toBe('175,5');
    expect(values.weight).toBe('');
  });

  it('без веса сохранять нечего', () => {
    const values = newMeasurementFormValues('2026-09-29', null);
    const result = formToMeasurementFields(values);
    expect(result.fields).toBeNull();
    expect(result.errors.weight).toBe('required');
  });

  it('понимает запятую, пустые поля стирают значение', () => {
    const values = { ...newMeasurementFormValues('2026-09-29', null), weight: '72,5', waist: '86', neck: '' };
    const result = formToMeasurementFields(values);
    expect(result.errors).toEqual({});
    expect(result.fields).toMatchObject({ date: '2026-09-29', weight: 72.5, waist: 86, neck: null });
  });

  it('неправдоподобные значения не сохраняются, остальное сохраняется', () => {
    const values = { ...newMeasurementFormValues('2026-09-29', null), weight: '72', waist: '860', skinfoldChest: 'abc' };
    const result = formToMeasurementFields(values);
    expect(result.errors).toEqual({ waist: 'range', skinfoldChest: 'invalid' });
    expect(result.fields).not.toBeNull();
    expect(result.fields).not.toHaveProperty('waist');
    expect(result.fields).not.toHaveProperty('skinfoldChest');
  });

  it('пульс округляется до целого', () => {
    const values = { ...newMeasurementFormValues('2026-09-29', null), weight: '72', restingHeartRate: '61,6' };
    expect(formToMeasurementFields(values).fields?.restingHeartRate).toBe(62);
  });

  it('неверная дата блокирует сохранение', () => {
    const values = { ...newMeasurementFormValues('2026-09-29', null), weight: '72', date: '31.02.2026' };
    const result = formToMeasurementFields(values);
    expect(result.fields).toBeNull();
    expect(result.errors.date).toBe('invalid');
  });

  it('замер → форма → замер без потерь', () => {
    const m = makeMeasurement({ weight: 72.25, waist: 86, skinfoldCalf: 8 });
    const back = formToMeasurementFields(measurementToFormValues(m)).fields;
    expect(back).toMatchObject({ date: '2026-09-01', weight: 72.25, waist: 86, skinfoldCalf: 8, neck: null });
  });
});
