import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmButton } from '@/components/ConfirmButton';
import { icons } from '@/components/Icon';
import { InfoRow } from '@/components/InfoRow';
import { Screen } from '@/components/Screen';
import { shareBackupFile } from '@/db/backupFiles';
import { fillDemoData } from '@/db/demo';
import { countsText } from '@/i18n/backup';
import { ru } from '@/i18n/ru';
import { spacing } from '@/theme';
import { fill } from '@/utils/format';
import { canShareFiles } from '@/utils/share';

const b = ru.backup;

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '—';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [demoMessage, setDemoMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);

  const addDemo = async () => {
    setDemoBusy(true);
    setDemoMessage(null);
    try {
      const count = await fillDemoData();
      setDemoMessage({ text: fill(ru.demo.done, { count }), error: false });
    } catch {
      setDemoMessage({ text: ru.demo.error, error: true });
    } finally {
      setDemoBusy(false);
    }
  };

  const saveBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const summary = await shareBackupFile();
      const missing = summary.missingPhotos > 0 ? ` ${fill(b.missingPhotos, { count: summary.missingPhotos })}` : '';
      setMessage({ text: `${b.contents}: ${countsText(summary)}.${missing}`, error: false });
    } catch {
      setMessage({ text: b.error, error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title={ru.settings.title}>
      <Card title={ru.settings.dataSection} footer={ru.settings.dataHint}>
        <InfoRow label={ru.settings.dataStorage} value={ru.settings.dataStorageValue} />
      </Card>

      <View style={styles.section}>
        <AppText variant="caption" color="textSecondary" style={styles.sectionTitle}>
          {b.section.toUpperCase()}
        </AppText>
        <Button title={busy ? b.saving : b.save} icon={icons.backup} onPress={() => void saveBackup()} disabled={busy} />
        {message ? (
          <AppText variant="callout" color={message.error ? 'danger' : 'textSecondary'}>
            {message.text}
          </AppText>
        ) : null}
        <AppText variant="caption" color="textTertiary">
          {canShareFiles ? b.hint : b.webNote}
        </AppText>
        <Button title={b.restore} icon={icons.repeat} variant="secondary" onPress={() => router.push('/restore')} />
      </View>

      <View style={styles.section}>
        <AppText variant="caption" color="textSecondary" style={styles.sectionTitle}>
          {ru.demo.section.toUpperCase()}
        </AppText>
        {demoBusy ? (
          <Button title={ru.demo.filling} icon={icons.clients} variant="secondary" onPress={() => undefined} disabled />
        ) : (
          <ConfirmButton
            title={ru.demo.fill}
            icon={icons.clients}
            variant="secondary"
            question={ru.demo.question}
            confirmTitle={ru.demo.confirm}
            onConfirm={() => void addDemo()}
          />
        )}
        {demoMessage ? (
          <AppText variant="callout" color={demoMessage.error ? 'danger' : 'success'}>
            {demoMessage.text}
          </AppText>
        ) : null}
        <AppText variant="caption" color="textTertiary">
          {ru.demo.hint}
        </AppText>
      </View>

      <Card title={ru.settings.aboutSection}>
        <InfoRow label={ru.settings.theme} value={ru.settings.themeSystem} />
        <InfoRow label={ru.settings.version} value={version} divider />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginLeft: spacing.lg,
  },
});
