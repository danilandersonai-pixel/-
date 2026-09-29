import type { Measurement } from '@/db/schema';

import { compareMeasurements } from './compare';

function m(id: string, date: string, fields: Partial<Measurement>): Measurement {
  return {
    id,
    clientId: 'c',
    date,
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
    ...fields,
  };
}

const man = { gender: 'male' as const, birthDate: '1996-01-01' };

describe('сравнение замеров', () => {
  it('порядок по дате и разница по показателям', () => {
    const start = m('a', '2026-06-01', { weight: 80, height: 175, neck: 38, waist: 90 });
    const now = m('b', '2026-09-01', { weight: 76, height: 175, neck: 38, waist: 86 });
    // передаём в обратном порядке — функция сама разберётся, что раньше
    const result = compareMeasurements(now, start, man);
    expect(result.older.id).toBe('a');
    expect(result.method).toBe('navy');
    const weight = result.rows.find((r) => r.id === 'weight');
    expect(weight).toMatchObject({ from: 80, to: 76, delta: -4 });
    const bodyFat = result.rows.find((r) => r.id === 'bodyFat');
    // Контрольный пример ВМС: 175 / 38 / 86 → ≈ 17,7 %
    expect(bodyFat?.to).toBeCloseTo(17.7, 1);
    expect(bodyFat?.delta).toBeLessThan(0);
    expect(result.rows.find((r) => r.id === 'hips')).toBeUndefined();
  });

  it('строки с разницей — первыми', () => {
    const start = m('a', '2026-06-01', { weight: 80, waist: 90, hips: 100 });
    const now = m('b', '2026-09-01', { weight: 76 });
    const rows = compareMeasurements(start, now, man).rows;
    expect(rows[0].id).toBe('weight');
    expect(rows.slice(1).every((r) => r.delta === null)).toBe(true);
  });

  it('% жира — методом нового замера; у старого его нет — разницы нет', () => {
    const start = m('a', '2026-06-01', { weight: 80 });
    const now = m('b', '2026-09-01', { weight: 76, height: 175, neck: 38, waist: 86 });
    const bodyFat = compareMeasurements(start, now, man).rows.find((r) => r.id === 'bodyFat');
    expect(bodyFat).toMatchObject({ from: null, delta: null });
    expect(bodyFat?.to).toBeCloseTo(17.7, 1);
  });
});
