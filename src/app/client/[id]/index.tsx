import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { ClientHealthTab } from '@/components/ClientHealthTab';
import { ClientMeasurementsTab } from '@/components/ClientMeasurementsTab';
import { ClientNutritionTab } from '@/components/ClientNutritionTab';
import { ClientProfileTab } from '@/components/ClientProfileTab';
import { ClientSummary } from '@/components/ClientSummary';
import { ClientWorkoutsTab } from '@/components/ClientWorkoutsTab';
import { clientTabs, ClientTabs, type ClientTab } from '@/components/ClientTabs';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { setClientArchived } from '@/db/clients';
import { useClient } from '@/db/useClients';
import { useActiveConsent } from '@/db/useConsent';
import { useHealth } from '@/db/useHealth';
import { ru } from '@/i18n/ru';
import { clientFullName } from '@/lib/clients';
import { useTheme } from '@/theme';

function isClientTab(value: string | undefined): value is ClientTab {
  return clientTabs.some((tab) => tab === value);
}

export default function ClientCardScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const [tab, setTab] = useState<ClientTab>(isClientTab(tabParam) ? tabParam : 'profile');
  const { data: client, error } = useClient(id);
  const { data: consent } = useActiveConsent(id);
  const { data: health } = useHealth(id);
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

  if (client === undefined || consent === undefined) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const openConsent = () => router.push({ pathname: '/client/[id]/consent', params: { id } });
  const locked = (
    <EmptyState
      icon={icons.lock}
      title={ru.consent.lockedTitle}
      hint={ru.consent.lockedHint}
      action={<Button title={ru.consent.missingAction} onPress={openConsent} />}
    />
  );

  let content;
  switch (tab) {
    case 'profile':
      content = <ClientProfileTab key={client.id} client={client} consent={consent} onArchived={() => router.back()} />;
      break;
    case 'health':
      if (!consent) {
        content = locked;
      } else if (health !== undefined) {
        content = <ClientHealthTab key={client.id} clientId={client.id} health={health} />;
      }
      break;
    case 'measurements':
      content = consent ? <ClientMeasurementsTab client={client} /> : locked;
      break;
    case 'workouts':
      content = <ClientWorkoutsTab client={client} />;
      break;
    case 'nutrition':
      content = <ClientNutritionTab client={client} />;
      break;
  }

  // Статус «Сохранено» в заголовке показывают вкладки с формами — они сами управляют заголовком
  const editable = tab === 'profile' || tab === 'nutrition' || (tab === 'health' && consent !== null);

  return (
    <FormScreen>
      <Stack.Screen options={{ title: clientFullName(client) }} />
      {editable ? null : <Stack.Screen options={{ headerRight: () => null }} />}
      <ClientSummary client={client} />
      {client.archived ? (
        <Notice
          icon={icons.archive}
          title={ru.card.archivedTitle}
          text={ru.card.archivedText}
          action={
            <Button
              title={ru.card.restore}
              variant="secondary"
              onPress={() => void setClientArchived(client.id, false)}
            />
          }
        />
      ) : null}
      {consent ? null : (
        <Notice
          tone="warning"
          icon={icons.consent}
          title={ru.consent.missingTitle}
          text={ru.consent.missingText}
          action={<Button title={ru.consent.missingAction} onPress={openConsent} />}
        />
      )}
      <ClientTabs value={tab} onChange={setTab} />
      {content}
    </FormScreen>
  );
}
