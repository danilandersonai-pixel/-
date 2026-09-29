import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { minTouchSize, radius, spacing, useTheme, type Palette } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  /** primary — главное действие, secondary — второстепенное, danger — необратимое или важное */
  variant?: ButtonVariant;
  disabled?: boolean;
};

const variantColors: Record<ButtonVariant, { background: keyof Palette; text: keyof Palette }> = {
  primary: { background: 'primary', text: 'onPrimary' },
  secondary: { background: 'primarySoft', text: 'primary' },
  danger: { background: 'surfaceMuted', text: 'danger' },
};

export function Button({ title, onPress, icon, variant = 'primary', disabled = false }: ButtonProps) {
  const { colors } = useTheme();
  const palette = variantColors[variant];
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors[palette.background] },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <Icon name={icon} color={palette.text} size={20} /> : null}
      <AppText variant="headline" color={palette.text}>
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
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.4,
  },
});
