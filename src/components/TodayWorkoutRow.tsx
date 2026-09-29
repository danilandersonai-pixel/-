import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { fonts, minTouchSize, radius, spacing, useTheme } from '@/theme';

type TodayWorkoutRowProps = {
  /** «19:00»; null — время не указано */
  time: string | null;
  name: string;
  subtitle: string;
  onPress: () => void;
};

/** Тренировка на сегодня в блоке «Сегодня»: яркая плашка, время крупно, как на табло */
export function TodayWorkoutRow({ time, name, subtitle, onPress }: TodayWorkoutRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[time, name, subtitle].filter(Boolean).join('. ')}
      onPress={onPress}
      style={({ pressed }) => [styles.plaque, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
      {time ? (
        <AppText color="onAccent" style={styles.time}>
          {time}
        </AppText>
      ) : (
        <Icon name={icons.workouts} color="onAccent" size={26} />
      )}
      <View style={styles.text}>
        <AppText variant="headline" color="onAccent" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="callout" color="onAccent">
          {subtitle}
        </AppText>
      </View>
      <Icon name={icons.chevronRight} color="onAccent" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plaque: {
    minHeight: minTouchSize + spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.85,
  },
  time: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
