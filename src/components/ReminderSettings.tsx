import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SegmentedControl } from '@/components/SegmentedControl';
import { workoutReminderLead } from '@/db/settings';
import { useSetting } from '@/db/useSetting';
import { notificationsUnavailable, requestNotificationPermission } from '@/device/notifications';
import { ru } from '@/i18n/ru';
import { reminderLeads, type ReminderLead } from '@/lib/workoutReminders';
import { spacing } from '@/theme';

const t = ru.reminders;
const options = reminderLeads.map((lead) => ({ value: lead, label: t.options[lead] }));

/** Настройки → «Напоминания о тренировках»: за сколько до начала */
export function ReminderSettings() {
  const lead = useSetting(workoutReminderLead);
  const [denied, setDenied] = useState(false);

  const change = async (value: ReminderLead) => {
    setDenied(false);
    if (value !== 'off' && !(await requestNotificationPermission())) {
      setDenied(true);
      return;
    }
    workoutReminderLead.set(value);
  };

  return (
    <View style={styles.section}>
      <AppText variant="section" color="textSecondary" style={styles.title}>
        {t.section}
      </AppText>
      {notificationsUnavailable ? (
        <AppText variant="callout" color="textSecondary">
          {t[notificationsUnavailable]}
        </AppText>
      ) : (
        <SegmentedControl label={t.lead} options={options} value={lead} onChange={(value) => void change(value)} />
      )}
      {denied ? (
        <AppText variant="callout" color="danger">
          {t.denied}
        </AppText>
      ) : null}
      <AppText variant="caption" color="textTertiary">
        {t.hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    marginLeft: spacing.lg,
  },
});
