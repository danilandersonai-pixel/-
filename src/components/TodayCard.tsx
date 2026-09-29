import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import { TodayRow } from '@/components/TodayRow';
import { TodayWorkoutRow } from '@/components/TodayWorkoutRow';
import type { Client, Measurement, Workout } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { clientFullName } from '@/lib/clients';
import { measurementsDue, plannedOn, upcomingBirthdays } from '@/lib/today';
import { spacing } from '@/theme';
import { dayMonthTitle } from '@/utils/calendar';
import { fill } from '@/utils/format';
import { pluralRu } from '@/utils/plural';

/** Сколько напоминаний о замерах показывать — остальные видны в списке */
const MAX_DUE = 3;

type TodayCardProps = {
  todayIso: string;
  clients: Client[];
  measurementsByClient: Map<string, Measurement[]>;
  planned: Workout[];
};

const t = ru.today;

function daysText(days: number): string {
  return `${days} ${pluralRu(days, t.dayForms)}`;
}

function ageText(age: number): string {
  return `${age} ${pluralRu(age, ru.card.ageForms)}`;
}

/** «Сегодня»: тренировки дня, дни рождения и кому пора делать замер. Пусто — блок не показывается. */
export function TodayCard({ todayIso, clients, measurementsByClient, planned }: TodayCardProps) {
  const byId = new Map(clients.map((client) => [client.id, client]));
  const workouts = plannedOn(planned, todayIso).flatMap((workout) => {
    const client = byId.get(workout.clientId);
    return client ? [{ workout, name: clientFullName(client) }] : [];
  });
  const birthdays = upcomingBirthdays(clients, todayIso);
  const due = measurementsDue(clients, measurementsByClient, todayIso);
  if (workouts.length + birthdays.length + due.length === 0) {
    return null;
  }

  const openClient = (id: string, tab?: string) =>
    router.push({ pathname: '/client/[id]', params: tab ? { id, tab } : { id } });
  // Разделители — только между обычными строками; плашки тренировок идут отдельно сверху
  let index = 0;
  const divider = () => index++ > 0;

  return (
    <Card title={fill(t.title, { date: dayMonthTitle(todayIso) })}>
      {workouts.map(({ workout, name }) => (
        <TodayWorkoutRow
          key={workout.id}
          time={workout.startTime}
          name={name}
          subtitle={t.workout}
          onPress={() => router.push({ pathname: '/client/[id]/workout', params: { id: workout.clientId, wid: workout.id } })}
        />
      ))}
      {workouts.length > 0 ? <View style={styles.afterPlaques} /> : null}
      {birthdays.map(({ client, inDays, age }) => (
        <TodayRow
          key={`birthday-${client.id}`}
          icon={icons.birthday}
          tone="success"
          title={clientFullName(client)}
          subtitle={
            inDays === 0
              ? fill(t.birthdayToday, { age: ageText(age) })
              : fill(t.birthdaySoon, {
                  when: inDays === 1 ? t.tomorrow : fill(t.inDays, { days: daysText(inDays) }),
                  age: ageText(age),
                })
          }
          divider={divider()}
          onPress={() => openClient(client.id)}
        />
      ))}
      {due.slice(0, MAX_DUE).map(({ client, daysSince }) => (
        <TodayRow
          key={`due-${client.id}`}
          icon={icons.measurements}
          tone="warning"
          title={clientFullName(client)}
          subtitle={daysSince === null ? t.measureNever : fill(t.measureDue, { days: daysText(daysSince) })}
          divider={divider()}
          onPress={() => openClient(client.id, 'measurements')}
        />
      ))}
      {due.length > MAX_DUE ? (
        <AppText variant="caption" color="textSecondary" style={styles.more}>
          {fill(t.more, { count: due.length - MAX_DUE })}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  afterPlaques: {
    height: spacing.sm,
  },
  more: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
