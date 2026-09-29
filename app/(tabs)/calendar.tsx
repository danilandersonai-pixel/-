import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import { MonthCalendar } from '@/components/MonthCalendar';
import { Screen } from '@/components/Screen';
import { WorkoutRow } from '@/components/WorkoutRow';
import { useActiveClients, useArchivedClients } from '@/db/useClients';
import { useWorkoutsBetween } from '@/db/useWorkouts';
import { ru } from '@/i18n/ru';
import { clientFullName } from '@/lib/clients';
import { spacing } from '@/theme';
import { monthOf, monthRange, shiftMonth, shortWhen } from '@/utils/calendar';
import { toIsoDate } from '@/utils/date';
import { fill } from '@/utils/format';

export default function CalendarScreen() {
  const today = toIsoDate(new Date());
  const [month, setMonth] = useState(monthOf(today));
  const [selected, setSelected] = useState(today);
  const range = monthRange(month);
  const { data: workouts } = useWorkoutsBetween(range.from, range.to);
  const { data: active } = useActiveClients();
  const { data: archived } = useArchivedClients();

  const names = new Map([...(active ?? []), ...(archived ?? [])].map((c) => [c.id, clientFullName(c)]));
  const counts = new Map<string, number>();
  for (const workout of workouts ?? []) {
    counts.set(workout.date, (counts.get(workout.date) ?? 0) + 1);
  }
  const ofDay = (workouts ?? []).filter((w) => w.date === selected);

  const changeMonth = (delta: number) => {
    const next = shiftMonth(month, delta);
    setMonth(next);
    setSelected(monthRange(next).from);
  };

  return (
    <Screen
      title={ru.calendar.title}
      subtitle={workouts ? fill(ru.calendar.monthCount, { count: workouts.length }) : undefined}>
      <View style={styles.content}>
        <MonthCalendar
          month={month}
          onMonthChange={changeMonth}
          selected={selected}
          onSelect={setSelected}
          today={today}
          counts={counts}
        />
        <AppText variant="title">{selected === today ? ru.calendar.today : shortWhen(selected, null)}</AppText>
        {ofDay.length === 0 ? (
          <AppText variant="callout" color="textSecondary">
            {ru.calendar.dayEmpty}
          </AppText>
        ) : (
          <Card>
            {ofDay.map((workout, index) => (
              <WorkoutRow
                key={workout.id}
                workout={workout}
                clientName={names.get(workout.clientId) ?? '—'}
                divider={index > 0}
                onPress={() =>
                  router.push({ pathname: '/client/[id]/workout', params: { id: workout.clientId, wid: workout.id } })
                }
              />
            ))}
          </Card>
        )}
        {active && active.length === 0 ? (
          <AppText variant="callout" color="textTertiary">
            {ru.calendar.noClients}
          </AppText>
        ) : (
          <Button
            title={selected < today ? ru.calendar.addDone : ru.calendar.add}
            icon={icons.add}
            onPress={() => router.push({ pathname: '/workout/new', params: { date: selected } })}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
});
