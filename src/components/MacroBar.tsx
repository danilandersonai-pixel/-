import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import { macroShares, type Macros } from '@/lib/nutrition';
import { radius, spacing, useTheme, type Palette } from '@/theme';
import { formatMeasure } from '@/utils/format';

const t = ru.nutrition;

const parts: readonly { key: keyof Macros; label: string; color: keyof Palette }[] = [
  { key: 'protein', label: t.protein, color: 'macroProtein' },
  { key: 'fat', label: t.fat, color: 'macroFat' },
  { key: 'carbs', label: t.carbs, color: 'macroCarbs' },
];

/**
 * Распределение калорий между белками, жирами и углеводами: полоса из трёх частей
 * с просветами и подписи с граммами и долями — цвет не единственный способ отличить части.
 */
export function MacroBar({ macros }: { macros: Macros }) {
  const { colors } = useTheme();
  const shares = macroShares(macros);
  if (!shares) {
    return null;
  }
  const visible = parts.filter((part) => shares[part.key] > 0);

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.bar, { backgroundColor: colors.surface }]}
        accessibilityRole="image"
        accessibilityLabel={parts.map((p) => `${p.label} ${Math.round(shares[p.key])} %`).join(', ')}>
        {visible.map((part, index) => (
          <View
            key={part.key}
            style={[
              styles.segment,
              { flex: shares[part.key], backgroundColor: colors[part.color] },
              index === 0 && styles.first,
              index === visible.length - 1 && styles.last,
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {parts.map((part) => (
          <View key={part.key} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: colors[part.color] }]} />
            <View>
              <AppText variant="caption" color="textSecondary">
                {part.label}
              </AppText>
              <AppText variant="headline">
                {macros[part.key] === null ? '—' : `${formatMeasure(macros[part.key] ?? 0)} ${t.grams}`}
              </AppText>
              <AppText variant="caption" color="textTertiary">
                {`${Math.round(shares[part.key])} %`}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  bar: {
    flexDirection: 'row',
    height: 16,
    // Просвет в цвет фона между частями — 2 px
    gap: 2,
  },
  segment: {
    height: '100%',
  },
  first: {
    borderTopLeftRadius: radius.sm / 2,
    borderBottomLeftRadius: radius.sm / 2,
  },
  last: {
    borderTopRightRadius: radius.sm / 2,
    borderBottomRightRadius: radius.sm / 2,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  legendItem: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    marginTop: 4,
  },
});
