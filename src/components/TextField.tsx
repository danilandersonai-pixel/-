import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { minTouchSize, radius, spacing, typography, useTheme } from '@/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Текст ошибки под полем */
  error?: string;
  /** Единица справа внутри поля: «кг», «см» */
  unit?: string;
  /** Подсказка под полем (если нет ошибки) */
  helper?: string;
};

/** Поле ввода с подписью сверху, единицей справа и ошибкой или подсказкой снизу */
export function TextField({ label, error, unit, helper, onFocus, onBlur, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
          },
          (focused || error) && styles.highlighted,
        ]}>
        <TextInput
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.text }, inputProps.multiline && styles.multiline]}
        />
        {unit ? (
          <AppText variant="body" color="textTertiary">
            {unit}
          </AppText>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color="textTertiary">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  box: {
    minHeight: minTouchSize + spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  highlighted: {
    borderWidth: 1.5,
  },
  input: {
    ...typography.body,
    flex: 1,
    alignSelf: 'stretch',
    paddingVertical: spacing.md,
    // В браузере вместо стандартной чёрной рамки фокуса — наша цветная граница
    outlineWidth: 0,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
