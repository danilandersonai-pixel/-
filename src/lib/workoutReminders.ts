// Напоминания тренеру о запланированных тренировках — локальные уведомления телефона, без сервера.

import type { Workout } from '@/db/schema';

export const reminderLeads = ['off', '30', '60', '120'] as const;

/** За сколько минут напоминать; off — не напоминать */
export type ReminderLead = (typeof reminderLeads)[number];

/** На сколько дней вперёд ставим напоминания: телефоны ограничивают число запланированных уведомлений */
export const REMINDER_HORIZON_DAYS = 14;
export const MAX_REMINDERS = 50;
/** Во сколько напоминать о тренировке без времени начала */
export const NO_TIME_HOUR = 9;

export type WorkoutReminder = {
  /** id тренировки */
  id: string;
  clientId: string;
  at: Date;
  clientName: string;
  startTime: string | null;
};

export function parseReminderLead(raw: string | null): ReminderLead {
  return reminderLeads.find((lead) => lead === raw) ?? 'off';
}

/** Местное время по дате ГГГГ-ММ-ДД и времени ЧЧ:ММ */
function localTime(dateIso: string, hours: number, minutes: number): Date {
  const [y, m, d] = dateIso.split('-').map(Number);
  return new Date(y, m - 1, d, hours, minutes);
}

/**
 * Когда напоминать: за leadMinutes до начала, а если время не указано — в 9:00 того же дня.
 * Только запланированные тренировки подопечных из clientNames (архивные туда не попадают),
 * только будущие и не дальше двух недель.
 */
export function planWorkoutReminders(
  workouts: Pick<Workout, 'id' | 'clientId' | 'date' | 'startTime' | 'status'>[],
  clientNames: ReadonlyMap<string, string>,
  leadMinutes: number,
  now: Date,
): WorkoutReminder[] {
  // Граница — конец дня «сегодня + 14 дней»
  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + REMINDER_HORIZON_DAYS + 1);
  const reminders: WorkoutReminder[] = [];
  for (const workout of workouts) {
    const clientName = clientNames.get(workout.clientId);
    if (workout.status !== 'planned' || clientName === undefined) {
      continue;
    }
    let at: Date;
    if (workout.startTime) {
      const [hours, minutes] = workout.startTime.split(':').map(Number);
      at = new Date(localTime(workout.date, hours, minutes).getTime() - leadMinutes * 60_000);
    } else {
      at = localTime(workout.date, NO_TIME_HOUR, 0);
    }
    if (at.getTime() > now.getTime() && at < horizon) {
      reminders.push({ id: workout.id, clientId: workout.clientId, at, clientName, startTime: workout.startTime });
    }
  }
  return reminders.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_REMINDERS);
}
