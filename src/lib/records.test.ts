import {
  estimatedOneRepMax,
  exerciseKey,
  exerciseMetrics,
  exerciseRecords,
  exerciseSeries,
  recordWorkoutIds,
  type ExerciseSession,
} from './records';

const session = (workoutId: string, date: string, name: string, sets: [number | null, number | null][]): ExerciseSession => ({
  workoutId,
  date,
  name,
  sets: sets.map(([reps, weight]) => ({ reps, weight })),
});

describe('расчётный максимум (Эпли)', () => {
  it('контрольные значения', () => {
    expect(estimatedOneRepMax(100, 5)).toBeCloseTo(116.67, 2);
    expect(estimatedOneRepMax(60, 10)).toBeCloseTo(80, 5);
    expect(estimatedOneRepMax(80, 1)).toBe(80);
  });

  it('без веса, без повторов и при слишком многих повторах — не считаем', () => {
    expect(estimatedOneRepMax(50, 13)).toBeNull();
    expect(estimatedOneRepMax(0, 10)).toBeNull();
    expect(estimatedOneRepMax(null, 10)).toBeNull();
    expect(estimatedOneRepMax(50, 0)).toBeNull();
    expect(estimatedOneRepMax(50, null)).toBeNull();
  });
});

describe('рекорды в упражнениях', () => {
  it('одно упражнение, даже если записано по-разному', () => {
    expect(exerciseKey('  Жим   лёжа ')).toBe('жим лежа');
    expect(exerciseKey('ЖИМ ЛЕЖА')).toBe('жим лежа');
  });

  it('лучший вес, максимум, тоннаж и отметки рекордов', () => {
    const records = exerciseRecords([
      session('w1', '2026-09-01', 'Жим лёжа', [[10, 60], [8, 65]]),
      session('w2', '2026-09-08', 'жим лежа', [[10, 60], [10, 65]]),
      session('w3', '2026-09-15', 'Жим лёжа ', [[5, 60]]),
      session('w4', '2026-09-22', 'Жим лёжа', [[3, 70], [20, 40]]),
    ]);
    expect(records).toHaveLength(1);
    const [bench] = records;
    expect(bench.name).toBe('Жим лёжа');
    expect(bench.bestSet).toEqual({ weight: 70, reps: 3, date: '2026-09-22' });
    // 65 × 10 → 86,7 — больше, чем 70 × 3 → 77
    expect(bench.bestEstimate?.value).toBeCloseTo(86.67, 2);
    expect(bench.bestEstimate).toMatchObject({ weight: 65, reps: 10, date: '2026-09-08' });
    expect(bench.sessions.map((s) => [s.workoutId, s.volume, s.isRecord])).toEqual([
      ['w1', 1120, false], // первая тренировка — бить нечего
      ['w2', 1250, true], // больше повторов с тем же весом — вырос максимум
      ['w3', 300, false],
      ['w4', 1010, true], // новый лучший вес
    ]);
    expect([...recordWorkoutIds(records)].sort()).toEqual(['w2', 'w4']);
  });

  it('упражнение без веса — рекорд по повторам', () => {
    const [pullups] = exerciseRecords([
      session('a', '2026-09-01', 'Подтягивания', [[8, null], [6, 0]]),
      session('b', '2026-09-05', 'Подтягивания', [[8, null]]),
      session('c', '2026-09-09', 'Подтягивания', [[10, null]]),
    ]);
    expect(pullups.bestSet).toBeNull();
    expect(pullups.maxReps).toEqual({ reps: 10, date: '2026-09-09' });
    expect(pullups.sessions.map((s) => s.isRecord)).toEqual([false, false, true]);
    expect(exerciseMetrics(pullups)).toEqual(['reps']);
    expect(exerciseSeries(pullups, 'reps')).toEqual([
      { date: '2026-09-01', value: 8 },
      { date: '2026-09-05', value: 8 },
      { date: '2026-09-09', value: 10 },
    ]);
  });

  it('порядок: чаще делали — выше, пустые подходы не ломают расчёт', () => {
    const records = exerciseRecords([
      session('1', '2026-09-01', 'Присед', [[10, 50]]),
      session('1', '2026-09-01', 'Тяга', [[null, null]]),
      session('2', '2026-09-03', 'Присед', [[10, 55]]),
      session('2', '2026-09-03', '   ', [[10, 10]]),
    ]);
    expect(records.map((r) => r.name)).toEqual(['Присед', 'Тяга']);
    const deadlift = records[1];
    expect(deadlift).toMatchObject({ bestSet: null, bestEstimate: null, maxReps: null });
    expect(exerciseMetrics(deadlift)).toEqual([]);
    expect(exerciseMetrics(records[0])).toEqual(['estimate', 'weight', 'volume']);
    expect(exerciseSeries(records[0], 'estimate')).toEqual([
      { date: '2026-09-01', value: 66.7 },
      { date: '2026-09-03', value: 73.3 },
    ]);
  });
});
