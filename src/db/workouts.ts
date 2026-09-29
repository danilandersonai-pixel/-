import { and, asc, between, count, desc, eq, gte, inArray, isNull, ne, notInArray } from 'drizzle-orm';

import { notifyChange } from './changes';
import { db } from './database';
import { newId } from './ids';
import type { ExerciseSession } from '@/lib/records';

import {
  sets,
  workoutExercises,
  workouts,
  type ExerciseInput,
  type Workout,
  type WorkoutFields,
} from './schema';

export type WorkoutSummary = Workout & { exerciseCount: number };
export type WorkoutDetails = { workout: Workout; exercises: ExerciseInput[] };

/** Тренировки подопечного, новые сверху, с числом упражнений */
export async function listWorkouts(clientId: string): Promise<WorkoutSummary[]> {
  const rows = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.clientId, clientId), isNull(workouts.deletedAt)))
    .orderBy(desc(workouts.date), desc(workouts.startTime), desc(workouts.createdAt));
  if (rows.length === 0) {
    return [];
  }
  const counts = await db
    .select({ workoutId: workoutExercises.workoutId, total: count() })
    .from(workoutExercises)
    .where(inArray(workoutExercises.workoutId, rows.map((row) => row.id)))
    .groupBy(workoutExercises.workoutId);
  const byWorkout = new Map(counts.map((row) => [row.workoutId, row.total]));
  return rows.map((row) => ({ ...row, exerciseCount: byWorkout.get(row.id) ?? 0 }));
}

/** Тренировки всех подопечных за период (для календаря), по порядку */
export async function listWorkoutsBetween(fromIso: string, toIso: string): Promise<Workout[]> {
  return db
    .select()
    .from(workouts)
    .where(and(between(workouts.date, fromIso, toIso), isNull(workouts.deletedAt)))
    .orderBy(asc(workouts.date), asc(workouts.startTime), asc(workouts.createdAt));
}

/** Запланированные тренировки начиная с даты — для «следующей тренировки» */
export async function listPlannedFrom(fromIso: string): Promise<Workout[]> {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.status, 'planned'), gte(workouts.date, fromIso), isNull(workouts.deletedAt)))
    .orderBy(asc(workouts.date), asc(workouts.startTime));
}

export async function getWorkoutDetails(id: string): Promise<WorkoutDetails | null> {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, id), isNull(workouts.deletedAt)))
    .limit(1);
  if (!workout) {
    return null;
  }
  return { workout, exercises: await loadExercises(workout.id) };
}

async function loadExercises(workoutId: string): Promise<ExerciseInput[]> {
  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position));
  if (exercises.length === 0) {
    return [];
  }
  const allSets = await db
    .select()
    .from(sets)
    .where(inArray(sets.exerciseId, exercises.map((e) => e.id)))
    .orderBy(asc(sets.position));
  return exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    sets: allSets
      .filter((set) => set.exerciseId === exercise.id)
      .map((set) => ({ id: set.id, reps: set.reps, weight: set.weight, restSec: set.restSec })),
  }));
}

/**
 * Все упражнения проведённых тренировок подопечного с подходами — для личных рекордов.
 * Один запрос: подходы вместе с упражнением и датой тренировки.
 */
export async function listExerciseSessions(clientId: string): Promise<ExerciseSession[]> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      date: workouts.date,
      exerciseId: workoutExercises.id,
      name: workoutExercises.name,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(sets, eq(sets.exerciseId, workoutExercises.id))
    .where(and(eq(workouts.clientId, clientId), eq(workouts.status, 'done'), isNull(workouts.deletedAt)))
    .orderBy(asc(workouts.date), asc(workouts.createdAt), asc(workoutExercises.position), asc(sets.position));

  const sessions = new Map<string, ExerciseSession>();
  for (const row of rows) {
    const session = sessions.get(row.exerciseId) ?? { workoutId: row.workoutId, date: row.date, name: row.name, sets: [] };
    if (row.reps !== null || row.weight !== null) {
      session.sets.push({ reps: row.reps, weight: row.weight });
    }
    sessions.set(row.exerciseId, session);
  }
  return [...sessions.values()];
}

/** Упражнения последней тренировки подопечного с упражнениями — чтобы повторить её */
export async function getLastWorkoutExercises(clientId: string, exceptId: string): Promise<ExerciseInput[]> {
  const recent = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.clientId, clientId), ne(workouts.id, exceptId), isNull(workouts.deletedAt)))
    .orderBy(desc(workouts.date), desc(workouts.createdAt))
    .limit(10);
  for (const { id } of recent) {
    const exercises = await loadExercises(id);
    if (exercises.length > 0) {
      return exercises;
    }
  }
  return [];
}

/**
 * Сохраняет тренировку целиком. Упражнения и подходы обновляются по одному,
 * а убранные тренером удаляются в конце — сбой посреди сохранения не сотрёт тренировку.
 */
export async function saveWorkout(
  id: string,
  clientId: string,
  fields: WorkoutFields,
  exercises: ExerciseInput[],
): Promise<void> {
  const now = Date.now();
  await db
    .insert(workouts)
    .values({ ...fields, id, clientId, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: workouts.id, set: { ...fields, updatedAt: now } });

  for (const [position, exercise] of exercises.entries()) {
    await db
      .insert(workoutExercises)
      .values({ id: exercise.id, workoutId: id, position, name: exercise.name, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: workoutExercises.id, set: { position, name: exercise.name, updatedAt: now } });
    for (const [setPosition, set] of exercise.sets.entries()) {
      const values = { position: setPosition, reps: set.reps, weight: set.weight, restSec: set.restSec };
      await db
        .insert(sets)
        .values({ ...values, id: set.id, exerciseId: exercise.id, createdAt: now, updatedAt: now })
        .onConflictDoUpdate({ target: sets.id, set: { ...values, updatedAt: now } });
    }
  }

  const existing = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, id));
  const existingIds = existing.map((row) => row.id);
  if (existingIds.length > 0) {
    const keptSetIds = exercises.flatMap((exercise) => exercise.sets.map((set) => set.id));
    const keptExerciseIds = exercises.map((exercise) => exercise.id);
    await db
      .delete(sets)
      .where(and(inArray(sets.exerciseId, existingIds), keptSetIds.length > 0 ? notInArray(sets.id, keptSetIds) : undefined));
    await db
      .delete(workoutExercises)
      .where(
        and(
          eq(workoutExercises.workoutId, id),
          keptExerciseIds.length > 0 ? notInArray(workoutExercises.id, keptExerciseIds) : undefined,
        ),
      );
  }
  notifyChange('workouts');
}

/** Серия запланированных тренировок в указанные даты (без упражнений). Возвращает, сколько создано. */
export async function planWorkouts(
  clientId: string,
  dates: string[],
  fields: Pick<WorkoutFields, 'startTime' | 'durationMin'>,
): Promise<number> {
  for (const date of dates) {
    await saveWorkout(newId(), clientId, { ...fields, date, status: 'planned' }, []);
  }
  return dates.length;
}

/** Удаление после подтверждения: помечаем тренировку, упражнения остаются при ней */
export async function deleteWorkout(id: string): Promise<void> {
  const now = Date.now();
  await db.update(workouts).set({ deletedAt: now, updatedAt: now }).where(eq(workouts.id, id));
  notifyChange('workouts');
}
