import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { StatTile } from '@/components/StatTile';
import { WorkoutRow } from '@/components/WorkoutRow';
import type { Client } from '@/db/schema';
import { useWorkouts } from '@/db/useWorkouts';
import { ru } from '@/i18n/ru';
import { workoutStats } from '@/lib/workouts';
import { spacing } from '@/theme';
import { shortWhen } from '@/utils/calendar';
import { toIsoDate } from '@/utils/date';
import { fill, formatMeasure } from '@/utils/format';

const t = ru.workout;

/** Вкладка «Тренировки»: счётчики, ближайшая тренировка и история */
export function ClientWorkoutsTab({ client }: { client: Client }) {
  const { data: workouts } = useWorkouts(client.id);
  const openNew = () => router.push({ pathname: '/client/[id]/workout', params: { id: client.id } });
  const openWorkout = (wid: string) => router.push({ pathname: '/client/[id]/workout', params: { id: client.id, wid } });

  if (!workouts) {
    return null;
  }
  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={icons.workouts}
        title={t.listEmptyTitle}
        hint={t.listEmptyHint}
        action={<Button title={t.emptyAction} icon={icons.add} onPress={openNew} />}
      />
    );
  }

  const stats = workoutStats(workouts);
  const today = toIsoDate(new Date());
  const next = [...workouts].reverse().find((w) => w.status === 'planned' && w.date >= today);

  return (
    <View style={styles.tab}>
      <View style={styles.stats}>
        <StatTile label={t.statsDone} value={String(stats.done)} />
        <StatTile label={t.statsHours} value={fill(t.hours, { value: formatMeasure(stats.minutes / 60) })} />
      </View>
      <StatTile label={t.statsNext} value={next ? shortWhen(next.date, next.startTime) : t.statsNone} />
      <Button title={t.add} icon={icons.add} onPress={openNew} />
      <Card>
        {workouts.map((workout, index) => (
          <WorkoutRow
            key={workout.id}
            workout={workout}
            exerciseCount={workout.exerciseCount}
            divider={index > 0}
            onPress={() => openWorkout(workout.id)}
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    gap: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
