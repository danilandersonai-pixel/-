import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

type ChipsProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Подпись группы для экранного диктора */
  label: string;
};

/** Ряд переключателей-«таблеток», прокручивается по горизонтали */
export function Chips<T extends string>({ options, value, onChange, label }: ChipsProps<T>) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            aria-checked={selected}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
              pressed && styles.pressed,
            ]}>
            <AppText variant="callout" color={selected ? 'primary' : 'textSecondary'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.lg,
    flexGrow: 0,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    minHeight: minTouchSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
