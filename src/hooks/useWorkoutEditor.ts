import { useCallback, useMemo, useState } from 'react';

import { newId } from '@/db/ids';
import type { ExerciseInput, WorkoutFields } from '@/db/schema';
import { saveWorkout } from '@/db/workouts';
import {
  exerciseToFormValues,
  formToWorkoutData,
  type ExerciseFormValues,
  type SetFormValues,
  type WorkoutFormValues,
} from '@/lib/workoutForm';

import { useAutosave } from './useAutosave';

type Saved = { fields: WorkoutFields; exercises: ExerciseInput[] };

/** Состояние тренировки с упражнениями и подходами, сохраняется само */
export function useWorkoutEditor(id: string, clientId: string, initialValues: WorkoutFormValues) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  const change = useCallback((update: (current: WorkoutFormValues) => WorkoutFormValues) => {
    setValues(update);
    setDirty(true);
  }, []);

  const setField = useCallback(
    <K extends keyof WorkoutFormValues>(key: K, value: WorkoutFormValues[K]) =>
      change((current) => ({ ...current, [key]: value })),
    [change],
  );

  const mapExercise = useCallback(
    (exerciseId: string, update: (exercise: ExerciseFormValues) => ExerciseFormValues) =>
      change((current) => ({
        ...current,
        exercises: current.exercises.map((e) => (e.id === exerciseId ? update(e) : e)),
      })),
    [change],
  );

  const actions = useMemo(
    () => ({
      addExercise: () =>
        change((current) => ({
          ...current,
          exercises: [
            ...current.exercises,
            { id: newId(), name: '', sets: [{ id: newId(), reps: '', weight: '', rest: '' }] },
          ],
        })),
      removeExercise: (exerciseId: string) =>
        change((current) => ({ ...current, exercises: current.exercises.filter((e) => e.id !== exerciseId) })),
      renameExercise: (exerciseId: string, name: string) => mapExercise(exerciseId, (e) => ({ ...e, name })),
      // Новый подход повторяет прошлый — обычно меняют только вес или повторы
      addSet: (exerciseId: string) =>
        mapExercise(exerciseId, (e) => {
          const last = e.sets[e.sets.length - 1];
          return { ...e, sets: [...e.sets, { ...(last ?? { reps: '', weight: '', rest: '' }), id: newId() }] };
        }),
      updateSet: (exerciseId: string, setId: string, patch: Partial<Omit<SetFormValues, 'id'>>) =>
        mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) })),
      removeSet: (exerciseId: string, setId: string) =>
        mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== setId) })),
      // Копия упражнений прошлой тренировки — с новыми id, чтобы не трогать старую
      copyExercises: (exercises: ExerciseInput[]) =>
        change((current) => ({
          ...current,
          exercises: exercises.map((exercise) => ({
            ...exerciseToFormValues(exercise),
            id: newId(),
            sets: exerciseToFormValues(exercise).sets.map((set) => ({ ...set, id: newId() })),
          })),
        })),
    }),
    [change, mapExercise],
  );

  const { fields, exercises, errors } = useMemo(() => formToWorkoutData(values), [values]);
  const toSave = useMemo<Saved | null>(() => (fields ? { fields, exercises } : null), [fields, exercises]);
  const save = useCallback(
    (data: Saved) => saveWorkout(id, clientId, data.fields, data.exercises),
    [id, clientId],
  );
  const { status, flush } = useAutosave(dirty ? toSave : null, save);

  return { values, setField, ...actions, errors: dirty ? errors : {}, status, flush };
}
