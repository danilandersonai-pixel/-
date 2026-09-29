import type { Workout } from '@/db/schema';
import { addDays } from '@/utils/date';

/** Счётчики: сколько тренировок проведено и сколько минут всего */
export function workoutStats(workouts: Pick<Workout, 'status' | 'durationMin'>[]): { done: number; minutes: number } {
  const done = workouts.filter((w) => w.status === 'done');
  return { done: done.length, minutes: done.reduce((total, w) => total + (w.durationMin ?? 0), 0) };
}

/** Ближайшая запланированная тренировка каждого подопечного (список уже по порядку) */
export function nextWorkoutByClient<T extends Pick<Workout, 'clientId'>>(planned: T[]): Map<string, T> {
  const next = new Map<string, T>();
  for (const workout of planned) {
    if (!next.has(workout.clientId)) {
      next.set(workout.clientId, workout);
    }
  }
  return next;
}

/** Тоннаж: сумма повторы × вес по всем подходам, кг */
export function workoutVolume(exercises: { sets: { reps: number | null; weight: number | null }[] }[]): number {
  return exercises.reduce(
    (total, exercise) => total + exercise.sets.reduce((sum, set) => sum + (set.reps ?? 0) * (set.weight ?? 0), 0),
    0,
  );
}

/** День недели даты «ГГГГ-ММ-ДД»: 0 — понедельник … 6 — воскресенье */
export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

/**
 * Даты серии тренировок: после startIso и на `weeks` недель вперёд, в выбранные дни недели.
 * Дни, где у подопечного уже есть тренировка (busy), пропускаются — дублей не будет.
 */
export function recurringDates(startIso: string, weekdays: readonly number[], weeks: number, busy: ReadonlySet<string>): string[] {
  const dates: string[] = [];
  for (let offset = 1; offset <= weeks * 7; offset += 1) {
    const date = addDays(startIso, offset);
    if (weekdays.includes(weekdayIndex(date)) && !busy.has(date)) {
      dates.push(date);
    }
  }
  return dates;
}
