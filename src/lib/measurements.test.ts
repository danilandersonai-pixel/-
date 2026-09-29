import type { Measurement } from '@/db/schema';

import { bodyFatTrend, compositionFor, groupByClient, personOnDate } from './measurements';

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

const client = { gender: 'male' as const, birthDate: '1996-10-15' };

describe('замеры и подопечный', () => {
  it('возраст считается на дату замера', () => {
    expect(personOnDate(client, '2026-10-14').age).toBe(29);
    expect(personOnDate(client, '2026-10-15').age).toBe(30);
    expect(personOnDate({ gender: null, birthDate: null }, '2026-10-15')).toEqual({ sex: null, age: null });
  });

  it('состав тела по замеру', () => {
    expect(compositionFor(m({}), client).bodyFat.value).toBeCloseTo(17.7, 1);
  });

  it('динамика % жира: последний и изменение к предыдущему', () => {
    const trend = bodyFatTrend([m({ id: 'new', waist: 86 }), m({ id: 'old', waist: 90 })], client);
    expect(trend?.value).toBeCloseTo(17.7, 1);
    expect(trend?.delta).toBeLessThan(0);
    expect(bodyFatTrend([m({ waist: null })], client)).toBeNull();
    expect(bodyFatTrend([m({})], client)?.delta).toBeNull();
  });

  it('группирует по подопечным', () => {
    const groups = groupByClient([m({ id: '1', clientId: 'a' }), m({ id: '2', clientId: 'b' }), m({ id: '3', clientId: 'a' })]);
    expect(groups.get('a')?.map((x) => x.id)).toEqual(['1', '3']);
  });
});
