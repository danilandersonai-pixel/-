import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { spacing, useTheme } from '@/theme';

type ScreenProps = {
  title: string;
  /** Мелкая строка под заголовком, например «5 подопечных» */
  subtitle?: string;
  /** Кнопка справа от заголовка */
  headerRight?: ReactNode;
  children: ReactNode;
};

/** Каркас экрана вкладки: безопасные отступы, крупный заголовок, прокрутка */
export function Screen({ title, subtitle, headerRight, children }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.titles}>
            <AppText variant="largeTitle" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" color="textSecondary">
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {headerRight}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  titles: {
    flex: 1,
    gap: spacing.xs,
  },
});
