import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ClientEditor } from '@/components/ClientEditor';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { useClient } from '@/db/useClients';
import { ru } from '@/i18n/ru';
import { clientToFormValues } from '@/lib/clientForm';
import { useTheme } from '@/theme';

export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: client, error } = useClient(id);
  const { colors } = useTheme();

  if (error || client === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon={icons.searchPerson}
          title={error ? ru.database.errorTitle : ru.clients.notFoundTitle}
          hint={error ? error.message : ru.clients.notFoundHint}
        />
      </View>
    );
  }

  if (!client) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  // key: форма берёт значения из базы один раз, дальше живёт своим состоянием
  return (
    <ClientEditor
      key={client.id}
      id={client.id}
      initialValues={clientToFormValues(client)}
      fallbackTitle={ru.clientForm.newTitle}
    />
  );
}
