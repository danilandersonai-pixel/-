import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DeltaBadge } from '@/components/DeltaBadge';
import { ru } from '@/i18n/ru';
import type { CompareRow } from '@/lib/compare';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { formatMeasure } from '@/utils/format';

/** Строка сравнения: показатель, «было → стало» и разница */
export function CompareRowView({ row, divider = false }: { row: CompareRow; divider?: boolean }) {
  const { colors } = useTheme();
  const unit = ru.progress.units[row.unit];
  const show = (value: number | null) => (value === null ? ru.compare.empty : formatMeasure(value));
  return (
    <View style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
      <AppText variant="body" style={styles.label}>
        {ru.progress.metrics[row.id]}
      </AppText>
      <View style={styles.values}>
        <AppText variant="headline">{`${show(row.from)} → ${show(row.to)}${unit ? ` ${unit}` : ''}`}</AppText>
        <DeltaBadge delta={row.delta} direction={row.direction} unit={unit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: {
    flex: 1,
  },
  values: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
