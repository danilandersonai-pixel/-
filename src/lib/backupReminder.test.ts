import { backupReminder, parseTimestamp, snoozeUntil } from './backupReminder';

const day = 86_400_000;
const now = new Date('2026-09-29T12:00:00Z');
const at = (daysAgo: number) => now.getTime() - daysAgo * day;

describe('напоминание о резервной копии', () => {
  it('нет данных — не напоминаем', () => {
    expect(backupReminder({ lastBackupAt: null, snoozedUntil: null, oldestDataAt: null, now })).toBeNull();
  });

  it('копию не сохраняли: напоминаем, когда данным неделя', () => {
    expect(backupReminder({ lastBackupAt: null, snoozedUntil: null, oldestDataAt: at(6), now })).toBeNull();
    expect(backupReminder({ lastBackupAt: null, snoozedUntil: null, oldestDataAt: at(7), now })).toEqual({ days: null });
  });

  it('копии больше недели — напоминаем и говорим, сколько дней', () => {
    expect(backupReminder({ lastBackupAt: at(3), snoozedUntil: null, oldestDataAt: at(60), now })).toBeNull();
    expect(backupReminder({ lastBackupAt: at(12.5), snoozedUntil: null, oldestDataAt: at(60), now })).toEqual({ days: 12 });
  });

  it('«Позже» откладывает на три дня', () => {
    const snoozed = snoozeUntil(now);
    expect(snoozed).toBe(at(-3));
    expect(backupReminder({ lastBackupAt: at(12), snoozedUntil: snoozed, oldestDataAt: at(60), now })).toBeNull();
    const later = new Date(snoozed + 1);
    expect(backupReminder({ lastBackupAt: at(12), snoozedUntil: snoozed, oldestDataAt: at(60), now: later })).toEqual({ days: 15 });
  });

  it('отметки времени из хранилища', () => {
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp('abc')).toBeNull();
    expect(parseTimestamp('1759147200000')).toBe(1759147200000);
  });
});
