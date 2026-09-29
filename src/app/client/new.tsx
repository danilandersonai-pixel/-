import { useState } from 'react';

import { ClientEditor } from '@/components/ClientEditor';
import { newId } from '@/db/ids';
import { ru } from '@/i18n/ru';
import { emptyClientFormValues } from '@/lib/clientForm';

export default function NewClientScreen() {
  // id выдаём сразу: как только введено имя, карточка сохраняется под этим id
  const [id] = useState(newId);
  return (
    <ClientEditor id={id} initialValues={emptyClientFormValues} fallbackTitle={ru.clientForm.newTitle} autoFocus />
  );
}
