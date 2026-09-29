import { Stack } from 'expo-router';

import { ClientForm } from '@/components/ClientForm';
import { FormScreen } from '@/components/FormScreen';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { useClientEditor } from '@/hooks/useClientEditor';
import type { ClientFormValues } from '@/lib/clientForm';
import { clientFullName } from '@/lib/clients';

type ClientEditorProps = {
  id: string;
  initialValues: ClientFormValues;
  /** Заголовок, пока имя не введено */
  fallbackTitle: string;
  autoFocus?: boolean;
};

/** Экран редактирования подопечного с автосохранением — для нового и для существующего */
export function ClientEditor({ id, initialValues, fallbackTitle, autoFocus }: ClientEditorProps) {
  const { values, setField, errors, status } = useClientEditor(id, initialValues);
  const name = clientFullName({ firstName: values.firstName.trim(), lastName: values.lastName.trim() });
  return (
    <FormScreen>
      <Stack.Screen
        options={{
          title: name || fallbackTitle,
          headerRight: () => <SaveStatusLabel status={status} />,
        }}
      />
      <ClientForm values={values} errors={errors} onChange={setField} autoFocus={autoFocus} />
    </FormScreen>
  );
}
