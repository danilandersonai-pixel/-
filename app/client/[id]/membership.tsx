import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormScreen } from '@/components/FormScreen';
import { MembershipEditor } from '@/components/MembershipEditor';
import { newId } from '@/db/ids';
import { useMembership } from '@/db/useMembership';
import { useTheme } from '@/theme';
import { toIsoDate } from '@/utils/date';

/** Абонемент: изменить действующий или (renew=1) завести новый */
export default function MembershipScreen() {
  const { id, renew } = useLocalSearchParams<{ id: string; renew?: string }>();
  const { data: membership } = useMembership(id);
  const [newMembershipId] = useState(newId);
  const { colors } = useTheme();

  if (membership === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  const existing = renew === '1' ? null : membership;
  return (
    <FormScreen>
      <MembershipEditor
        key={existing?.id ?? newMembershipId}
        clientId={id}
        membershipId={existing?.id ?? newMembershipId}
        existing={existing}
        todayIso={toIsoDate(new Date())}
      />
    </FormScreen>
  );
}
