import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ActionTile } from '@/components/ActionTile';
import { Button } from '@/components/Button';
import { GoalCard } from '@/components/GoalCard';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { MeasurementRow } from '@/components/MeasurementRow';
import { Notice } from '@/components/Notice';
import type { Client } from '@/db/schema';
import { useGoal } from '@/db/useGoal';
import { useMeasurements } from '@/db/useMeasurements';
import { ru } from '@/i18n/ru';
import { compositionDelta } from '@/lib/calc/composition';
import { csvFileName, measurementsCsv } from '@/lib/csv';
import { compositionFor } from '@/lib/measurements';
import { measurementOverdueDays } from '@/lib/today';
import { spacing } from '@/theme';
import { toIsoDate } from '@/utils/date';
import { fill } from '@/utils/format';
import { pluralRu } from '@/utils/plural';
import { canShareFiles, shareTextFile } from '@/utils/share';

/** Вкладка «Замеры»: история и кнопка нового замера */
export function ClientMeasurementsTab({ client }: { client: Client }) {
  const { data: measurements } = useMeasurements(client.id);
  const { data: goal } = useGoal(client.id);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const openNew = () => router.push({ pathname: '/client/[id]/measure', params: { id: client.id } });

  if (!measurements) {
    return null;
  }
  if (measurements.length === 0) {
    return (
      <EmptyState
        icon={icons.measurements}
        title={ru.card.measurementsEmptyTitle}
        hint={ru.card.measurementsEmptyHint}
        action={<Button title={ru.measurement.emptyAction} icon={icons.add} onPress={openNew} />}
      />
    );
  }

  const compositions = measurements.map((m) => compositionFor(m, client));
  const exportCsv = async () => {
    if (!canShareFiles) {
      setCsvMessage(ru.csv.webNote);
      return;
    }
    setCsvBusy(true);
    setCsvMessage(null);
    try {
      await shareTextFile(csvFileName(client), measurementsCsv(client, measurements), 'text/csv');
    } catch {
      setCsvMessage(ru.csv.error);
    } finally {
      setCsvBusy(false);
    }
  };
  // Список отсортирован по дате, новые сверху
  const overdue = measurementOverdueDays(measurements[0].date, toIsoDate(new Date()));

  return (
    <View style={styles.tab}>
      {overdue !== null ? (
        <Notice
          icon={icons.measurements}
          tone="warning"
          title={ru.today.dueTitle}
          text={fill(ru.today.dueText, { days: `${overdue} ${pluralRu(overdue, ru.today.dayForms)}` })}
        />
      ) : null}
      <View style={styles.row}>
        <View style={styles.main}>
          <Button title={ru.measurement.add} icon={icons.add} onPress={openNew} />
        </View>
        <View style={styles.flex}>
          <Button
            title={ru.quickWeight.open}
            variant="secondary"
            onPress={() => router.push({ pathname: '/client/[id]/quick-weight', params: { id: client.id } })}
          />
        </View>
      </View>
      {goal !== undefined ? <GoalCard client={client} measurements={measurements} goal={goal} /> : null}
      <View style={styles.grid}>
        <ActionTile
          icon={icons.chart}
          label={ru.progress.openShort}
          onPress={() => router.push({ pathname: '/client/[id]/progress', params: { id: client.id } })}
        />
        <ActionTile
          icon={icons.compare}
          label={ru.compare.open}
          onPress={() => router.push({ pathname: '/client/[id]/compare', params: { id: client.id } })}
          disabled={measurements.length < 2}
        />
        <ActionTile
          icon={icons.doc}
          label={ru.report.openShort}
          onPress={() => router.push({ pathname: '/client/[id]/report', params: { id: client.id } })}
        />
        <ActionTile
          icon={icons.table}
          label={csvBusy ? ru.csv.exporting : ru.csv.exportShort}
          onPress={() => void exportCsv()}
          disabled={csvBusy}
        />
      </View>
      {csvMessage ? (
        <AppText variant="caption" color="textSecondary">
          {csvMessage}
        </AppText>
      ) : null}
      <Card>
        {measurements.map((m, index) => {
          const composition = compositions[index];
          return (
            <MeasurementRow
              key={m.id}
              date={m.date}
              weight={m.weight}
              bodyFat={composition.bodyFat.value}
              bodyFatDelta={compositionDelta('bodyFat', composition, compositions[index + 1])}
              divider={index > 0}
              onPress={() =>
                router.push({ pathname: '/client/[id]/measurement/[mid]', params: { id: client.id, mid: m.id } })
              }
            />
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  main: {
    flex: 3,
  },
  flex: {
    flex: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
