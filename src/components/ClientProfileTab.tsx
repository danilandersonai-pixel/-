import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ClientForm } from '@/components/ClientForm';
import { ConfirmButton } from '@/components/ConfirmButton';
import { ConsentStatusCard } from '@/components/ConsentStatusCard';
import { icons } from '@/components/Icon';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { setClientArchived } from '@/db/clients';
import type { Client, Consent } from '@/db/schema';
import { useClientEditor } from '@/hooks/useClientEditor';
import { ru } from '@/i18n/ru';
import { clientToFormValues } from '@/lib/clientForm';
import { spacing } from '@/theme';

type ClientProfileTabProps = {
  client: Client;
  consent: Consent | null;
  onArchived: () => void;
};

/** Вкладка «Профиль»: все данные подопечного с автосохранением, согласие, архив */
export function ClientProfileTab({ client, consent, onArchived }: ClientProfileTabProps) {
  const { values, setField, errors, status } = useClientEditor(client.id, clientToFormValues(client));
  return (
    <View style={styles.tab}>
      <Stack.Screen options={{ headerRight: () => <SaveStatusLabel status={status} /> }} />
      <ClientForm values={values} errors={errors} onChange={setField} extended />
      {consent ? <ConsentStatusCard consent={consent} /> : null}
      {client.archived ? null : (
        <ConfirmButton
          title={ru.card.archive}
          icon={icons.archive}
          question={ru.card.archiveConfirm}
          confirmTitle={ru.card.archiveConfirmButton}
          onConfirm={() => {
            void setClientArchived(client.id, true).then(onArchived);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    gap: spacing.xl,
  },
});
