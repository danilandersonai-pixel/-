import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { TableName } from '@/db/changes';
import { listActiveClients } from '@/db/clients';
import { workoutReminderLead } from '@/db/settings';
import { useLiveData } from '@/db/useLiveData';
import { useSetting } from '@/db/useSetting';
import { listPlannedFrom } from '@/db/workouts';
import { onReminderOpened, scheduleWorkoutReminders } from '@/device/notifications';
import { ru } from '@/i18n/ru';
import { clientFullName } from '@/lib/clients';
import { planWorkoutReminders, type ReminderLead, type WorkoutReminder } from '@/lib/workoutReminders';
import { toIsoDate } from '@/utils/date';
import { fill } from '@/utils/format';

const t = ru.reminders;
const tables: readonly TableName[] = ['workouts', 'clients'];

async function loadPlanned() {
  return { planned: await listPlannedFrom(toIsoDate(new Date())), clients: await listActiveClients() };
}

function reminderText(reminder: WorkoutReminder, lead: Exclude<ReminderLead, 'off'>) {
  return reminder.startTime
    ? {
        title: fill(t.titleAt, { time: reminder.startTime }),
        body: fill(t.bodyIn, { name: reminder.clientName, lead: t.options[lead] }),
      }
    : { title: t.titleToday, body: reminder.clientName };
}

/**
 * Держит напоминания телефона в соответствии с календарём: при любом изменении тренировок,
 * подопечных или настройки — и при каждом возвращении в приложение (чтобы окно в две недели сдвигалось).
 * Ничего не рисует.
 */
export function WorkoutReminderSync() {
  const lead = useSetting(workoutReminderLead);
  const { data } = useLiveData(tables, loadPlanned);
  const [resumed, setResumed] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setResumed((count) => count + 1);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(
    () =>
      onReminderOpened((clientId, workoutId) =>
        router.push({ pathname: '/client/[id]/workout', params: { id: clientId, wid: workoutId } }),
      ),
    [],
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    const names = new Map(data.clients.map((client) => [client.id, clientFullName(client)]));
    const reminders =
      lead === 'off'
        ? []
        : planWorkoutReminders(data.planned, names, Number(lead), new Date()).map((reminder) => ({
            id: reminder.id,
            clientId: reminder.clientId,
            at: reminder.at,
            ...reminderText(reminder, lead),
          }));
    void scheduleWorkoutReminders(reminders, t.channel);
  }, [data, lead, resumed]);

  return null;
}
