import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { ConfirmButton } from '@/components/ConfirmButton';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { TextField } from '@/components/TextField';
import { deleteGoal, saveGoal } from '@/db/goals';
import type { Client, Goal, GoalFields, Measurement } from '@/db/schema';
import { useAutosave } from '@/hooks/useAutosave';
import { ru } from '@/i18n/ru';
import { goalFormToFields, goalMetrics, type GoalFormValues } from '@/lib/goals';
import { progressMetrics, progressSeries } from '@/lib/progress';
import { spacing } from '@/theme';
import { isoToRuDate, maskDateInput } from '@/utils/date';
import { fill, formatMeasure } from '@/utils/format';

type GoalEditorProps = {
  client: Client;
  /** Замеры, новые сверху */
  measurements: Measurement[];
  goalId: string;
  existing: Goal | null;
  todayIso: string;
};

const t = ru.goal;

/** Постановка и правка цели: показатель, значение, срок. Сохраняется само. */
export function GoalEditor({ client, measurements, goalId, existing, todayIso }: GoalEditorProps) {
  const [values, setValues] = useState<GoalFormValues>(() => ({
    metric: existing?.metric ?? (progressSeries(measurements, client, 'bodyFat').points.length > 0 ? 'bodyFat' : 'weight'),
    target: existing ? formatMeasure(existing.targetValue) : '',
    targetDate: existing?.targetDate ? isoToRuDate(existing.targetDate) : '',
  }));
  const [dirty, setDirty] = useState(false);
  const change = (patch: Partial<GoalFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setDirty(true);
  };

  const startDate = existing?.startDate ?? todayIso;
  const { fields, errors } = useMemo(() => goalFormToFields(values, startDate), [values, startDate]);
  const save = useCallback((toSave: GoalFields) => saveGoal(goalId, client.id, toSave), [goalId, client.id]);
  const { status, flush } = useAutosave(dirty ? fields : null, save);

  const metric = progressMetrics.find((m) => m.id === values.metric);
  const unit = metric ? ru.progress.units[metric.unit] : '';
  const points = progressSeries(measurements, client, values.metric).points;
  const current = points[points.length - 1];

  const done = async () => {
    await flush();
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t.title, headerRight: () => <SaveStatusLabel status={status} /> }} />
      <View style={styles.block}>
        <AppText variant="caption" color="textSecondary">
          {t.metric}
        </AppText>
        <Chips
          label={t.metric}
          options={goalMetrics.map((value) => ({ value, label: ru.progress.metrics[value] }))}
          value={values.metric}
          onChange={(metricId) => change({ metric: metricId })}
        />
      </View>
      <TextField
        label={t.target}
        value={values.target}
        onChangeText={(text) => change({ target: text })}
        unit={unit}
        keyboardType="decimal-pad"
        placeholder="—"
        error={dirty && errors.target ? t.errors[errors.target] : undefined}
        helper={current ? fill(t.currentValue, { value: `${formatMeasure(current.value)}${unit ? ` ${unit}` : ''}` }) : t.noValue}
      />
      <TextField
        label={t.targetDate}
        value={values.targetDate}
        onChangeText={(text) => change({ targetDate: maskDateInput(text) })}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="ДД.ММ.ГГГГ"
        error={errors.targetDate ? t.errors.dateInvalid : undefined}
        helper={t.targetDateHelper}
      />
      <Button title={t.done} onPress={() => void done()} disabled={fields === null} />
      {existing ? (
        <ConfirmButton
          title={t.delete}
          question={t.deleteConfirm}
          confirmTitle={t.deleteButton}
          onConfirm={() => {
            void deleteGoal(existing.id).then(() => router.back());
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
});
