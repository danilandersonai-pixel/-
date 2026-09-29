import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import type { Client, Goal, Measurement } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { goalProgress } from '@/lib/goals';
import { progressMetrics, progressSeries } from '@/lib/progress';
import { radius, spacing, useTheme, type Palette } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatMeasure, formatNumber } from '@/utils/format';

type GoalCardProps = {
  client: Client;
  /** Замеры, новые сверху */
  measurements: Measurement[];
  goal: Goal | null;
};

const t = ru.goal;

/** Цель подопечного: путь от старта, остаток и прогноз по нынешнему темпу. Нет цели — кнопка «Поставить». */
export function GoalCard({ client, measurements, goal }: GoalCardProps) {
  const { colors } = useTheme();
  const open = () => router.push({ pathname: '/client/[id]/goal', params: { id: client.id } });

  if (!goal) {
    return (
      <View style={styles.empty}>
        <Button title={t.set} icon={icons.goal} variant="secondary" onPress={open} />
        <AppText variant="caption" color="textTertiary">
          {t.setHint}
        </AppText>
      </View>
    );
  }

  const metric = progressMetrics.find((m) => m.id === goal.metric);
  const unit = metric ? ru.progress.units[metric.unit] : '';
  const withUnit = (value: number) => `${formatMeasure(value)}${unit ? ` ${unit}` : ''}`;
  const progress = goalProgress(goal, progressSeries(measurements, client, goal.metric).points);

  let status: { text: string; color: keyof Palette } | null = null;
  if (progress.reached) {
    status = { text: t.reached, color: 'success' };
  } else if (progress.onTime !== null) {
    status = progress.onTime ? { text: t.onTime, color: 'success' } : { text: t.late, color: 'warning' };
  }

  let forecast: string;
  if (!progress.current) {
    forecast = t.noData;
  } else if (progress.reached) {
    forecast = '';
  } else if (progress.forecast && progress.perWeek !== null) {
    const rate = `${progress.perWeek > 0 ? '+' : '−'}${formatNumber(Math.abs(progress.perWeek), 1)}${unit ? ` ${unit}` : ''}`;
    forecast = fill(t.forecast, { rate, date: isoToRuDate(progress.forecast) });
  } else {
    forecast = progress.perWeek === null ? t.fewData : t.notToward;
  }

  return (
    <Card title={t.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t.edit}
        onPress={open}
        style={({ pressed }) => [styles.body, pressed && { backgroundColor: colors.surfaceMuted }]}>
        <View style={styles.head}>
          <AppText variant="title">{`${ru.progress.metrics[goal.metric]} · ${withUnit(goal.targetValue)}`}</AppText>
          <AppText variant="callout" color="textSecondary">
            {goal.targetDate ? fill(t.by, { date: isoToRuDate(goal.targetDate) }) : t.noDeadline}
          </AppText>
        </View>
        {progress.progress !== null ? (
          <View style={styles.barBlock}>
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.round(progress.progress * 100)}%` }]} />
            </View>
            <AppText variant="caption" color="textSecondary">
              {fill(t.passed, { percent: Math.round(progress.progress * 100) })}
            </AppText>
          </View>
        ) : null}
        {progress.current && !progress.reached && progress.remaining !== null ? (
          <AppText variant="callout">
            {fill(t.remaining, { current: withUnit(progress.current.value), left: withUnit(Math.abs(progress.remaining)) })}
          </AppText>
        ) : null}
        {forecast ? (
          <AppText variant="callout" color="textSecondary">
            {forecast}
          </AppText>
        ) : null}
        {status ? (
          <AppText variant="headline" color={status.color}>
            {status.text}
          </AppText>
        ) : null}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    gap: spacing.xs,
  },
  body: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  head: {
    gap: 2,
  },
  barBlock: {
    gap: spacing.xs,
  },
  track: {
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
