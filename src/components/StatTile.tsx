import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type StatTileProps = {
  label: string;
  value: string;
};

/** Плитка-счётчик: подпись и крупное значение */
export function StatTile({ label, value }: StatTileProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="caption" color="textSecondary" numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
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
