import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { TimerButton } from '@/components/TimerButton';
import { ru } from '@/i18n/ru';
import { fonts, minTouchSize, radius, spacing, useTheme } from '@/theme';
import { formatClock } from '@/utils/format';

const presets = [45, 60, 90, 120, 180];

type Phase = { kind: 'idle' } | { kind: 'choosing' } | { kind: 'running'; endAt: number; total: number } | { kind: 'finished'; total: number };

/** Запуск отсчёта: время окончания считается от текущего момента */
function runningFor(seconds: number): Phase {
  return { kind: 'running', endAt: Date.now() + seconds * 1000, total: seconds };
}

type RestTimerProps = {
  /** Отдых из последнего заполненного подхода, секунды — предлагается первым */
  suggested: number | null;
};

const t = ru.rest;

/**
 * Таймер отдыха поверх экрана тренировки. Считает от момента окончания, поэтому не сбивается,
 * если приложение свернули; по окончании — вибрация.
 */
export function RestTimer({ suggested }: RestTimerProps) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase.kind !== 'running') {
      return;
    }
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= phase.endAt) {
        Vibration.vibrate([0, 400, 200, 400]);
        setPhase({ kind: 'finished', total: phase.total });
      }
    }, 250);
    return () => clearInterval(timer);
  }, [phase]);

  const start = (seconds: number) => setPhase(runningFor(seconds));

  if (phase.kind === 'idle') {
    return (
      <View style={styles.anchor} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.title}
          onPress={() => setPhase({ kind: 'choosing' })}
          style={({ pressed }) => [styles.pill, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
          <Icon name={icons.timer} color="onAccent" size={22} />
          <AppText variant="headline" color="onAccent">
            {t.open}
          </AppText>
        </Pressable>
      </View>
    );
  }

  const options = suggested && !presets.includes(suggested) ? [suggested, ...presets] : presets;
  const barStyle = [styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }];

  if (phase.kind === 'choosing') {
    return (
      <View style={barStyle}>
        <View style={styles.header}>
          <AppText variant="section" color="textSecondary" style={styles.flex}>
            {t.choose}
          </AppText>
          <TimerButton label={t.close} onPress={() => setPhase({ kind: 'idle' })} />
        </View>
        <View style={styles.presets}>
          {options.map((seconds) => (
            <Pressable
              key={seconds}
              accessibilityRole="button"
              onPress={() => start(seconds)}
              style={({ pressed }) => [
                styles.preset,
                {
                  backgroundColor: seconds === suggested ? colors.accent : colors.surfaceMuted,
                },
                pressed && styles.pressed,
              ]}>
              <AppText variant="headline" color={seconds === suggested ? 'onAccent' : 'text'}>
                {formatClock(seconds)}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  if (phase.kind === 'finished') {
    return (
      <View style={[styles.bar, { backgroundColor: colors.accent, borderColor: colors.accent }]} accessibilityLiveRegion="assertive">
        <View style={styles.header}>
          <AppText variant="title" color="onAccent" style={styles.flex}>
            {t.finished}
          </AppText>
          <TimerButton label={t.again} onPress={() => start(phase.total)} onAccent />
          <TimerButton label={t.close} onPress={() => setPhase({ kind: 'idle' })} onAccent />
        </View>
      </View>
    );
  }

  // До первого тика `now` может быть старым — не показываем больше, чем длится отдых
  const left = Math.min(phase.total, Math.max(0, Math.ceil((phase.endAt - now) / 1000)));
  const share = phase.total > 0 ? left / phase.total : 0;
  return (
    <View style={barStyle}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="caption" color="textSecondary">
            {t.left}
          </AppText>
          <AppText style={[styles.clock, { color: colors.text }]} accessibilityLiveRegion="polite">
            {formatClock(left)}
          </AppText>
        </View>
        <TimerButton label={t.add15} onPress={() => setPhase({ ...phase, endAt: phase.endAt + 15_000, total: phase.total + 15 })} />
        <TimerButton label={t.stop} onPress={() => setPhase({ kind: 'idle' })} />
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.fill, { backgroundColor: colors.accent, width: `${Math.round(share * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  pill: {
    minHeight: minTouchSize + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  bar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  preset: {
    minWidth: 64,
    minHeight: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  clock: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 46,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
});
