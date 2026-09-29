import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { LockScreen } from '@/components/LockScreen';
import { appLockEnabled } from '@/db/settings';
import { useSetting } from '@/db/useSetting';
import { shouldRelock } from '@/lib/appLock';

/**
 * Защита входа. Если включена: при запуске и после того, как приложение было свёрнуто дольше минуты,
 * поверх всего экран «Разблокировать». Содержимое под ним не выгружается — ввод и открытый экран сохраняются.
 */
export function AppLock({ children }: { children: ReactNode }) {
  const enabled = useSetting(appLockEnabled);
  // Заперто при запуске, если защита включена. Включение защиты в настройках не запирает сразу.
  const [locked, setLocked] = useState(enabled);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const backgroundAt = useRef<number | null>(null);
  const unlock = useCallback(() => setLocked(false), []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
      if (state === 'background') {
        backgroundAt.current ??= Date.now();
      } else if (state === 'active') {
        if (appLockEnabled.get() && shouldRelock(backgroundAt.current, Date.now())) {
          setLocked(true);
        }
        backgroundAt.current = null;
      }
    });
    return () => subscription.remove();
  }, []);

  const covered = enabled && (locked || !active);
  return (
    <View style={styles.root}>
      <View style={styles.root} aria-hidden={covered} importantForAccessibility={covered ? 'no-hide-descendants' : 'auto'}>
        {children}
      </View>
      {covered ? <LockScreen locked={locked} onUnlock={unlock} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
