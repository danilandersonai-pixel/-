import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { DeltaBadge } from '@/components/DeltaBadge';
import { InfoRow } from '@/components/InfoRow';
import { MetricChart } from '@/components/MetricChart';
import type { Client, Measurement } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { progressMetrics, progressSeries, type ProgressMetricId } from '@/lib/progress';
import { radius, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatMeasure, lowerFirst } from '@/utils/format';

type ProgressChartsProps = {
  client: Client;
  /** Замеры, новые сверху */
  measurements: Measurement[];
};

const t = ru.progress;

/** Графики показателей по датам: выбор показателя, линия, изменение, таблица значений */
export function ProgressCharts({ client, measurements }: ProgressChartsProps) {
  const { colors } = useTheme();
  // Показываем только показатели, по которым есть хоть одно значение
  const available = progressMetrics.filter(
    (metric) => progressSeries(measurements, client, metric.id).points.length > 0,
  );
  const [selected, setSelected] = useState<ProgressMetricId>(
    available.some((m) => m.id === 'bodyFat') ? 'bodyFat' : 'weight',
  );
  const metric = available.find((m) => m.id === selected) ?? available[0];
  if (!metric) {
    return null;
  }

  const { points, method } = progressSeries(measurements, client, metric.id);
  const unit = t.units[metric.unit];
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View style={styles.section}>
      <Chips
        label={t.charts}
        options={available.map((m) => ({ value: m.id, label: t.metrics[m.id] }))}
        value={metric.id}
        onChange={setSelected}
      />
      <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <AppText variant="headline" style={styles.flex}>
              {unit ? `${t.metrics[metric.id]}, ${unit}` : t.metrics[metric.id]}
            </AppText>
            <AppText variant="title">{`${formatMeasure(last.value)}${unit ? ` ${unit}` : ''}`}</AppText>
          </View>
          {points.length > 1 ? (
            <DeltaBadge
              delta={last.value - first.value}
              direction={metric.direction}
              unit={unit}
              suffix={fill(t.change, { from: isoToRuDate(first.date).slice(0, 5), to: isoToRuDate(last.date).slice(0, 5) })}
            />
          ) : null}
        </View>
        {points.length > 1 ? (
          <MetricChart points={points} unit={unit} label={t.metrics[metric.id]} />
        ) : (
          <AppText variant="callout" color="textSecondary">
            {t.needTwo}
          </AppText>
        )}
        {method ? (
          <AppText variant="caption" color="textTertiary">
            {fill(t.method, { method: lowerFirst(ru.methods[method]) })}
          </AppText>
        ) : null}
      </View>
      <Card title={t.values}>
        {[...points].reverse().map((point, index) => (
          <InfoRow
            key={`${point.date}-${index}`}
            label={isoToRuDate(point.date)}
            value={`${formatMeasure(point.value)}${unit ? ` ${unit}` : ''}`}
            divider={index > 0}
          />
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
