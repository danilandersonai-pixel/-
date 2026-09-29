// Браузерная версия notifications.ts: в превью уведомлений нет.

import type { ScheduledReminder } from './notifications';

const api = {
  notificationsUnavailable: 'web' as 'web' | 'expoGoAndroid' | null,
  async requestNotificationPermission(): Promise<boolean> {
    return false;
  },
  async scheduleWorkoutReminders(_reminders: ScheduledReminder[], _channelName: string): Promise<void> {},
  onReminderOpened(_onOpen: (clientId: string, workoutId: string) => void): () => void {
    return () => undefined;
  },
} satisfies typeof import('./notifications');

export type { ScheduledReminder };
export const { notificationsUnavailable, requestNotificationPermission, scheduleWorkoutReminders, onReminderOpened } = api;
