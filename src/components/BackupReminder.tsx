import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { icons } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { saveBackupNow } from '@/db/saveBackup';
import { backupSnoozedUntil, lastBackupAt } from '@/db/settings';
import { useSetting } from '@/db/useSetting';
import { ru } from '@/i18n/ru';
import { backupReminder, snoozeUntil } from '@/lib/backupReminder';
import { spacing } from '@/theme';
import { fill } from '@/utils/format';
import { pluralRu } from '@/utils/plural';

type BackupReminderProps = {
  /** Когда появились первые данные, мс; null — данных нет */
  oldestDataAt: number | null;
};

const t = ru.backupReminder;

/** Плашка «Сохраните резервную копию», если копии больше недели или её не было */
export function BackupReminder({ oldestDataAt }: BackupReminderProps) {
  const last = useSetting(lastBackupAt);
  const snoozed = useSetting(backupSnoozedUntil);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const reminder = backupReminder({ lastBackupAt: last, snoozedUntil: snoozed, oldestDataAt, now: new Date() });
  if (!reminder) {
    return null;
  }

  const save = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await saveBackupNow();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const text =
    reminder.days === null ? t.never : fill(t.days, { days: `${reminder.days} ${pluralRu(reminder.days, ru.today.dayForms)}` });
  return (
    <Notice
      tone="warning"
      icon={icons.backup}
      title={t.title}
      text={text}
      action={
        <View style={styles.actions}>
          <Button title={busy ? ru.backup.saving : t.save} icon={icons.backup} onPress={() => void save()} disabled={busy} />
          <Button title={t.later} variant="secondary" onPress={() => backupSnoozedUntil.set(snoozeUntil(new Date()))} />
          {failed ? (
            <AppText variant="callout" color="danger">
              {t.error}
            </AppText>
          ) : null}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
});
