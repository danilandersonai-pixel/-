import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type StatTileProps = {
  label: string;
  value: string;
  /** Главный показатель экрана — на яркой заливке */
  highlight?: boolean;
};

/** Плитка-счётчик: подпись и крупное значение */
export function StatTile({ label, value, highlight = false }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        highlight
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
      <AppText variant="caption" color={highlight ? 'onAccent' : 'textSecondary'} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="title" color={highlight ? 'onAccent' : 'text'} numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
