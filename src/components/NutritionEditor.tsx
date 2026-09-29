import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { TextField } from '@/components/TextField';
import { useNutritionEditor } from '@/hooks/useNutritionEditor';
import { ru } from '@/i18n/ru';
import type { NutritionFormValues } from '@/lib/nutrition';
import { spacing } from '@/theme';
import { maskDateInput } from '@/utils/date';

type NutritionEditorProps = {
  planId: string;
  clientId: string;
  initialValues: NutritionFormValues;
  /** Сообщает текущие значения — сводка над формой обновляется, пока тренер печатает */
  onValues: (values: NutritionFormValues) => void;
};

const t = ru.nutrition;

/** Поля плана питания с автосохранением */
export function NutritionEditor({ planId, clientId, initialValues, onValues }: NutritionEditorProps) {
  const { values, setField, errors, status } = useNutritionEditor(planId, clientId, initialValues);
  const change = (key: keyof NutritionFormValues, value: string) => {
    setField(key, value);
    onValues({ ...values, [key]: value });
  };
  const invalid = (key: keyof NutritionFormValues) => (errors[key] ? t.invalid : undefined);

  return (
    <View style={styles.form}>
      <Stack.Screen options={{ headerRight: () => <SaveStatusLabel status={status} /> }} />
      <TextField
        label={t.calories}
        value={values.calories}
        onChangeText={(text) => change('calories', text)}
        unit={t.kcal}
        error={invalid('calories')}
        keyboardType="number-pad"
        placeholder="—"
      />
      <View style={styles.row}>
        {(['protein', 'fat', 'carbs'] as const).map((key) => (
          <View key={key} style={styles.flex}>
            <TextField
              label={t[key]}
              value={values[key]}
              onChangeText={(text) => change(key, text)}
              unit={t.grams}
              error={invalid(key)}
              keyboardType="decimal-pad"
              placeholder="—"
            />
          </View>
        ))}
      </View>
      <TextField
        label={t.startDate}
        value={values.startDate}
        onChangeText={(text) => change('startDate', maskDateInput(text))}
        error={errors.startDate ? ru.measurement.errors.dateInvalid : undefined}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextField
        label={t.notes}
        value={values.notes}
        onChangeText={(text) => change('notes', text)}
        placeholder={t.notesPlaceholder}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
