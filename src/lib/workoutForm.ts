import type { ExerciseInput, Workout, WorkoutFields, WorkoutStatus } from '@/db/schema';
import { isoToRuDate, parseRuDate, parseTime } from '@/utils/date';
import { parseDecimal } from '@/utils/format';

import { textOrNull } from './clientForm';
import { numberToInput } from './measurementForm';

export type SetFormValues = { id: string; reps: string; weight: string; rest: string };
export type ExerciseFormValues = { id: string; name: string; sets: SetFormValues[] };

export type WorkoutFormValues = {
  status: WorkoutStatus;
  /** ДД.ММ.ГГГГ */
  date: string;
  /** ЧЧ:ММ */
  startTime: string;
  duration: string;
  wellbeing: number | null;
  notes: string;
  exercises: ExerciseFormValues[];
};

export type WorkoutFormErrors = Partial<Record<'date' | 'startTime' | 'duration', 'required' | 'invalid'>>;

export function newWorkoutFormValues(dateIso: string, status: WorkoutStatus): WorkoutFormValues {
  return { status, date: isoToRuDate(dateIso), startTime: '', duration: '', wellbeing: null, notes: '', exercises: [] };
}

export function exerciseToFormValues(exercise: ExerciseInput): ExerciseFormValues {
  return {
    id: exercise.id,
    name: exercise.name,
    sets: exercise.sets.map((set) => ({
      id: set.id,
      reps: numberToInput(set.reps),
      weight: numberToInput(set.weight),
      rest: numberToInput(set.restSec),
    })),
  };
}

export function workoutToFormValues(workout: Workout, exercises: ExerciseInput[]): WorkoutFormValues {
  return {
    status: workout.status,
    date: isoToRuDate(workout.date),
    startTime: workout.startTime ?? '',
    duration: numberToInput(workout.durationMin),
    wellbeing: workout.wellbeing,
    notes: workout.notes ?? '',
    exercises: exercises.map(exerciseToFormValues),
  };
}

function toNumber(text: string, integer = false): number | null {
  const value = parseDecimal(text);
  if (value === null || value < 0) {
    return null;
  }
  return integer ? Math.round(value) : value;
}

/**
 * Форма → данные для сохранения. Без даты сохранять нечего.
 * Упражнения без названия пропускаем — тренер ещё не дописал.
 */
export function formToWorkoutData(values: WorkoutFormValues): {
  fields: WorkoutFields | null;
  exercises: ExerciseInput[];
  errors: WorkoutFormErrors;
} {
  const errors: WorkoutFormErrors = {};
  const date = parseRuDate(values.date);
  if (!date) {
    errors.date = values.date.trim() === '' ? 'required' : 'invalid';
  }

  const fields: Partial<WorkoutFields> = {
    status: values.status,
    wellbeing: values.wellbeing,
    notes: textOrNull(values.notes),
  };
  if (values.startTime.trim() === '') {
    fields.startTime = null;
  } else {
    const time = parseTime(values.startTime);
    if (time) {
      fields.startTime = time;
    } else {
      errors.startTime = 'invalid';
    }
  }
  if (values.duration.trim() === '') {
    fields.durationMin = null;
  } else {
    const minutes = toNumber(values.duration, true);
    if (minutes !== null && minutes > 0 && minutes <= 600) {
      fields.durationMin = minutes;
    } else {
      errors.duration = 'invalid';
    }
  }

  const exercises: ExerciseInput[] = values.exercises
    .filter((exercise) => exercise.name.trim() !== '')
    .map((exercise) => ({
      id: exercise.id,
      name: exercise.name.trim(),
      sets: exercise.sets.map((set) => ({
        id: set.id,
        reps: toNumber(set.reps, true),
        weight: toNumber(set.weight),
        restSec: toNumber(set.rest, true),
      })),
    }));

  return { fields: date ? { ...fields, date, status: values.status } : null, exercises, errors };
}
