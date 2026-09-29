// Браузерная версия workouts.ts для превью: те же функции, но данные в localStorage.

import { notifyChange } from './changes';
import type { ExerciseInput, Workout, WorkoutExercise, WorkoutFields, WorkoutSet } from './schema';
import { createWebTable, getBrowserStorage } from './webTable';
import type { WorkoutDetails, WorkoutSummary } from './workouts';

const storage = getBrowserStorage();
const workoutTable = createWebTable<Workout>('workouts', storage);
const exerciseTable = createWebTable<WorkoutExercise>('workout_exercises', storage);
const setTable = createWebTable<WorkoutSet>('sets', storage);

function alive(): Workout[] {
  return workoutTable.all().filter((w) => w.deletedAt === null);
}

function byTimeAsc(a: Workout, b: Workout): number {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '') || a.createdAt - b.createdAt;
}

function exercisesOf(workoutId: string): ExerciseInput[] {
  return exerciseTable
    .all()
    .filter((e) => e.workoutId === workoutId)
    .sort((a, b) => a.position - b.position)
    .map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: setTable
        .all()
        .filter((set) => set.exerciseId === exercise.id)
        .sort((a, b) => a.position - b.position)
        .map((set) => ({ id: set.id, reps: set.reps, weight: set.weight, restSec: set.restSec })),
    }));
}

const api = {
  async listWorkouts(clientId: string): Promise<WorkoutSummary[]> {
    const exercises = exerciseTable.all();
    return alive()
      .filter((w) => w.clientId === clientId)
      .sort((a, b) => byTimeAsc(b, a))
      .map((w) => ({ ...w, exerciseCount: exercises.filter((e) => e.workoutId === w.id).length }));
  },

  async listWorkoutsBetween(fromIso: string, toIso: string): Promise<Workout[]> {
    return alive()
      .filter((w) => w.date >= fromIso && w.date <= toIso)
      .sort(byTimeAsc);
  },

  async listPlannedFrom(fromIso: string): Promise<Workout[]> {
    return alive()
      .filter((w) => w.status === 'planned' && w.date >= fromIso)
      .sort(byTimeAsc);
  },

  async getWorkoutDetails(id: string): Promise<WorkoutDetails | null> {
    const workout = workoutTable.get(id);
    if (!workout || workout.deletedAt !== null) {
      return null;
    }
    return { workout, exercises: exercisesOf(id) };
  },

  async getLastWorkoutExercises(clientId: string, exceptId: string): Promise<ExerciseInput[]> {
    const recent = alive()
      .filter((w) => w.clientId === clientId && w.id !== exceptId)
      .sort((a, b) => byTimeAsc(b, a));
    for (const workout of recent) {
      const exercises = exercisesOf(workout.id);
      if (exercises.length > 0) {
        return exercises;
      }
    }
    return [];
  },

  async saveWorkout(id: string, clientId: string, fields: WorkoutFields, exercises: ExerciseInput[]): Promise<void> {
    const now = Date.now();
    const existing = workoutTable.get(id);
    workoutTable.upsert({
      startTime: null,
      durationMin: null,
      wellbeing: null,
      notes: null,
      deletedAt: null,
      ...existing,
      ...fields,
      id,
      clientId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    exercises.forEach((exercise, position) => {
      const oldExercise = exerciseTable.get(exercise.id);
      exerciseTable.upsert({
        id: exercise.id,
        workoutId: id,
        position,
        name: exercise.name,
        createdAt: oldExercise?.createdAt ?? now,
        updatedAt: now,
      });
      exercise.sets.forEach((set, setPosition) => {
        const oldSet = setTable.get(set.id);
        setTable.upsert({
          id: set.id,
          exerciseId: exercise.id,
          position: setPosition,
          reps: set.reps,
          weight: set.weight,
          restSec: set.restSec,
          createdAt: oldSet?.createdAt ?? now,
          updatedAt: now,
        });
      });
    });
    const keptExercises = new Set(exercises.map((e) => e.id));
    const keptSets = new Set(exercises.flatMap((e) => e.sets.map((s) => s.id)));
    const ownExercises = exerciseTable.all().filter((e) => e.workoutId === id);
    const ownExerciseIds = new Set(ownExercises.map((e) => e.id));
    setTable
      .all()
      .filter((set) => ownExerciseIds.has(set.exerciseId) && !keptSets.has(set.id))
      .forEach((set) => setTable.remove(set.id));
    ownExercises.filter((e) => !keptExercises.has(e.id)).forEach((e) => exerciseTable.remove(e.id));
    notifyChange('workouts');
  },

  async deleteWorkout(id: string): Promise<void> {
    const existing = workoutTable.get(id);
    if (existing) {
      const now = Date.now();
      workoutTable.upsert({ ...existing, deletedAt: now, updatedAt: now });
      notifyChange('workouts');
    }
  },
} satisfies typeof import('./workouts');

export const {
  listWorkouts,
  listWorkoutsBetween,
  listPlannedFrom,
  getWorkoutDetails,
  getLastWorkoutExercises,
  saveWorkout,
  deleteWorkout,
} = api;
