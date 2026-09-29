import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type StepProgressProps = {
  current: number;
  total: number;
  /** «Шаг 2 из 3» */
  label: string;
  title: string;
};

/** Полоска прогресса пошагового ввода */
export function StepProgress({ current, total, label, title }: StepProgressProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper} accessibilityRole="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.bar, { backgroundColor: index <= current ? colors.primary : colors.surfaceMuted }]}
          />
        ))}
      </View>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="title">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
});
