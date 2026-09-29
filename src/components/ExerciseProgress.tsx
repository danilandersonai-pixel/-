import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { DeltaBadge } from '@/components/DeltaBadge';
import { ExerciseSessionRow } from '@/components/ExerciseSessionRow';
import { MetricChart } from '@/components/MetricChart';
import { ru } from '@/i18n/ru';
import { exerciseMetrics, exerciseSeries, type ExerciseMetric, type ExerciseRecord } from '@/lib/records';
import { radius, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatMeasure } from '@/utils/format';

const t = ru.records;

/** Что считается улучшением на графике: тоннаж зависит от плана тренировки, его не оцениваем */
const directions: Record<ExerciseMetric, 'up' | 'neutral'> = {
  estimate: 'up',
  weight: 'up',
  volume: 'neutral',
  reps: 'up',
};

/** График упражнения по датам и история по тренировкам */
export function ExerciseProgress({ record }: { record: ExerciseRecord }) {
  const { colors } = useTheme();
  const metrics = exerciseMetrics(record);
  const [selected, setSelected] = useState<ExerciseMetric | null>(null);
  const metric = selected && metrics.includes(selected) ? selected : (metrics[0] ?? null);
  const points = metric ? exerciseSeries(record, metric) : [];
  const unit = metric ? t.units[metric] : '';
  const withUnit = (value: number) => `${formatMeasure(value)}${unit ? ` ${unit}` : ''}`;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View style={styles.section}>
      {metric && last ? (
        <>
          {metrics.length > 1 ? (
            <Chips
              label={t.chartsLabel}
              options={metrics.map((m) => ({ value: m, label: t.metrics[m] }))}
              value={metric}
              onChange={setSelected}
            />
          ) : null}
          <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <AppText variant="headline" style={styles.flex}>
                  {unit ? `${t.metrics[metric]}, ${unit}` : t.metrics[metric]}
                </AppText>
                <AppText variant="title">{withUnit(last.value)}</AppText>
              </View>
              {points.length > 1 ? (
                <DeltaBadge
                  delta={last.value - first.value}
                  direction={directions[metric]}
                  unit={unit}
                  digits={metric === 'reps' ? 0 : 1}
                  suffix={fill(ru.progress.change, {
                    from: isoToRuDate(first.date).slice(0, 5),
                    to: isoToRuDate(last.date).slice(0, 5),
                  })}
                />
              ) : null}
            </View>
            {points.length > 1 ? (
              <MetricChart points={points} unit={unit} label={t.metrics[metric]} integer={metric === 'reps'} />
            ) : (
              <AppText variant="callout" color="textSecondary">
                {t.needTwo}
              </AppText>
            )}
          </View>
        </>
      ) : null}
      <Card title={t.historyTitle}>
        {[...record.sessions].reverse().map((session, index) => (
          <ExerciseSessionRow key={`${session.workoutId}-${index}`} session={session} divider={index > 0} />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  chartCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
