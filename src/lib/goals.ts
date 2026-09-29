// Цель подопечного: насколько пройден путь и когда при нынешнем темпе цель будет достигнута.
// Ничего не храним — всё считается из замеров при показе.

import type { Goal, GoalMetric } from '@/db/schema';
import { addDays, daysBetween, parseRuDate } from '@/utils/date';
import { parseDecimal } from '@/utils/format';

import type { ProgressPoint } from './progress';

export const goalMetrics: readonly GoalMetric[] = ['weight', 'bodyFat', 'fatMass', 'leanMass', 'waist', 'hips'];

/** По скольким последним дням считать темп: старые замеры о нынешнем темпе говорят мало */
export const TREND_WINDOW_DAYS = 90;
/** Прогноз дальше этого — «при нынешнем темпе не скоро» */
const MAX_FORECAST_DAYS = 3 * 365;

export type GoalProgress = {
  /** Значение на старте: последний замер не позже даты постановки цели, иначе первый после неё */
  start: ProgressPoint | null;
  current: ProgressPoint | null;
  /** Доля пройденного пути 0…1 (null — не с чем сравнить) */
  progress: number | null;
  /** Сколько осталось до цели (со знаком: минус — нужно снизить) */
  remaining: number | null;
  reached: boolean;
  /** Темп за неделю по последним замерам (null — мало данных) */
  perWeek: number | null;
  /** Когда при таком темпе будет цель; null — темп не ведёт к цели или данных мало */
  forecast: string | null;
  /** Успеваем к сроку: true / false; null — срока нет или прогноза нет */
  onTime: boolean | null;
};

/** Наклон прямой по методу наименьших квадратов: изменение в день */
function slopePerDay(points: ProgressPoint[]): number | null {
  const first = points[0]?.date;
  if (!first || points.length < 2) {
    return null;
  }
  const xs = points.map((p) => daysBetween(first, p.date));
  const n = points.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = points.reduce((a, p) => a + p.value, 0) / n;
  let num = 0;
  let den = 0;
  points.forEach((p, i) => {
    num += (xs[i] - meanX) * (p.value - meanY);
    den += (xs[i] - meanX) ** 2;
  });
  return den === 0 ? null : num / den;
}

/** series — значения показателя по датам, старые сначала (progressSeries) */
export function goalProgress(goal: Pick<Goal, 'targetValue' | 'targetDate' | 'startDate'>, series: ProgressPoint[]): GoalProgress {
  const empty: GoalProgress = {
    start: null,
    current: null,
    progress: null,
    remaining: null,
    reached: false,
    perWeek: null,
    forecast: null,
    onTime: null,
  };
  if (series.length === 0) {
    return empty;
  }
  const current = series[series.length - 1];
  const start = [...series].reverse().find((p) => p.date <= goal.startDate) ?? series[0];
  const target = goal.targetValue;
  const wantsDown = target < start.value;
  const reached = wantsDown ? current.value <= target : current.value >= target;
  const totalPath = target - start.value;
  const progress = totalPath === 0 ? 1 : Math.min(1, Math.max(0, (current.value - start.value) / totalPath));

  const recent = series.filter((p) => daysBetween(p.date, current.date) <= TREND_WINDOW_DAYS);
  const spanDays = recent.length > 1 ? daysBetween(recent[0].date, current.date) : 0;
  const slope = spanDays >= 7 ? slopePerDay(recent) : null;

  let forecast: string | null = null;
  if (!reached && slope !== null) {
    const days = (target - current.value) / slope;
    if (days > 0 && days <= MAX_FORECAST_DAYS) {
      forecast = addDays(current.date, Math.ceil(days));
    }
  }

  return {
    start,
    current,
    progress,
    remaining: reached ? 0 : target - current.value,
    reached,
    perWeek: slope === null ? null : slope * 7,
    forecast,
    onTime: goal.targetDate && forecast ? forecast <= goal.targetDate : goal.targetDate && reached ? true : null,
  };
}

export type GoalFormValues = { metric: GoalMetric; target: string; targetDate: string };
export type GoalFormErrors = Partial<Record<'target' | 'targetDate', 'required' | 'invalid'>>;

/** Форма цели → поля для сохранения. Срок необязателен; без целевого значения сохранять нечего. */
export function goalFormToFields(
  values: GoalFormValues,
  startDate: string,
): { fields: (Pick<Goal, 'metric' | 'targetValue' | 'startDate' | 'targetDate'>) | null; errors: GoalFormErrors } {
  const errors: GoalFormErrors = {};
  const target = parseDecimal(values.target);
  if (values.target.trim() === '') {
    errors.target = 'required';
  } else if (target === null || target <= 0) {
    errors.target = 'invalid';
  }
  const dateText = values.targetDate.trim();
  const targetDate = dateText === '' ? null : parseRuDate(dateText);
  if (dateText !== '' && !targetDate) {
    errors.targetDate = 'invalid';
  }
  if (errors.target || errors.targetDate || target === null) {
    return { fields: null, errors };
  }
  return { fields: { metric: values.metric, targetValue: target, startDate, targetDate }, errors };
}
