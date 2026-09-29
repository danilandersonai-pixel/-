import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon, icons } from '@/components/Icon';
import { authenticate, canProtectApp } from '@/device/biometrics';
import { ru } from '@/i18n/ru';
import { radius, spacing, useTheme } from '@/theme';

type LockScreenProps = {
  /** false — просто закрываем содержимое, пока приложение свёрнуто (чтобы не было видно в списке приложений) */
  locked: boolean;
  onUnlock: () => void;
};

const t = ru.security;

/** Экран поверх приложения: логотип и кнопка «Разблокировать» с системным запросом Face ID / отпечатка */
export function LockScreen({ locked, onUnlock }: LockScreenProps) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);

  const tryUnlock = useCallback(async () => {
    // Если в телефоне сняли и код, и биометрию, проверять нечем — не запираем тренера от его данных
    if (!(await canProtectApp()) || (await authenticate(t.prompt, t.cancel))) {
      onUnlock();
    }
  }, [onUnlock]);

  // Системный запрос — сразу, как только экран заперт
  useEffect(() => {
    if (locked) {
      void tryUnlock();
    }
  }, [locked, tryUnlock]);

  const press = async () => {
    setBusy(true);
    try {
      await tryUnlock();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Icon name={icons.lock} color="onAccent" size={40} />
      </View>
      <AppText variant="title" style={styles.center}>
        {t.lockedTitle}
      </AppText>
      <AppText variant="callout" color="textSecondary" style={styles.center}>
        {t.lockedText}
      </AppText>
      {locked ? (
        <View style={styles.button}>
          <Button title={t.unlock} icon={icons.lock} onPress={() => void press()} disabled={busy} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
});
