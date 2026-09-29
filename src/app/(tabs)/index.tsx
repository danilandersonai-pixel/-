import { router } from 'expo-router';
import { useState } from 'react';

import { ArchiveLink } from '@/components/ArchiveLink';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ClientRow } from '@/components/ClientRow';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { icons } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { useActiveClients, useArchivedClients } from '@/db/useClients';
import { ru } from '@/i18n/ru';
import { matchesClientSearch } from '@/lib/clients';
import { pluralRu } from '@/utils/plural';

function openNewClient() {
  router.push('/client/new');
}

function openArchive() {
  router.push('/archive');
}

export default function ClientsScreen() {
  const { data: clients, error } = useActiveClients();
  const { data: archived } = useArchivedClients();
  const [query, setQuery] = useState('');
  const archiveLink =
    archived && archived.length > 0 ? <ArchiveLink count={archived.length} onPress={openArchive} /> : null;

  if (error) {
    return (
      <Screen title={ru.clients.title}>
        <EmptyState icon={icons.warning} title={ru.database.errorTitle} hint={error.message} />
      </Screen>
    );
  }

  // Пока список загружается — только заголовок, без мигания пустого состояния
  if (!clients) {
    return <Screen title={ru.clients.title}>{null}</Screen>;
  }

  if (clients.length === 0) {
    return (
      <Screen title={ru.clients.title}>
        <EmptyState
          icon={icons.clients}
          title={ru.clients.emptyTitle}
          hint={ru.clients.emptyHint}
          action={<Button title={ru.clients.add} icon={icons.add} onPress={openNewClient} />}
        />
        {archiveLink}
      </Screen>
    );
  }

  const found = clients.filter((client) => matchesClientSearch(client, query));

  return (
    <Screen
      title={ru.clients.title}
      subtitle={`${clients.length} ${pluralRu(clients.length, ru.clients.countForms)}`}
      headerRight={<IconButton icon={icons.add} label={ru.clients.add} onPress={openNewClient} />}>
      <SearchField value={query} onChangeText={setQuery} placeholder={ru.clients.searchPlaceholder} />
      {found.length === 0 ? (
        <EmptyState icon={icons.searchPerson} title={ru.clients.nothingFound} hint={ru.clients.nothingFoundHint} />
      ) : (
        <Card>
          {found.map((client, index) => (
            <ClientRow
              key={client.id}
              client={client}
              divider={index > 0}
              onPress={() => router.push({ pathname: '/client/[id]', params: { id: client.id } })}
            />
          ))}
        </Card>
      )}
      {archiveLink}
    </Screen>
  );
}
