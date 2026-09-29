import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { MeasureHint } from '@/components/MeasureHint';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { StepProgress } from '@/components/StepProgress';
import { TextField } from '@/components/TextField';
import type { Client, Measurement } from '@/db/schema';
import { useMeasurementEditor } from '@/hooks/useMeasurementEditor';
import { ru } from '@/i18n/ru';
import { fieldRanges, numberToInput, type MeasurementField, type MeasurementFormValues } from '@/lib/measurementForm';
import { fieldPurposes, fieldUnit, measurementSteps } from '@/lib/measurementSteps';
import { spacing } from '@/theme';
import { maskDateInput } from '@/utils/date';
import { fill } from '@/utils/format';

type MeasurementWizardProps = {
  client: Client;
  measurementId: string;
  initialValues: MeasurementFormValues;
  /** Прошлый замер — для подсказок «в прошлый раз» */
  previous: Measurement | null;
  isNew: boolean;
};

const t = ru.measurement;

/** Пошаговый ввод замера: дата и вес → обхваты → складки. Всё сохраняется само. */
export function MeasurementWizard({ client, measurementId, initialValues, previous, isNew }: MeasurementWizardProps) {
  const steps = measurementSteps(client.gender);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const [focused, setFocused] = useState<MeasurementField>(step.fields[0]);
  const { values, setField, errors, status, flush, canSave } = useMeasurementEditor(
    measurementId,
    client.id,
    initialValues,
  );

  const goToStep = (index: number) => {
    setStepIndex(index);
    setFocused(steps[index].fields[0]);
  };

  const finish = async () => {
    await flush();
    router.replace({ pathname: '/client/[id]/measurement/[mid]', params: { id: client.id, mid: measurementId } });
  };

  const errorText = (field: MeasurementField): string | undefined => {
    const error = errors[field];
    if (!error) {
      return undefined;
    }
    if (error === 'range') {
      const { min, max } = fieldRanges[field];
      return fill(t.errors.range, { min, max });
    }
    return t.errors[error];
  };

  const helperText = (field: MeasurementField): string | undefined => {
    const parts: string[] = [];
    const purposes = fieldPurposes(field, client.gender);
    if (purposes.includes('bodyFat')) {
      parts.push(t.neededForBodyFat);
    }
    if (purposes.includes('muscle')) {
      parts.push(t.neededForMuscle);
    }
    const before = previous?.[field];
    if (before !== null && before !== undefined && previous?.id !== measurementId) {
      parts.push(fill(t.previousValue, { value: `${numberToInput(before)} ${t.units[fieldUnit(field)]}` }));
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  };

  const isLast = stepIndex === steps.length - 1;

  return (
    <FormScreen>
      <Stack.Screen
        options={{
          title: isNew ? t.newTitle : t.editTitle,
          headerRight: () => <SaveStatusLabel status={status} />,
        }}
      />
      <StepProgress
        current={stepIndex}
        total={steps.length}
        label={fill(t.stepOf, { step: stepIndex + 1, total: steps.length })}
        title={t.steps[step.key]}
      />
      <AppText variant="callout" color="textSecondary">
        {t.stepHints[step.key]}
      </AppText>
      <MeasureHint field={focused} />

      <View style={styles.fields}>
        {step.key === 'basics' ? (
          <TextField
            label={t.date}
            value={values.date}
            onChangeText={(text) => setField('date', maskDateInput(text))}
            placeholder={ru.clientForm.birthDatePlaceholder}
            error={errors.date ? (errors.date === 'invalid' ? t.errors.dateInvalid : t.errors.required) : undefined}
            keyboardType="number-pad"
            maxLength={10}
          />
        ) : null}
        {step.fields.map((field) => (
          <TextField
            key={field}
            label={t.fields[field]}
            value={values[field]}
            onChangeText={(text) => setField(field, text)}
            onFocus={() => setFocused(field)}
            unit={t.units[fieldUnit(field)]}
            error={errorText(field)}
            helper={helperText(field)}
            keyboardType={field === 'restingHeartRate' ? 'number-pad' : 'decimal-pad'}
            placeholder="—"
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {isLast ? (
          <Button title={t.calculate} onPress={() => void finish()} disabled={!canSave} />
        ) : (
          <Button title={t.next} onPress={() => goToStep(stepIndex + 1)} disabled={!canSave} />
        )}
        {step.key === 'girths' ? (
          <Button title={t.calculate} variant="secondary" onPress={() => void finish()} disabled={!canSave} />
        ) : null}
        {stepIndex > 0 ? <Button title={t.back} variant="secondary" onPress={() => goToStep(stepIndex - 1)} /> : null}
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.lg,
  },
  buttons: {
    gap: spacing.sm,
  },
});
