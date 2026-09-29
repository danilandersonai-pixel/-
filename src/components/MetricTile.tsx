import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DeltaBadge } from '@/components/DeltaBadge';
import { InfoButton } from '@/components/InfoButton';
import { radius, spacing, useTheme } from '@/theme';
import { formatMeasure } from '@/utils/format';

type MetricTileProps = {
  label: string;
  value: number | null;
  unit: string;
  errorMargin: number | null;
  delta: number | null;
  direction: 'up' | 'down' | 'neutral';
  /** Почему не посчиталось — показываем вместо числа */
  problem: string | null;
  infoLabel: string;
  infoOpen: boolean;
  onInfo: () => void;
};

/** Плитка показателя: крупное число, погрешность, изменение и «?» */
export function MetricTile(props: MetricTileProps) {
  const { label, value, unit, errorMargin, delta, direction, problem, infoLabel, infoOpen, onInfo } = props;
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: colors.surface, borderColor: infoOpen ? colors.primary : colors.border },
      ]}>
      <View style={styles.header}>
        <AppText variant="caption" color="textSecondary" style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
        <InfoButton label={infoLabel} onPress={onInfo} active={infoOpen} />
      </View>
      {value === null ? (
        <AppText variant="caption" color="textTertiary">
          {problem ?? '—'}
        </AppText>
      ) : (
        <>
          <View style={styles.valueRow}>
            <AppText variant="title" style={styles.value}>
              {formatMeasure(value)}
            </AppText>
            {unit ? (
              <AppText variant="callout" color="textSecondary">
                {unit}
              </AppText>
            ) : null}
          </View>
          {errorMargin !== null ? (
            <AppText variant="caption" color="textTertiary">
              {`±${formatMeasure(errorMargin)}${unit ? ` ${unit}` : ''}`}
            </AppText>
          ) : null}
          <DeltaBadge delta={delta} direction={direction} unit={unit} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
