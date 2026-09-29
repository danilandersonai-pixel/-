import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import type { Workout } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';
import { shortWhen } from '@/utils/calendar';
import { pluralRu } from '@/utils/plural';

type WorkoutRowProps = {
  workout: Workout;
  /** Имя подопечного — в календаре, где тренировки всех */
  clientName?: string;
  exerciseCount?: number;
  onPress: () => void;
  divider?: boolean;
};

const t = ru.workout;

/** Строка тренировки: когда, статус, длительность, сколько упражнений */
export function WorkoutRow({ workout, clientName, exerciseCount, onPress, divider = false }: WorkoutRowProps) {
  const { colors } = useTheme();
  const planned = workout.status === 'planned';
  const details = [
    workout.durationMin ? `${workout.durationMin} ${t.minutes}` : null,
    exerciseCount === undefined
      ? null
      : exerciseCount === 0
        ? t.noExercises
        : `${exerciseCount} ${pluralRu(exerciseCount, t.exerciseForms)}`,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}>
      <View style={styles.text}>
        <AppText variant="headline">{clientName ?? shortWhen(workout.date, workout.startTime)}</AppText>
        <AppText variant="callout" color="textSecondary">
          {clientName ? [workout.startTime, ...details].filter(Boolean).join(' · ') || t.editTitle : details.join(' · ') || ' '}
        </AppText>
      </View>
      <View style={[styles.badge, { backgroundColor: planned ? colors.primarySoft : colors.surfaceMuted }]}>
        <AppText variant="caption" color={planned ? 'primary' : 'textSecondary'}>
          {planned ? t.planned : t.done}
        </AppText>
      </View>
      <Icon name={icons.chevronRight} color="textTertiary" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
});
