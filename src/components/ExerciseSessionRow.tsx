import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { setText } from '@/i18n/records';
import type { SessionSummary } from '@/lib/records';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatInteger } from '@/utils/format';

type ExerciseSessionRowProps = {
  session: SessionSummary;
  divider?: boolean;
};

/** Одна тренировка в истории упражнения: дата, лучший подход, тоннаж, отметка рекорда */
export function ExerciseSessionRow({ session, divider = false }: ExerciseSessionRowProps) {
  const { colors } = useTheme();
  const best = session.bestSet
    ? setText(session.bestSet)
    : session.maxReps !== null
      ? fill(ru.records.repsOnly, { reps: session.maxReps })
      : ru.records.noSets;
  const details = session.volume > 0 ? `${best} · ${fill(ru.records.volumeLine, { value: formatInteger(session.volume) })}` : best;
  return (
    <View
      style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
      accessible
      accessibilityLabel={`${isoToRuDate(session.date)}: ${details}${session.isRecord ? `. ${ru.records.recordBadge}` : ''}`}>
      <View style={styles.text}>
        <AppText variant="headline">{isoToRuDate(session.date)}</AppText>
        <AppText variant="callout" color="textSecondary">
          {details}
        </AppText>
      </View>
      {session.isRecord ? (
        <View style={styles.record}>
          <Icon name={icons.trophy} color="warning" size={18} />
          <AppText variant="caption" color="warning">
            {ru.records.recordBadge}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.lg,
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
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
