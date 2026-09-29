import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { MeasurementWizard } from '@/components/MeasurementWizard';
import { newId } from '@/db/ids';
import { useClient } from '@/db/useClients';
import { useMeasurements } from '@/db/useMeasurements';
import { ru } from '@/i18n/ru';
import { measurementToFormValues, newMeasurementFormValues } from '@/lib/measurementForm';
import { useTheme } from '@/theme';
import { toIsoDate } from '@/utils/date';

/** Новый замер (без mid) или правка существующего (mid) */
export default function MeasureScreen() {
  const { id, mid } = useLocalSearchParams<{ id: string; mid?: string }>();
  const [newMeasurementId] = useState(newId);
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { colors } = useTheme();

  if (client === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.searchPerson} title={ru.clients.notFoundTitle} hint={ru.clients.notFoundHint} />
      </View>
    );
  }
  if (!client || !measurements) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const existingIndex = mid ? measurements.findIndex((m) => m.id === mid) : -1;
  const existing = existingIndex >= 0 ? measurements[existingIndex] : null;
  if (mid && !existing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon={icons.measurements}
          title={ru.measurement.notFoundTitle}
          hint={ru.measurement.notFoundHint}
        />
      </View>
    );
  }

  const measurementId = existing?.id ?? newMeasurementId;
  // «Прошлый» замер — следующий по списку после текущего (список — новые сверху)
  const previous = existing ? (measurements[existingIndex + 1] ?? null) : (measurements[0] ?? null);
  const initialValues = existing
    ? measurementToFormValues(existing)
    : newMeasurementFormValues(toIsoDate(new Date()), previous);

  return (
    <MeasurementWizard
      key={measurementId}
      client={client}
      measurementId={measurementId}
      initialValues={initialValues}
      previous={previous}
      isNew={!existing}
    />
  );
}
