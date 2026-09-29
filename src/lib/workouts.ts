import type { Workout } from '@/db/schema';

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
