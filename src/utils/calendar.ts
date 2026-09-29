import { toIsoDate } from './date';

export const weekdayShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

const monthNamesGenitive = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const;

/** «29 сентября» */
export function dayMonthTitle(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${day} ${monthNamesGenitive[month - 1]}`;
}

/** Месяц как год и номер 0–11 */
export type MonthRef = { year: number; month: number };

export function monthOf(iso: string): MonthRef {
  const [year, month] = iso.split('-').map(Number);
  return { year, month: month - 1 };
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** «Сентябрь 2026» */
export function monthTitle({ year, month }: MonthRef): string {
  return `${monthNames[month]} ${year}`;
}

/**
 * Сетка месяца по неделям с понедельника. Дни соседних месяцев — null.
 * Каждая неделя — 7 ячеек с датой «ГГГГ-ММ-ДД» или null.
 */
export function monthGrid({ year, month }: MonthRef): (string | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // В JS воскресенье — 0; нам нужен понедельник первым
  const leading = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** Первый и последний день месяца «ГГГГ-ММ-ДД» */
export function monthRange({ year, month }: MonthRef): { from: string; to: string } {
  return { from: toIsoDate(new Date(year, month, 1)), to: toIsoDate(new Date(year, month + 1, 0)) };
}

/** День недели коротко: «Пн» */
export function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return weekdayShort[(new Date(y, m - 1, d).getDay() + 6) % 7];
}

/** «Пт 02.10, 18:00» — коротко для списков */
export function shortWhen(dateIso: string, startTime: string | null): string {
  const [, month, day] = dateIso.split('-');
  return `${weekdayOf(dateIso)} ${day}.${month}${startTime ? `, ${startTime}` : ''}`;
}
