import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { giveConsent } from '@/db/consents';
import type { Client } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { clientFullName } from '@/lib/clients';
import { radius, spacing, useTheme } from '@/theme';
import { formatDate } from '@/utils/format';

type ConsentFormProps = {
  client: Client;
  /** Согласие записано или тренер решил оформить позже */
  onDone: () => void;
};

const t = ru.consent;

/** Текст согласия, который тренер показывает подопечному, и подпись */
export function ConsentForm({ client, onDone }: ConsentFormProps) {
  const { colors } = useTheme();
  const [signedBy, setSignedBy] = useState(clientFullName(client));
  const [saving, setSaving] = useState(false);
  const trimmed = signedBy.trim();

  const agree = async () => {
    setSaving(true);
    try {
      await giveConsent(client.id, trimmed);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={[styles.document, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="headline">{t.heading}</AppText>
        {t.paragraphs.map((paragraph) => (
          <AppText key={paragraph} variant="callout">
            {paragraph}
          </AppText>
        ))}
        <AppText variant="caption" color="textSecondary">
          {`${t.date}: ${formatDate(new Date())}`}
        </AppText>
      </View>
      <TextField
        label={t.signedBy}
        value={signedBy}
        onChangeText={setSignedBy}
        error={trimmed === '' ? t.signedByRequired : undefined}
        autoCapitalize="words"
      />
      <Button title={t.agree} onPress={() => void agree()} disabled={trimmed === '' || saving} />
      <Button title={t.later} variant="secondary" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  document: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
