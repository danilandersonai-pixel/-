import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { minTouchSize, radius, spacing, typography, useTheme } from '@/theme';

/** Маленькое числовое поле для таблицы подходов */
export function CompactInput(props: Omit<TextInputProps, 'style'> & { label: string }) {
  const { colors } = useTheme();
  const { label, ...inputProps } = props;
  return (
    <TextInput
      {...inputProps}
      accessibilityLabel={label}
      keyboardType="decimal-pad"
      placeholder="—"
      placeholderTextColor={colors.textTertiary}
      selectionColor={colors.primary}
      style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    minHeight: minTouchSize,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    outlineWidth: 0,
  },
});
