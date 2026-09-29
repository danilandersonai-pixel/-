// Локальные уведомления о тренировках: их ставит сам телефон, без сервера и интернета.

import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

/** Почему уведомления недоступны; null — доступны */
export const notificationsUnavailable: 'web' | 'expoGoAndroid' | null =
  Platform.OS === 'android' && isRunningInExpoGo() ? 'expoGoAndroid' : null;

export type ScheduledReminder = {
  id: string;
  at: Date;
  title: string;
  body: string;
  /** Что открыть по нажатию */
  clientId: string;
};

const CHANNEL_ID = 'workouts';
const ID_PREFIX = 'workout-';

type NotificationsModule = typeof import('expo-notifications');
let loaded: Promise<NotificationsModule> | null = null;

// Библиотеку грузим только там, где она работает: в Expo Go на Android она падает уже при загрузке,
// потому что Expo Go там не поддерживает push-уведомления (а локальные нам нужны только в сборке).
function load(): Promise<NotificationsModule> {
  loaded ??= import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return Notifications;
  });
  return loaded;
}

/** Спросить разрешение (если ещё не спрашивали). true — можно показывать уведомления. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (notificationsUnavailable) {
    return false;
  }
  const Notifications = await load();
  if ((await Notifications.getPermissionsAsync()).granted) {
    return true;
  }
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function replaceReminders(reminders: ScheduledReminder[], channelName: string): Promise<void> {
  const Notifications = await load();
  const ours = (await Notifications.getAllScheduledNotificationsAsync()).filter((r) => r.identifier.startsWith(ID_PREFIX));
  for (const request of ours) {
    await Notifications.cancelScheduledNotificationAsync(request.identifier);
  }
  if (reminders.length === 0 || !(await Notifications.getPermissionsAsync()).granted) {
    return;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}${reminder.id}`,
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: true,
        data: { clientId: reminder.clientId, workoutId: reminder.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, channelId: CHANNEL_ID },
    });
  }
}

let queue: Promise<void> = Promise.resolve();

/** Заменить все напоминания о тренировках новым списком. Вызовы выполняются по очереди. */
export function scheduleWorkoutReminders(reminders: ScheduledReminder[], channelName: string): Promise<void> {
  if (notificationsUnavailable) {
    return Promise.resolve();
  }
  queue = queue.then(() => replaceReminders(reminders, channelName)).catch(() => undefined);
  return queue;
}

/** Нажатие на уведомление: вызывает onOpen с подопечным и тренировкой. Возвращает отписку. */
export function onReminderOpened(onOpen: (clientId: string, workoutId: string) => void): () => void {
  if (notificationsUnavailable) {
    return () => undefined;
  }
  let subscription: { remove(): void } | null = null;
  let cancelled = false;
  void load().then((Notifications) => {
    if (cancelled) {
      return;
    }
    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (typeof data?.clientId === 'string' && typeof data.workoutId === 'string') {
        onOpen(data.clientId, data.workoutId);
      }
    });
  });
  return () => {
    cancelled = true;
    subscription?.remove();
  };
}
