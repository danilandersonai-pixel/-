import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ConfirmButton } from '@/components/ConfirmButton';
import { InfoRow } from '@/components/InfoRow';
import { revokeConsent } from '@/db/consents';
import type { Consent } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { spacing } from '@/theme';
import { formatDate } from '@/utils/format';

/** Сведения о действующем согласии и кнопка отзыва */
export function ConsentStatusCard({ consent }: { consent: Consent }) {
  return (
    <View style={styles.wrapper}>
      <Card title={ru.consent.statusTitle}>
        <InfoRow label={ru.consent.statusSigned} value={formatDate(new Date(consent.signedAt))} />
        <InfoRow label={ru.consent.statusSignedBy} value={consent.signedBy} divider />
        <InfoRow label={ru.consent.statusVersion} value={consent.textVersion} divider />
      </Card>
      <ConfirmButton
        title={ru.consent.revoke}
        question={ru.consent.revokeConfirm}
        confirmTitle={ru.consent.revokeConfirmButton}
        onConfirm={() => void revokeConsent(consent.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
});
