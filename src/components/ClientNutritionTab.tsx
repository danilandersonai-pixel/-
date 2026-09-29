import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { InfoButton } from '@/components/InfoButton';
import { InfoPanel } from '@/components/InfoPanel';
import { InfoRow } from '@/components/InfoRow';
import { MacroBar } from '@/components/MacroBar';
import { NutritionEditor } from '@/components/NutritionEditor';
import { newId } from '@/db/ids';
import { saveNutritionPlan } from '@/db/nutrition';
import type { Client, NutritionPlan } from '@/db/schema';
import { useMeasurements } from '@/db/useMeasurements';
import { useNutritionPlans } from '@/db/useNutrition';
import { ru } from '@/i18n/ru';
import {
  caloriesFromMacros,
  formToNutritionFields,
  mifflinStJeor,
  planToFormValues,
  type NutritionFormValues,
} from '@/lib/nutrition';
import { radius, spacing, typography, useTheme } from '@/theme';
import { ageOn, isoToRuDate, toIsoDate } from '@/utils/date';
import { fill, formatInteger, formatMeasure } from '@/utils/format';

const t = ru.nutrition;

/** Вкладка «Питание»: цель по калориям и КБЖУ, проверка цифр, заметки, история планов */
export function ClientNutritionTab({ client }: { client: Client }) {
  const { data: plans } = useNutritionPlans(client.id);
  const { data: measurements } = useMeasurements(client.id);

  if (!plans || !measurements) {
    return null;
  }

  const createPlan = (from?: NutritionPlan) =>
    void saveNutritionPlan(newId(), client.id, {
      startDate: toIsoDate(new Date()),
      calories: from?.calories ?? null,
      protein: from?.protein ?? null,
      fat: from?.fat ?? null,
      carbs: from?.carbs ?? null,
      notes: from?.notes ?? null,
    });

  if (plans.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerRight: () => null }} />
        <EmptyState
          icon={icons.nutrition}
          title={t.emptyTitle}
          hint={t.emptyHint}
          action={<Button title={t.create} icon={icons.add} onPress={() => createPlan()} />}
        />
      </>
    );
  }

  const [current, ...history] = plans;
  const latestWeight = measurements[0]?.weight ?? null;
  const latestHeight = measurements.find((m) => m.height !== null)?.height ?? null;
  const age = client.birthDate ? ageOn(client.birthDate, toIsoDate(new Date())) : null;
  const bmr = mifflinStJeor({ sex: client.gender, weightKg: latestWeight, heightCm: latestHeight, age });

  return (
    <View style={styles.tab}>
      <PlanSummaryAndEditor key={current.id} plan={current} clientId={client.id} weight={latestWeight} bmr={bmr} />
      <Button title={t.newPlan} icon={icons.add} variant="secondary" onPress={() => createPlan(current)} />
      {history.length > 0 ? (
        <Card title={t.history}>
          {history.map((plan, index) => (
            <InfoRow
              key={plan.id}
              label={fill(t.historyRow, { date: isoToRuDate(plan.startDate) })}
              value={[
                plan.calories !== null ? `${formatInteger(plan.calories)} ${t.kcal}` : null,
                plan.protein !== null ? `${t.proteinShort} ${formatMeasure(plan.protein)}` : null,
                plan.fat !== null ? `${t.fatShort} ${formatMeasure(plan.fat)}` : null,
                plan.carbs !== null ? `${t.carbsShort} ${formatMeasure(plan.carbs)}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              divider={index > 0}
            />
          ))}
        </Card>
      ) : null}
    </View>
  );
}

type PlanSummaryAndEditorProps = {
  plan: NutritionPlan;
  clientId: string;
  weight: number | null;
  bmr: number | null;
};

/** Сводка текущего плана (обновляется на лету) и его поля */
function PlanSummaryAndEditor({ plan, clientId, weight, bmr }: PlanSummaryAndEditorProps) {
  const { colors } = useTheme();
  const initialValues = planToFormValues(plan);
  const [values, setValues] = useState<NutritionFormValues>(initialValues);
  const [bmrInfo, setBmrInfo] = useState(false);
  const fields = formToNutritionFields(values).fields;
  const macros = { protein: fields?.protein ?? null, fat: fields?.fat ?? null, carbs: fields?.carbs ?? null };
  const calories = fields?.calories ?? null;
  const fromMacros = caloriesFromMacros(macros);

  let macrosCheck: string | null = null;
  if (fromMacros !== null) {
    const given = fill(t.macrosGive, { kcal: formatInteger(fromMacros) });
    if (calories === null) {
      macrosCheck = given;
    } else {
      const diff = Math.round(fromMacros - calories);
      macrosCheck =
        Math.abs(diff) <= 50
          ? `${given} — ${t.macrosMatch}`
          : `${given} — ${fill(t.macrosDiff, { kcal: formatInteger(Math.abs(diff)), direction: diff > 0 ? t.more : t.less })}`;
    }
  }

  return (
    <>
      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="section" color="textSecondary">
          {`${t.current} · ${fill(t.since, { date: values.startDate })}`}
        </AppText>
        {calories !== null ? (
          <View style={styles.caloriesRow}>
            <AppText style={[typography.number, { color: colors.text }]}>{formatInteger(calories)}</AppText>
            <AppText variant="callout" color="textSecondary">
              {t.perDay}
            </AppText>
          </View>
        ) : (
          <AppText variant="headline" color="textTertiary">
            {t.noCalories}
          </AppText>
        )}
        <MacroBar macros={macros} />
        {macrosCheck ? (
          <AppText variant="callout" color="textSecondary">
            {macrosCheck}
          </AppText>
        ) : null}
        {macros.protein !== null && weight ? (
          <AppText variant="callout" color="textSecondary">
            {fill(t.proteinPerKg, { value: formatMeasure(macros.protein / weight) })}
          </AppText>
        ) : null}
        {bmr !== null ? (
          <View style={styles.bmrRow}>
            <AppText variant="callout" color="textSecondary" style={styles.flex}>
              {fill(t.bmr, { value: formatInteger(bmr) })}
            </AppText>
            <InfoButton label={t.bmrLabel} onPress={() => setBmrInfo((open) => !open)} active={bmrInfo} />
          </View>
        ) : null}
      </View>
      {bmrInfo ? (
        <InfoPanel title={t.bmrInfoTitle} text={t.bmrInfo} closeLabel={ru.measurement.closeInfo} onClose={() => setBmrInfo(false)} />
      ) : null}
      <NutritionEditor planId={plan.id} clientId={clientId} initialValues={initialValues} onValues={setValues} />
    </>
  );
}

const styles = StyleSheet.create({
  tab: {
    gap: spacing.lg,
  },
  summary: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  bmrRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
});
