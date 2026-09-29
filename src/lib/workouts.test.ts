import { formToWorkoutData, newWorkoutFormValues, workoutToFormValues } from './workoutForm';
import { nextWorkoutByClient, workoutStats, workoutVolume } from './workouts';

describe('статистика тренировок', () => {
  it('считает только проведённые', () => {
    expect(
      workoutStats([
        { status: 'done', durationMin: 60 },
        { status: 'done', durationMin: null },
        { status: 'planned', durationMin: 90 },
      ]),
    ).toEqual({ done: 2, minutes: 60 });
  });

  it('ближайшая тренировка — первая в списке для каждого', () => {
    const next = nextWorkoutByClient([
      { clientId: 'a', id: '1' },
      { clientId: 'b', id: '2' },
      { clientId: 'a', id: '3' },
    ]);
    expect(next.get('a')?.id).toBe('1');
    expect(next.get('b')?.id).toBe('2');
  });

  it('тоннаж', () => {
    expect(workoutVolume([{ sets: [{ reps: 10, weight: 60 }, { reps: 8, weight: null }] }, { sets: [{ reps: 5, weight: 100 }] }])).toBe(1100);
  });
});

describe('форма тренировки', () => {
  it('без даты не сохраняется', () => {
    const values = { ...newWorkoutFormValues('2026-09-29', 'done'), date: '' };
    expect(formToWorkoutData(values).fields).toBeNull();
  });

  it('разбирает время, длительность и подходы; упражнения без названия пропускает', () => {
    const values = {
      ...newWorkoutFormValues('2026-09-29', 'planned'),
      startTime: '18:30',
      duration: '75',
      exercises: [
        { id: 'e1', name: ' Присед ', sets: [{ id: 's1', reps: '10', weight: '62,5', rest: '90' }] },
        { id: 'e2', name: '', sets: [] },
      ],
    };
    const data = formToWorkoutData(values);
    expect(data.errors).toEqual({});
    expect(data.fields).toMatchObject({ date: '2026-09-29', status: 'planned', startTime: '18:30', durationMin: 75 });
    expect(data.exercises).toEqual([{ id: 'e1', name: 'Присед', sets: [{ id: 's1', reps: 10, weight: 62.5, restSec: 90 }] }]);
  });

  it('неверное время и длительность подсвечиваются и не сохраняются', () => {
    const values = { ...newWorkoutFormValues('2026-09-29', 'done'), startTime: '25:00', duration: '0' };
    const data = formToWorkoutData(values);
    expect(data.errors).toEqual({ startTime: 'invalid', duration: 'invalid' });
    expect(data.fields).not.toHaveProperty('startTime');
    expect(data.fields).not.toHaveProperty('durationMin');
  });

  it('тренировка → форма → тренировка без потерь', () => {
    const workout = {
      id: 'w',
      clientId: 'c',
      date: '2026-09-29',
      startTime: '07:00',
      durationMin: 60,
      status: 'done' as const,
      wellbeing: 4,
      notes: 'Хорошо',
      deletedAt: null,
      createdAt: 0,
      updatedAt: 0,
    };
    const exercises = [{ id: 'e', name: 'Жим', sets: [{ id: 's', reps: 8, weight: 50, restSec: null }] }];
    const back = formToWorkoutData(workoutToFormValues(workout, exercises));
    expect(back.fields).toMatchObject({ date: '2026-09-29', startTime: '07:00', durationMin: 60, wellbeing: 4, notes: 'Хорошо' });
    expect(back.exercises).toEqual(exercises);
  });
});
