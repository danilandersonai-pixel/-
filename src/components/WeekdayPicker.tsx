import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { fonts, minTouchSize, radius, spacing, useTheme } from '@/theme';
import { weekdayShort } from '@/utils/calendar';

type WeekdayPickerProps = {
  label: string;
  /** Выбранные дни: 0 — понедельник … 6 — воскресенье */
  value: readonly number[];
  onChange: (value: number[]) => void;
};

/** Выбор нескольких дней недели: семь кнопок-переключателей в ряд */
export function WeekdayPicker({ label, value, onChange }: WeekdayPickerProps) {
  const { colors } = useTheme();
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b));
  return (
    <View style={styles.row} accessibilityLabel={label}>
      {weekdayShort.map((name, day) => {
        const selected = value.includes(day);
        return (
          <Pressable
            key={name}
            accessibilityRole="checkbox"
            accessibilityLabel={name}
            aria-checked={selected}
            onPress={() => toggle(day)}
            style={({ pressed }) => [
              styles.day,
              {
                backgroundColor: selected ? colors.text : colors.surface,
                borderColor: selected ? colors.text : colors.border,
              },
              pressed && styles.pressed,
            ]}>
            <AppText variant="callout" color={selected ? 'background' : 'textSecondary'} style={selected && styles.selected}>
              {name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  day: {
    flex: 1,
    minHeight: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selected: {
    fontFamily: fonts.bodySemiBold,
  },
  pressed: {
    opacity: 0.7,
  },
});
