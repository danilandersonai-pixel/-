import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DeltaBadge } from '@/components/DeltaBadge';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatMeasure, formatNumber } from '@/utils/format';

type MeasurementRowProps = {
  date: string;
  weight: number;
  bodyFat: number | null;
  bodyFatDelta: number | null;
  onPress: () => void;
  divider?: boolean;
};

/** Строка истории замеров: дата, вес, % жира и изменение */
export function MeasurementRow({ date, weight, bodyFat, bodyFatDelta, onPress, divider = false }: MeasurementRowProps) {
  const { colors } = useTheme();
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
        <AppText variant="headline">{isoToRuDate(date)}</AppText>
        <AppText variant="callout" color="textSecondary">
          {fill(ru.measurement.listWeight, { value: formatMeasure(weight) })}
        </AppText>
      </View>
      {bodyFat !== null ? (
        <View style={styles.value}>
          <AppText variant="headline">{`${formatNumber(bodyFat, 1)} %`}</AppText>
          <DeltaBadge delta={bodyFatDelta} direction="down" unit="%" />
        </View>
      ) : null}
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
  value: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
