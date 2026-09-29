// Напоминание о резервной копии: данные живут только на телефоне, и без копии их легко потерять.

/** Через сколько дней после последней копии напоминать */
export const BACKUP_REMINDER_DAYS = 7;

/** На сколько дней откладывает кнопка «Позже» */
export const BACKUP_SNOOZE_DAYS = 3;

const DAY_MS = 86_400_000;

type ReminderInput = {
  /** Когда последний раз сохраняли копию, мс; null — ни разу */
  lastBackupAt: number | null;
  /** До какого момента напоминание отложено, мс */
  snoozedUntil: number | null;
  /** Когда появились первые данные (самый старый подопечный), мс; null — данных нет */
  oldestDataAt: number | null;
  now: Date;
};

/** null — напоминать не нужно; days — сколько дней прошло с последней копии (null — копии не было) */
export function backupReminder({ lastBackupAt, snoozedUntil, oldestDataAt, now }: ReminderInput): { days: number | null } | null {
  const time = now.getTime();
  if (oldestDataAt === null || (snoozedUntil !== null && time < snoozedUntil)) {
    return null;
  }
  const since = lastBackupAt ?? oldestDataAt;
  if (time - since < BACKUP_REMINDER_DAYS * DAY_MS) {
    return null;
  }
  return { days: lastBackupAt === null ? null : Math.floor((time - lastBackupAt) / DAY_MS) };
}

export function snoozeUntil(now: Date): number {
  return now.getTime() + BACKUP_SNOOZE_DAYS * DAY_MS;
}

/** Отметка времени из хранилища настроек; пусто или мусор — null */
export function parseTimestamp(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
