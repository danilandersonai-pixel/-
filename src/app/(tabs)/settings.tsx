import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import { InfoRow } from '@/components/InfoRow';
import { Screen } from '@/components/Screen';
import { exportBackup } from '@/db/backup';
import { ru } from '@/i18n/ru';
import { backupCounts, backupFileName } from '@/lib/backup';
import { spacing } from '@/theme';
import { toIsoDate } from '@/utils/date';
import { pluralRu } from '@/utils/plural';
import { canShareFiles, shareTextFile } from '@/utils/share';

const b = ru.backup;

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '—';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const saveBackup = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const backup = await exportBackup();
      const counts = backupCounts(backup);
      const summary = [
        `${counts.clients} ${pluralRu(counts.clients, b.counts.clients)}`,
        `${counts.measurements} ${pluralRu(counts.measurements, b.counts.measurements)}`,
        `${counts.workouts} ${pluralRu(counts.workouts, b.counts.workouts)}`,
      ].join(', ');
      setMessage({ text: `${b.contents}: ${summary}`, error: false });
      if (canShareFiles) {
        await shareTextFile(backupFileName(toIsoDate(new Date())), JSON.stringify(backup, null, 2), 'application/json');
      }
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
