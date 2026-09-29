import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

type TimerButtonProps = {
  label: string;
  onPress: () => void;
  /** Кнопка на яркой заливке (когда отдых окончен) */
  onAccent?: boolean;
};

/** Небольшая кнопка на панели таймера отдыха: «+15 с», «Стоп», «Закрыть» */
export function TimerButton({ label, onPress, onAccent = false }: TimerButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: onAccent ? colors.onAccent : colors.surfaceMuted },
        pressed && styles.pressed,
      ]}>
      <AppText variant="headline" color={onAccent ? 'accent' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTouchSize,
    minWidth: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.8,
  },
});
