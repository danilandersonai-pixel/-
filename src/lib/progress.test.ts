import type { Measurement } from '@/db/schema';

import { niceScale, progressSeries } from './progress';

function m(overrides: Partial<Measurement>): Measurement {
  return {
    id: 'm',
    clientId: 'c1',
    date: '2026-09-01',
    weight: 70,
    height: 175,
    neck: 38,
    chest: null,
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
    restingHeartRate: null,
    deletedAt: null,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const client = { gender: 'male' as const, birthDate: '1996-01-01' };

describe('ряды для графиков', () => {
  // замеры новыми сверху, как их отдаёт база
  const newestFirst = [
    m({ id: '3', date: '2026-09-29', weight: 71, skinfoldChest: 20, skinfoldAbdomen: 25, skinfoldThigh: 15 }),
    m({ id: '2', date: '2026-09-15', weight: 70.5, waist: null }),
    m({ id: '1', date: '2026-09-01', weight: 72, skinfoldChest: 22, skinfoldAbdomen: 27, skinfoldThigh: 16 }),
  ];

  it('вес — все замеры, от старых к новым', () => {
    expect(progressSeries(newestFirst, client, 'weight').points).toEqual([
      { date: '2026-09-01', value: 72 },
      { date: '2026-09-15', value: 70.5 },
      { date: '2026-09-29', value: 71 },
    ]);
  });

  it('% жира — одним методом последнего замера, остальные замеры пропускаются', () => {
    const series = progressSeries(newestFirst, client, 'bodyFat');
    expect(series.method).toBe('jp3');
    expect(series.points.map((p) => p.date)).toEqual(['2026-09-01', '2026-09-29']);
    expect(series.points[1].value).toBeCloseTo(17.9, 1);
  });

  it('жировая и безжировая масса согласованы с весом', () => {
    const fat = progressSeries(newestFirst, client, 'fatMass').points[1].value;
    const lean = progressSeries(newestFirst, client, 'leanMass').points[1].value;
    expect(fat + lean).toBeCloseTo(71, 5);
  });

  it('обхваты — только там, где измеряли', () => {
    expect(progressSeries(newestFirst, client, 'waist').points).toHaveLength(2);
    expect(progressSeries(newestFirst, client, 'calf').points).toHaveLength(0);
  });
});

describe('niceScale', () => {
  it('круглые деления вокруг данных', () => {
    const scale = niceScale([70.5, 72]);
    expect(scale.min).toBeLessThanOrEqual(70.5);
    expect(scale.min + scale.step * scale.sections).toBeGreaterThanOrEqual(72);
    expect([0.1, 0.2, 0.25, 0.5, 1]).toContain(scale.step);
  });

  it('одно значение тоже рисуется', () => {
    const scale = niceScale([80]);
    expect(scale.step).toBeGreaterThan(0);
    expect(scale.min).toBeLessThan(80);
  });
});
