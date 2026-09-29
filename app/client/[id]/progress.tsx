import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { PhotoSection } from '@/components/PhotoSection';
import { ProgressCharts } from '@/components/ProgressCharts';
import { useClient } from '@/db/useClients';
import { useMeasurements } from '@/db/useMeasurements';
import { usePhotos } from '@/db/usePhotos';
import { ru } from '@/i18n/ru';
import { spacing, useTheme } from '@/theme';

export default function ProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { data: photos } = usePhotos(id);
  const { colors } = useTheme();

  if (!client || !measurements || !photos) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.progress.title }} />
      <View style={styles.section}>
        <AppText variant="title">{ru.progress.charts}</AppText>
        {measurements.length === 0 ? (
          <EmptyState icon={icons.measurements} title={ru.progress.emptyTitle} hint={ru.progress.emptyHint} />
        ) : (
          <ProgressCharts client={client} measurements={measurements} />
        )}
      </View>
      <View style={styles.section}>
        <AppText variant="title">{ru.progress.photos}</AppText>
        <PhotoSection clientId={client.id} photos={photos} />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
});
