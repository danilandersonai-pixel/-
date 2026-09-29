import { useCallback, useMemo, useState } from 'react';

import { saveClient } from '@/db/clients';
import type { ClientFields } from '@/db/schema';
import { formToClientFields, type ClientFormValues } from '@/lib/clientForm';

import { useAutosave } from './useAutosave';

/** Состояние формы подопечного с автосохранением в базу */
export function useClientEditor(id: string, initialValues: ClientFormValues) {
  const [values, setValues] = useState(initialValues);
  const [dirty, setDirty] = useState(false);

  const setField = useCallback(<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const { fields, errors } = useMemo(() => formToClientFields(values), [values]);
  const save = useCallback((toSave: ClientFields) => saveClient(id, toSave), [id]);
  // Пока тренер ничего не менял, сохранять незачем
  const { status, flush } = useAutosave(dirty ? fields : null, save);

  return { values, setField, errors: dirty ? errors : {}, status, flush, canSave: fields !== null };
}
