import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { QuickWeightForm } from '@/components/QuickWeightForm';
import { useMeasurements } from '@/db/useMeasurements';
import { useTheme } from '@/theme';

/** Быстрый замер: только дата и вес — для еженедельного взвешивания */
export default function QuickWeightScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: measurements } = useMeasurements(id);
  const { colors } = useTheme();

  if (!measurements) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  return <QuickWeightForm clientId={id} previous={measurements[0] ?? null} />;
}
