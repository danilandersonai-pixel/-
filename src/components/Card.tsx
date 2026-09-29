import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type CardProps = {
  title?: string;
  /** Пояснение мелким текстом под карточкой */
  footer?: string;
  children: ReactNode;
};

/** Карточка-секция с необязательными заголовком и пояснением */
export function Card({ title, footer, children }: CardProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      {title ? (
        <AppText variant="section" color="textSecondary" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
      {footer ? (
        <AppText variant="caption" color="textSecondary" style={styles.footer}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
    marginLeft: spacing.lg,
  },
  footer: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
