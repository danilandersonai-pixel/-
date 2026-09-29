import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type EmptyStateProps = {
  icon: SymbolViewProps['name'];
  title: string;
  hint: string;
  /** Кнопка следующего шага, например «Добавить подопечного» */
  action?: ReactNode;
};

/** Пустой экран с подсказкой, что делать дальше */
export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <SymbolView name={icon} size={36} tintColor={colors.primary} />
      </View>
      <AppText variant="title" style={styles.centered}>
        {title}
      </AppText>
      <AppText variant="callout" color="textSecondary" style={styles.centered}>
        {hint}
      </AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
