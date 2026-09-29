import { router, Stack, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ClientRow } from '@/components/ClientRow';
import { FormScreen } from '@/components/FormScreen';
import { useActiveClients } from '@/db/useClients';
import { ru } from '@/i18n/ru';
import { toIsoDate } from '@/utils/date';

/** Тренировка из календаря: сначала выбираем подопечного, потом — обычный редактор */
export default function NewWorkoutPickClientScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { data: clients } = useActiveClients();
  const day = date ?? toIsoDate(new Date());
  const status = day < toIsoDate(new Date()) ? 'done' : 'planned';

  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.workout.newTitle }} />
      <AppText variant="title">{ru.workout.pickClient}</AppText>
      <Card>
        {(clients ?? []).map((client, index) => (
          <ClientRow
            key={client.id}
            client={client}
            divider={index > 0}
            onPress={() =>
              router.replace({ pathname: '/client/[id]/workout', params: { id: client.id, date: day, status } })
            }
          />
        ))}
      </Card>
    </FormScreen>
  );
}
