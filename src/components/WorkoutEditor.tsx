import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { ConfirmButton } from '@/components/ConfirmButton';
import { ExerciseEditor } from '@/components/ExerciseEditor';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { RecurringPanel } from '@/components/RecurringPanel';
import { RestTimer } from '@/components/RestTimer';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import type { WorkoutStatus } from '@/db/schema';
import { deleteWorkout, getLastWorkoutExercises } from '@/db/workouts';
import { useWorkoutEditor } from '@/hooks/useWorkoutEditor';
import { ru } from '@/i18n/ru';
import type { WorkoutFormValues } from '@/lib/workoutForm';
import { workoutVolume } from '@/lib/workouts';
import { spacing } from '@/theme';
import { maskDateInput, maskTimeInput, parseRuDate, parseTime } from '@/utils/date';
import { fill, formatMeasure, parseDecimal } from '@/utils/format';

type WorkoutEditorProps = {
  workoutId: string;
  clientId: string;
  initialValues: WorkoutFormValues;
  isNew: boolean;
};

const t = ru.workout;

const statusOptions: readonly { value: WorkoutStatus; label: string }[] = [
  { value: 'planned', label: t.planned },
  { value: 'done', label: t.done },
];

const wellbeingOptions = t.wellbeingLevels.map((label, index) => ({ value: String(index + 1), label }));

/** Запись тренировки: дата, время, упражнения с подходами, самочувствие. Сохраняется сама. */
export function WorkoutEditor({ workoutId, clientId, initialValues, isNew }: WorkoutEditorProps) {
  const editor = useWorkoutEditor(workoutId, clientId, initialValues);
  const { values, errors } = editor;
  const [repeatChecked, setRepeatChecked] = useState(false);

  const repeatLast = async () => {
    setRepeatChecked(true);
    const exercises = await getLastWorkoutExercises(clientId, workoutId);
    if (exercises.length > 0) {
      editor.copyExercises(exercises);
    }
  };

  const volume = workoutVolume(
    values.exercises.map((e) => ({
      sets: e.sets.map((s) => ({ reps: parseDecimal(s.reps), weight: parseDecimal(s.weight) })),
    })),
  );

  // Отдых последнего подхода, где он указан, — таймер предложит его первым
  const lastRest = values.exercises
    .flatMap((exercise) => exercise.sets)
    .map((set) => set.rest.trim())
    .filter((rest) => /^\d+$/.test(rest))
    .map(Number)
    .pop();

  return (
    <View style={styles.screen}>
      <FormScreen>
        <Stack.Screen
          options={{
            title: isNew ? t.newTitle : t.editTitle,
            headerRight: () => <SaveStatusLabel status={editor.status} />,
          }}
        />
        <SegmentedControl
          label={t.status}
          options={statusOptions}
          value={values.status}
          onChange={(status) => editor.setField('status', status)}
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField
              label={t.date}
              value={values.date}
              onChangeText={(text) => editor.setField('date', maskDateInput(text))}
              error={errors.date ? ru.measurement.errors.dateInvalid : undefined}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
          <View style={styles.time}>
            <TextField
              label={t.startTime}
              value={values.startTime}
              onChangeText={(text) => editor.setField('startTime', maskTimeInput(text))}
              placeholder={t.startTimePlaceholder}
              error={errors.startTime ? t.errors.timeInvalid : undefined}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>
        <TextField
          label={t.duration}
          value={values.duration}
          onChangeText={(text) => editor.setField('duration', text)}
          unit={t.minutes}
          error={errors.duration ? t.errors.durationInvalid : undefined}
          keyboardType="number-pad"
          placeholder="—"
        />

        <View style={styles.section}>
          <AppText variant="title">{t.exercises}</AppText>
          {volume > 0 ? (
            <AppText variant="callout" color="textSecondary">
              {fill(t.volume, { value: formatMeasure(volume) })}
            </AppText>
          ) : null}
          {values.exercises.map((exercise) => (
            <ExerciseEditor
              key={exercise.id}
              exercise={exercise}
              onRename={(name) => editor.renameExercise(exercise.id, name)}
              onAddSet={() => editor.addSet(exercise.id)}
              onUpdateSet={(setId, patch) => editor.updateSet(exercise.id, setId, patch)}
              onRemoveSet={(setId) => editor.removeSet(exercise.id, setId)}
              onRemove={() => editor.removeExercise(exercise.id)}
            />
          ))}
          <Button title={t.addExercise} icon={icons.add} variant="secondary" onPress={editor.addExercise} />
          {values.exercises.length === 0 && !repeatChecked ? (
            <Button title={t.repeatLast} icon={icons.repeat} variant="secondary" onPress={() => void repeatLast()} />
          ) : null}
        </View>

        {values.status === 'planned' ? (
          <RecurringPanel
            clientId={clientId}
            dateIso={parseRuDate(values.date)}
            startTime={parseTime(values.startTime)}
            durationMin={/^\d+$/.test(values.duration.trim()) ? Number(values.duration.trim()) : null}
          />
        ) : null}

        {values.status === 'done' ? (
          <View style={styles.section}>
            <AppText variant="caption" color="textSecondary">
              {t.wellbeing}
            </AppText>
            <Chips
              label={t.wellbeing}
              options={wellbeingOptions}
              value={values.wellbeing === null ? null : String(values.wellbeing)}
              onChange={(value) => editor.setField('wellbeing', Number(value))}
            />
          </View>
        ) : null}
        <TextField
          label={t.notes}
          value={values.notes}
          onChangeText={(text) => editor.setField('notes', text)}
          placeholder={t.notesPlaceholder}
          multiline
        />
        {isNew ? null : (
          <ConfirmButton
            title={t.delete}
            question={t.deleteConfirm}
            confirmTitle={t.deleteConfirmButton}
            onConfirm={() => {
              void deleteWorkout(workoutId).then(() => router.back());
            }}
          />
        )}
        {/* Место под панель таймера, чтобы она не закрывала последние поля */}
        <View style={styles.timerSpace} />
      </FormScreen>
      <RestTimer suggested={lastRest ?? null} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  timerSpace: {
    height: 72,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  time: {
    width: 120,
  },
  section: {
    gap: spacing.md,
  },
});
