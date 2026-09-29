import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ru } from '@/i18n/ru';

export default function ClientsScreen() {
  return (
    <Screen title={ru.clients.title}>
      <EmptyState
        icon={{ ios: 'person.2', android: 'group', web: 'group' }}
        title={ru.clients.emptyTitle}
        hint={ru.clients.emptyHint}
      />
    </Screen>
  );
}
