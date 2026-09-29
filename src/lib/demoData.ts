// Демо-данные для кнопки «Заполнить примером»: три вымышленных подопечных с историей.
// Даты считаются от сегодняшнего дня, чтобы графики и календарь всегда выглядели живыми.

import type {
  ClientFields,
  ExerciseInput,
  HealthFields,
  MeasurementFields,
  NutritionFields,
  WorkoutFields,
} from '@/db/schema';
import { addDays } from '@/utils/date';

export type DemoClient = {
  id: string;
  fields: ClientFields;
  consentBy: string;
  health: HealthFields | null;
  measurements: { id: string; fields: MeasurementFields }[];
  workouts: { id: string; fields: WorkoutFields; exercises: ExerciseInput[] }[];
  nutrition: NutritionFields | null;
};

export const DEMO_NOTE = 'Пример — вымышленный подопечный. Можно перенести в архив.';

type ExerciseTemplate = { name: string; reps: number; weight: number; step: number; sets: number };

function round(value: number, step = 0.1): number {
  return Math.round(value / step) * step;
}

/** Дата рождения, чтобы день рождения был через inDays дней и исполнялось age лет */
function birthdayIn(todayIso: string, inDays: number, age: number): string {
  const day = addDays(todayIso, inDays);
  const monthDay = day.slice(5) === '02-29' ? '02-28' : day.slice(5);
  return `${Number(day.slice(0, 4)) - age}-${monthDay}`;
}

/** Плавное изменение от start к end за n шагов */
function lerp(start: number, end: number, i: number, n: number): number {
  return n <= 1 ? end : start + ((end - start) * i) / (n - 1);
}

function makeWorkouts(
  makeId: () => string,
  todayIso: string,
  daysAgo: number[],
  plannedIn: number[],
  templates: ExerciseTemplate[],
): DemoClient['workouts'] {
  const done = daysAgo.map((ago, index) => ({
    id: makeId(),
    fields: {
      date: addDays(todayIso, -ago),
      status: 'done' as const,
      startTime: index % 2 === 0 ? '08:00' : '19:00',
      durationMin: 60,
      wellbeing: 3 + (index % 3 === 0 ? 1 : 0),
      notes: null,
    },
    // Рабочий вес понемногу растёт от тренировки к тренировке
    exercises: templates.map((t) => ({
      id: makeId(),
      name: t.name,
      sets: Array.from({ length: t.sets }, () => ({
        id: makeId(),
        reps: t.reps,
        // daysAgo идёт от давних к недавним, поэтому index — номер тренировки по порядку
        weight: round(t.weight + t.step * index, 0.5),
        restSec: 90,
      })),
    })),
  }));
  const planned = plannedIn.map((inDays) => ({
    id: makeId(),
    fields: { date: addDays(todayIso, inDays), status: 'planned' as const, startTime: '19:00', durationMin: 60, notes: null },
    exercises: [],
  }));
  return [...done, ...planned];
}

export function buildDemoData(todayIso: string, makeId: () => string): DemoClient[] {
  // Анна: сушка, замеры со складками раз в две недели — считается по Jackson–Pollock
  const annaCount = 7;
  const anna: DemoClient = {
    id: makeId(),
    fields: {
      firstName: 'Анна',
      lastName: 'Смирнова',
      gender: 'female',
      birthDate: '1994-04-12',
      phone: '+7 900 000-00-01',
      goal: 'Снизить процент жира к лету',
      notes: DEMO_NOTE,
    },
    consentBy: 'Анна Смирнова',
    health: null,
    measurements: Array.from({ length: annaCount }, (_, i) => ({
      id: makeId(),
      fields: {
        date: addDays(todayIso, -(annaCount - 1 - i) * 14),
        weight: round(lerp(68.4, 64.6, i, annaCount)),
        height: 167,
        neck: 32,
        waist: round(lerp(78, 72.5, i, annaCount), 0.5),
        hips: round(lerp(104, 100, i, annaCount), 0.5),
        arm: round(lerp(29, 28, i, annaCount), 0.5),
        thigh: round(lerp(58, 55.5, i, annaCount), 0.5),
        calf: 36,
        skinfoldTriceps: round(lerp(22, 17, i, annaCount), 0.5),
        skinfoldSuprailiac: round(lerp(20, 14, i, annaCount), 0.5),
        skinfoldThigh: round(lerp(30, 24, i, annaCount), 0.5),
        skinfoldCalf: round(lerp(14, 11, i, annaCount), 0.5),
        restingHeartRate: Math.round(lerp(72, 64, i, annaCount)),
      },
    })),
    // Одна тренировка запланирована на сегодня — её видно в блоке «Сегодня»
    workouts: makeWorkouts(makeId, todayIso, [26, 23, 21, 19, 16, 14, 12, 9, 7, 5, 2], [0, 3], [
      { name: 'Приседания со штангой', reps: 12, weight: 30, step: 1, sets: 3 },
      { name: 'Румынская тяга', reps: 10, weight: 35, step: 1, sets: 3 },
      { name: 'Тяга верхнего блока', reps: 12, weight: 32, step: 0.5, sets: 3 },
    ]),
    nutrition: {
      startDate: addDays(todayIso, -84),
      calories: 1750,
      protein: 120,
      fat: 55,
      carbs: 190,
      notes: 'Белок в каждом приёме пищи, сладкое — не чаще раза в неделю.',
    },
  };

  // Игорь: набор массы, раз в месяц только обхваты — считается по методу ВМС
  const igorCount = 4;
  const igor: DemoClient = {
    id: makeId(),
    fields: {
      firstName: 'Игорь',
      lastName: 'Васильев',
      gender: 'male',
      // День рождения через 3 дня — пример напоминания в блоке «Сегодня»
      birthDate: birthdayIn(todayIso, 3, 38),
      phone: '+7 900 000-00-02',
      goal: 'Набрать мышечную массу',
      notes: DEMO_NOTE,
    },
    consentBy: 'Игорь Васильев',
    health: {
      injuries: 'Протрузия L5–S1 (2023)',
      limitations: 'Без осевой нагрузки на позвоночник, становая — только с трэп-грифом',
      contraindications: null,
      notes: null,
    },
    measurements: Array.from({ length: igorCount }, (_, i) => ({
      id: makeId(),
      fields: {
        date: addDays(todayIso, -(igorCount - 1 - i) * 30 - 1),
        weight: round(lerp(74.5, 78.2, i, igorCount)),
        height: 181,
        neck: round(lerp(38, 39, i, igorCount), 0.5),
        chest: round(lerp(98, 103, i, igorCount), 0.5),
        waist: round(lerp(83, 84.5, i, igorCount), 0.5),
        arm: round(lerp(33, 35.5, i, igorCount), 0.5),
      },
    })),
    workouts: makeWorkouts(makeId, todayIso, [25, 22, 18, 15, 11, 8, 4, 1], [2, 5], [
      { name: 'Жим лёжа', reps: 8, weight: 70, step: 2.5, sets: 4 },
      { name: 'Жим ногами', reps: 10, weight: 140, step: 5, sets: 4 },
      { name: 'Подтягивания с весом', reps: 6, weight: 5, step: 1.25, sets: 3 },
    ]),
    nutrition: {
      startDate: addDays(todayIso, -60),
      calories: 2900,
      protein: 170,
      fat: 80,
      carbs: 370,
      notes: 'Профицит около 300 ккал, взвешиваться раз в неделю утром.',
    },
  };

  // Ольга: здоровье и тонус, два замера (последний 35 дней назад — пора новый), есть противопоказание
  const olga: DemoClient = {
    id: makeId(),
    fields: {
      firstName: 'Ольга',
      lastName: 'Кузнецова',
      gender: 'female',
      birthDate: '1979-07-21',
      phone: '+7 900 000-00-03',
      goal: 'Здоровая спина и общий тонус',
      notes: DEMO_NOTE,
    },
    consentBy: 'Ольга Кузнецова',
    health: {
      contraindications: 'Гипертония I степени — контроль давления до и после тренировки',
      injuries: null,
      limitations: 'Без задержки дыхания и работы вниз головой',
      notes: null,
    },
    measurements: [
      { id: makeId(), fields: { date: addDays(todayIso, -67), weight: 71.8, height: 164, neck: 34, waist: 84, hips: 106 } },
      { id: makeId(), fields: { date: addDays(todayIso, -35), weight: 70.9, height: 164, neck: 34, waist: 82, hips: 105 } },
    ],
    workouts: makeWorkouts(makeId, todayIso, [20, 13, 6], [4], [
      { name: 'Гиперэкстензия', reps: 15, weight: 0, step: 0, sets: 3 },
      { name: 'Ягодичный мост', reps: 15, weight: 20, step: 2.5, sets: 3 },
    ]),
    nutrition: null,
  };

  return [anna, igor, olga];
}
