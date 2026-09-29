import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { ru } from '@/i18n/ru';
import type { HealthFormValues } from '@/lib/healthForm';
import { spacing } from '@/theme';

type HealthFormProps = {
  values: HealthFormValues;
  onChange: (key: keyof HealthFormValues, value: string) => void;
};

const t = ru.health;

const fields: readonly { key: keyof HealthFormValues; label: string; placeholder: string }[] = [
  { key: 'contraindications', label: t.contraindications, placeholder: t.contraindicationsPlaceholder },
  { key: 'injuries', label: t.injuries, placeholder: t.injuriesPlaceholder },
  { key: 'limitations', label: t.limitations, placeholder: t.limitationsPlaceholder },
  { key: 'notes', label: t.notes, placeholder: t.notesPlaceholder },
];

/** Здоровье подопечного: противопоказания, травмы, ограничения */
export function HealthForm({ values, onChange }: HealthFormProps) {
  return (
    <View style={styles.form}>
      {fields.map((field) => (
        <TextField
          key={field.key}
          label={field.label}
          value={values[field.key]}
          onChangeText={(text) => onChange(field.key, text)}
          placeholder={field.placeholder}
          multiline
        />
      ))}
      <AppText variant="caption" color="textTertiary" style={styles.hint}>
        {t.hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  hint: {
    textAlign: 'center',
  },
});
