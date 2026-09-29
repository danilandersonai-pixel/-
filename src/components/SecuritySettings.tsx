import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SegmentedControl } from '@/components/SegmentedControl';
import { appLockEnabled } from '@/db/settings';
import { useSetting } from '@/db/useSetting';
import { authenticate, canProtectApp } from '@/device/biometrics';
import { ru } from '@/i18n/ru';
import { spacing } from '@/theme';

const t = ru.security;
const options = [
  { value: 'off', label: t.off },
  { value: 'on', label: t.on },
] as const;

/** Настройки → «Защита»: вход по Face ID / отпечатку / коду телефона */
export function SecuritySettings() {
  const enabled = useSetting(appLockEnabled);
  const [message, setMessage] = useState<string | null>(null);

  const change = async (value: 'on' | 'off') => {
    setMessage(null);
    if (value === 'off') {
      appLockEnabled.set(false);
      return;
    }
    if (!(await canProtectApp())) {
      setMessage(t.unavailable);
      return;
    }
    // Сначала проверяем, что вход срабатывает, — иначе можно запереть себя
    if (await authenticate(t.confirmPrompt, t.cancel)) {
      appLockEnabled.set(true);
    } else {
      setMessage(t.failed);
    }
  };

  return (
    <View style={styles.section}>
      <AppText variant="section" color="textSecondary" style={styles.title}>
        {t.section}
      </AppText>
      {Platform.OS === 'web' ? (
        <AppText variant="callout" color="textSecondary">
          {t.web}
        </AppText>
      ) : (
        <SegmentedControl label={t.lock} options={options} value={enabled ? 'on' : 'off'} onChange={(value) => void change(value)} />
      )}
      {message ? (
        <AppText variant="callout" color="danger">
          {message}
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
