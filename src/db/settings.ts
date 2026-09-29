// Настройки телефона, кроме темы (она в src/theme): профиль тренера и служебные отметки.

import { parseFlag } from '@/lib/appLock';
import { parseTimestamp } from '@/lib/backupReminder';
import { createSetting, parseJson } from '@/lib/settingStore';
import { emptyTrainerProfile, isTrainerProfile, type TrainerProfile } from '@/lib/trainer';
import { parseReminderLead, type ReminderLead } from '@/lib/workoutReminders';

import { kv } from './kv';

export const trainerProfile = createSetting<TrainerProfile>(
  kv,
  'trainerProfile',
  (raw) => parseJson(raw, emptyTrainerProfile, isTrainerProfile),
  (value) => JSON.stringify(value),
);

const timestamp = (key: string) =>
  createSetting<number | null>(kv, key, parseTimestamp, (value) => (value === null ? '' : String(value)));

/** Когда последний раз сохраняли резервную копию */
export const lastBackupAt = timestamp('lastBackupAt');

/** До какого момента отложено напоминание о копии («Позже») */
export const backupSnoozedUntil = timestamp('backupSnoozedUntil');

/** Вход по Face ID / отпечатку / коду телефона */
export const appLockEnabled = createSetting<boolean>(kv, 'appLock', parseFlag, (value) => (value ? '1' : '0'));

/** За сколько минут напоминать о запланированной тренировке */
export const workoutReminderLead = createSetting<ReminderLead>(kv, 'workoutReminderLead', parseReminderLead, String);
