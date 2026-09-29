import { useCallback, useMemo, useState } from 'react';

import { saveMeasurement } from '@/db/measurements';
import type { MeasurementFields } from '@/db/schema';
import { formToMeasurementFields, type MeasurementFormValues } from '@/lib/measurementForm';

import { useAutosave } from './useAutosave';

/** Состояние формы замера с автосохранением: запись появляется, как только введены дата и вес */
export function useMeasurementEditor(id: string, clientId: string, initialValues: MeasurementFormValues) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  const setField = useCallback((key: keyof MeasurementFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const { fields, errors } = useMemo(() => formToMeasurementFields(values), [values]);
  const save = useCallback((toSave: MeasurementFields) => saveMeasurement(id, clientId, toSave), [id, clientId]);
  const { status, flush } = useAutosave(dirty ? fields : null, save);

  return { values, setField, errors: dirty ? errors : {}, status, flush, canSave: fields !== null };
}
