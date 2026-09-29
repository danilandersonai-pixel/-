import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormScreen } from '@/components/FormScreen';
import { GoalEditor } from '@/components/GoalEditor';
import { newId } from '@/db/ids';
import { useClient } from '@/db/useClients';
import { useGoal } from '@/db/useGoal';
import { useMeasurements } from '@/db/useMeasurements';
import { useTheme } from '@/theme';
import { toIsoDate } from '@/utils/date';

/** Цель подопечного: поставить новую или изменить действующую */
export default function GoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { data: goal } = useGoal(id);
  const [newGoalId] = useState(newId);
  const { colors } = useTheme();

  if (!client || !measurements || goal === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  return (
    <FormScreen>
      <GoalEditor
        key={goal?.id ?? newGoalId}
        client={client}
        measurements={measurements}
        goalId={goal?.id ?? newGoalId}
        existing={goal}
        todayIso={toIsoDate(new Date())}
      />
    </FormScreen>
  );
}
