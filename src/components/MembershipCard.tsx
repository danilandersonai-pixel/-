import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import type { Membership } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { membershipStatus } from '@/lib/memberships';
import { radius, spacing, useTheme, type Palette } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill } from '@/utils/format';
import { pluralRu } from '@/utils/plural';

type MembershipCardProps = {
  clientId: string;
  membership: Membership | null;
  /** Даты проведённых тренировок подопечного */
  doneDates: string[];
  todayIso: string;
};

const t = ru.membership;

/** Абонемент: сколько тренировок осталось, срок и напоминание о продлении */
export function MembershipCard({ clientId, membership, doneDates, todayIso }: MembershipCardProps) {
  const { colors } = useTheme();
  const open = (renew = false) =>
    router.push({ pathname: '/client/[id]/membership', params: renew ? { id: clientId, renew: '1' } : { id: clientId } });

  if (!membership) {
    return (
      <View style={styles.empty}>
        <Button title={t.add} icon={icons.ticket} variant="secondary" onPress={() => open()} />
        <AppText variant="caption" color="textTertiary">
          {t.addHint}
        </AppText>
      </View>
    );
  }

  const status = membershipStatus(membership, doneDates, todayIso);
  const period = [
    fill(t.since, { date: isoToRuDate(membership.startDate) }),
    membership.endDate ? fill(t.until, { date: isoToRuDate(membership.endDate) }) : t.noEnd,
    status.daysLeft !== null && status.daysLeft >= 0
      ? fill(t.daysLeft, { days: `${status.daysLeft} ${pluralRu(status.daysLeft, ru.today.dayForms)}` })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const warning: { text: string; color: keyof Palette } | null = status.expired
    ? { text: t.expired, color: 'danger' }
    : status.exhausted
      ? { text: t.exhausted, color: 'danger' }
      : status.ending
        ? { text: t.ending, color: 'warning' }
        : null;
  const share = membership.total > 0 ? Math.min(1, status.used / membership.total) : 0;

  return (
    <Card title={t.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => open()}
        style={({ pressed }) => [styles.body, pressed && { backgroundColor: colors.surfaceMuted }]}>
        <AppText variant="title">{fill(t.left, { left: status.remaining, total: membership.total })}</AppText>
        <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.round(share * 100)}%` }]} />
        </View>
        <AppText variant="caption" color="textSecondary">
          {`${status.used} ${pluralRu(status.used, t.usedForms)} · ${period}`}
        </AppText>
        {warning ? (
          <AppText variant="headline" color={warning.color}>
            {warning.text}
          </AppText>
        ) : null}
        {membership.notes ? (
          <AppText variant="callout" color="textSecondary">
            {membership.notes}
          </AppText>
        ) : null}
      </Pressable>
      {warning ? (
        <View style={styles.renew}>
          <Button title={t.renew} icon={icons.add} variant="secondary" onPress={() => open(true)} />
        </View>
      ) : null}
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
  track: {
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  renew: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
