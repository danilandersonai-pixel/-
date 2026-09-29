import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { WorkoutEditor } from '@/components/WorkoutEditor';
import { newId } from '@/db/ids';
import type { WorkoutStatus } from '@/db/schema';
import { useWorkoutDetails } from '@/db/useWorkouts';
import { ru } from '@/i18n/ru';
import { newWorkoutFormValues, workoutToFormValues } from '@/lib/workoutForm';
import { useTheme } from '@/theme';
import { toIsoDate } from '@/utils/date';

/** Новая тренировка (без wid) или правка (wid). date и status — для новой из календаря. */
export default function WorkoutScreen() {
  const { id, wid, date, status } = useLocalSearchParams<{
    id: string;
    wid?: string;
    date?: string;
    status?: WorkoutStatus;
  }>();
  const [newWorkoutId] = useState(newId);
  const { data: details } = useWorkoutDetails(wid ?? newWorkoutId);
  const { colors } = useTheme();

  if (details === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  if (wid && details === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.workouts} title={ru.workout.notFoundTitle} hint={ru.workout.notFoundHint} />
      </View>
    );
  }

  const initialValues = details
    ? workoutToFormValues(details.workout, details.exercises)
    : newWorkoutFormValues(date ?? toIsoDate(new Date()), status === 'planned' ? 'planned' : 'done');

  return (
    <WorkoutEditor
      key={details?.workout.id ?? newWorkoutId}
      workoutId={details?.workout.id ?? newWorkoutId}
      clientId={id}
      initialValues={initialValues}
      isNew={!details}
    />
  );
}
