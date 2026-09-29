import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { MeasurementResult } from '@/components/MeasurementResult';
import { useClient } from '@/db/useClients';
import { useMeasurements } from '@/db/useMeasurements';
import { ru } from '@/i18n/ru';
import { useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';

export default function MeasurementResultScreen() {
  const { id, mid } = useLocalSearchParams<{ id: string; mid: string }>();
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { colors } = useTheme();

  if (client === undefined || measurements === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  const index = measurements.findIndex((m) => m.id === mid);
  if (!client || index < 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.measurements} title={ru.measurement.notFoundTitle} hint={ru.measurement.notFoundHint} />
      </View>
    );
  }
  const measurement = measurements[index];

  return (
    <FormScreen>
      <Stack.Screen options={{ title: `${ru.measurement.resultTitle} ${isoToRuDate(measurement.date)}` }} />
      <MeasurementResult client={client} measurement={measurement} previous={measurements[index + 1] ?? null} />
    </FormScreen>
  );
}
