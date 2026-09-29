import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { CompareRowView } from '@/components/CompareRowView';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { useClient } from '@/db/useClients';
import { useMeasurements } from '@/db/useMeasurements';
import { ru } from '@/i18n/ru';
import { compareMeasurements } from '@/lib/compare';
import { spacing, useTheme } from '@/theme';
import { daysBetween, isoToRuDate } from '@/utils/date';
import { fill, lowerFirst } from '@/utils/format';
import { pluralRu } from '@/utils/plural';

const t = ru.compare;

/** Сравнение двух любых замеров: по умолчанию самый первый и последний */
export default function CompareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { colors } = useTheme();
  const [choice, setChoice] = useState<{ from?: string; to?: string }>({});

  if (!client || !measurements) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  if (measurements.length < 2) {
    return (
      <FormScreen>
        <Stack.Screen options={{ title: t.title }} />
        <EmptyState icon={icons.measurements} title={t.title} hint={t.needTwo} />
      </FormScreen>
    );
  }

  // Замеры приходят новыми сверху
  const from = measurements.find((m) => m.id === choice.from) ?? measurements[measurements.length - 1];
  const to = measurements.find((m) => m.id === choice.to) ?? measurements[0];
  // «Было» — от старых к новым, «Стало» — от новых к старым: выбранные по умолчанию даты видны сразу
  const newestFirst = measurements.map((m) => ({ value: m.id, label: isoToRuDate(m.date) }));
  const oldestFirst = [...newestFirst].reverse();
  const comparison = from.id === to.id ? null : compareMeasurements(from, to, client);
  const days = comparison ? daysBetween(comparison.older.date, comparison.newer.date) : 0;

  return (
    <FormScreen>
      <Stack.Screen options={{ title: t.title }} />
      <View style={styles.pickers}>
        <AppText variant="caption" color="textSecondary">
          {t.from}
        </AppText>
        <Chips label={t.from} options={oldestFirst} value={from.id} onChange={(value) => setChoice((c) => ({ ...c, from: value }))} />
        <AppText variant="caption" color="textSecondary">
          {t.to}
        </AppText>
        <Chips label={t.to} options={newestFirst} value={to.id} onChange={(value) => setChoice((c) => ({ ...c, to: value }))} />
      </View>
      {comparison ? (
        <>
          <AppText variant="callout" color="textSecondary">
            {`${isoToRuDate(comparison.older.date)} → ${isoToRuDate(comparison.newer.date)} · ${fill(t.days, {
              count: days,
              days: pluralRu(days, ru.today.dayForms),
            })}`}
          </AppText>
          <Card>
            {comparison.rows.map((row, index) => (
              <CompareRowView key={row.id} row={row} divider={index > 0} />
            ))}
          </Card>
          {comparison.method ? (
            <AppText variant="caption" color="textTertiary">
              {fill(t.method, { method: lowerFirst(ru.methods[comparison.method]) })}
            </AppText>
          ) : null}
        </>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  pickers: {
    gap: spacing.sm,
  },
});
