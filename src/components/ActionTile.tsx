import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

type ActionTileProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** Плитка-действие для сетки второстепенных кнопок: иконка и подпись */
export function ActionTile({ icon, label, onPress, disabled = false }: ActionTileProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Icon name={icon} color="primary" size={22} />
      <AppText variant="headline" numberOfLines={2} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: minTouchSize + spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
