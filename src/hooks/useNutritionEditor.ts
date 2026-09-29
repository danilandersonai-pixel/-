import { useCallback, useMemo, useState } from 'react';

import { saveNutritionPlan } from '@/db/nutrition';
import type { NutritionFields } from '@/db/schema';
import { formToNutritionFields, type NutritionFormValues } from '@/lib/nutrition';

import { useAutosave } from './useAutosave';

/** Состояние плана питания с автосохранением */
export function useNutritionEditor(planId: string, clientId: string, initialValues: NutritionFormValues) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  const setField = useCallback((key: keyof NutritionFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const { fields, errors } = useMemo(() => formToNutritionFields(values), [values]);
  const save = useCallback(
    (toSave: NutritionFields) => saveNutritionPlan(planId, clientId, toSave),
    [planId, clientId],
  );
  const { status } = useAutosave(dirty ? fields : null, save);

  return { values, setField, errors: dirty ? errors : {}, status };
}
