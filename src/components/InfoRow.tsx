import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { minTouchSize, spacing, useTheme } from '@/theme';

type InfoRowProps = {
  label: string;
  value: string;
  /** Показать разделитель над строкой (для всех строк карточки, кроме первой) */
  divider?: boolean;
};

/** Строка «название — значение» внутри карточки */
export function InfoRow({ label, value, divider = false }: InfoRowProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
      ]}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText color="textSecondary" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: {
    flexShrink: 1,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
