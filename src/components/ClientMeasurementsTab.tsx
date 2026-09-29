import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { MeasurementRow } from '@/components/MeasurementRow';
import { Notice } from '@/components/Notice';
import type { Client } from '@/db/schema';
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
      <Button title={ru.measurement.add} icon={icons.add} onPress={openNew} />
      <Button
        title={ru.progress.open}
        icon={icons.chart}
        variant="secondary"
        onPress={() => router.push({ pathname: '/client/[id]/progress', params: { id: client.id } })}
      />
      <Button
        title={ru.report.open}
        icon={icons.doc}
        variant="secondary"
        onPress={() => router.push({ pathname: '/client/[id]/report', params: { id: client.id } })}
      />
      <Button
        title={csvBusy ? ru.csv.exporting : ru.csv.export}
        icon={icons.table}
        variant="secondary"
        onPress={() => void exportCsv()}
        disabled={csvBusy}
      />
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
});
