import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CompactInput } from '@/components/CompactInput';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Icon, icons } from '@/components/Icon';
import { TextField } from '@/components/TextField';
import { ru } from '@/i18n/ru';
import type { ExerciseFormValues, SetFormValues } from '@/lib/workoutForm';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';
import { fill } from '@/utils/format';

type ExerciseEditorProps = {
  exercise: ExerciseFormValues;
  onRename: (name: string) => void;
  onAddSet: () => void;
  onUpdateSet: (setId: string, patch: Partial<Omit<SetFormValues, 'id'>>) => void;
  onRemoveSet: (setId: string) => void;
  onRemove: () => void;
};

const t = ru.workout;

/** Упражнение: название и таблица подходов — повторы, вес, отдых */
export function ExerciseEditor({ exercise, onRename, onAddSet, onUpdateSet, onRemoveSet, onRemove }: ExerciseEditorProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextField
        label={t.exerciseName}
        value={exercise.name}
        onChangeText={onRename}
        placeholder={t.exerciseNamePlaceholder}
        autoCapitalize="sentences"
      />
      <View style={styles.row}>
        <AppText variant="caption" color="textTertiary" style={styles.number}>
          {t.setNumber}
        </AppText>
        <AppText variant="caption" color="textTertiary" style={styles.header}>
          {t.reps}
        </AppText>
        <AppText variant="caption" color="textTertiary" style={styles.header}>
          {t.weight}
        </AppText>
        <AppText variant="caption" color="textTertiary" style={styles.header}>
          {t.rest}
        </AppText>
        <View style={styles.remove} />
      </View>
      {exercise.sets.map((set, index) => (
        <View key={set.id} style={styles.row}>
          <AppText variant="headline" color="textSecondary" style={styles.number}>
            {index + 1}
          </AppText>
          <CompactInput
            label={`${t.reps}, ${index + 1}`}
            value={set.reps}
            onChangeText={(reps) => onUpdateSet(set.id, { reps })}
            keyboardType="number-pad"
          />
          <CompactInput
            label={`${t.weight}, ${index + 1}`}
            value={set.weight}
            onChangeText={(weight) => onUpdateSet(set.id, { weight })}
          />
          <CompactInput
            label={`${t.rest}, ${index + 1}`}
            value={set.rest}
            onChangeText={(rest) => onUpdateSet(set.id, { rest })}
            keyboardType="number-pad"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fill(t.removeSet, { n: index + 1 })}
            onPress={() => onRemoveSet(set.id)}
            hitSlop={6}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
            <Icon name={icons.close} color="textTertiary" size={18} />
          </Pressable>
        </View>
      ))}
      <Button title={t.addSet} icon={icons.add} variant="secondary" onPress={onAddSet} />
      <ConfirmButton
        title={t.removeExercise}
        question={t.removeExerciseConfirm}
        confirmTitle={t.removeExerciseButton}
        onConfirm={onRemove}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  number: {
    width: 22,
    textAlign: 'center',
  },
  header: {
    flex: 1,
    textAlign: 'center',
  },
  remove: {
    width: minTouchSize - 12,
    height: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
