import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { MeasurementRow } from '@/components/MeasurementRow';
import type { Client } from '@/db/schema';
import { useMeasurements } from '@/db/useMeasurements';
import { ru } from '@/i18n/ru';
import { compositionDelta } from '@/lib/calc/composition';
import { compositionFor } from '@/lib/measurements';
import { spacing } from '@/theme';

/** Вкладка «Замеры»: история и кнопка нового замера */
export function ClientMeasurementsTab({ client }: { client: Client }) {
  const { data: measurements } = useMeasurements(client.id);
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

  return (
    <View style={styles.tab}>
      <Button title={ru.measurement.add} icon={icons.add} onPress={openNew} />
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
