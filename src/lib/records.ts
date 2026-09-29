// Личные рекорды в упражнениях: лучший вес, расчётный максимум на 1 повтор, тоннаж, история.
// Считаются из записанных тренировок при показе — в базе не храним, как и результаты замеров.

/** Подходы с большим числом повторов для оценки максимума не годятся — слишком неточно */
export const MAX_REPS_FOR_ESTIMATE = 12;

export type SetResult = { reps: number | null; weight: number | null };

/** Одно упражнение в одной проведённой тренировке */
export type ExerciseSession = { workoutId: string; date: string; name: string; sets: SetResult[] };

/**
 * Расчётный максимум на 1 повтор (1ПМ) по формуле Эпли: вес × (1 + повторы / 30).
 * null — нет веса или повторов слишком много для оценки.
 */
export function estimatedOneRepMax(weight: number | null, reps: number | null): number | null {
  if (weight === null || reps === null || weight <= 0 || reps < 1 || reps > MAX_REPS_FOR_ESTIMATE) {
    return null;
  }
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

/** Ключ упражнения: «Жим  лёжа» и «жим лежа» — одно и то же упражнение */
export function exerciseKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru').replace(/ё/g, 'е');
}

export type BestSet = { weight: number; reps: number; date: string };

export type SessionSummary = {
  workoutId: string;
  date: string;
  /** Самый тяжёлый подход (при равном весе — с большим числом повторов) */
  bestSet: BestSet | null;
  bestEstimate: number | null;
  /** Больше всего повторов в подходе — для упражнений без веса */
  maxReps: number | null;
  /** Тоннаж: сумма повторы × вес, кг */
  volume: number;
  /** В этой тренировке побит прошлый рекорд */
  isRecord: boolean;
};

export type ExerciseRecord = {
  key: string;
  /** Название, как его записали в последний раз */
  name: string;
  /** По датам, старые сначала */
  sessions: SessionSummary[];
  bestSet: BestSet | null;
  bestEstimate: (BestSet & { value: number }) | null;
  maxReps: { reps: number; date: string } | null;
  lastDate: string;
};

function summarize(session: ExerciseSession): Omit<SessionSummary, 'isRecord'> {
  let bestSet: BestSet | null = null;
  let bestEstimate: number | null = null;
  let maxReps: number | null = null;
  let volume = 0;
  for (const { reps, weight } of session.sets) {
    if (reps !== null && reps > 0) {
      maxReps = Math.max(maxReps ?? 0, reps);
      if (weight !== null && weight > 0) {
        volume += reps * weight;
        if (!bestSet || weight > bestSet.weight || (weight === bestSet.weight && reps > bestSet.reps)) {
          bestSet = { weight, reps, date: session.date };
        }
      }
    }
    const estimate = estimatedOneRepMax(weight, reps);
    if (estimate !== null && (bestEstimate === null || estimate > bestEstimate)) {
      bestEstimate = estimate;
    }
  }
  return { workoutId: session.workoutId, date: session.date, bestSet, bestEstimate, maxReps, volume };
}

/** Небольшой запас, чтобы округления не давали «рекорд» на тех же цифрах */
const EPSILON = 1e-6;

/**
 * Рекорды по каждому упражнению. Рекорд тренировки — если побит прошлый лучший вес, расчётный
 * максимум или, для упражнений без веса, число повторов. Первая тренировка рекордом не считается:
 * бить ещё нечего. Сначала упражнения, которые делали чаще, потом недавние.
 */
export function exerciseRecords(sessions: ExerciseSession[]): ExerciseRecord[] {
  const groups = new Map<string, ExerciseSession[]>();
  for (const session of sessions) {
    const key = exerciseKey(session.name);
    if (key === '') {
      continue;
    }
    groups.set(key, [...(groups.get(key) ?? []), session]);
  }

  const records: ExerciseRecord[] = [];
  for (const [key, group] of groups) {
    const ordered = [...group].sort((a, b) => a.date.localeCompare(b.date));
    let bestSet: BestSet | null = null;
    let bestEstimate: ExerciseRecord['bestEstimate'] = null;
    let maxReps: ExerciseRecord['maxReps'] = null;
    const summaries: SessionSummary[] = [];

    for (const [index, session] of ordered.entries()) {
      const summary = summarize(session);
      const heavier = summary.bestSet !== null && (bestSet === null || summary.bestSet.weight > bestSet.weight + EPSILON);
      const stronger =
        summary.bestEstimate !== null && (bestEstimate === null || summary.bestEstimate > bestEstimate.value + EPSILON);
      const moreReps =
        summary.bestSet === null && summary.maxReps !== null && (maxReps === null || summary.maxReps > maxReps.reps);
      summaries.push({ ...summary, isRecord: index > 0 && (heavier || stronger || moreReps) });

      if (heavier && summary.bestSet) {
        bestSet = summary.bestSet;
      }
      if (stronger && summary.bestEstimate !== null) {
        const set = session.sets.find((s) => estimatedOneRepMax(s.weight, s.reps) === summary.bestEstimate);
        bestEstimate = { value: summary.bestEstimate, weight: set?.weight ?? 0, reps: set?.reps ?? 0, date: session.date };
      }
      if (summary.maxReps !== null && (maxReps === null || summary.maxReps > maxReps.reps)) {
        maxReps = { reps: summary.maxReps, date: session.date };
      }
    }

    const last = ordered[ordered.length - 1];
    records.push({ key, name: last.name.trim(), sessions: summaries, bestSet, bestEstimate, maxReps, lastDate: last.date });
  }

  return records.sort(
    (a, b) => b.sessions.length - a.sessions.length || b.lastDate.localeCompare(a.lastDate) || a.name.localeCompare(b.name, 'ru'),
  );
}

/** Тренировки, в которых побит хотя бы один рекорд — для отметки в списке */
export function recordWorkoutIds(records: ExerciseRecord[]): Set<string> {
  return new Set(records.flatMap((record) => record.sessions.filter((s) => s.isRecord).map((s) => s.workoutId)));
}

export type ExerciseMetric = 'estimate' | 'weight' | 'volume' | 'reps';

/** Какие графики есть у упражнения: с весом — максимум, вес, тоннаж; без веса — повторы */
export function exerciseMetrics(record: ExerciseRecord): ExerciseMetric[] {
  const metrics: ExerciseMetric[] = [];
  if (record.sessions.some((s) => s.bestEstimate !== null)) {
    metrics.push('estimate');
  }
  if (record.bestSet) {
    metrics.push('weight', 'volume');
  } else if (record.maxReps) {
    metrics.push('reps');
  }
  return metrics;
}

/** Точки графика упражнения по датам */
export function exerciseSeries(record: ExerciseRecord, metric: ExerciseMetric): { date: string; value: number }[] {
  const value = (s: SessionSummary): number | null => {
    switch (metric) {
      case 'estimate':
        return s.bestEstimate;
      case 'weight':
        return s.bestSet?.weight ?? null;
      case 'volume':
        return s.volume > 0 ? s.volume : null;
      case 'reps':
        return s.maxReps;
    }
  };
  return record.sessions.flatMap((s) => {
    const v = value(s);
    return v === null ? [] : [{ date: s.date, value: Math.round(v * 10) / 10 }];
  });
}
