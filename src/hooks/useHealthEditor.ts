import { useCallback, useMemo, useState } from 'react';

import { saveHealth } from '@/db/health';
import type { HealthFields } from '@/db/schema';
import { formToHealthFields, type HealthFormValues } from '@/lib/healthForm';

import { useAutosave } from './useAutosave';

/** Состояние формы здоровья с автосохранением */
export function useHealthEditor(clientId: string, initialValues: HealthFormValues) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  const setField = useCallback((key: keyof HealthFormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const fields = useMemo(() => formToHealthFields(values), [values]);
  const save = useCallback((toSave: HealthFields) => saveHealth(clientId, toSave), [clientId]);
  const { status } = useAutosave(dirty ? fields : null, save);

  return { values, setField, status };
}
