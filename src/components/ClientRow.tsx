import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { DeltaBadge } from '@/components/DeltaBadge';
import { Icon, icons } from '@/components/Icon';
import type { Client } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { clientFullName, clientInitials } from '@/lib/clients';
import type { BodyFatTrend } from '@/lib/measurements';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { fill, formatNumber } from '@/utils/format';

type ClientRowProps = {
  client: Client;
  onPress: () => void;
  /** Разделитель над строкой (у всех строк, кроме первой) */
  divider?: boolean;
  /** Последний % жира и изменение к прошлому замеру */
  trend?: BodyFatTrend | null;
  /** Ближайшая тренировка: «Пт 02.10, 18:00» */
  nextWorkout?: string | null;
};

/** Строка списка подопечных: аватар, имя, цель */
export function ClientRow({ client, onPress, divider = false, trend = null, nextWorkout = null }: ClientRowProps) {
  const { colors } = useTheme();
  const name = clientFullName(client);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <Avatar initials={clientInitials(client)} />
      <View
        style={[
          styles.body,
          divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        ]}>
        <View style={styles.text}>
          <AppText variant="headline" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="callout" color={client.goal ? 'textSecondary' : 'textTertiary'} numberOfLines={1}>
            {client.goal ?? ru.clients.noGoal}
          </AppText>
          {nextWorkout ? (
            <View style={styles.next}>
              <Icon name={icons.upcoming} color="primary" size={14} />
              <AppText variant="caption" color="primary" numberOfLines={1}>
                {fill(ru.workout.nextLine, { when: nextWorkout })}
              </AppText>
            </View>
          ) : null}
        </View>
        {trend ? (
          <View style={styles.trend}>
            <AppText variant="title" style={styles.trendValue}>{`${formatNumber(trend.value, 1)} %`}</AppText>
            <DeltaBadge delta={trend.delta} direction="down" unit="%" />
          </View>
        ) : null}
        <Icon name={icons.chevronRight} color="textTertiary" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
  },
  body: {
    flex: 1,
    minHeight: minTouchSize + spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  trend: {
    alignItems: 'flex-end',
    gap: 2,
  },
  trendValue: {
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
