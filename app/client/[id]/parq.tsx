import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormScreen } from '@/components/FormScreen';
import { ParqEditor } from '@/components/ParqEditor';
import { newId } from '@/db/ids';
import { useParq } from '@/db/useParq';
import { useTheme } from '@/theme';
import { toIsoDate } from '@/utils/date';

/** Анкета PAR-Q: открыть последнюю или (again=1) пройти заново */
export default function ParqScreen() {
  const { id, again } = useLocalSearchParams<{ id: string; again?: string }>();
  const { data: form } = useParq(id);
  const [newFormId] = useState(newId);
  const { colors } = useTheme();

  if (form === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  const existing = again === '1' ? null : form;
  return (
    <FormScreen>
      <ParqEditor
        key={existing?.id ?? newFormId}
        clientId={id}
        formId={existing?.id ?? newFormId}
        existing={existing}
        todayIso={toIsoDate(new Date())}
      />
    </FormScreen>
  );
}
