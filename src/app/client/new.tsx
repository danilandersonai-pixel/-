import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { ClientForm } from '@/components/ClientForm';
import { FormScreen } from '@/components/FormScreen';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { newId } from '@/db/ids';
import { useClientEditor } from '@/hooks/useClientEditor';
import { ru } from '@/i18n/ru';
import { emptyClientFormValues } from '@/lib/clientForm';
import { clientFullName } from '@/lib/clients';

export default function NewClientScreen() {
  // id выдаём сразу: как только введено имя, карточка сохраняется под этим id
  const [id] = useState(newId);
  const { values, setField, errors, status, flush, canSave } = useClientEditor(id, emptyClientFormValues);
  const name = clientFullName({ firstName: values.firstName.trim(), lastName: values.lastName.trim() });

  const goToConsent = async () => {
    await flush();
    router.replace({ pathname: '/client/[id]/consent', params: { id, from: 'new' } });
  };

  return (
    <FormScreen>
      <Stack.Screen
        options={{
          title: name || ru.clientForm.newTitle,
          headerRight: () => <SaveStatusLabel status={status} />,
        }}
      />
      <ClientForm values={values} errors={errors} onChange={setField} autoFocus />
      <Button title={ru.clientForm.next} onPress={() => void goToConsent()} disabled={!canSave} />
    </FormScreen>
  );
}
