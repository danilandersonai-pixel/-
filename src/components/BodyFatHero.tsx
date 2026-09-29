import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DeltaBadge } from '@/components/DeltaBadge';
import { InfoButton } from '@/components/InfoButton';
import { problemText } from '@/i18n/calc';
import { ru } from '@/i18n/ru';
import { compositionDelta, type Composition } from '@/lib/calc/composition';
import { isSuccess } from '@/lib/calc/types';
import { radius, spacing, typography, useTheme } from '@/theme';
import { fill, formatMeasure, formatNumber } from '@/utils/format';

type BodyFatHeroProps = {
  composition: Composition;
  previous: Composition | undefined;
  /** Дата прошлого замера для подписи «к 01.09.2026» */
  previousDate: string | null;
  infoOpen: boolean;
  onInfo: () => void;
};

/** Главная цифра замера — процент жира, крупно, с методом и погрешностью */
export function BodyFatHero({ composition, previous, previousDate, infoOpen, onInfo }: BodyFatHeroProps) {
  const { colors } = useTheme();
  const { bodyFat, bodyFatByMethod } = composition;
  const { jp3, navy } = bodyFatByMethod;

  return (
    <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: infoOpen ? colors.primary : colors.border }]}>
      <View style={styles.header}>
        <AppText variant="headline" color="textSecondary" style={styles.label}>
          {ru.metrics.bodyFat}
        </AppText>
        <InfoButton label={fill(ru.measurement.howCalculated, { metric: ru.metrics.bodyFat })} onPress={onInfo} active={infoOpen} />
      </View>
      {isSuccess(bodyFat) ? (
        <>
          <View style={styles.valueRow}>
            <AppText style={[typography.number, { color: colors.text }]}>{formatNumber(bodyFat.value, 1)}</AppText>
            <AppText variant="title" color="textSecondary">
              %
            </AppText>
            {bodyFat.errorMargin !== null ? (
              <AppText variant="callout" color="textTertiary">
                {`±${formatMeasure(bodyFat.errorMargin)} %`}
              </AppText>
            ) : null}
          </View>
          <AppText variant="callout" color="textSecondary">
            {ru.methods[bodyFat.method]}
          </AppText>
          <DeltaBadge
            delta={compositionDelta('bodyFat', composition, previous)}
            direction="down"
            unit="%"
            suffix={previousDate ? fill(ru.measurement.vsPrevious, { date: previousDate }) : undefined}
          />
          {isSuccess(jp3) && isSuccess(navy) ? (
            <AppText variant="caption" color="textTertiary">
              {fill(ru.measurement.bothMethods, {
                jp3: `${formatNumber(jp3.value, 1)} %`,
                navy: `${formatNumber(navy.value, 1)} %`,
              })}
            </AppText>
          ) : null}
          {bodyFat.method === 'navy' ? (
            <AppText variant="caption" color="warning">
              {ru.calcWarnings.navyMuscular}
            </AppText>
          ) : null}
        </>
      ) : (
        <AppText variant="callout" color="textSecondary">
          {problemText(bodyFat)}
        </AppText>
      )}
      {isSuccess(bodyFat) && bodyFat.method === 'navy' && !isSuccess(jp3) && jp3.problem.kind === 'missing' && jp3.problem.inputs.length < 3 ? (
        <AppText variant="caption" color="textTertiary">
          {`${ru.methods.jp3}: ${problemText(jp3)}`}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
});
