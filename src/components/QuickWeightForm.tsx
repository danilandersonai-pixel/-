import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { TextField } from '@/components/TextField';
import { newId } from '@/db/ids';
import type { Measurement } from '@/db/schema';
import { useMeasurementEditor } from '@/hooks/useMeasurementEditor';
import { ru } from '@/i18n/ru';
import { fieldRanges, newMeasurementFormValues, numberToInput } from '@/lib/measurementForm';
import { maskDateInput, toIsoDate } from '@/utils/date';
import { fill } from '@/utils/format';

const t = ru.measurement;

/** Форма быстрого замера: дата и вес с автосохранением; рост берётся из прошлого замера */
export function QuickWeightForm({ clientId, previous }: { clientId: string; previous: Measurement | null }) {
  const [measurementId] = useState(newId);
  const { values, setField, errors, status, flush, canSave } = useMeasurementEditor(
    measurementId,
    clientId,
    newMeasurementFormValues(toIsoDate(new Date()), previous),
  );
  const weightError = errors.weight
    ? errors.weight === 'range'
      ? fill(t.errors.range, { min: fieldRanges.weight.min, max: fieldRanges.weight.max })
      : t.errors[errors.weight]
    : undefined;

  const done = async () => {
    await flush();
    router.back();
  };

  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.quickWeight.title, headerRight: () => <SaveStatusLabel status={status} /> }} />
      <AppText variant="callout" color="textSecondary">
        {ru.quickWeight.hint}
      </AppText>
      <TextField
        label={t.date}
        value={values.date}
        onChangeText={(text) => setField('date', maskDateInput(text))}
        placeholder={ru.clientForm.birthDatePlaceholder}
        error={errors.date ? (errors.date === 'invalid' ? t.errors.dateInvalid : t.errors.required) : undefined}
        keyboardType="number-pad"
        maxLength={10}
      />
      <TextField
        label={t.fields.weight}
        value={values.weight}
        onChangeText={(text) => setField('weight', text)}
        unit={t.units.kg}
        error={weightError}
        helper={previous ? fill(t.previousValue, { value: `${numberToInput(previous.weight)} ${t.units.kg}` }) : undefined}
        keyboardType="decimal-pad"
        placeholder="—"
        autoFocus
      />
      <Button title={ru.quickWeight.done} onPress={() => void done()} disabled={!canSave} />
    </FormScreen>
  );
}
