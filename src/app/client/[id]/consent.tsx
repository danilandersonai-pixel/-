import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ConsentForm } from '@/components/ConsentForm';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { useClient } from '@/db/useClients';
import { ru } from '@/i18n/ru';
import { useTheme } from '@/theme';

export default function ConsentScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { data: client } = useClient(id);
  const { colors } = useTheme();

  if (client === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.searchPerson} title={ru.clients.notFoundTitle} hint={ru.clients.notFoundHint} />
      </View>
    );
  }
  if (!client) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  // После создания подопечного — сразу в его карточку, из карточки — просто назад
  const done = () => {
    if (from === 'new') {
      router.replace({ pathname: '/client/[id]', params: { id } });
    } else {
      router.back();
    }
  };

  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.consent.title }} />
      <ConsentForm client={client} onDone={done} />
    </FormScreen>
  );
}
