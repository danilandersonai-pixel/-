import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import { ParqSummary } from '@/components/ParqSummary';
import { useParq } from '@/db/useParq';
import { ru } from '@/i18n/ru';
import { parqIsStale, parseParqAnswers } from '@/lib/parq';
import { spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill } from '@/utils/format';

type ParqCardProps = {
  clientId: string;
  todayIso: string;
};

const t = ru.parq;

/** Вкладка «Здоровье»: итог последней анкеты PAR-Q или приглашение её пройти */
export function ParqCard({ clientId, todayIso }: ParqCardProps) {
  const { colors } = useTheme();
  const { data: form } = useParq(clientId);
  const open = (again = false) =>
    router.push({ pathname: '/client/[id]/parq', params: again ? { id: clientId, again: '1' } : { id: clientId } });

  if (form === undefined) {
    return null;
  }
  if (form === null) {
    return (
      <View style={styles.empty}>
        <Button title={t.start} icon={icons.checklist} variant="secondary" onPress={() => open()} />
        <AppText variant="caption" color="textTertiary">
          {t.startHint}
        </AppText>
      </View>
    );
  }

  const stale = parqIsStale(form.date, todayIso);
  return (
    <Card title={t.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => open()}
        style={({ pressed }) => [styles.body, pressed && { backgroundColor: colors.surfaceMuted }]}>
        <ParqSummary answers={parseParqAnswers(form.answers)} />
        {form.notes ? (
          <AppText variant="callout" color="textSecondary">
            {form.notes}
          </AppText>
        ) : null}
        <AppText variant="caption" color="textTertiary">
          {fill(t.filled, { date: isoToRuDate(form.date) })}
        </AppText>
        {stale ? (
          <AppText variant="headline" color="warning">
            {t.stale}
          </AppText>
        ) : null}
      </Pressable>
      <View style={styles.again}>
        <Button title={t.again} icon={icons.checklist} variant="secondary" onPress={() => open(true)} />
      </View>
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
  again: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
