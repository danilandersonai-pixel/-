import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

export const clientTabs = ['profile', 'health', 'measurements', 'workouts', 'nutrition'] as const;
export type ClientTab = (typeof clientTabs)[number];

type ClientTabsProps = {
  value: ClientTab;
  onChange: (tab: ClientTab) => void;
};

/** Вкладки карточки подопечного — прокручиваются по горизонтали */
export function ClientTabs({ value, onChange }: ClientTabsProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {clientTabs.map((tab) => {
        const selected = tab === value;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            aria-selected={selected}
            onPress={() => onChange(tab)}
            style={({ pressed }) => [
              styles.tab,
              { backgroundColor: selected ? colors.primary : colors.surfaceMuted },
              pressed && styles.pressed,
            ]}>
            <AppText variant="headline" color={selected ? 'onPrimary' : 'textSecondary'}>
              {ru.card.tabs[tab]}
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
  tab: {
    minHeight: minTouchSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.7,
  },
});
