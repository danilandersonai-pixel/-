import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { minTouchSize, radius, useTheme } from '@/theme';

type IconButtonProps = {
  icon: IconName;
  /** Подпись для экранного диктора */
  label: string;
  onPress: () => void;
};

/** Кнопка с иконкой 48×48 на яркой заливке — главное действие экрана («+») */
export function IconButton({ icon, label, onPress }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
      <Icon name={icon} color="onAccent" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTouchSize + 4,
    height: minTouchSize + 4,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
