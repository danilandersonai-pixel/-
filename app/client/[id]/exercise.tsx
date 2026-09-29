import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseProgress } from '@/components/ExerciseProgress';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { InfoButton } from '@/components/InfoButton';
import { InfoPanel } from '@/components/InfoPanel';
import { StatTile } from '@/components/StatTile';
import { useExerciseSessions } from '@/db/useWorkouts';
import { ru } from '@/i18n/ru';
import { setText } from '@/i18n/records';
import { exerciseRecords } from '@/lib/records';
import { spacing, useTheme } from '@/theme';
import { formatMeasure } from '@/utils/format';

const t = ru.records;

export default function ExerciseScreen() {
  const { id, key } = useLocalSearchParams<{ id: string; key: string }>();
  const { data: sessions } = useExerciseSessions(id);
  const { colors } = useTheme();
  const [infoOpen, setInfoOpen] = useState(false);

  if (!sessions) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  const record = exerciseRecords(sessions).find((r) => r.key === key);
  if (!record) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: t.screenTitle }} />
        <EmptyState icon={icons.workouts} title={t.notFound} hint={t.notFoundHint} />
      </View>
    );
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: record.name }} />
      <View style={styles.tiles}>
        {record.bestSet ? (
          <StatTile label={t.tileBest} value={setText(record.bestSet)} />
        ) : record.maxReps ? (
          <StatTile label={t.tileReps} value={String(record.maxReps.reps)} />
        ) : null}
        <StatTile label={t.tileSessions} value={String(record.sessions.length)} />
      </View>
      {record.bestEstimate ? (
        <View style={styles.estimate}>
          <View style={styles.estimateRow}>
            <View style={styles.flex}>
              <StatTile label={t.tileEstimate} value={`≈ ${formatMeasure(record.bestEstimate.value)} ${t.units.estimate}`} />
            </View>
            <InfoButton label={t.explainLabel} onPress={() => setInfoOpen((open) => !open)} active={infoOpen} />
          </View>
          {infoOpen ? (
            <InfoPanel title={t.explainTitle} text={t.explain} closeLabel={t.close} onClose={() => setInfoOpen(false)} />
          ) : null}
        </View>
      ) : null}
      <ExerciseProgress record={record} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  estimate: {
    gap: spacing.md,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
