// Блок «Сегодня» на главном экране: тренировки дня, кому пора делать замер, дни рождения.

import type { Client, Measurement, Workout } from '@/db/schema';
import { daysBetween } from '@/utils/date';

/** Через сколько дней после последнего замера напоминать о новом */
export const MEASUREMENT_INTERVAL_DAYS = 30;

/** За сколько дней предупреждать о дне рождения */
export const BIRTHDAY_LOOKAHEAD_DAYS = 7;

/** Пора ли делать замер: null — ещё рано, иначе дней с последнего замера */
export function measurementOverdueDays(lastDate: string, todayIso: string): number | null {
  const days = daysBetween(lastDate, todayIso);
  return days >= MEASUREMENT_INTERVAL_DAYS ? days : null;
}

export type MeasurementDue = {
  client: Client;
  /** Дней с последнего замера; null — замеров ещё не было */
  daysSince: number | null;
};

/**
 * Кому пора делать замер: последний замер 30+ дней назад или замеров ещё нет.
 * Сначала самые давние, в конце — те, у кого замеров не было.
 */
export function measurementsDue(
  clients: Client[],
  measurementsByClient: Map<string, Measurement[]>,
  todayIso: string,
): MeasurementDue[] {
  const due: MeasurementDue[] = [];
  for (const client of clients) {
    const list = measurementsByClient.get(client.id) ?? [];
    if (list.length === 0) {
      due.push({ client, daysSince: null });
      continue;
    }
    const last = list.reduce((latest, m) => (m.date > latest ? m.date : latest), list[0].date);
    const days = measurementOverdueDays(last, todayIso);
    if (days !== null) {
      due.push({ client, daysSince: days });
    }
  }
  return due.sort((a, b) => (b.daysSince ?? -1) - (a.daysSince ?? -1));
}

export type Birthday = {
  client: Client;
  /** 0 — сегодня */
  inDays: number;
  /** Сколько лет исполняется */
  age: number;
};

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Ближайший день рождения не раньше сегодня; 29 февраля в невисокосный год — 28-го */
function nextBirthday(birthIso: string, todayIso: string): { date: string; year: number } {
  const [, month, day] = birthIso.split('-');
  const todayYear = Number(todayIso.slice(0, 4));
  for (const year of [todayYear, todayYear + 1]) {
    const dayInYear = month === '02' && day === '29' && !isLeapYear(year) ? '28' : day;
    const date = `${year}-${month}-${dayInYear}`;
    if (date >= todayIso) {
      return { date, year };
    }
  }
  // Сюда не попадаем: день рождения в следующем году всегда позже сегодняшнего дня
  return { date: todayIso, year: todayYear };
}

/** Дни рождения сегодня и в ближайшую неделю, по порядку */
export function upcomingBirthdays(clients: Client[], todayIso: string): Birthday[] {
  const result: Birthday[] = [];
  for (const client of clients) {
    if (!client.birthDate) {
      continue;
    }
    const next = nextBirthday(client.birthDate, todayIso);
    const inDays = daysBetween(todayIso, next.date);
    if (inDays <= BIRTHDAY_LOOKAHEAD_DAYS) {
      result.push({ client, inDays, age: next.year - Number(client.birthDate.slice(0, 4)) });
    }
  }
  return result.sort((a, b) => a.inDays - b.inDays);
}

/** Запланированные тренировки на день, по времени; без времени — в конце */
export function plannedOn(workouts: Workout[], dayIso: string): Workout[] {
  return workouts
    .filter((w) => w.date === dayIso && w.status === 'planned' && w.deletedAt === null)
    .sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'));
}
