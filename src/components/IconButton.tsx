import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { minTouchSize, radius, useTheme } from '@/theme';

type IconButtonProps = {
  icon: IconName;
  /** Подпись для экранного диктора */
  label: string;
  onPress: () => void;
};

/** Круглая кнопка с иконкой, 44×44 */
export function IconButton({ icon, label, onPress }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.primarySoft }, pressed && styles.pressed]}>
      <Icon name={icon} color="primary" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTouchSize,
    height: minTouchSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
