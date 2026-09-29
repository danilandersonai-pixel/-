import { router, Stack } from 'expo-router';

import { Card } from '@/components/Card';
import { ClientRow } from '@/components/ClientRow';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { useArchivedClients } from '@/db/useClients';
import { ru } from '@/i18n/ru';

export default function ArchiveScreen() {
  const { data: clients } = useArchivedClients();
  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.archive.title }} />
      {clients === undefined ? null : clients.length === 0 ? (
        <EmptyState icon={icons.archive} title={ru.archive.emptyTitle} hint={ru.archive.emptyHint} />
      ) : (
        <Card>
          {clients.map((client, index) => (
            <ClientRow
              key={client.id}
              client={client}
              divider={index > 0}
              onPress={() => router.push({ pathname: '/client/[id]', params: { id: client.id } })}
            />
          ))}
        </Card>
      )}
    </FormScreen>
  );
}
