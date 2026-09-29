import type { Measurement } from '@/db/schema';

import { buildDemoData } from './demoData';
import { compositionFor } from './measurements';

let counter = 0;
const makeId = () => `id-${++counter}`;
const today = '2026-09-29';

function asMeasurement(clientId: string, id: string, fields: object): Measurement {
  return {
    id,
    clientId,
    date: '',
    weight: 0,
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

describe('демо-данные', () => {
  const demo = buildDemoData(today, makeId);

  it('три вымышленных подопечных с пометкой', () => {
    expect(demo.map((c) => c.fields.firstName)).toEqual(['Анна', 'Игорь', 'Ольга']);
    expect(demo.every((c) => c.fields.notes?.startsWith('Пример'))).toBe(true);
  });

  it('все id уникальны', () => {
    const ids = demo.flatMap((c) => [
      c.id,
      ...c.measurements.map((m) => m.id),
      ...c.workouts.flatMap((w) => [w.id, ...w.exercises.flatMap((e) => [e.id, ...e.sets.map((s) => s.id)])]),
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('проведённые тренировки в прошлом, запланированные — с сегодняшнего дня', () => {
    const workouts = demo.flatMap((c) => c.workouts);
    expect(workouts.filter((w) => w.fields.status === 'done').every((w) => w.fields.date < today)).toBe(true);
    expect(workouts.filter((w) => w.fields.status === 'planned').every((w) => w.fields.date >= today)).toBe(true);
  });

  it('в блоке «Сегодня» есть что показать: тренировка, день рождения, замер', () => {
    const [anna, igor, olga] = demo;
    expect(anna.workouts.some((w) => w.fields.date === today && w.fields.status === 'planned')).toBe(true);
    expect(igor.fields.birthDate).toBe('1988-10-02');
    expect(olga.measurements[olga.measurements.length - 1].fields.date).toBe('2026-08-25');
  });

  it('рабочий вес в упражнениях растёт от тренировки к тренировке', () => {
    const [anna] = demo;
    const squat = anna.workouts
      .filter((w) => w.fields.status === 'done')
      .sort((a, b) => a.fields.date.localeCompare(b.fields.date))
      .map((w) => w.exercises[0].sets[0].weight ?? 0);
    expect(squat[squat.length - 1]).toBeGreaterThan(squat[0]);
    expect(squat.every((weight, i) => i === 0 || weight >= squat[i - 1])).toBe(true);
  });

  it('у Анны % жира по складкам и снижается, у Игоря — по обхватам', () => {
    const [anna, igor] = demo;
    const annaBf = anna.measurements.map((m) =>
      compositionFor(asMeasurement(anna.id, m.id, m.fields), { gender: 'female', birthDate: '1994-04-12' }).bodyFat,
    );
    expect(annaBf.every((bf) => bf.method === 'jp3' && bf.value !== null)).toBe(true);
    expect(annaBf[annaBf.length - 1].value).toBeLessThan(annaBf[0].value ?? 0);

    const igorBf = compositionFor(asMeasurement(igor.id, 'x', igor.measurements[0].fields), {
      gender: 'male',
      birthDate: '1988-11-03',
    }).bodyFat;
    expect(igorBf).toMatchObject({ method: 'navy' });
    expect(igorBf.value).not.toBeNull();
  });

  it('у Анны считается мышечная масса (Lee)', () => {
    const [anna] = demo;
    const last = anna.measurements[anna.measurements.length - 1];
    expect(compositionFor(asMeasurement(anna.id, last.id, last.fields), { gender: 'female', birthDate: '1994-04-12' }).skeletalMuscle.value).not.toBeNull();
  });
});
