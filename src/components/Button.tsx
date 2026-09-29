import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
};

/** Главная кнопка экрана */
export function Button({ title, onPress, icon }: ButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
      {icon ? <Icon name={icon} color="onPrimary" size={20} /> : null}
      <AppText variant="headline" color="onPrimary">
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTouchSize + spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.8,
  },
});
