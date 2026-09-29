import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import type { Client } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { clientFullName, clientInitials } from '@/lib/clients';
import { spacing } from '@/theme';
import { ageOn, toIsoDate } from '@/utils/date';
import { pluralRu } from '@/utils/plural';

/** «36 лет · Женщина» — то, что есть из возраста и пола */
function describeClient(client: Client): string | null {
  const parts: string[] = [];
  if (client.birthDate) {
    const age = ageOn(client.birthDate, toIsoDate(new Date()));
    parts.push(`${age} ${pluralRu(age, ru.card.ageForms)}`);
  }
  if (client.gender) {
    parts.push(ru.card[client.gender]);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Шапка карточки подопечного: аватар, имя, возраст и цель */
export function ClientSummary({ client }: { client: Client }) {
  const details = describeClient(client);
  return (
    <View style={styles.row}>
      <Avatar initials={clientInitials(client)} size={64} />
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={2}>
          {clientFullName(client)}
        </AppText>
        {details ? (
          <AppText variant="callout" color="textSecondary">
            {details}
          </AppText>
        ) : null}
        <AppText variant="callout" color={client.goal ? 'text' : 'textTertiary'} numberOfLines={2}>
          {client.goal ?? ru.clients.noGoal}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
